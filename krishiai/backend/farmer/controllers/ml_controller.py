import logging
from fastapi import HTTPException
from farmer.backend.services.ml_model import predict, predict_all_crops

logger = logging.getLogger("Backend.Farmer.MLController")

class MLController:
    @staticmethod
    def predict_yield(crop_name: str, district: str, season: str, temperature: float = None, rainfall: float = None):
        try:
            return predict(
                crop_name=crop_name,
                district=district,
                season=season,
                temperature=temperature,
                rainfall=rainfall
            )
        except Exception as e:
            logger.error(f"Error in ML yield prediction: {e}")
            raise HTTPException(status_code=500, detail="Yield prediction engine error")

    @staticmethod
    def recommend_crops(district: str, season: str, nitrogen: float = None, phosphorus: float = None, potassium: float = None):
        try:
            return predict_all_crops(
                district=district,
                season=season,
                nitrogen=nitrogen,
                phosphorus=phosphorus,
                potassium=potassium
            )
        except Exception as e:
            logger.error(f"Error in crop recommendations: {e}")
            raise HTTPException(status_code=500, detail="Recommendation engine error")

ml_controller = MLController()
