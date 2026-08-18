import os
import logging
from twilio.rest import Client

logger = logging.getLogger("KrishiMCP.SMS")

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
        
        # Determine if we should send via WhatsApp or SMS based on the 'from' number
        # If the user's phone starts with +, and the from_phone is whatsapp:, use that.
        # Otherwise, attempt standard SMS.
        
        message_data = {
            "body": message,
            "from_": from_phone,
            "to": to_phone
        }

        # If sending to an Indian number without whatsapp prefix, ensure standard SMS
        if not to_phone.startswith("whatsapp:") and from_phone.startswith("whatsapp:"):
            # If we only have a WhatsApp number but want to send SMS, 
            # we should ideally have a separate SMS SID, but we'll try to strip prefix
            # if the user just wants 'outbound communication'.
            pass

        msg = client.messages.create(**message_data)
        logger.info(f"[SMS] Message sent to {to_phone}. SID: {msg.sid}")
        return True
    except Exception as e:
        logger.error(f"[SMS] Failed to send outbound message to {to_phone}: {e}")
        return False
