"""
Disease detection tool — analyzes crop photos to identify diseases, pests, and deficiencies.
Uses Groq Vision (qwen/qwen3.8-27b) as the primary engine, with Gemini Vision as emergency fallback.
Also provides a symptom-to-disease text lookup for text-based queries.
"""
import httpx
import base64
import logging
import os
from typing import Optional

logger = logging.getLogger("KrishiMCP.Disease")

# Text-based symptom lookup for when no image is provided
SYMPTOM_CATALOG = {
    "yellow leaves":         ("Nitrogen deficiency or Yellowing Mosaic Virus",   "Apply urea (N-rich fertilizer). If mosaic pattern — remove infected plants."),
    "yellow spot":           ("Early Blight (Alternaria)",                        "Spray Mancozeb 75% WP @ 2g/L water. Remove infected leaves."),
    "brown spot":            ("Brown Spot (Bipolaris/Helminthosporium)",           "Spray Carbendazim 50% WP @ 1g/L. Ensure balanced K fertilization."),
    "white powder":          ("Powdery Mildew (Erysiphe sp.)",                    "Spray wettable Sulphur 80% WP @ 3g/L or Hexaconazole 5% EC @ 1ml/L."),
    "wilting":               ("Fusarium Wilt or Root Rot",                         "Soil drench with Carbendazim 50% WP. Improve drainage. Avoid waterlogging."),
    "holes in leaves":       ("Caterpillar / Helicoverpa Pest",                   "Spray Chlorpyrifos 20% EC @ 2ml/L or apply neem oil @ 5ml/L."),
    "black spots":           ("Anthracnose or Bacterial Leaf Spot",               "Copper Oxychloride 50% WP @ 3g/L. Avoid overhead irrigation."),
    "rust":                  ("Rust (Puccinia sp.)",                               "Spray Propiconazole 25% EC @ 1ml/L. Ensure proper plant spacing for airflow."),
    "stunted growth":        ("Micronutrient Deficiency or Viral Disease",         "Apply Zinc Sulphate 21% @ 25 kg/ha. Test soil at KVK for specific deficiency."),
    "leaf curl":             ("Leaf Curl Virus (whitefly-transmitted)",            "Control whiteflies with Imidacloprid 17.8% SL @ 0.3ml/L. Use reflective mulch."),
    "rotting":               ("Soft Rot (Bacterial) or Blight",                   "Remove infected parts. Apply Copper Hydroxide. Reduce irrigation."),
    "pink stem":             ("Pink Disease / Fusarium",                           "Apply Carbendazim drenching @ root zone."),
    "sticky leaves":         ("Aphid or Mealybug infestation",                    "Spray Thiamethoxam 25% WG @ 0.3g/L. Remove heavily infested shoots."),
}

AGRO_VISION_PROMPT = """You are an expert agronomist and plant pathologist advising Indian rural farmers.

Analyze this crop photo and provide:
1. **Crop Identified**: What crop is this?
2. **Disease/Issue**: Any disease, pest, or deficiency detected (be specific with scientific name if possible)
3. **Confidence**: Your confidence level (High/Medium/Low)
4. **Immediate Action**: What should the farmer do in the next 24-48 hours?
5. **Treatment**: Specific fungicide/pesticide/fertilizer name with dosage
6. **Prevention**: How to prevent this in future season

Keep language simple and actionable. Use Indian market product names when possible."""


async def _analyze_with_groq_vision(image_bytes: bytes, mime_type: str, prompt: str, groq_key: str) -> Optional[str]:
    """Primary Vision: Analyze crop image using Groq Vision model (qwen/qwen3.8-27b)."""
    from groq import AsyncGroq
    # Verified working Groq Vision model
    primary_model = "qwen/qwen3.8-27b"
    
    try:
        base64_img = base64.b64encode(image_bytes).decode('utf-8')
        data_url = f"data:{mime_type};base64,{base64_img}"
        client = AsyncGroq(api_key=groq_key, max_retries=1)

        logger.info(f"[Vision] Analyzing crop image using Groq model: {primary_model}")
        response = await client.chat.completions.create(
            model=primary_model,
            messages=[{
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url}}
                ]
            }],
            max_tokens=800,
            temperature=0.2
        )
        if response.choices and response.choices[0].message.content:
            logger.info(f"[Vision] Groq {primary_model} successfully analyzed image.")
            return response.choices[0].message.content
    except Exception as e:
        logger.warning(f"[Vision] Groq Vision ({primary_model}) encountered error: {e}")
    
    return None


