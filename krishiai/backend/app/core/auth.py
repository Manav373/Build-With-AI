import os
import json
import logging
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx

# Configure logging
logger = logging.getLogger("KrishiAI-Auth")

# Clerk configuration
CLERK_FRONTEND_API = os.getenv("CLERK_FRONTEND_API", "needed-mastodon-98.clerk.accounts.dev")
CLERK_JWKS_URL = f"https://{CLERK_FRONTEND_API}/.well-known/jwks.json"
CLERK_ISSUER = f"https://{CLERK_FRONTEND_API}"

security = HTTPBearer(auto_error=False)

# Cache for JWKS
_jwks_cache = None

async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.get(CLERK_JWKS_URL)
                response.raise_for_status()
                _jwks_cache = response.json()
        except Exception as e:
            logger.warning(f"Failed to fetch JWKS from Clerk: {e}")
            return None
    return _jwks_cache

async def verify_clerk_token(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)):
    guest_payload = {"sub": "guest_user", "is_guest": True}
    
    if not credentials or not credentials.credentials:
        return guest_payload
        
    token = credentials.credentials
    try:
        jwks = await get_jwks()
        if not jwks:
            return guest_payload

        # Get the kid from the token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            return guest_payload
        
        # Find the correct public key in JWKS
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key.get("kid") == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            return guest_payload
            
        # Verify the JWT
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=None,  # Clerk tokens don't always have audience set to the same as backend
            issuer=CLERK_ISSUER
        )
        
        return payload
        
    except JWTError as e:
        logger.warning(f"JWT Verification failed (falling back to guest): {e}")
        return guest_payload
    except Exception as e:
        logger.warning(f"Unexpected error during auth (falling back to guest): {e}")
        return guest_payload

# Dependency to get current user ID
async def get_current_user(payload: dict = Depends(verify_clerk_token)):
    user_id = payload.get("sub", "guest_user")
    return user_id
