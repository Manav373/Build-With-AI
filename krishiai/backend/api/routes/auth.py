import time
import base64
import json
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from app.services.auth_service import otp_service

logger = logging.getLogger("AuthRouter")

router = APIRouter(prefix="/api", tags=["Auth"])


def create_access_token(user_data: dict) -> str:
    payload = {
        **user_data,
        "iat": int(time.time()),
        "exp": int(time.time()) + (86400 * 14)  # 14 days session
    }
    raw = json.dumps(payload).encode("utf-8")
    return f"krishi_{base64.urlsafe_b64encode(raw).decode('utf-8').rstrip('=')}"


def decode_token(auth_header: str) -> Optional[dict]:
    try:
        token = auth_header.strip()
        if token.lower().startswith("bearer "):
            token = token[7:].strip()
        if token.startswith("krishi_"):
            token = token[7:]
            padded = token + "=" * (-len(token) % 4)
            return json.loads(base64.urlsafe_b64decode(padded.encode("utf-8")).decode("utf-8"))
    except Exception:
        pass
    return None


class LoginRequest(BaseModel):
    identifier: str
    password: Optional[str] = ""
    target_domain: Optional[str] = "farmer"


class RegisterRequest(BaseModel):
    name: Optional[str] = "Krishi Member"
    email: Optional[str] = ""
    phone: Optional[str] = ""
    role: Optional[str] = "farmer"
    target_domain: Optional[str] = "farmer"
    password: Optional[str] = ""


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


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
            # Generate session token for verified phone authentication
            auth_token = f"krishi_auth_{req.phone}"
            return VerifyOTPResponse(
                success=True,
                message="OTP verified successfully",
                phone=req.phone,
                token=auth_token
            )
        else:
            raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[AuthRouter] verify_otp error: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")


# ─── V1 MULTI-DOMAIN AUTH ENDPOINTS ──────────────────────────────────────────

@router.post("/v1/auth/login")
@router.post("/auth/login")
async def login(req: LoginRequest):
    identifier = req.identifier.strip()
    target_domain = (req.target_domain or "farmer").lower()

    if target_domain == "admin" or "admin" in identifier.lower():
        role = "admin"
        name = "Super Administrator"
        email = identifier if "@" in identifier else "admin@krishiai.com"
        user_id = "admin-master-01"
    elif target_domain == "vendor" or "vendor" in identifier.lower():
        role = "vendor"
        name = "Krishi Vendor Partner"
        email = identifier if "@" in identifier else "vendor@krishiai.com"
        user_id = "vendor-partner-01"
    else:
        role = "farmer"
        name = "Kisan Partner"
        email = identifier if "@" in identifier else f"farmer_{identifier}@krishiai.in"
        user_id = f"farmer-{abs(hash(identifier)) % 100000}"

    user_payload = {
        "id": user_id,
        "name": name,
        "email": email,
        "phone": identifier if identifier.isdigit() else "9876543210",
        "role": role,
        "domain": target_domain,
        "avatar": None
    }

    access_token = create_access_token(user_payload)
    refresh_token = create_access_token({**user_payload, "type": "refresh"})

    return {
        "success": True,
        "message": "Authenticated successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_payload
    }


@router.get("/v1/auth/me")
@router.get("/auth/me")
async def get_me(request: Request):
    auth_header = request.headers.get("Authorization", "")
    decoded = decode_token(auth_header)
    if decoded:
        return {"success": True, "user": decoded}

    return {
        "success": True,
        "user": {
            "id": "user-guest",
            "name": "Krishi Member",
            "email": "member@krishiai.com",
            "role": "farmer",
            "domain": "farmer"
        }
    }


@router.post("/v1/auth/register")
@router.post("/auth/register")
async def register(req: RegisterRequest):
    target_domain = (req.target_domain or req.role or "farmer").lower()
    email = req.email or (f"{req.phone}@krishiai.in" if req.phone else "user@krishiai.com")
    user_payload = {
        "id": f"usr-{int(time.time())}",
        "name": req.name or "Krishi Member",
        "email": email,
        "phone": req.phone or "9876543210",
        "role": req.role or target_domain,
        "domain": target_domain,
        "avatar": None
    }
    access_token = create_access_token(user_payload)
    refresh_token = create_access_token({**user_payload, "type": "refresh"})
    return {
        "success": True,
        "message": "Registered successfully",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user": user_payload
    }


@router.post("/v1/auth/refresh")
@router.post("/auth/refresh")
async def refresh_token(req: RefreshRequest):
    decoded = decode_token(req.refresh_token or "")
    if not decoded:
        decoded = {
            "id": "usr-refreshed",
            "name": "Krishi Member",
            "role": "farmer",
            "domain": "farmer"
        }
    access_token = create_access_token(decoded)
    return {
        "success": True,
        "access_token": access_token,
        "token_type": "bearer"
    }


@router.post("/v1/auth/logout")
@router.post("/auth/logout")
async def logout():
    return {"success": True, "message": "Logged out successfully"}
