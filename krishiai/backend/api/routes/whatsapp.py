from fastapi import APIRouter, Request, HTTPException, Depends
import os
from dotenv import load_dotenv
load_dotenv()
import httpx
import logging
import json
import re
from typing import Optional, List, Dict, Any
from app.core.whatsapp_agent import process_whatsapp_query, clear_session
from app.db.database import SessionLocal
from app.models.location import FarmerLocation
from datetime import datetime

logger = logging.getLogger("KrishiMCP.WhatsApp")
router = APIRouter(prefix="/api/whatsapp", tags=["WhatsApp Webhook"])

WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN", "krishiai_secret_token")
WHATSAPP_PHONE_ID = os.getenv("WHATSAPP_PHONE_ID")
WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")

# Twilio credentials
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
TWILIO_PHONE_NUMBER = os.getenv("TWILIO_PHONE_NUMBER")

# In-memory session tracking
USER_PREFERENCES = {}   # phone -> language
USER_LOCATIONS = {}     # phone -> {lat, lon}
USER_STATES = {}        # phone -> state (AWAITING_LANGUAGE, IDLE)


# ═══════════════════════════════════════════════════════════════════════
# KEYWORD MAPS for smart direct-bypass (skips LLM tool-calling overhead)
# ═══════════════════════════════════════════════════════════════════════

WEATHER_KEYWORDS = [
    "weather", "forecast", "temperature", "rain", "humidity", "climate",
    "barish", "mausam", "baarish", "garmi", "thand", "sardi",
    "હવામાન", "વાતાવરણ", "વરસાદ", "પાऊस", "मौसम", "बारिश",
]
MARKET_KEYWORDS = [
    "price", "rate", "mandi", "market", "bhav", "daam", "mol",
    "ભાવ", "બજાર ભાવ", "મંડી", "માર્કેટ યાર્ડ", "યાર્ડ", "ડુંગળી", "दाम", "बाजार", "किमत",
]
SCHEME_KEYWORDS = [
    "scheme", "yojana", "subsidy", "pm-kisan", "pmkisan", "pmfby", "kcc",
    "kisan credit", "fasal bima", "sarkari", "government",
    "યોજના", "સરકારી યોજના", "योजना", "सरकारी", "अनुदान",
]
YIELD_KEYWORDS = [
    "yield", "production", "harvest", "paidavar", "utpadan",
    "ઉત્પાદન", "પાક ઉત્પાદન", "અંદાજ", "उत्पादन", "पैदावार",
]
SOIL_KEYWORDS = [
    "soil", "mitti", "bhumi", "land", "fertilizer", "khad", "npk", "urea",
    "માટી", "ખાતર", "જમીન", "ખાત", "खाद", "मिट्टी", "जमीन",
]
PEST_KEYWORDS = [
    "pest", "insect", "kida", "keeda", "bug", "fungus", "blight",
    "કીટક", "જીવાત", "રોગ", "ઇયળ", "कीट", "कीड़ा", "फफूंद",
]
IRRIGATION_KEYWORDS = [
    "irrigation", "water", "sinchai", "paani", "drip", "sprinkler",
    "સિંચાઈ", "પાણી", "સિંચાઈ પદ્ધતિ", "सिंचाई", "पानी",
]
MENU_KEYWORDS = [
    "menu", "help", "features", "kya kar sakte", "options",
    "મેનુ", "મેનૂ", "સુવિધાઓ", "સહાય", "મેન્યુ", "मेनू", "मदद", "ਸਹાય", "ਮੇਨੂ", "మెనూ", "மெனு", "মেনু",
]
TRENDS_KEYWORDS = [
    "trend", "history", "graph", "chart", "pichle", "itihaas", "rujhan",
    "વલણ", "બજાર વલણ", "ઇતિહાસ", "इतिहास", "रुझान",
]

def _has_keyword(text: str, keywords: list) -> bool:
    text_lower = text.lower()
    return any(kw in text_lower for kw in keywords)


# ── Native Menus for Supported Languages ─────────────────────────────
MENU_TEMPLATE_EN = (
    "🌾 *KrishiAI — All Features*\n\n"
    "Type a number or just describe what you need:\n\n"
    "1️⃣ *Weather Forecast* — \"What's the weather?\"\n"
    "2️⃣ *Market Prices* — \"Onion price in Nashik\"\n"
    "3️⃣ *Crop Advisory* — \"How to grow wheat?\"\n"
    "4️⃣ *Disease Detection* — Send a crop photo 📷\n"
    "5️⃣ *Yield Prediction* — \"Predict yield for 5 acres wheat\"\n"
    "6️⃣ *Government Schemes* — \"PM-KISAN eligibility\"\n"
    "7️⃣ *Soil Analysis* — \"Best fertilizer for cotton?\"\n"
    "8️⃣ *Pest Alerts* — \"Pest risk for tomato\"\n"
    "9️⃣ *Irrigation Advice* — \"Water need for rice 3 acres\"\n"
    "🔟 *Nearby Mandis* — Share your location 📍\n"
    "📈 *Market Trends* — \"Wheat price trend\"\n\n"
    "🎙️ You can also send *voice notes* in any language!\n"
    "📍 Share your *location* for local advice!"
)

MENU_TEMPLATE_GU = (
    "🌾 *કૃષિએઆઈ — તમામ સુવિધાઓ*\n\n"
    "નંબર લખો અથવા તમને જે જરૂર હોય તે જણાવો:\n\n"
    "1️⃣ *હવામાન આગાહી* — \"આજનું હવામાન કેવું રહેશે?\"\n"
    "2️⃣ *બજાર ભાવ* — \"મહુવામાં ડુંગળીનો ભાવ\"\n"
    "3️⃣ *પાક સલાહ* — \"ઘઉંની ખેતી કેવી રીતે કરવી?\"\n"
    "4️⃣ *રોગ-જીવાત તપાસ* — પાકનો ફોટો મોકલો 📷\n"
    "5️⃣ *ઉત્પાદન અંદાજ* — \"૫ એકરમાં ઘઉંનું કેટલું ઉત્પાદન થશે?\"\n"
    "6️⃣ *સરકારી યોજનાઓ* — \"પીએમ-કિસાન યોજનાની માહિતી\"\n"
    "7️⃣ *જમીન ચકાસણી* — \"કપાસ માટે શ્રેષ્ઠ ખાતર કયું?\"\n"
    "8️⃣ *જીવાત ચેતવણી* — \"ટામેટામાં જીવાતનું જોખમ\"\n"
    "9️⃣ *સિંચાઈ સલાહ* — \"ડાંગરના પાક માટે પાણીની જરૂરિયાત\"\n"
    "🔟 *નજીકના માર્કેટ યાર્ડ* — તમારું લોકેશન શેર કરો 📍\n"
    "📈 *બજાર વલણ* — \"ઘઉંના ભાવનું વલણ\"\n\n"
    "🎙️ તમે કોઈપણ ભાષામાં *વૉઇસ નોટ* (બોલીને) પણ મોકલી શકો છો!\n"
    "📍 સ્થાનિક સલાહ માટે તમારું *લોકેશન* શેર કરો!"
)

