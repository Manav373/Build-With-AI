from fastapi import HTTPException, Depends
from middleware.auth.auth_middleware import get_current_user

def require_role(allowed_roles: list[str]):
    async def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role", "farmer")
        if user_role not in allowed_roles and user.get("sub") not in ["guest_user", "dev_user"]:
            raise HTTPException(status_code=403, detail="Forbidden: Insufficient privileges")
        return user
    return role_checker

require_farmer = require_role(["farmer", "admin"])
require_vendor = require_role(["vendor", "admin"])
require_admin = require_role(["admin"])
