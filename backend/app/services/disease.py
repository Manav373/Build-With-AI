"""
Disease detection tool — wraps Gemini Vision with agronomist-grade prompt.
Also provides a symptom-to-disease text lookup for text-based queries.
"""
import httpx
import base64
import logging
import os

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


async def analyze_image_bytes(image_bytes: bytes, mime_type: str = "image/jpeg", language: str = "English") -> str:
    """Analyze crop image using Groq Vision model."""
    from groq import AsyncGroq

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return "Vision analysis unavailable. Please add GROQ_API_KEY to .env file."

    try:
        base64_img = base64.b64encode(image_bytes).decode('utf-8')
        data_url = f"data:{mime_type};base64,{base64_img}"

        lang_instruction = f"\n\nIMPORTANT: Provide the entire response in {language} language using the native script (e.g. Devanagari for Hindi, Gujarati script for Gujarati)."
        prompt = AGRO_VISION_PROMPT + lang_instruction

        client = AsyncGroq(api_key=api_key, max_retries=0)
        model_id = "meta-llama/llama-4-scout-17b-16e-instruct"
        logger.info(f"Using Groq Vision model: {model_id}")
        response = await client.chat.completions.create(
            model=model_id,
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
        return response.choices[0].message.content

    except Exception as e:
        logger.error(f"Groq Vision error: {e}")
        return "Vision analysis temporarily unavailable. Please describe the symptoms in text."


async def analyze_crop_image(image_url: str) -> str:
    """Download image from URL (Twilio) and analyze via Gemini."""
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            r = await client.get(image_url, follow_redirects=True)
            if r.status_code != 200:
                return "Could not download the image. Please try sending it again."
            return await analyze_image_bytes(r.content, r.headers.get("Content-Type", "image/jpeg"))
    except Exception as e:
        logger.error(f"Image download error: {e}")
        return "Error downloading image. Please describe the symptoms in text."
    return ""  # Backup return to satisfy linter


def lookup_symptom(query: str) -> str:
    """Text-based symptom lookup for queries without images."""
    q = query.lower()
    for symptom, (disease, remedy) in SYMPTOM_CATALOG.items():
        if symptom in q:
            return f"🔬 Detected: {disease}\n💊 Treatment: {remedy}"
    return ""
