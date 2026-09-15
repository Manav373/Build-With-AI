import logging
import os
from fastapi import APIRouter, Form, Request
from fastapi.responses import PlainTextResponse
from twilio.twiml.messaging_response import MessagingResponse

logger = logging.getLogger("Shared.TwilioSMS")

router = APIRouter(prefix="/api/sms", tags=["Twilio SMS"])

async def ask_ai(message: str, phone: str) -> str:
    try:
        from farmer.backend.core.whatsapp_agent import process_whatsapp_query
        return await process_whatsapp_query(
            message=message,
            phone=phone,
            language="English",
        )
    except Exception as e:
        logger.error(f"[SMS] Fallback agent error: {e}")
        return "Namaste! KrishiAI is currently processing your request. Please try again in a moment. 🌾"

@router.post("/twilio-sms", response_class=PlainTextResponse)
async def receive_sms(
    request: Request,
    Body: str = Form(...),
    From: str = Form(...),
):
    """Twilio SMS Webhook."""
    sender = From.strip()
    text = Body.strip()

    logger.info(f"[SMS] Received from {sender}: {text[:80]}...")

    try:
        ai_reply = await ask_ai(message=text, phone=sender)
    except Exception as e:
        logger.error(f"[SMS] AI error for {sender}: {e}")
        ai_reply = "Sorry, I'm having trouble answering right now. Please try again in a moment. 🌾"

    if len(ai_reply) > 1580:
        ai_reply = ai_reply[:1577] + "..."

    twiml = MessagingResponse()
    twiml.message(ai_reply)

    return PlainTextResponse(content=str(twiml), media_type="application/xml")

@router.get("/health")
def sms_health():
    twilio_configured = bool(os.getenv("TWILIO_ACCOUNT_SID"))
    return {
        "status": "ok",
        "service": "KrishiAI SMS",
        "twilio_configured": twilio_configured,
    }
