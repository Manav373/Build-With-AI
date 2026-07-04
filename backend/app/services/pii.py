import re
import uuid
import logging

logger = logging.getLogger("KrishiAI.PII")

# Regex for Indian Phone Numbers
PHONE_REGEX = r"(?:\+91[\s-]?)?[6789]\d{9}"
# Regex for GPS Coordinates (lat/lon)
GPS_REGEX = r"(-?\d+\.\d+)\s*[,/ ]\s*(-?\d+\.\d+)"
# Regex for Emails
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

class PIIService:
    def __init__(self):
        # We use a simple token prefix to distinguish between types
        self.token_prefix = "TOK_"

    def mask(self, text: str) -> tuple[str, dict]:
        """
        Identify PII in text and replace with tokens.
        Returns (masked_text, token_map)
        """
        mapping = {}
        counter = 1

        def replace_phone(match):
            nonlocal counter
            val = match.group(0)
            token = f"[PHONE_TOKEN_{counter}]"
            mapping[token] = val
            counter += 1
            return token

        def replace_gps(match):
            nonlocal counter
            val = match.group(0)
            token = f"[GPS_TOKEN_{counter}]"
            mapping[token] = val
            counter += 1
            return token

        def replace_email(match):
            nonlocal counter
            val = match.group(0)
            token = f"[EMAIL_TOKEN_{counter}]"
            mapping[token] = val
            counter += 1
            return token

        # Order matters to avoid overlapping matches
        text = re.sub(EMAIL_REGEX, replace_email, text)
        text = re.sub(PHONE_REGEX, replace_phone, text)
        text = re.sub(GPS_REGEX, replace_gps, text)

        if mapping:
            logger.info(f"Masked {len(mapping)} PII elements in user query.")
        
        return text, mapping

    def unmask(self, text: str, mapping: dict) -> str:
        """
        Restore real values from tokens in the text.
        """
        if not mapping:
            return text
            
        for token, original in mapping.items():
            # Use escape if original contains special regex chars, 
            # but token is our own controlled string.
            text = text.replace(token, str(original))
            
        return text

# Singleton instance
pii_service = PIIService()