MENU_TEMPLATE_HI = (
    "🌾 *कृषिAI — सभी सुविधाएँ*\n\n"
    "नंबर भेजें या अपनी ज़रूरत लिखें:\n\n"
    "1️⃣ *मौसम पूर्वानुमान* — \"आज मौसम कैसा रहेगा?\"\n"
    "2️⃣ *मंडी भाव* — \"नासिक में प्याज का भाव\"\n"
    "3️⃣ *फसल सलाह* — \"गेहूं की खेती कैसे करें?\"\n"
    "4️⃣ *रोग पहचान* — फसल की फोटो भेजें 📷\n"
    "5️⃣ *पैदावार अनुमान* — \"5 एकड़ में गेहूं की पैदावार\"\n"
    "6️⃣ *सरकारी योजनाएं* — \"पीएम-किसान पात्रता\"\n"
    "7️⃣ *मिट्टी परीक्षण* — \"कपास के लिए सबसे अच्छा खाद\"\n"
    "8️⃣ *कीट चेतावनी* — \"टमाटर में कीट का खतरा\"\n"
    "9️⃣ *सिंचाई सलाह* — \"धान के लिए पानी की जरूरत\"\n"
    "🔟 *नजदीकी मंडी* — अपनी लोकेशन भेजें 📍\n"
    "📈 *बाज़ार रुझान* — \"गेहूं का भाव रुझान\"\n\n"
    "🎙️ आप किसी भी भाषा में *वॉइस नोट* (बोलकर) भी भेज सकते हैं!\n"
    "📍 सटीक सलाह के लिए अपनी *लोकेशन* शेयर करें!"
)

MENU_TEMPLATE_MR = (
    "🌾 *कृषीAI — सर्व वैशिष्ट्ये*\n\n"
    "क्रमांक पाठवा किंवा आपली गरज लिहा:\n\n"
    "1️⃣ *हवामान अंदाज* — \"आजचे हवामान कसे आहे?\"\n"
    "2️⃣ *बाजार भाव* — \"नाशिकमध्ये कांद्याचा भाव\"\n"
    "3️⃣ *पीक सल्ला* — \"गव्हाची शेती कशी करावी?\"\n"
    "4️⃣ *रोग निदान* — पिकाचा फोटो पाठवा 📷\n"
    "5️⃣ *उत्पादन अंदाज* — \"५ एकरात गव्हाचे उत्पादन\"\n"
    "6️⃣ *शासकीय योजना* — \"पीएम-किसान पात्रता\"\n"
    "7️⃣ *माती परीक्षण* — \"कापसासाठी उत्तम खत कोणते?\"\n"
    "8️⃣ *कीड नियंत्रण* — \"टोमॅटोवरील कीड जोखीम\"\n"
    "9️⃣ *सिंचन सल्ला* — \"भातासाठी पाण्याची गरज\"\n"
    "🔟 *जवळची बाजार समिती* — तुमचे लोकेशन पाठवा 📍\n"
    "📈 *बाजार कल* — \"गव्हाचा दर कल\"\n\n"
    "🎙️ तुम्ही कोणत्याही भाषेत *व्हॉइस नोट* (बोलून) पाठवू शकता!\n"
    "📍 स्थानिक सल्ल्यासाठी तुमचे *लोकेशन* शेअर करा!"
)

MENU_TEMPLATE_TA = (
    "🌾 *கிருஷிAI — அனைத்து சேவைகள்*\n\n"
    "எண்ணை உள்ளிடவும் அல்லது உங்களுக்கு தேவையானதை தெரிவிக்கவும்:\n\n"
    "1️⃣ *வானிலை முன்னறிவிப்பு* — \"இன்றைய வானிலை எப்படி?\"\n"
    "2️⃣ *சந்தை விலை* — \"வெங்காயத்தின் விலை நிலவரம்\"\n"
    "3️⃣ *பயிர் ஆலோசனை* — \"கோதுமை சாகுபடி முறை\"\n"
    "4️⃣ *நோய் கண்டறிதல்* — பயிர் புகைப்படத்தை அனுப்பவும் 📷\n"
    "5️⃣ *விளைச்சல் கணிப்பு* — \"5 ஏக்கர் நிலத்தில் விளைச்சல் எவ்வளவு?\"\n"
    "6️⃣ *அரசு திட்டங்கள்* — \"பிஎம்-கிசான் தகுதி விவரம்\"\n"
    "7️⃣ *மண் பரிசோதனை* — \"பருத்திக்கு சிறந்த உரம் எது?\"\n"
    "8️⃣ *பூச்சி தாக்குதல் எச்சரிக்கை* — \"தக்காளி பூச்சி தாக்குதல்\"\n"
    "9️⃣ *பாசன ஆலோசனை* — \"நெல் பயிருக்கு தேவையான நீர்\"\n"
    "🔟 *அருகிலுள்ள சந்தைகள்* — உங்கள் இருப்பிடத்தை பகிரவும் 📍\n"
    "📈 *சந்தை போக்குகள்* — \"கோதுமை விலை போக்கு\"\n\n"
    "🎙️ எந்த மொழியிலும் *குரல் பதிவு* (வாய்ஸ் நோட்) அனுப்பலாம்!\n"
    "📍 உள்ளூர் ஆலோசனைக்கு உங்கள் *இருப்பிடத்தை* பகிரவும்!"
)

