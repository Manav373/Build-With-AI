import os
import random
import logging
import aiohttp
from datetime import datetime, timedelta

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


class TwoFactorOTPService:
    """2Factor.in OTP gateway integration"""

    BASE_URL = "https://2factor.in/API/V1"

    def __init__(self):
        self.api_key = os.getenv("TWO_FACTOR_API_KEY")
        if not self.api_key:
            logger.warning("[2Factor] API key not configured. OTP will use test mode.")

    async def send_otp(self, phone: str) -> dict:
        """
        Send OTP via 2Factor.in
        Args:
            phone: 10-digit phone number without +91
        Returns:
            {"success": bool, "session_id": str, "message": str}
        """
        # Generate random 6-digit OTP
        otp = str(random.randint(100000, 999999))

        # Store locally for verification
        otp_store.store(phone, otp)

        if not self.api_key:
            # Fallback for testing without API key
            logger.info(f"[2Factor] Test mode: OTP={otp} for {phone}")
            return {
                "success": True,
                "session_id": "test_session",
                "message": f"Test OTP: {otp}",
                "phone": phone
            }

        try:
            # 2Factor.in API: GET /API/V1/{api_key}/SMS/{phone}/{otp}
            url = f"{self.BASE_URL}/{self.api_key}/SMS/{phone}/{otp}"

            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as resp:
                    result = await resp.json()

                    # 2Factor.in returns {"Status": "Success", "Details": "..."}
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
        """
        Verify OTP locally (2Factor.in does not provide verify API in free tier)
        In production, use their session-based verification or custom database
        """
        return otp_store.verify(phone, code)


# Singleton instance
otp_service = TwoFactorOTPService()
