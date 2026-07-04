"""
Crop advisory tool using Groq LLaMA3 for real AI-powered advice.
Provides sowing calendar, irrigation, fertilizer, and pest management.
"""
import logging
from datetime import datetime

logger = logging.getLogger("KrishiMCP.CropAdvice")


from app.utils.ai_utils import fetch_structured_agri_data, clean_input
from datetime import datetime

async def get_crop_advice(crop: str, location: str, weather_summary: str = "") -> dict:
    """
    Returns AI-generated expert crop advice for any crop/location/weather.
    """
    crop = clean_input(crop)
    location = clean_input(location)
    current_month = datetime.now().strftime("%B")

    prompt = f"""
    Provide expert agricultural advice for {crop} in {location}, India.
    Current Month: {current_month}
    Weather Context: {weather_summary}
    
    Return EXACTLY this JSON structure:
    {{
        "crop": "{crop.title()}",
        "location": "{location.title()}",
        "season": "Kharif/Rabi/Zaid",
        "sowing_window": "e.g. Oct-Nov",
        "harvest_window": "e.g. Mar-Apr",
        "duration_days": 120,
        "sowing_advice": "Detailed advice about timing and variety",
        "fertilizer": "NPK recommendations",
        "water_requirement_mm": 500,
        "weather_context": "{weather_summary}"
    }}
    """
    
    data = await fetch_structured_agri_data(prompt)
    if "error" in data:
        return {
            "crop": crop.title(),
            "location": location.title(),
            "sowing_advice": "Advice temporarily unavailable. Consult your local KVK.",
            "fertilizer": "Follow standard NPK ratios for your soil type.",
            "water_requirement_mm": 500
        }
    return data


def format_crop_advice_for_llm(data: dict) -> str:
    lines = [f"🌱 Crop Advisory: {data['crop']} | {data['location']}"]
    if data.get("sowing_advice"):
        lines.append(data["sowing_advice"])
    if data.get("sowing_window"):
        lines.append(f"Sowing: {data['sowing_window']} → Harvest: {data.get('harvest_window', 'varies')}")
    if data.get("fertilizer"):
        lines.append(f"Fertilizer: {data['fertilizer']}")
    if data.get("water_requirement_mm"):
        lines.append(f"Water Needed: ~{data['water_requirement_mm']} mm/season")
    return "\n".join(lines)


def _get_season(month: int) -> str:
    if month in (6, 7, 8, 9, 10): return "Kharif"
    elif month in (11, 12, 1, 2, 3): return "Rabi"
    return "Zaid"


def _months_to_text(months: list) -> str:
    MONTH_NAMES = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
    return "-".join(MONTH_NAMES[m] for m in months if 1 <= m <= 12)