MENU_TEMPLATE_TE = (
    "🌾 *కృషిAI — అన్ని సేవలు*\n\n"
    "సంఖ్యను పంపండి లేదా మీ అవసరాన్ని తెలపండి:\n\n"
    "1️⃣ *వాతావరణ సమాచారం* — \"నేటి వాతావరణం ఎలా ఉంది?\"\n"
    "2️⃣ *మార్కెట్ ధరలు* — \"ఉల్లిపాయ తాజా ధర\"\n"
    "3️⃣ *పంట సలహా* — \"గోధుమ సాగు పద్ధతి\"\n"
    "4️⃣ *రోగ నిర్ధారణ* — పంట ఫోటో పంపండి 📷\n"
    "5️⃣ *దిగుబడి అంచనా* — \"5 ఎకరాలలో గోధుమ దిగుబడి\"\n"
    "6️⃣ *ప్రభుత్వ పథకాలు* — \"పీఎం-కిసాన్ అర్హత\"\n"
    "7️⃣ *నేల పరీక్ష* — \"పత్తికి ఉత్తమ ఎరువులు\"\n"
    "8️⃣ *కీటక హెచ్చరిక* — \"టమోటాలో కీటకాల సమస్య\"\n"
    "9️⃣ *నీటిపారుదల సలహా* — \"వరి పంటకు నీటి అవసరం\"\n"
    "🔟 *సమీప మార్కెట్లు* — మీ లొకేషన్ షేర్ చేయండి 📍\n"
    "📈 *మార్కెట్ ట్రెండ్స్* — \"గోధుమ ధర ట్రెండ్\"\n\n"
    "🎙️ మీరు ఏదైనా భాషలో *వాయిస్ నోట్* కూడా పంపవచ్చు!\n"
    "📍 స్థానిక సలహా కోసం మీ *లొకేషన్* షేర్ చేయండి!"
)

MENU_TEMPLATE_BN = (
    "🌾 *কৃষিAI — সমস্ত সুবিধাসমূহ*\n\n"
    "একটি নম্বর লিখুন অথবা আপনার প্রয়োজনীয় তথ্য জানান:\n\n"
    "1️⃣ *আবহাওয়ার পূর্বাভাস* — \"আজকের আবহাওয়া কেমন?\"\n"
    "2️⃣ *বাজার দর* — \"পেঁয়াজের বর্তমান দাম\"\n"
    "3️⃣ *ফসল পরামর্শ* — \"গম চাষ কীভাবে করবেন?\"\n"
    "4️⃣ *রোগ শনাক্তকরণ* — ফসলের ছবি পাঠান 📷\n"
    "5️⃣ *ফলন অনুমান* — \"৫ একরে গম উৎপাদন কতটা হবে?\"\n"
    "6️⃣ *সরকারি প্রকল্প* — \"পিএম-কিসান যোগ্যতা\"\n"
    "7️⃣ *মাটি পরীক্ষা* — \"তুলার জন্য সেরা সার কোনটি?\"\n"
    "8️⃣ *কীটপতঙ্গ সতর্কতা* — \"টমেটোতে পোকার আক্রমণ\"\n"
    "9️⃣ *সেচ পরামর্শ* — \"ধানের জন্য জলের প্রয়োজনীয়তা\"\n"
    "🔟 *নিকটস্থ মাণ্ডি* — আপনার লোকেশন শেয়ার করুন 📍\n"
    "📈 *বাজারের প্রবণতা* — \"গমের দামের ধারা\"\n\n"
    "🎙️ আপনি যেকোনো ভাষায় *ভয়েস নোট* পাঠাতে পারেন!\n"
    "📍 স্থানীয় পরামর্শের জন্য আপনার *লোকেশন* শেয়ার করুন!"
)

MENU_TEMPLATE_PA = (
    "🌾 *ਕ੍ਰਿਸ਼ੀAI — ਸਾਰੀਆਂ ਸਹੂਲਤਾਂ*\n\n"
    "ਕੋਈ ਨੰਬਰ ਲਿਖੋ ਜਾਂ ਆਪਣੀ ਲੋੜ ਦੱਸੋ:\n\n"
    "1️⃣ *ਮੌਸਮ ਦੀ ਜਾਣਕਾਰੀ* — \"ਅੱਜ ਦਾ ਮੌਸਮ ਕਿਵੇਂ ਰਹੇਗਾ?\"\n"
    "2️⃣ *ਮੰਡੀ ਭਾਅ* — \"ਪਿਆਜ਼ ਦਾ ਤਾਜ਼ਾ ਭਾਅ\"\n"
    "3️⃣ *ਫ਼ਸਲ ਸਲਾਹ* — \"ਕਣਕ ਦੀ ਖੇਤੀ ਕਿਵੇਂ ਕਰੀਏ?\"\n"
    "4️⃣ *ਬਿਮਾਰੀ ਦੀ ਜਾਂਚ* — ਫ਼ਸਲ ਦੀ ਫੋਟੋ ਭੇਜੋ 📷\n"
    "5️⃣ *ਝਾੜ ਦਾ ਅੰਦਾਜ਼ਾ* — \"5 ਏਕੜ ਕਣਕ ਦਾ ਝਾੜ\"\n"
    "6️⃣ *ਸਰਕਾਰੀ ਸਕੀਮਾਂ* — \"ਪੀਐਮ-ਕਿਸਾਨ ਯੋਗਤਾ\"\n"
    "7️⃣ *ਮਿੱਟੀ ਦੀ ਪਰਖ* — \"ਨਰਮੇ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਖਾਦ\"\n"
    "8️⃣ *ਕੀੜੇ-ਮਕੌੜੇ ਚੇਤਾਵਨੀ* — \"ਟਮਾਟਰ ਵਿੱਚ ਕੀੜੇ ਦਾ ਖ਼ਤਰਾ\"\n"
    "9️⃣ *ਸਿੰਚਾਈ ਸਲਾਹ* — \"ਝੋਨੇ ਲਈ ਪਾਣੀ ਦੀ ਲੋੜ\"\n"
    "🔟 *ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ* — ਆਪਣੀ ਲੋਕੇਸ਼ਨ ਭੇਜੋ 📍\n"
    "📈 *ਮੰਡੀ ਰੁਝਾਨ* — \"ਕਣਕ ਦੇ ਭਾਅ ਦਾ ਰੁਝਾਨ\"\n\n"
    "🎙️ ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਭਾਸ਼ਾ ਵਿੱਚ *ਵੌਇਸ ਨੋਟ* ਵੀ ਭੇਜ ਸਕਦੇ ਹੋ!\n"
    "📍 ਸਹੀ ਸਲਾਹ ਲਈ ਆਪਣੀ *ਲੋਕੇਸ਼ਨ* ਸਾਂਝੀ ਕਰੋ!"
)

