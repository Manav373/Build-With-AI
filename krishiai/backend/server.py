import os
import sys
import uvicorn

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8000"))
    is_dev = os.getenv("ENVIRONMENT", "").lower() in ("development", "dev", "local")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=is_dev)
