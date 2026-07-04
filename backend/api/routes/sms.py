"""
app/api/sms.py  –  Twilio SMS Webhook for KrishiAI
-----------------------------------------------------
Flow: Farmer SMS → Twilio → POST /api/sms/twilio-sms → AI → TwiML SMS reply

Setup:
  In your Twilio console, set your number's "A Message Comes In" webhook to:
  https://<your-deployed-backend>/api/sms/twilio-sms  (HTTP POST)
"""

import logging
import os
from fastapi import APIRouter, Form, Request
from fastapi.responses import PlainTextResponse
from twilio.twiml.messaging_response import MessagingResponse

# Reuse the existing WhatsApp AI logic (language detection, session memory, prompts)
from app.core.whatsapp_agent import process_whatsapp_query

logger = logging.getLogger("KrishiMCP.SMS")

router = APIRouter(prefix="/api/sms", tags=["Twilio SMS"])


async def ask_ai(message: str, phone: str) -> str:
    """
    Bridge to the existing AI function.
    Uses the WhatsApp agent so SMS farmers get the same smart,
    language-aware, session-aware responses as WhatsApp users.
    """
    return await process_whatsapp_query(
        message=message,
        phone=phone,  # used for per-user session memory
        language="English",  # auto-detected from message content
    )


@router.post("/twilio-sms", response_class=PlainTextResponse)
async def receive_sms(
    request: Request,
    Body: str = Form(...),
    From: str = Form(...),
):
    """
    Twilio SMS Webhook.

    Twilio sends a POST with form fields:
      - Body: the farmer's message text
      - From: the farmer's phone number (e.g. +919876543210)

    This endpoint:
      1. Extracts the message and phone number.
      2. Passes it to the KrishiAI agent.
      3. Returns a TwiML XML response so Twilio sends the reply as SMS.

    Twilio Console Webhook URL:
      https://<your-domain>/api/sms/twilio-sms  [HTTP POST]
    """
    sender = From.strip()
    text = Body.strip()

    logger.info(f"[SMS] Received from {sender}: {text[:80]}...")

    try:
        ai_reply = await ask_ai(message=text, phone=sender)
    except Exception as e:
        logger.error(f"[SMS] AI error for {sender}: {e}")
        ai_reply = (
            "Sorry, I'm having trouble answering right now. "
            "Please try again in a moment. 🌾"
        )

    # Truncate to WhatsApp/SMS-safe 1600-char limit
    if len(ai_reply) > 1580:
        ai_reply = ai_reply[:1577] + "..."
        logger.warning(f"[SMS] Reply truncated for {sender}")

    # Build TwiML response (this is what Twilio reads to send the SMS back)
    twiml = MessagingResponse()
    twiml.message(ai_reply)

    logger.info(f"[SMS] Sending reply ({len(ai_reply)} chars) to {sender}")
    return PlainTextResponse(content=str(twiml), media_type="application/xml")


@router.get("/health")
def sms_health():
    """Quick check that the SMS endpoint is reachable."""
    twilio_configured = bool(os.getenv("TWILIO_ACCOUNT_SID"))
    return {
        "status": "ok",
        "service": "KrishiAI SMS",
        "twilio_configured": twilio_configured,
    }
