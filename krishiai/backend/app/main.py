import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, Response
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment before any other app modules
load_dotenv(override=True)

import os

from api.routes.mcp import router as tools_router, mcp_server
from api.routes.whatsapp import router as whatsapp_router
from api.routes.web import router as web_router
from api.routes.sms import router as sms_router
from api.routes.vapi import router as vapi_router
from api.routes.location import router as location_router
from api.routes.ml import router as ml_router
from api.routes.schemes import router as schemes_router
from api.routes.community import router as community_router
from api.routes.auth import router as auth_router
from api.routes.vendor import router as vendor_router
from api.routes.admin import router as admin_router
from api.routes.iot import router as iot_router, devices_router
from app.db.database import engine, Base
from app.services.gee_service import gee_service
import app.models.location  # noqa
import app.models.market    # noqa – registers ORM models
import app.models.vapi_model # noqa
import app.models.community_model # noqa
import app.models.vendor  # noqa – registers vendor ecosystem ORM models
import app.models.admin_model # noqa – registers admin ecosystem ORM models

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger("KrishiMCP")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Auto-create DB tables on startup
    try:
        from scripts.sync_db import sync_database
        sync_database()
    except Exception as e:
        logger.warning(f"[DB Sync] Startup sync warning: {e}")
        Base.metadata.create_all(bind=engine)
    logger.info("[DB] Tables created / verified.")
    
    # Seed initial market benchmarks
    try:
        from app.services.market import seed_market_data
        await seed_market_data()
        logger.info("[Market] Baseline MSP seeded / verified.")
    except Exception as e:
        logger.error(f"[Market] Seed failure: {e}")

    # Pre-initialize Google Earth Engine (Speed Optimization)
    try:
        gee_service.initialize()
    except Exception as e:
        logger.error(f"[GEE] Startup initialization failed: {e}")

    yield

# --- Rate Limiting is currently disabled per user request ---

app = FastAPI(
    title="KrishiAI MCP Server", 
    description="A FastAPI backend exposing KrishiAI agricultural tools via REST and MCP.",
    lifespan=lifespan
)

# --- Global Exception Handler (Production Safety) ---
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"error": "An internal server error occurred. Our engineers are investigating."},
    )
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response

# Add middleware to bypass ngrok browser warning and restrict origins
raw_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
allowed_origins = [o.strip() for o in raw_origins if o.strip()]

# Common defaults for local dev and production
default_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
    "http://localhost:5176",
    "http://127.0.0.1:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5177",
    "http://localhost:5178",
    "http://127.0.0.1:5178",
    "http://localhost:3000",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "https://krishiai-bot.vercel.app",
    "https://krishiai.vercel.app",
    "https://krishiai-backend-21jz.onrender.com",
    "https://dashboard.vapi.ai",
    "https://vapi.ai",
    "https://krishiai-frontend-118806637740.us-central1.run.app"
]

for origin in default_origins:
    if origin not in allowed_origins:
        allowed_origins.append(origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?|https://.*\.vercel\.app|https://.*\.onrender\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# --- Enhanced Security Headers Middleware ---
@app.middleware("http")
async def add_security_and_ngrok_headers(request: Request, call_next):
    response: Response = await call_next(request)
    # Bypass ngrok warning
    response.headers["ngrok-skip-browser-warning"] = "true"
    
    # Standard Security Headers
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline' https://clerk.needed-mastodon-98.accounts.dev; "
        "connect-src 'self' http://localhost:5173 http://127.0.0.1:5173 http://localhost:8000 http://127.0.0.1:8000 https://krishiai-backend-21jz.onrender.com https://*.onrender.com https://*.vercel.app https://clerk.needed-mastodon-98.accounts.dev https://nominatim.openstreetmap.org; "
        "img-src 'self' data: https://*.basemaps.cartocdn.com https://*.tile.openstreetmap.org; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com;"
    )
    return response

# Include REST API endpoints
app.include_router(tools_router)

# Include WhatsApp Webhook endpoints
app.include_router(whatsapp_router)

# Include Web Frontend API endpoints
app.include_router(web_router)

# Include Twilio SMS endpoint
app.include_router(sms_router)

# Include Vapi Voice Assistant endpoints
app.include_router(vapi_router)

# Include Farmer Location Intelligence endpoints
app.include_router(location_router)


# Include Crop Intelligence ML endpoints
app.include_router(ml_router)

# Include Government Schemes API endpoints
app.include_router(schemes_router, prefix="/api/schemes", tags=["Schemes"])

# Include Krishi Community WebSocket/REST endpoints
app.include_router(community_router, prefix="/api")

# Include Auth (OTP) endpoints
app.include_router(auth_router)

# Include Vendor Marketplace endpoints
app.include_router(vendor_router)

# Include Admin Master Command endpoints
app.include_router(admin_router, prefix="/api/v1/admin", tags=["Admin"])

# Include IoT Smart Farm endpoints
app.include_router(iot_router)
app.include_router(devices_router)

logger.info("KrishiAI MCP Server starting up...")

@app.get("/")
def root():
    return {"message": "Welcome to KrishiAI MCP Server. Go to /docs to see the REST tools or connect via MCP SDK."}

# If running directly, can start MCP standard stdio server or uvicorn
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1 and sys.argv[1] == "mcp":
        # Start MCP stdio server
        logger.info("Starting MCP stdio server...")
        mcp_server.run()
    else:
        # Start normal FastAPI server
        import uvicorn
        logger.info("Starting FastAPI server...")
        uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
