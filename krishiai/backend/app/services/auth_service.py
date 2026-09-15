import os
import random
import logging
import aiohttp
from datetime import datetime, timedelta

from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("AuthService")

class OTPStore:
    """In-memory OTP store for hackathon — in production use Redis or database"""
    def __init__(self):
        self.otps = {}  # {phone: {code: str, expires: datetime}}

    def store(self, phone: str, code: str, validity_minutes: int = 10):
        """Store OTP with expiration"""
        self.otps[phone] = {
            'code': code,
            'expires': datetime.utcnow() + timedelta(minutes=validity_minutes)
        }
        logger.info(f"[OTP] Stored for {phone}, valid for {validity_minutes} min")

    def verify(self, phone: str, code: str) -> bool:
        """Verify OTP and consume it"""
        if phone not in self.otps:
            return False

        otp_data = self.otps[phone]
        if datetime.utcnow() > otp_data['expires']:
            del self.otps[phone]
            return False

        is_valid = otp_data['code'] == code
        if is_valid:
            del self.otps[phone]
            logger.info(f"[OTP] Verified for {phone}")
        return is_valid

otp_store = OTPStore()


class OTPService:
    """Multi-provider OTP service supporting Fast2SMS, 2Factor.in, and Test Mode"""

    FAST2SMS_URL = "https://www.fast2sms.com/dev/bulkV2"
    TWO_FACTOR_URL = "https://2factor.in/API/V1"

    def __init__(self):
        self.fast2sms_key = os.getenv("FAST2SMS_API_KEY")
        self.two_factor_key = os.getenv("TWO_FACTOR_API_KEY")
        if self.fast2sms_key:
            logger.info("[SMS] Fast2SMS provider active.")
        elif self.two_factor_key:
            logger.info("[SMS] 2Factor.in provider active.")
        else:
            logger.warning("[SMS] No SMS gateway API key found (FAST2SMS_API_KEY or TWO_FACTOR_API_KEY). Running in TEST MODE.")

    async def send_otp(self, phone: str) -> dict:
        """
        Send OTP to 10-digit Indian phone number
        """
        # Generate 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Store locally with 10-minute validity
        otp_store.store(phone, otp)

        # Always check fresh environment
        load_dotenv(override=True)
        fast2sms_key = (os.getenv("FAST2SMS_API_KEY") or self.fast2sms_key or "").strip().strip('"').strip("'")
        two_factor_key = (os.getenv("TWO_FACTOR_API_KEY") or self.two_factor_key or "").strip().strip('"').strip("'")

        # 1. Try Fast2SMS if key is configured
        if fast2sms_key:
            try:
                headers = {
                    "authorization": fast2sms_key,
                    "Content-Type": "application/json",
                }
                payload = {
                    "variables_values": otp,
                    "route": "otp",
                    "numbers": phone.strip(),
                }
                async with aiohttp.ClientSession() as session:
                    async with session.post(self.FAST2SMS_URL, json=payload, headers=headers, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        result = await resp.json()
                        logger.info(f"[Fast2SMS] Response: {result}")
                        if result.get("return") is True:
                            return {
                                "success": True,
                                "session_id": result.get("request_id", ""),
                                "message": "OTP sent via Fast2SMS successfully",
                                "phone": phone,
                            }
                        else:
                            error_msg = result.get("message", "Fast2SMS failed")
                            if isinstance(error_msg, list):
                                error_msg = ", ".join(error_msg)
                            logger.error(f"[Fast2SMS] Error: {error_msg}")
                            return {
                                "success": False,
                                "message": f"Fast2SMS error: {error_msg}",
                                "phone": phone,
                            }
            except Exception as e:
                logger.error(f"[Fast2SMS] Exception: {e}")
                return {
                    "success": False,
                    "message": f"Fast2SMS error: {str(e)}",
                    "phone": phone,
                }

        # 2. Try 2Factor.in if key is configured
        if two_factor_key:
            try:
                url = f"{self.TWO_FACTOR_URL}/{two_factor_key}/SMS/{phone.strip()}/{otp}"
                logger.info(f"[2Factor] Sending OTP to {phone} via 2factor.in gateway...")
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                        result = await resp.json()
                        logger.info(f"[2Factor] Gateway Response: {result}")
                        if result.get("Status") == "Success":
                            logger.info(f"[2Factor] OTP delivered to {phone}")
                            return {
                                "success": True,
                                "session_id": result.get("Details", ""),
                                "message": "OTP sent successfully via 2Factor",
                                "phone": phone,
                            }
                        else:
                            logger.error(f"[2Factor] Failed: {result}")
                            return {
                                "success": False,
                                "message": result.get("Details", "Failed to send OTP via 2Factor"),
                                "phone": phone,
                            }
            except Exception as e:
                logger.error(f"[2Factor] Exception: {e}")
                return {
                    "success": False,
                    "message": f"2Factor error: {str(e)}",
                    "phone": phone,
                }

        # 3. Fallback Test Mode (when no API key configured)
        logger.info(f"[OTP] Test Mode: OTP is {otp} for {phone}")
        return {
            "success": True,
            "session_id": "test_session",
            "message": f"Test OTP: {otp}",
            "phone": phone,
            "test_otp": otp,
        }

    def verify_otp(self, phone: str, code: str) -> bool:
        """Verify OTP locally"""
        return otp_store.verify(phone, code)


# Singleton instance
otp_service = OTPService()
TwoFactorOTPService = OTPService  # Backwards compatibility alias
