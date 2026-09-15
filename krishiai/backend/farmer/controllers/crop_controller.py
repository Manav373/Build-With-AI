import logging
from fastapi import HTTPException
from shared.backend.services.weather import get_weather_by_city
from shared.backend.utils.ai_utils import fetch_agri_text

logger = logging.getLogger("Backend.Farmer.CropController")

class CropController:
    @staticmethod
    async def get_crop_advisory(crop_name: str, location: str):
        try:
            weather_data = await get_weather_by_city(location)
            prompt = f"Provide expert farming and disease prevention advice for {crop_name} in {location}."
            advisory = await fetch_agri_text(prompt)
            return {
                "crop": crop_name,
                "location": location,
                "weather": weather_data,
                "advisory": advisory
            }
        except Exception as e:
            logger.error(f"Error in get_crop_advisory: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch crop advisory")

crop_controller = CropController()
