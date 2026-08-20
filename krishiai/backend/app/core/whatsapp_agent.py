"""
app/core/whatsapp_agent.py  –  WhatsApp-specific KrishiAI agent
---------------------------------------------------------------
Advanced WhatsApp AI with:
  - Auto language detection from the user's message script/content
  - Strict MIRROR rule: always reply in the SAME language the user wrote in
  - Short-term session memory so follow-up questions have context
  - Plain-text replies optimised for WhatsApp (no markdown)
  - Smart language injection into the system prompt per request
"""

import re
import logging
from collections import deque
from typing import Optional
from app.core.agent import process_query_base
from app.services.pii import pii_service

logger = logging.getLogger("KrishiMCP.WhatsAppAgent")

# ---------------------------------------------------------------------------
# Per-user short-term session memory  (last N turns, cleared on restart)
# We keep a small deque per phone number so follow-ups make sense.
# ---------------------------------------------------------------------------
_SESSION_HISTORY: dict = {}  # phone -> deque of {role, content} dicts
MAX_SESSION_TURNS = 6   # last 3 user+assistant pairs


def _get_history(phone: str) -> list:
    return list(_SESSION_HISTORY.get(phone, []))


def _push_history(phone: str, role: str, content: str):
    if phone not in _SESSION_HISTORY:
        _SESSION_HISTORY[phone] = deque(maxlen=MAX_SESSION_TURNS * 2)
    _SESSION_HISTORY[phone].append({"role": role, "content": content})


# ---------------------------------------------------------------------------
# Language auto-detection from message content
# Priority: Unicode script range → keyword → caller-supplied preference
# ---------------------------------------------------------------------------

# Unicode block ranges for script identification
_DEVANAGARI  = re.compile(r'[\u0900-\u097F]')      # Hindi, Marathi (Devanagari)
_GUJARATI    = re.compile(r'[\u0A80-\u0AFF]')       # Gujarati
_TAMIL       = re.compile(r'[\u0B80-\u0BFF]')       # Tamil
_TELUGU      = re.compile(r'[\u0C00-\u0C7F]')       # Telugu
_BENGALI     = re.compile(r'[\u0980-\u09FF]')       # Bengali
_PUNJABI     = re.compile(r'[\u0A00-\u0A7F]')       # Punjabi (Gurmukhi)
_KANNADA     = re.compile(r'[\u0C80-\u0CFF]')       # Kannada
_MALAYALAM   = re.compile(r'[\u0D00-\u0D7F]')       # Malayalam

# Keyword hints for Latin-script language names users might type
_HINDI_KW    = re.compile(r'\b(hindi|हिंदी|namaste|kisan|khet|fasal|paani|khad)\b', re.I)
_GUJARATI_KW = re.compile(r'\b(gujarati|kem|chho|kheti|vavtar)\b', re.I)
_MARATHI_KW  = re.compile(r'\b(marathi|shetkari|pikavad|paus|sheti)\b', re.I)
_TAMIL_KW    = re.compile(r'\b(tamil|விவசாயம்|வணக்கம்)\b', re.I)
_TELUGU_KW   = re.compile(r'\b(telugu|okka|mee|crops)\b', re.I)


def detect_language(message: str, preference: str = "English") -> str:
    """
    Detect the language the user is writing in.
    Returns one of: English, Hindi, Gujarati, Marathi, Tamil, Telugu,
                    Bengali, Punjabi, Kannada, Malayalam
    Falls back to `preference` if nothing is detected.
    """
    if _GUJARATI.search(message):
        return "Gujarati"
    if _TAMIL.search(message):
        return "Tamil"
    if _TELUGU.search(message):
        return "Telugu"
    if _BENGALI.search(message):
        return "Bengali"
    if _PUNJABI.search(message):
        return "Punjabi"
    if _KANNADA.search(message):
        return "Kannada"
    if _MALAYALAM.search(message):
        return "Malayalam"
    # Devanagari is shared by Hindi and Marathi — use keyword to disambiguate
    if _DEVANAGARI.search(message):
        if _MARATHI_KW.search(message):
            return "Marathi"
        return "Hindi"
    # Latin-script keyword hints
    if _HINDI_KW.search(message):
        return "Hindi"
    if _GUJARATI_KW.search(message):
        return "Gujarati"
    if _MARATHI_KW.search(message):
        return "Marathi"
    if _TAMIL_KW.search(message):
        return "Tamil"
    if _TELUGU_KW.search(message):
        return "Telugu"
    # Default to stored preference (user selected via menu) or English
    return preference


# ---------------------------------------------------------------------------
# Language-aware system prompt builder
# ---------------------------------------------------------------------------

