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

security = HTTPBearer()

# Cache for JWKS
_jwks_cache = None

async def get_jwks():
    global _jwks_cache
    if _jwks_cache is None:
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(CLERK_JWKS_URL)
                response.raise_for_status()
                _jwks_cache = response.json()
        except Exception as e:
            logger.error(f"Failed to fetch JWKS from Clerk: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Authentication server unavailable"
            )
    return _jwks_cache

async def verify_clerk_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials
    jwks = await get_jwks()
    
    try:
        # Get the kid from the token header
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")
        
        if not kid:
            raise JWTError("Missing 'kid' in token header")
        
        # Find the correct public key in JWKS
        rsa_key = {}
        for key in jwks.get("keys", []):
            if key["kid"] == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"]
                }
                break
        
        if not rsa_key:
            raise JWTError("Public key not found in JWKS")
            
        # Verify the JWT
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            audience=None,  # Clerk tokens don't always have audience set to the same as backend
            issuer=CLERK_ISSUER
        )
        
        # Optionally perform extra checks on payload e.g. roles/permissions
        return payload
        
    except JWTError as e:
        logger.warning(f"JWT Verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Unexpected error during auth: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"},
        )

# Dependency to get current user ID
async def get_current_user(payload: dict = Depends(verify_clerk_token)):
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID not found in token"
        )
    return user_id
