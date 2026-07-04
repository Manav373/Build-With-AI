"""
Soil Health Analyzer — Recommends soil amendments based on crop, soil type, and symptoms.
"""
import logging

logger = logging.getLogger("KrishiMCP.Soil")

from app.utils.ai_utils import fetch_structured_agri_data, clean_input

async def analyze_soil_health(soil_type: str, crop: str = "general", symptoms: str = "") -> dict:
    """
    Returns AI-generated soil health analysis, amendment recommendations, and crop suitability.
    """
    soil_type = clean_input(soil_type)
    crop = clean_input(crop)
    symptoms = clean_input(symptoms)

    prompt = f"""
    Analyze the health of {soil_type} soil for growing {crop} in India.
    Farmer reported symptoms: {symptoms}.
    
    Return EXACTLY this JSON structure:
    {{
        "soil_type": "{soil_type.title()}",
        "crop": "{crop.title()}",
        "ph_range": "e.g. 6.0-7.5",
        "texture": "e.g. Sandy Loam",
        "suitable_for_crop": true,
        "crop_suitability": "Detailed suitability and better crop options if not ideal",
        "base_amendments": "What to add (e.g. Gypsum, Lime, FYM, Compost)",
        "ph_advice": "Detailed advice on managing pH for this soil",
        "fertilizer_dosage": "Provide specific kg per acre doses for Urea, DAP, etc.",
        "dosage_method": "When and how to apply (e.g. Basal dose at sowing)",
        "deficiency_remedy": "How to fix specific symptoms (dosage/method) or null",
        "challenges": "Agricultural challenges with this specific soil",
        "quick_tip": "One short, actionable tip for the farmer"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "soil_type": soil_type.title(),
            "crop": crop.title(),
            "ph_range": "6.0-7.5",
            "suitable_for_crop": True,
            "crop_suitability": "Soil data temporarily unavailable.",
            "base_amendments": "Apply balanced organic manure.",
            "ph_advice": "Consult local KVK for soil testing.",
            "challenges": "General maintenance required."
        }
    return data
