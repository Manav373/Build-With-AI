"""
Farmer Backend Routes Package
"""
from farmer.backend.routes.web import router as web_router
from farmer.backend.routes.location import router as location_router
from farmer.backend.routes.ml import router as ml_router
from farmer.backend.routes.schemes import router as schemes_router
from farmer.backend.routes.vapi import router as vapi_router
from farmer.backend.routes.community import router as community_router
from farmer.backend.routes.whatsapp import router as whatsapp_router

__all__ = [
    "web_router",
    "location_router",
    "ml_router",
    "schemes_router",
    "vapi_router",
    "community_router",
    "whatsapp_router",
]
