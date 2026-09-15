import logging
import os
import httpx
from fastapi import HTTPException

logger = logging.getLogger("Backend.Farmer.VapiController")
VAPI_API_KEY = os.getenv("VAPI_API_KEY", "")

class VapiController:
    @staticmethod
    async def create_outbound_call(phone: str, assistant_id: str):
        if not VAPI_API_KEY:
            return {"status": "mocked", "message": "Vapi key not configured (Test Mode)"}
        try:
            url = "https://api.vapi.ai/call/phone"
            headers = {"Authorization": f"Bearer {VAPI_API_KEY}"}
            payload = {"phoneNumber": phone, "assistantId": assistant_id}
            async with httpx.AsyncClient(timeout=15) as client:
                res = await client.post(url, json=payload, headers=headers)
                return res.json()
        except Exception as e:
            logger.error(f"Vapi outbound error: {e}")
            raise HTTPException(status_code=500, detail="Voice assistant dispatch failed")

vapi_controller = VapiController()