_BASE_SYSTEM_PROMPT = """You are KrishiAI, a premium and helpful AI agricultural advisor for Indian farmers communicating via WhatsApp.

ABSOLUTE LANGUAGE RULE — READ THIS FIRST:
{lang_rule}

WHATSAPP FORMATTING RULES:
- Use WhatsApp-style formatting: *bold* for emphasis and headers. Do NOT use markdown headers (#) or standard markdown bold (**).
- Use emojis liberally to make responses visual and friendly (🌱 🌤 💧 🌾 📍 🌅 🌇 etc.).
- Keep replies concise (4-10 lines) but highly structured.
- For **Weather Reports**, use a clean bulleted list showing: Temp, Humidity, Wind, Sunrise/Sunset.
- ALWAYS include **Actionable Farming Advice** (e.g., "Safe to spray", "Irrigate now").
- NEVER output raw function calls or JSON.

CONTENT RULES:
- Provide specific fertilizer names (e.g., NPK 19:19:19, Urea 46%, DAP) with exact dosages.
- When GPS coordinates are shared, identify the exact locality (e.g., "Hi from Gota!") and give precise local weather/market advice.
- Be warm, respectful, and practical. Use simple language.
"""

_LANG_RULES = {
    "English":   "The user is writing in English. You MUST reply in English ONLY. Do not use Hindi, Devanagari, or any other language.",
    "Hindi":     "The user is writing in Hindi. You MUST reply entirely in Hindi using Devanagari script (हिंदी). Do NOT use English sentences in your response.",
    "Gujarati":  "The user is writing in Gujarati. You MUST reply entirely in Gujarati using Gujarati script (ગુજરાતી). Do NOT use English or Hindi.",
    "Marathi":   "The user is writing in Marathi. You MUST reply entirely in Marathi using Devanagari script (मराठी). Do NOT use English or Hindi.",
    "Tamil":     "The user is writing in Tamil. You MUST reply entirely in Tamil using Tamil script (தமிழ்). Do NOT use English or Hindi.",
    "Telugu":    "The user is writing in Telugu. You MUST reply entirely in Telugu using Telugu script (తెలుగు). Do NOT use English or Hindi.",
    "Bengali":   "The user is writing in Bengali. You MUST reply entirely in Bengali using Bengali script (বাংলা). Do NOT use English or Hindi.",
    "Punjabi":   "The user is writing in Punjabi. You MUST reply entirely in Punjabi using Gurmukhi script (ਪੰਜਾਬੀ). Do NOT use English or Hindi.",
    "Kannada":   "The user is writing in Kannada. You MUST reply entirely in Kannada using Kannada script (ಕನ್ನಡ). Do NOT use English or Hindi.",
    "Malayalam": "The user is writing in Malayalam. You MUST reply entirely in Malayalam using Malayalam script (മലയാളം). Do NOT use English or Hindi.",
}


def _build_system_prompt(language: str) -> str:
    lang_rule = _LANG_RULES.get(language, _LANG_RULES["English"])
    return _BASE_SYSTEM_PROMPT.format(lang_rule=lang_rule)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

async def process_whatsapp_query(
    message: str,
    phone: str = "",
    lat: float = 0.0,
    lon: float = 0.0,
    language: str = "English",
) -> str:
    """
    Process a WhatsApp farmer message and return a short plain-text reply.

    Args:
        message:  Raw text from the farmer.
        phone:    Sender phone number (used for session memory).
        lat/lon:  GPS coordinates if shared.
        language: Language preference from the user's menu selection.
                  Auto-detection takes priority if the message content reveals another language.
    """
    # --- 1. Detect actual language from message content ---
    detected_lang = detect_language(message, preference=language)
    if detected_lang != language:
        logger.info(f"[WhatsApp] Lang override: preference={language} → detected={detected_lang}")
    effective_lang = detected_lang

    logger.info(f"[WhatsApp] Processing message from {phone}: {message[:80]}... (Lang: {effective_lang})")

    # --- 2. Build context-aware message ---
    # Apply PII Secure Masking (Enterprise Grade)
    masked_message, token_map = pii_service.mask(message)

    context_parts = []
    if lat and lon:
        context_parts.append(f"[User GPS location: {lat:.5f},{lon:.5f}]")
    # Always inject the language tag so the model sees it in the user turn too
    context_parts.append(f"[REPLY LANGUAGE: {effective_lang} — reply ONLY in {effective_lang}]")

    full_message = "\n".join(context_parts) + "\n" + masked_message if context_parts else masked_message

    # --- 3. Retrieve session history ---
    history = _get_history(phone) if phone else []

    # --- 4. Build language-specific system prompt ---
    system_prompt = _build_system_prompt(effective_lang)

    # --- 5. Call the base agent ---
    reply = await process_query_base(
        message=full_message,
        system_prompt=system_prompt,
        history=history,
    )

    # Unmask PII before sending back to the user
    reply = pii_service.unmask(reply, token_map)

    # --- 6. Store in session memory ---
    if phone:
        _push_history(phone, "user", message)        # store original (not context-prefixed)
        _push_history(phone, "assistant", reply)

    logger.info(f"[WhatsApp] Reply generated ({len(reply)} chars) in {effective_lang}")
    return reply


def clear_session(phone: str):
    """Clear session memory for a user (e.g., when they restart with 'hi')."""
    _SESSION_HISTORY.pop(phone, None)
    if phone:
        logger.info(f"[WhatsApp] Session cleared for {phone}")
