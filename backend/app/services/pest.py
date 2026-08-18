"""
Pest Alert System — Predicts likely pests based on crop, season, and weather conditions.
"""
import logging
from datetime import datetime

logger = logging.getLogger("KrishiMCP.Pest")

from app.utils.ai_utils import fetch_structured_agri_data, clean_input
from datetime import datetime

async def get_pest_alerts(crop: str, temp_c: float = None, humidity: float = None) -> dict:
    """
    Returns AI-generated likely pest threats for the given crop and current conditions.
    """
    crop = clean_input(crop)
    current_month = datetime.now().strftime("%B")

    prompt = f"""
    Predict likely agricultural pests and diseases for {crop} in India during {current_month}.
    Consider these weather conditions: Temp {temp_c}°C, Humidity {humidity}%.
    
    Return EXACTLY this JSON structure:
    {{
        "crop": "{crop.title()}",
        "season": "Kharif/Rabi/Zaid",
        "current_threats": [
            {{"name": "Pest or Disease Name", "risk": "HIGH/MEDIUM/LOW", "treatment": "Detailed treatment recommendation"}}
        ],
        "weather_warnings": ["List of weather-based risks (e.g. 'High humidity favors fungal growth')"],
        "high_risk_count": 0,
        "prevention_tip": "General scouting and prevention advice",
        "spray_timing": "Best time of day to apply treatments"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "crop": crop.title(),
            "season": "Seasonal",
            "current_threats": [],
            "weather_warnings": ["Weather data temporarily unavailable."],
            "high_risk_count": 0,
            "prevention_tip": "Scout your field twice a week. Look at both sides of leaves.",
            "spray_timing": "Spray early morning or late evening."
        }
    return data
