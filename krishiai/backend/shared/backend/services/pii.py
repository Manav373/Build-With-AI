import re
import logging

logger = logging.getLogger("Shared.PII")

PHONE_REGEX = r"(?:\+91[\s-]?)?[6789]\d{9}"
GPS_REGEX = r"(-?\d+\.\d+)\s*[,/ ]\s*(-?\d+\.\d+)"
EMAIL_REGEX = r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+"

class PIIService:
    def __init__(self):
        self.token_prefix = "TOK_"

    def mask(self, text: str) -> tuple[str, dict]:
        """Identify PII in text and replace with tokens."""
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

        text = re.sub(EMAIL_REGEX, replace_email, text)
        text = re.sub(PHONE_REGEX, replace_phone, text)
        text = re.sub(GPS_REGEX, replace_gps, text)

        if mapping:
            logger.info(f"Masked {len(mapping)} PII elements in user query.")
        
        return text, mapping

    def unmask(self, text: str, mapping: dict) -> str:
        """Restore real values from tokens in the text."""
        if not mapping:
            return text
            
        for token, original in mapping.items():
            text = text.replace(token, str(original))
            
        return text

pii_service = PIIService()
