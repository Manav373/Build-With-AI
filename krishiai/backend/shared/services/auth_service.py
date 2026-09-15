import os
import random
import logging
import aiohttp
from datetime import datetime, timedelta

logger = logging.getLogger("Shared.AuthService")

class OTPStore:
    """In-memory OTP store with expiration."""
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


class TwoFactorOTPService:
    """2Factor.in OTP gateway integration"""

    BASE_URL = "https://2factor.in/API/V1"

    def __init__(self):
        self.api_key = os.getenv("TWO_FACTOR_API_KEY")
        if not self.api_key:
            logger.warning("[2Factor] API key not configured. OTP will use test mode.")

    async def send_otp(self, phone: str) -> dict:
        """Send OTP via 2Factor.in"""
        otp = str(random.randint(100000, 999999))
        otp_store.store(phone, otp)

        if not self.api_key:
            logger.info(f"[2Factor] Test mode: OTP={otp} for {phone}")
            return {
                "success": True,
                "session_id": "test_session",
                "message": f"Test OTP: {otp}",
                "phone": phone
            }

        try:
            url = f"{self.BASE_URL}/{self.api_key}/SMS/{phone}/{otp}"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    result = await resp.json()

                    if result.get("Status") == "Success":
                        logger.info(f"[2Factor] OTP sent to {phone}")
                        return {
                            "success": True,
                            "session_id": result.get("Details", ""),
                            "message": "OTP sent successfully",
                            "phone": phone
                        }
                    else:
                        logger.error(f"[2Factor] Failed: {result}")
                        return {
                            "success": False,
                            "message": result.get("Details", "Failed to send OTP"),
                            "phone": phone
                        }

        except Exception as e:
            logger.error(f"[2Factor] Exception: {e}")
            return {
                "success": False,
                "message": str(e),
                "phone": phone
            }

    def verify_otp(self, phone: str, code: str) -> bool:
        """Verify OTP locally"""
        return otp_store.verify(phone, code)


otp_service = TwoFactorOTPService()
