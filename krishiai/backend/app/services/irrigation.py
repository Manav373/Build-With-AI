"""
Irrigation Calculator — Calculates water requirement per crop, area, and stage of growth.
"""
import logging
from datetime import datetime

logger = logging.getLogger("KrishiMCP.Irrigation")

from app.utils.ai_utils import fetch_structured_agri_data, clean_input

async def calculate_irrigation(
    crop: str,
    area_acres: float,
    growth_stage: str = "vegetative",
    method: str = "flood",
    rainfall_mm: float = 0
) -> dict:
    """
    Calculates weekly irrigation need for a crop using AI based on area, stage, and method.
    """
    crop = clean_input(crop)
    growth_stage = clean_input(growth_stage)
    method = clean_input(method)

    prompt = f"""
    Calculate weekly irrigation requirements for {crop} in India.
    Area: {area_acres} acres, Growth Stage: {growth_stage}, Irrigation Method: {method}, Recent Rainfall: {rainfall_mm}mm.
    
    1 mm of water on 1 acre = 4046.86 liters.
    
    Return EXACTLY this JSON structure:
    {{
        "crop": "{crop.title()}",
        "area_acres": {area_acres},
        "growth_stage": "{growth_stage.title()}",
        "irrigation_method": "{method.title()}",
        "weekly_water_needed_mm": 35.0,
        "to_apply_after_efficiency_mm": 50.0,
        "weekly_water_liters": "e.g. 1,40,000 liters",
        "irrigation_frequency": "e.g. every 5-7 days",
        "rainfall_credited_mm": {rainfall_mm},
        "total_season_liters": "e.g. 15,00,000 liters",
        "method_tip": "Advice on the chosen irrigation method",
        "critical_advice": "Critical water management tip for this stage and crop"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "crop": crop.title(),
            "area_acres": area_acres,
            "weekly_water_liters": "Data temporarily unavailable.",
            "critical_advice": "Ensure sufficient soil moisture during critical stages."
        }
    return data
