import logging
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.auth_service import otp_service

logger = logging.getLogger("AuthRouter")

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class SendOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10, description="10-digit phone number without country code")


class SendOTPResponse(BaseModel):
    success: bool
    message: str
    phone: str
    session_id: str | None = None


class VerifyOTPRequest(BaseModel):
    phone: str = Field(..., min_length=10, max_length=10)
    code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP")


class VerifyOTPResponse(BaseModel):
    success: bool
    message: str
    phone: str
    token: str | None = None  # In production, return JWT or session token


@router.post("/send-otp", response_model=SendOTPResponse)
async def send_otp(req: SendOTPRequest):
    """
    Send OTP to a phone number via 2Factor.in
    """
    try:
        # Validate phone format
        if not req.phone.isdigit():
            raise HTTPException(status_code=400, detail="Phone must be 10 digits")

        result = await otp_service.send_otp(req.phone)

        if result["success"]:
            return SendOTPResponse(
                success=True,
                message=result["message"],
                phone=req.phone,
                session_id=result.get("session_id")
            )
        else:
            raise HTTPException(status_code=500, detail=result["message"])

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AuthRouter] send_otp error: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@router.post("/verify-otp", response_model=VerifyOTPResponse)
def verify_otp(req: VerifyOTPRequest):
    """
    Verify OTP code for a phone number
    """
    try:
        # Validate OTP format
        if not req.code.isdigit():
            raise HTTPException(status_code=400, detail="OTP must be 6 digits")

        is_valid = otp_service.verify_otp(req.phone, req.code)

        if is_valid:
            # In production: create JWT token, session, or database record here
            # For now, just confirm verification succeeded
            return VerifyOTPResponse(
                success=True,
                message="OTP verified successfully",
                phone=req.phone,
                token=None  # TODO: generate JWT
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AuthRouter] verify_otp error: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")
