"""
Yield Estimator — Estimates expected yield based on crop, area, seed variety, and conditions.
"""
import logging

logger = logging.getLogger("KrishiMCP.Yield")

from app.utils.ai_utils import fetch_structured_agri_data, clean_input

async def estimate_yield(crop: str, area_acres: float, variety: str = "average", conditions: str = "good") -> dict:
    """
    Estimates crop yield range using AI based on crop, area, variety type, and field conditions.
    """
    crop = clean_input(crop)
    variety = clean_input(variety)
    conditions = clean_input(conditions)

    prompt = f"""
    Estimate the expected crop yield for {crop} in India.
    Area: {area_acres} acres, Seed Variety: {variety}, Field Conditions: {conditions}.
    
    Return EXACTLY this JSON structure:
    {{
        "crop": "{crop.title()}",
        "area_acres": {area_acres},
        "variety": "{variety}",
        "conditions": "{conditions}",
        "yield_low": "e.g. 10.5 quintals",
        "yield_avg": "e.g. 15.0 quintals",
        "yield_high": "e.g. 22.0 quintals",
        "expected_range": "e.g. 10.5-22.0 quintals",
        "per_acre_avg": "e.g. 15.0 quintals/acre",
        "revenue_estimate_msp": "e.g. ₹20,000 - ₹40,000 (based on latest MSP)",
        "tips": "Detailed advice to maximize yield for this specific crop and condition"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "crop": crop.title(),
            "area_acres": area_acres,
            "expected_range": "Yield data temporarily unavailable.",
            "tips": "Consult your local agricultural officer for yield estimates."
        }
    return data
