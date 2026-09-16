"""
app/utils/language_detector.py — Multi-language auto-detection & localization helper
----------------------------------------------------------------------------------
Supports:
  - Unicode block identification (Devanagari, Tamil, Gujarati, Telugu, Bengali, Punjabi, Kannada, Malayalam)
  - Transliterated / Romanized phonetic detection (Hinglish, Tanglish, Romanized Gujarati, Romanized Marathi)
  - Multilingual system prompt injection & localized fallback responses
"""

import re
from typing import Optional

# ---------------------------------------------------------------------------
# Unicode block ranges
# ---------------------------------------------------------------------------
_DEVANAGARI = re.compile(r'[\u0900-\u097F]')      # Hindi, Marathi
_GUJARATI   = re.compile(r'[\u0A80-\u0AFF]')       # Gujarati
_TAMIL      = re.compile(r'[\u0B80-\u0BFF]')       # Tamil
_TELUGU     = re.compile(r'[\u0C00-\u0C7F]')       # Telugu
_BENGALI    = re.compile(r'[\u0980-\u09FF]')       # Bengali
_PUNJABI    = re.compile(r'[\u0A00-\u0A7F]')       # Punjabi (Gurmukhi)
_KANNADA    = re.compile(r'[\u0C80-\u0CFF]')       # Kannada
_MALAYALAM  = re.compile(r'[\u0D00-\u0D7F]')       # Malayalam

# ---------------------------------------------------------------------------
# Transliterated / Romanized keyword patterns
# ---------------------------------------------------------------------------
_HINGLISH_KW = re.compile(
    r'\b(aaj|kal|parso|kya|hai|hain|kaisa|kaisi|kaise|kitna|kitne|kitni|mausam|'
    r'hawamaan|havaman|barish|barsat|bhav|daam|rate|gehun|gehu|chawal|dhan|paani|'
    r'pani|khet|kheti|fasal|kisan|namaste|khad|dawai|batao|bataiye|chahiye|meri|'
    r'mera|mere|suno|bhai|kare|hota|hote|tamatar|aalu|pyaj|miti|mitti|ropan)\b',
    re.IGNORECASE
)

_TANGLISH_KW = re.compile(
    r'\b(inraiya|indraya|vanilai|eppadi|epdi|irukku|irukkum|vilai|enna|nel|'
    r'arisi|vivasayam|vivasayi|payir|thaneer|kadan|solla|sollunga|vanakkam|'
    r'thakkali|mazhai|mann|vithai|marunthu)\b',
    re.IGNORECASE
)

_GUJARATI_KW = re.compile(
    r'\b(kem|chho|aaje|su|che|khedut|varsad|ghau|apvo|jovu|karo|bhav|daam|'
    r'kheti|vavtar|dhana|chana)\b',
    re.IGNORECASE
)

_MARATHI_KW = re.compile(
    r'\b(kay|ahe|kasa|kase|paus|havaman|sheti|shetkari|pik|pikasathi|dar|'
    r'kiti|gavhacha|sanga|sangto|sangave|khata|sheta|bhav)\b',
    re.IGNORECASE
)

# Language code to Name mapping
LANG_CODE_MAP = {
    'en': 'English',
    'hi': 'Hindi',
    'gu': 'Gujarati',
    'mr': 'Marathi',
    'ta': 'Tamil',
    'te': 'Telugu',
    'bn': 'Bengali',
    'pa': 'Punjabi',
    'kn': 'Kannada',
    'ml': 'Malayalam',
}

