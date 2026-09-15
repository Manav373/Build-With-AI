from shared.backend.routes.auth import router as auth_router
from shared.backend.routes.sms import router as sms_router
from shared.backend.routes.mcp import router as mcp_router

__all__ = [
    "auth_router",
    "sms_router",
    "mcp_router",
]
