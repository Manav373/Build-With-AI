import time
import logging
from fastapi import Request

logger = logging.getLogger("Middleware.Logging")

async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - Status: {response.status_code} - Completed in {process_time:.2f}ms")
    return response