# Registry of verified native templates
MENU_TEMPLATES: Dict[str, str] = {
    "English": MENU_TEMPLATE_EN,
    "Gujarati": MENU_TEMPLATE_GU,
    "Hindi": MENU_TEMPLATE_HI,
    "Marathi": MENU_TEMPLATE_MR,
    "Tamil": MENU_TEMPLATE_TA,
    "Telugu": MENU_TEMPLATE_TE,
    "Bengali": MENU_TEMPLATE_BN,
    "Punjabi": MENU_TEMPLATE_PA,
}

# Translation cache initialized with all native menus
MENU_CACHE: Dict[str, str] = dict(MENU_TEMPLATES)


async def _get_menu(lang: str) -> str:
    """Return the feature menu in `lang`.
    Supported languages return instant native templates.
    Unrecognized languages fall back to dynamic translation via Groq.
    """
    if lang in MENU_CACHE:
        return MENU_CACHE[lang]

    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return MENU_TEMPLATE_EN

    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=groq_api_key)
        prompt = (
            f"Translate the following WhatsApp menu message accurately into {lang}.\n"
            "Rules:\n"
            "- Keep ALL emojis exactly as-is.\n"
            "- Keep WhatsApp *bold* markers (*…*) exactly as-is.\n"
            "- Keep numbered list format (1️⃣ 2️⃣ …) exactly as-is.\n"
            "- Use natural, authentic agricultural terms used by local farmers.\n"
            "- Output ONLY the translated message, nothing else.\n\n"
            + MENU_TEMPLATE_EN
        )
        resp = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=1500,
        )
        translated = resp.choices[0].message.content.strip()
        MENU_CACHE[lang] = translated
        logger.info(f"[WA] Menu dynamically translated for language: {lang}")
        return translated
    except Exception as e:
        logger.error(f"[WA] Menu translation failed for {lang}: {e}")
        MENU_CACHE[lang] = MENU_TEMPLATE_EN
        return MENU_TEMPLATE_EN




# ═══════════════════════════════════════════════════════════════════════
# DB HELPERS
# ═══════════════════════════════════════════════════════════════════════