async def _analyze_with_gemini_emergency(image_bytes: bytes, mime_type: str, prompt: str, gemini_key: str) -> Optional[str]:
    """Emergency Fallback: Analyze crop image using Gemini Vision if Groq is unavailable."""
    logger.info("[Vision] Groq unavailable. Activating emergency Gemini Vision fallback...")
    candidate_models = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-3.5-flash"]
    
    # 1. Try google.genai SDK
    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=gemini_key)

        for model_id in candidate_models:
            try:
                part = types.Part.from_bytes(data=image_bytes, mime_type=mime_type)
                response = client.models.generate_content(
                    model=model_id,
                    contents=[part, prompt]
                )
                if response and response.text:
                    logger.info(f"[Vision] Emergency Gemini fallback succeeded with {model_id}.")
                    return response.text
            except Exception as model_err:
                logger.warning(f"[Vision] Gemini {model_id} failed: {model_err}")
                continue
    except Exception as sdk_err:
        logger.warning(f"[Vision] google.genai SDK error, falling back to direct REST: {sdk_err}")

    # 2. Direct REST fallback via httpx
    try:
        base64_img = base64.b64encode(image_bytes).decode('utf-8')
        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
                    {"inline_data": {"mime_type": mime_type, "data": base64_img}}
                ]
            }]
        }
        for model_id in candidate_models:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_id}:generateContent?key={gemini_key}"
            async with httpx.AsyncClient(timeout=25.0) as http_client:
                r = await http_client.post(url, json=payload)
                if r.status_code == 200:
                    data = r.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        parts = candidates[0].get("content", {}).get("parts", [])
                        if parts and "text" in parts[0]:
                            logger.info(f"[Vision] Emergency Gemini REST succeeded with {model_id}.")
                            return parts[0]["text"]
    except Exception as rest_err:
        logger.error(f"[Vision] Emergency Gemini REST fallback failed: {rest_err}")

    return None


async def analyze_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg", language: str = "English") -> str:
    """Analyze crop image. Uses Groq models primarily; Gemini only as emergency backup."""
    lang_instruction = f"\n\nIMPORTANT: Provide the entire response in {language} language using the native script (e.g. Devanagari for Hindi, Gujarati script for Gujarati)."
    prompt = AGRO_VISION_PROMPT + lang_instruction

    # 1. PRIMARY: Groq Vision (qwen/qwen3.8-27b)
    groq_key = os.getenv("GROQ_API_KEY")
    if groq_key:
        groq_result = await _analyze_with_groq_vision(image_bytes, mime_type, prompt, groq_key)
        if groq_result:
            return groq_result

    # 2. EMERGENCY BACKUP ONLY: Gemini Vision (gemini-2.5-flash)
    gemini_key = os.getenv("GEMINI_API_KEY")
    if gemini_key:
        emergency_result = await _analyze_with_gemini_emergency(image_bytes, mime_type, prompt, gemini_key)
        if emergency_result:
            return emergency_result

    logger.error("[Vision] All vision models failed or API keys missing.")
    return "Vision analysis temporarily unavailable. Please describe the symptoms in text."


async def analyze_crop_image(image_url: str) -> str:
    """Download image from URL (Twilio / WhatsApp) and analyze via Vision AI."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(image_url, follow_redirects=True)
            if r.status_code != 200:
                return "Could not download the image. Please try sending it again."
            return await analyze_image_bytes(r.content, r.headers.get("Content-Type", "image/jpeg"))
    except Exception as e:
        logger.error(f"Image download error: {e}")
        return "Error downloading image. Please describe the symptoms in text."
    return ""


def lookup_symptom(query: str) -> str:
    """Text-based symptom lookup for queries without images."""
    q = query.lower()
    for symptom, (disease, remedy) in SYMPTOM_CATALOG.items():
        if symptom in q:
            return f"🔬 Detected: {disease}\n💊 Treatment: {remedy}"
    return ""
