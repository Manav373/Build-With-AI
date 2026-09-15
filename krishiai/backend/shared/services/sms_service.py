import os
import logging
from twilio.rest import Client

logger = logging.getLogger("Shared.SMS")

def send_outbound_sms(to_phone: str, message: str):
    """
    Sends an outbound SMS using Twilio.
    Supports both standard SMS and WhatsApp if the phone number prefix is correct.
    """
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_phone = os.getenv("TWILIO_PHONE_NUMBER", "+14155238886")

    if not account_sid or not auth_token:
        logger.error("[SMS] Twilio credentials missing in .env")
        return False

    try:
        client = Client(account_sid, auth_token)
        message_data = {
            "body": message,
            "from_": from_phone,
            "to": to_phone
        }
        msg = client.messages.create(**message_data)
        logger.info(f"[SMS] Message sent to {to_phone}. SID: {msg.sid}")
        return True
    except Exception as e:
        logger.error(f"[SMS] Failed to send outbound message to {to_phone}: {e}")
        return False
