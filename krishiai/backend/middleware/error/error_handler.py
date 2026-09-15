import logging
from fastapi import Request
from fastapi.responses import JSONResponse

logger = logging.getLogger("Middleware.Error")

async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception on {request.url.path}: {exc}", exc_info=True)
    response = JSONResponse(
        status_code=500,
        content={"error": "Internal server error. Please try again later.", "path": request.url.path},
    )
    origin = request.headers.get("origin")
    if origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
    return response