# ---------------------------------------------------------------------------
# Language detection function
# ---------------------------------------------------------------------------
def detect_language(message: str, preference: str = "English") -> str:
    """
    Detect the language the user is writing in.
    Returns: 'English', 'Hindi', 'Tamil', 'Gujarati', 'Marathi', etc.
    Falls back to `preference` if no specific language indicators are matched.
    """
    if not message:
        return preference

    # Strip any system-prepended metadata like [Farmer's exact GPS: ...]
    clean_message = re.sub(r'^\[Farmer\'s [^\]]+\]\s*', '', message, flags=re.IGNORECASE).strip()
    if not clean_message:
        clean_message = message

    # 1. Unicode script match takes primary precedence
    if _TAMIL.search(clean_message):
        return "Tamil"
    if _GUJARATI.search(clean_message):
        return "Gujarati"
    if _TELUGU.search(clean_message):
        return "Telugu"
    if _BENGALI.search(clean_message):
        return "Bengali"
    if _PUNJABI.search(clean_message):
        return "Punjabi"
    if _KANNADA.search(clean_message):
        return "Kannada"
    if _MALAYALAM.search(clean_message):
        return "Malayalam"

    # Devanagari is shared by Hindi & Marathi
    if _DEVANAGARI.search(clean_message):
        if _MARATHI_KW.search(clean_message) or any(w in clean_message for w in ["आहे", "कसा", "शेतकरी", "पाऊस", "पिका"]):
            return "Marathi"
        return "Hindi"

    # 2. Transliterated / Phonetic Romanized checks
    # Count keyword matches to disambiguate overlapping words (like 'aaj', 'bhav')
    hinglish_matches = len(_HINGLISH_KW.findall(clean_message))
    tanglish_matches = len(_TANGLISH_KW.findall(clean_message))
    marathi_matches  = len(_MARATHI_KW.findall(clean_message))
    gujarati_matches = len(_GUJARATI_KW.findall(clean_message))

    scores = {
        "Hindi": hinglish_matches,
        "Tamil": tanglish_matches,
        "Marathi": marathi_matches,
        "Gujarati": gujarati_matches,
    }
    best_lang, max_score = max(scores.items(), key=lambda x: x[1])
    if max_score > 0:
        return best_lang

    # 3. Fallback to caller-provided preference
    if preference in LANG_CODE_MAP.values():
        return preference
    return LANG_CODE_MAP.get(preference.lower(), "English")


# ---------------------------------------------------------------------------
# Localized location prompt helper
# ---------------------------------------------------------------------------
LOCATION_PROMPTS = {
    "English": "📍 To get an accurate, real-time weather update for your area, please tap the **location icon** (📍) in the chat bar.",
    "Hindi": "📍 अपने क्षेत्र के सटीक और रीयल-टाइम मौसम अपडेट के लिए, कृपया चैट बार में **लोकेशन आइकन** (📍) पर टैप करें।",
    "Tamil": "📍 உங்கள் பகுதிக்கான துல்லியமான நிகழ்நேர வானிலை தகவலைப் பெற, தயவுசெய்து சேட் பாரில் உள்ள **இருப்பிட ஐகானை** (📍) தட்டவும்.",
    "Gujarati": "📍 તમારા વિસ્તારના સચોટ હવામાન અપડેટ માટે, કૃપા કરીને ચેટ બારમાં **લોકેશન આઇકન** (📍) પર ટેપ કરો.",
    "Marathi": "📍 तुमच्या परिसरातील अचूक हवामानाच्या माहितीसाठी, कृपया चॅट बारमधील **लोकेशन आयकॉन** (📍) वर टॅप करा.",
}

def get_location_prompt(language: str) -> str:
    """Return the localized location request message."""
    return LOCATION_PROMPTS.get(language, LOCATION_PROMPTS["English"])


# ---------------------------------------------------------------------------
# Language prompt injection helper
# ---------------------------------------------------------------------------
LANGUAGE_INSTRUCTIONS = {
    "English": "The user is writing in English. You MUST respond in English.",
    "Hindi": "The user is writing in Hindi (or Hinglish). You MUST respond in fluent Hindi using Devanagari script (हिंदी) or natural conversational Hindi. Do NOT respond in English.",
    "Tamil": "The user is writing in Tamil (or Tanglish). You MUST respond in fluent Tamil using Tamil script (தமிழ்). Do NOT respond in English or Hindi.",
    "Gujarati": "The user is writing in Gujarati. You MUST respond in fluent Gujarati using Gujarati script (ગુજરાતી). Do NOT respond in English or Hindi.",
    "Marathi": "The user is writing in Marathi. You MUST respond in fluent Marathi using Devanagari script (मराठी). Do NOT respond in English or Hindi.",
    "Telugu": "The user is writing in Telugu. You MUST respond in fluent Telugu using Telugu script (తెలుగు).",
    "Bengali": "The user is writing in Bengali. You MUST respond in fluent Bengali using Bengali script (বাংলা).",
    "Punjabi": "The user is writing in Punjabi. You MUST respond in fluent Punjabi using Gurmukhi script (ਪੰਜਾਬੀ).",
    "Kannada": "The user is writing in Kannada. You MUST respond in fluent Kannada using Kannada script (ಕನ್ನಡ).",
    "Malayalam": "The user is writing in Malayalam. You MUST respond in fluent Malayalam using Malayalam script (മലയാളം).",
}

def get_language_rule(language: str) -> str:
    """Return strict system prompt instructions for language mirroring."""
    return LANGUAGE_INSTRUCTIONS.get(language, LANGUAGE_INSTRUCTIONS["English"])
