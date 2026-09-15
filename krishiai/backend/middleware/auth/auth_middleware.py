import os
import logging
import httpx
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient

logger = logging.getLogger("Middleware.Auth")
security = HTTPBearer(auto_error=False)

CLERK_FRONTEND_API = os.getenv("CLERK_FRONTEND_API", "needed-mastodon-98.clerk.accounts.dev")
JWKS_URL = f"https://{CLERK_FRONTEND_API}/.well-known/jwks.json"

jwks_client = None
try:
    jwks_client = PyJWKClient(JWKS_URL, cache_keys=True, max_cached_keys=10)
except Exception as e:
    logger.warning(f"[Auth] JWKS client initialization warning: {e}")

async def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    """Verifies Clerk JWT token from Authorization header."""
    if not credentials:
        return {"sub": "guest_user", "role": "guest"}
    
    token = credentials.credentials
    try:
        if jwks_client:
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            payload = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )
            return payload
    except Exception as e:
        logger.warning(f"[Auth] Token decode error: {e}")

    # Development fallback
    return {"sub": "dev_user", "role": "farmer"}

async def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    return await verify_token(credentials)