async def _save_whatsapp_location(lat: float, lon: float, phone: str) -> dict:
    """Persist a WhatsApp farmer's GPS coordinates with granular details."""
    try:
        from app.api.location import _reverse_geocode
        loc = await _reverse_geocode(lat, lon)
        db = SessionLocal()
        try:
            record = FarmerLocation(
                lat=lat, lon=lon, 
                village=loc.get("village"),
                taluka=loc.get("taluka"),
                district=loc.get("district"),
                city=loc.get("city"),
                state=loc.get("state"),
                pincode=loc.get("pincode"),
                source="whatsapp", timestamp=datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            logger.info(f"[WA] Saved location for {phone}: {loc.get('village') or loc.get('city')}, {loc.get('taluka')}, {loc.get('state')}")
            return loc
        finally:
            db.close()
    except Exception as e:
        logger.error(f"[WA] Failed to save location: {e}")
    return {}


# ═══════════════════════════════════════════════════════════════════════
# CORE MESSAGE HANDLER — Routes to right service
# ═══════════════════════════════════════════════════════════════════════

async def handle_whatsapp_logic(sender_phone: str, text_body: str, lat: Optional[float] = None, lon: Optional[float] = None):
    """
    Central router for all WhatsApp text messages.
    Uses smart keyword bypasses for faster responses, falls back to LLM tool-calling.
    """
    clean_msg = text_body.strip().lower()
    user_lang = USER_PREFERENCES.get(sender_phone, "English")

    # ── 1. GREETING → Language Menu ──
    trigger_keywords = [
        "hi", "hello", "hey", "namaste", "suno", "kaise ho", "kaisa",
        "start", "greet", "hi krishi", "नमस्ते", "kem chho",
    ]
    is_greeting = any(clean_msg.startswith(k) for k in trigger_keywords) or clean_msg in trigger_keywords
    if len(clean_msg) > 20: is_greeting = False

    if is_greeting:
        logger.info(f"[WA] Greeting from {sender_phone}, showing language menu")
        clear_session(sender_phone)
        USER_STATES[sender_phone] = "AWAITING_LANGUAGE"
        welcome_text = (
            "🌾 *Welcome to KrishiAI* — Your Smart Farming Advisor!\n\n"
            "Please choose your language / कृपया अपनी भाषा चुनें:\n\n"
            "1️⃣  English\n"
            "2️⃣  हिंदी (Hindi)\n"
            "3️⃣  ગુજરાતી (Gujarati)\n"
            "4️⃣  मराठी (Marathi)\n"
            "5️⃣  தமிழ் (Tamil)\n"
            "6️⃣  తెలుగు (Telugu)\n"
            "7️⃣  বাংলা (Bengali)\n"
            "8️⃣  ਪੰਜਾਬੀ (Punjabi)\n\n"
            "Reply with the number — or just type in your own language! 👇"
        )
        await send_whatsapp_reply(sender_phone, welcome_text)
        return

    # ── 2. LANGUAGE SELECTION (1-8) → Confirmation + Feature Menu ──
    lang_map = {
        "1": "English", "2": "Hindi", "3": "Gujarati", "4": "Marathi",
        "5": "Tamil", "6": "Telugu", "7": "Bengali", "8": "Punjabi",
    }
    
    current_state = USER_STATES.get(sender_phone, "IDLE")

    if clean_msg in lang_map and (current_state == "AWAITING_LANGUAGE" or sender_phone not in USER_PREFERENCES):
        selected_lang = lang_map[clean_msg]
        USER_PREFERENCES[sender_phone] = selected_lang
        USER_STATES[sender_phone] = "IDLE"
        logger.info(f"[WA] {sender_phone} selected: {selected_lang}")

        confirmation_map = {
            "English":  "✅ Language set to *English*!",
            "Hindi":    "✅ भाषा *हिंदी* सेट की गई!",
            "Gujarati": "✅ ભાષા *ગુજરાતી* સેટ થઈ!",
            "Marathi":  "✅ भाषा *मराठी* सेट केली!",
            "Tamil":    "✅ மொழி *தமிழ்* அமைக்கப்பட்டது!",
            "Telugu":   "✅ భాష *తెలుగు* సెట్ చేయబడింది!",
            "Bengali":  "✅ ভাষা *বাংলা* সেট করা হয়েছে!",
            "Punjabi":  "✅ ਭਾਸ਼ਾ *ਪੰਜਾਬੀ* ਸੈੱਟ ਕੀਤੀ!",
        }
        confirm = confirmation_map.get(selected_lang, confirmation_map["English"])
        menu = await _get_menu(selected_lang)
        await send_whatsapp_reply(sender_phone, f"{confirm}\n\n{menu}")
        return

    # ── 2b. NUMERIC MENU MAPPING (1-10) → Map to Keywords ──
    if clean_msg.isdigit() and current_state == "IDLE":
        menu_map = {
            "1": "weather forecast", "2": "market prices", "3": "crop advisory",
            "4": "disease detection", "5": "yield prediction", "6": "government schemes",
            "7": "soil analysis", "8": "pest alerts", "9": "irrigation advice", "10": "nearby mandis",
        }
        if clean_msg in menu_map:
            mapped_query = menu_map[clean_msg]
            logger.info(f"[WA] Numeric menu shortcut for {sender_phone}: {clean_msg} -> {mapped_query}")
            text_body = mapped_query
            clean_msg = mapped_query

    # ── 3. MENU COMMAND ──
    if _has_keyword(text_body, MENU_KEYWORDS) and len(clean_msg) < 30:
        await send_whatsapp_reply(sender_phone, await _get_menu(user_lang))
        return

    # ── 4. SMART BYPASS: Weather (needs GPS or city name) ──
    if _has_keyword(text_body, WEATHER_KEYWORDS):
        f_lat = lat or (USER_LOCATIONS.get(sender_phone, {}).get("lat"))
        f_lon = lon or (USER_LOCATIONS.get(sender_phone, {}).get("lon"))

        if f_lat and f_lon:
            from app.services.weather import get_weather_by_coords
            logger.info(f"[WA] Direct GPS weather for {sender_phone} at ({f_lat},{f_lon})")
            weather_data = await get_weather_by_coords(float(f_lat), float(f_lon))

            if "error" not in weather_data:
                w = weather_data
                report = (
                    f"🌤 *Weather Report: {w.get('city')}*\n\n"
                    f"🌡 *Temp:* {w.get('temp_c')}°C (Feels {w.get('feels_like')}°C)\n"
                    f"💧 *Humidity:* {w.get('humidity')}%\n"
                    f"💨 *Wind:* {w.get('wind_kmh')} km/h\n"
                    f"🧭 *Pressure:* {w.get('pressure')} hPa\n"
                    f"👁 *Visibility:* {w.get('visibility_km')} km\n"
                    f"🌅 *Sunrise:* {w.get('sunrise')}\n"
                    f"🌇 *Sunset:* {w.get('sunset')}\n\n"
                    f"*Conditions:* {w.get('description')}\n\n"
                    f"📍 _GPS location used for {w.get('city')}_"
                )
                # Add AI farming advice
                report = await _append_ai_advice(
                    report, sender_phone,
                    f"Weather in {w['city']}: {w['description']}, {w['temp_c']}°C, humidity {w['humidity']}%. "
                    f"Give 2 lines of WhatsApp-bolded farming advice."
                )
                await send_whatsapp_reply(sender_phone, report)
                return

    # ── 5. SMART BYPASS: Market Prices ──
    if _has_keyword(text_body, MARKET_KEYWORDS):
        from app.services.market import get_market_price
        logger.info(f"[WA] Market price query from {sender_phone}: {text_body}")
        # Extract crop & location from message using simple heuristics
        result = await get_market_price(crop=text_body, location="India")
        if result and "error" not in str(result).lower():
            formatted = await _format_with_ai(
                sender_phone, text_body,
                f"Market price data: {json.dumps(result)}. "
                f"Format as a WhatsApp message with *bold* headers and emojis. Keep it concise (8-12 lines)."
            )
            await send_whatsapp_reply(sender_phone, formatted)
            return

    # ── 6. SMART BYPASS: Government Schemes ──
    if _has_keyword(text_body, SCHEME_KEYWORDS):
        from app.services.scheme import get_gov_scheme
        logger.info(f"[WA] Scheme query from {sender_phone}: {text_body}")
        result = await get_gov_scheme(state="India", crop="general")
        if result:
            formatted = await _format_with_ai(
                sender_phone, text_body,
                f"Government scheme data: {json.dumps(result)}. "
                f"Format for WhatsApp. Include eligibility, benefits, how to apply. Use *bold* and emojis."
            )
            await send_whatsapp_reply(sender_phone, formatted)
            return

    # ── 7. SMART BYPASS: Yield Prediction ──
    if _has_keyword(text_body, YIELD_KEYWORDS):
        from app.services.yield_estimation import estimate_yield
        logger.info(f"[WA] Yield query from {sender_phone}: {text_body}")
        # Let AI handle parsing - fall through to tool-calling
        pass  # LLM will use estimate_yield tool

    # ── 8. SMART BYPASS: Soil Analysis ──
    if _has_keyword(text_body, SOIL_KEYWORDS):
        from app.services.soil import analyze_soil_health
        logger.info(f"[WA] Soil query from {sender_phone}: {text_body}")
        pass  # LLM will use analyze_soil_health tool

    # ── 9. SMART BYPASS: Pest Alerts ──
    if _has_keyword(text_body, PEST_KEYWORDS):
        from app.services.pest import get_pest_alerts
        logger.info(f"[WA] Pest query from {sender_phone}: {text_body}")
        pass  # LLM will use get_pest_alerts tool

    # ── 10. SMART BYPASS: Irrigation ──
    if _has_keyword(text_body, IRRIGATION_KEYWORDS):
        logger.info(f"[WA] Irrigation query from {sender_phone}: {text_body}")
        pass  # LLM will use calculate_irrigation tool

    # ── 11. SMART BYPASS: Nearby Mandis (if user has shared location) ──
    stored_loc = USER_LOCATIONS.get(sender_phone, {})
    if _has_keyword(text_body, ["mandi", "market near", "nearby", "najdik", "નજીક", "नजदीक", "जवळ"]):
        loc_lat = lat or stored_loc.get("lat")
        loc_lon = lon or stored_loc.get("lon")
        if loc_lat and loc_lon:
            from app.services.market import get_live_mandis_data
            logger.info(f"[WA] Mandi search for {sender_phone} at ({loc_lat},{loc_lon})")
            mandis = await get_live_mandis_data(float(loc_lat), float(loc_lon))
            if mandis:
                lines = [f"🏪 *Nearby Mandis ({len(mandis)} found):*\n"]
                for i, m in enumerate(mandis[:8]):  # limit to 8
                    lines.append(f"{i+1}. *{m.get('name', 'Unknown')}* — {m.get('city', '')}")
                    if m.get('crops'):
                        lines.append(f"   🌾 {m['crops']}")
                    if m.get('price_note'):
                        lines.append(f"   📊 {m['price_note']}")
                lines.append(f"\n📍 _Based on your GPS location_")
                await send_whatsapp_reply(sender_phone, "\n".join(lines))
                return

    # ── 12. SMART BYPASS: Market Trends ──
    if _has_keyword(text_body, TRENDS_KEYWORDS):
        from app.services.market import get_commodity_trends
        logger.info(f"[WA] Trend query from {sender_phone}: {text_body}")
        pass # LLM will use get_commodity_trends tool
    
    # ── FALLBACK: Forward to AI agent with all tools ──
    logger.info(f"[WA] AI routing for {sender_phone}: {text_body} (lang={user_lang})")

    f_lat = lat or stored_loc.get("lat", 0.0)
    f_lon = lon or stored_loc.get("lon", 0.0)
    try:
        f_lat = float(f_lat) if f_lat else 0.0
        f_lon = float(f_lon) if f_lon else 0.0
    except (ValueError, TypeError):
        f_lat, f_lon = 0.0, 0.0

    ai_response = await process_whatsapp_query(
        message=text_body, phone=sender_phone,
        lat=f_lat, lon=f_lon, language=user_lang,
    )
    await send_whatsapp_reply(sender_phone, ai_response)


# ═══════════════════════════════════════════════════════════════════════
# AI HELPER — Adds farming advice or formats tool results
# ═══════════════════════════════════════════════════════════════════════

async def _append_ai_advice(base_report: str, phone: str, advice_prompt: str) -> str:
    """Appends AI-generated farming advice to a report."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return base_report
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=groq_api_key)
        lang = USER_PREFERENCES.get(phone, "English")
        resp = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[{"role": "user", "content": f"{advice_prompt}\nReply ONLY in {lang}. Use WhatsApp *bold* formatting."}]
        )
        return f"{base_report}\n\n💡 *Farming Advice:*\n{resp.choices[0].message.content}"
    except Exception as e:
        logger.error(f"[WA] AI advice error: {e}")
        return base_report


async def _format_with_ai(phone: str, user_msg: str, format_prompt: str) -> str:
    """Uses AI to format raw data into WhatsApp-friendly message."""
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key:
        return "Data fetched but formatting unavailable. Please try again."
    try:
        from groq import AsyncGroq
        client = AsyncGroq(api_key=groq_api_key)
        lang = USER_PREFERENCES.get(phone, "English")
        resp = await client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": f"You are KrishiAI WhatsApp bot. Reply ONLY in {lang}. Use *bold* and emojis. Keep concise (max 1500 chars)."},
                {"role": "user", "content": f"Farmer asked: '{user_msg}'\n\n{format_prompt}"}
            ]
        )
        return resp.choices[0].message.content
    except Exception as e:
        logger.error(f"[WA] AI format error: {e}")
        return "Sorry, an error occurred. Please try again."


# ═══════════════════════════════════════════════════════════════════════
# IMAGE HANDLER — Crop Disease Detection
# ═══════════════════════════════════════════════════════════════════════

async def handle_whatsapp_vision(sender_phone: str, image_url: str = "", media_id: str = ""):
    """Downloads image, analyzes with Gemini Vision, replies with diagnosis."""
    try:
        user_lang = USER_PREFERENCES.get(sender_phone, "English")
        processing_msgs = {
            "English": "📷 Analyzing your crop photo... Please wait.",
            "Hindi": "📷 आपकी फसल की फोटो का विश्लेषण हो रहा है... कृपया प्रतीक्षा करें।",
            "Gujarati": "📷 તમારા પાકના ફોટોનું વિશ્લેષણ થઈ રહ્યું છે... કૃપા કરી રાહ જુઓ.",
            "Marathi": "📷 તમારા પિકાત્ચા ફોટોત્ચે વિશ્લેષણ હોત આહે... કૃપયા પ્રતીક્ષા કરા.",
        }
        await send_whatsapp_reply(sender_phone, processing_msgs.get(user_lang, processing_msgs["English"]))

        image_bytes = None
        mime_type = "image/jpeg"

        if media_id:
            media_info = await _get_meta_media_info(media_id)
            if media_info:
                media_url = media_info.get("url")
                mime_type = media_info.get("mime_type", "image/jpeg")
                image_bytes = await _download_meta_media(media_url)
        elif image_url:
            image_bytes, ct = await _download_generic_media(image_url)
            if ct: mime_type = ct

        if not image_bytes:
            await send_whatsapp_reply(sender_phone, "❌ Sorry, I couldn't download the image. Please try again.")
            return

        from app.services.disease import analyze_image_bytes
        vision_result = await analyze_image_bytes(image_bytes, mime_type, language=user_lang)

        from app.services.pii import pii_service
        pii_masked_result, token_map = pii_service.mask(vision_result)

        # Format with AI for better WhatsApp presentation
        formatted = await _format_with_ai(
            sender_phone, "I sent a photo of my crop",
            f"Vision AI analysis result:\n{pii_masked_result}\n\n"
            f"Present as a WhatsApp message: disease name, severity, immediate actions, treatment. Use *bold* and emojis."
        )
        final_reply = pii_service.unmask(formatted, token_map)
        await send_whatsapp_reply(sender_phone, f"✅ *Analysis Complete:*\n\n{final_reply}")

    except Exception as e:
        logger.error(f"[WA] Vision error: {e}")
        await send_whatsapp_reply(sender_phone, "❌ Something went wrong during image analysis. Please try later.")


# ═══════════════════════════════════════════════════════════════════════
# AUDIO HANDLER — Voice Note Transcription + Processing
# ═══════════════════════════════════════════════════════════════════════

async def handle_whatsapp_audio(sender_phone: str, audio_url: str = "", media_id: str = ""):
    """Downloads voice note, transcribes with Whisper, processes with AI."""
    try:
        user_lang = USER_PREFERENCES.get(sender_phone, "English")
        processing_msgs = {
            "English": "🎙️ Processing your voice message...",
            "Hindi": "🎙️ आपका वॉइस मैसेज प्रोसेस हो रहा है...",
            "Gujarati": "🎙️ તમારો વૉઇસ મેસેજ પ્રોસેસ થઈ રહ્યો છે...",
            "Marathi": "🎙️ તમારો વૉઇસ મેસેજ પ્રોસેસ હોત આહે...",
        }
        await send_whatsapp_reply(sender_phone, processing_msgs.get(user_lang, processing_msgs["English"]))

        audio_bytes = None
        filename = "voice.ogg"

        if media_id:
            media_info = await _get_meta_media_info(media_id)
            if media_info:
                media_url = media_info.get("url")
                audio_bytes = await _download_meta_media(media_url)
        elif audio_url:
            audio_bytes, ct = await _download_generic_media(audio_url)
            if ct:
                if "mpeg" in ct or "mp3" in ct: filename = "voice.mp3"
                elif "ogg" in ct: filename = "voice.ogg"
                elif "wav" in ct: filename = "voice.wav"

        if not audio_bytes:
            await send_whatsapp_reply(sender_phone, "❌ Couldn't download your audio message.")
            return

        from app.utils.speech import transcribe_audio_bytes
        text = await transcribe_audio_bytes(audio_bytes, filename)

        if not text or len(text.strip()) < 2:
            no_hear = {
                "English": "❌ I couldn't hear that clearly. Please try again or type your message.",
                "Hindi": "❌ मैं स्पष्ट नहीं सुन पाया। कृपया फिर से बोलें या टाइप करें।",
                "Gujarati": "❌ હું સ્પષ્ટ સાંભળી શક્યો નહીં. ફરીથી પ્રયાસ કરો.",
                "Marathi": "❌ મલા સ્પષ્ટ ઐકૂ આલે નાહી. પુન્હા પ્રયત્ન કરા.",
            }
            await send_whatsapp_reply(sender_phone, no_hear.get(user_lang, no_hear["English"]))
            return

        logger.info(f"[WA] Voice transcription from {sender_phone}: {text}")
        transcribed_msg = {
            "English": f"🎙️ _I heard:_ \"{text}\"\n\n",
            "Hindi": f"🎙️ _मैंने सुना:_ \"{text}\"\n\n",
            "Gujarati": f"🎙️ _મેં સાંભળ્યું:_ \"{text}\"\n\n",
            "Marathi": f"🎙️ _મી ઐકલે:_ \"{text}\"\n\n",
        }
        # Send transcription confirmation then process
        conf = transcribed_msg.get(user_lang, transcribed_msg["English"])
        await send_whatsapp_reply(sender_phone, f"{conf}Processing your question...")
        stored = USER_LOCATIONS.get(sender_phone, {})
        await handle_whatsapp_logic(sender_phone, text, lat=stored.get("lat"), lon=stored.get("lon"))

    except Exception as e:
        logger.error(f"[WA] Audio error: {e}")
        await send_whatsapp_reply(sender_phone, "❌ Error processing voice message.")


# ═══════════════════════════════════════════════════════════════════════
# MEDIA DOWNLOAD HELPERS
# ═══════════════════════════════════════════════════════════════════════

async def _get_meta_media_info(media_id: str) -> Optional[Dict[str, Any]]:
    if not WHATSAPP_ACCESS_TOKEN: return None
    url = f"https://graph.facebook.com/v22.0/{media_id}"
    headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers)
            return res.json() if res.status_code == 200 else None
    except Exception:
        return None

async def _download_meta_media(url: str) -> Optional[bytes]:
    if not WHATSAPP_ACCESS_TOKEN: return None
    headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}"}
    try:
        async with httpx.AsyncClient() as client:
            res = await client.get(url, headers=headers, follow_redirects=True)
            return res.content if res.status_code == 200 else None
    except Exception:
        return None

async def _download_generic_media(url: str) -> tuple[Optional[bytes], Optional[str]]:
    """Downloads media (supports Twilio auth)."""
    try:
        auth = None
        if "twilio.com" in url and TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN:
            auth = (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.get(url, auth=auth, follow_redirects=True)
            if res.status_code == 200:
                return res.content, res.headers.get("Content-Type")
            return None, None
    except Exception as e:
        logger.error(f"[WA] Media download error: {e}")
        return None, None


# ═══════════════════════════════════════════════════════════════════════
# WEBHOOK ENDPOINTS (Meta Cloud API + Twilio)
# ═══════════════════════════════════════════════════════════════════════

@router.get("/webhook")
async def verify_webhook(request: Request):
    mode = request.query_params.get("hub.mode")
    token = request.query_params.get("hub.verify_token")
    challenge = request.query_params.get("hub.challenge")
    if mode == "subscribe" and token == WHATSAPP_VERIFY_TOKEN:
        from fastapi.responses import PlainTextResponse
        return PlainTextResponse(content=challenge, headers={"ngrok-skip-browser-warning": "true"})
    raise HTTPException(status_code=403, detail="Verification failed")

@router.post("/webhook")
async def receive_message(request: Request):
    try:
        content_type = request.headers.get("content-type", "")

        if "application/x-www-form-urlencoded" in content_type:
            # ── TWILIO PROVIDER ──
            form_data = await request.form()
            sender_phone = str(form_data.get("From", "")).replace("whatsapp:", "")
            text_body = str(form_data.get("Body", ""))
            image_url = form_data.get("MediaUrl0")
            media_type = str(form_data.get("MediaContentType0", ""))
            lat = form_data.get("Latitude")
            lon = form_data.get("Longitude")

            if image_url and media_type.startswith("image"):
                await handle_whatsapp_vision(sender_phone, image_url=str(image_url))
            elif image_url and media_type.startswith("audio"):
                await handle_whatsapp_audio(sender_phone, audio_url=str(image_url))
            elif lat and lon:
                logger.info(f"[WA] Location from {sender_phone} via Twilio: ({lat},{lon})")
                loc = await _save_whatsapp_location(float(lat), float(lon), sender_phone)
                USER_LOCATIONS[sender_phone] = {"lat": float(lat), "lon": float(lon), "details": loc}
                
                place_name = loc.get("village") or loc.get("taluka") or loc.get("city")
                location_msg = f"I have shared my location: {place_name} ({lat}, {lon}). Please identify my exact area and provide relevant farming or weather advice."
                await handle_whatsapp_logic(sender_phone, location_msg, lat=float(lat), lon=float(lon))
            elif str(form_data.get("MediaContentType0", "")).startswith("audio"):
                audio_url = form_data.get("MediaUrl0")
                await handle_whatsapp_audio(sender_phone, audio_url=str(audio_url))
            else:
                await handle_whatsapp_logic(sender_phone, text_body)

        elif "application/json" in content_type:
            # ── META CLOUD API PROVIDER ──
            body = await request.json()
            for entry in body.get("entry", []):
                for change in entry.get("changes", []):
                    value = change.get("value", {})
                    for message in value.get("messages", []):
                        sender_phone = message.get("from")
                        msg_type = message.get("type")

                        if msg_type == "text":
                            await handle_whatsapp_logic(sender_phone, message.get("text", {}).get("body", ""))
                        elif msg_type == "image":
                            await handle_whatsapp_vision(sender_phone, media_id=message.get("image", {}).get("id"))
                        elif msg_type == "audio":
                            await handle_whatsapp_audio(sender_phone, media_id=message.get("audio", {}).get("id"))
                        elif msg_type == "location":
                            loc = message.get("location", {})
                            loc_lat = loc.get("latitude")
                            loc_lon = loc.get("longitude")
                            if loc_lat and loc_lon:
                                res_loc = await _save_whatsapp_location(float(loc_lat), float(loc_lon), sender_phone)
                                USER_LOCATIONS[sender_phone] = {"lat": float(loc_lat), "lon": float(loc_lon), "details": res_loc}
                                
                                place_name = res_loc.get("village") or res_loc.get("taluka") or res_loc.get("city")
                                await handle_whatsapp_logic(sender_phone, f"Location shared: {place_name}", lat=loc_lat, lon=loc_lon)
                        elif msg_type == "interactive":
                            interactive = message.get("interactive", {})
                            if interactive.get("type") == "button_reply":
                                title = interactive.get("button_reply", {}).get("title", "")
                                cleaned_title = re.sub(r'^\d+\.\s*', '', title)
                                _title_lower = cleaned_title.lower()
                                for _lang in ["English", "Hindi", "Gujarati", "Marathi", "Tamil", "Telugu", "Bengali", "Punjabi"]:
                                    if _lang.lower() in _title_lower:
                                        USER_PREFERENCES[sender_phone] = _lang
                                        USER_STATES[sender_phone] = "IDLE"
                                        break
                                ai_response = await process_whatsapp_query(
                                    message=f"Language selected: {cleaned_title}",
                                    phone=sender_phone,
                                    language=USER_PREFERENCES.get(sender_phone, "English"),
                                )
                                await send_whatsapp_reply(sender_phone, ai_response)
    except Exception as e:
        logger.error(f"[WA] Webhook error: {e}")
    return {"status": "ok"}


# ═══════════════════════════════════════════════════════════════════════
# SEND REPLY (Meta Graph API + Twilio fallback)
# ═══════════════════════════════════════════════════════════════════════

async def send_whatsapp_reply(to_phone: str, text: str, buttons: Optional[List[Dict[str, Any]]] = None):
    text_with_buttons = text
    if buttons:
        options = "\n".join([f"• {b['reply']['title']}" for b in buttons])
        text_with_buttons = f"{text}\n\nSelect an option:\n{options}"

    # 1. Meta Graph API
    if WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_ID:
        url = f"https://graph.facebook.com/v22.0/{WHATSAPP_PHONE_ID}/messages"
        headers = {"Authorization": f"Bearer {WHATSAPP_ACCESS_TOKEN}", "Content-Type": "application/json"}
        payload = {
            "messaging_product": "whatsapp",
            "to": to_phone,
            "type": "interactive" if buttons else "text",
            "text": {"body": text} if not buttons else None,
            "interactive": {
                "type": "button",
                "body": {"text": text},
                "action": {"buttons": buttons}
            } if buttons else None
        }
        payload = {k: v for k, v in payload.items() if v is not None}
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(url, headers=headers, json=payload)
                if res.status_code in [200, 201]: return
        except Exception: pass

    # 2. Twilio Fallback
    if TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN and TWILIO_PHONE_NUMBER:
        if not to_phone.startswith("whatsapp:"):
            to_phone = f"whatsapp:{to_phone if to_phone.startswith('+') else '+' + to_phone}"

        # WhatsApp limit is 1600 characters
        if len(text_with_buttons) > 1580:
            text_with_buttons = text_with_buttons[:1577] + "..."
            logger.warning(f"[WA] Truncated message to {to_phone}")

        data = {"To": to_phone, "From": TWILIO_PHONE_NUMBER, "Body": text_with_buttons}
        try:
            async with httpx.AsyncClient() as client:
                res = await client.post(
                    f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_ACCOUNT_SID}/Messages.json",
                    data=data, auth=(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
                )
                if res.status_code not in [200, 201]:
                    logger.error(f"[WA] Twilio error {to_phone}: {res.status_code} - {res.text}")
                else:
                    logger.info(f"[WA] Twilio reply sent to {to_phone}")
        except Exception as e:
            logger.error(f"[WA] Twilio exception: {e}")
