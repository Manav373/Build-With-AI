import logging
from fastapi import HTTPException
from shared.backend.utils.ai_utils import fetch_agri_text

logger = logging.getLogger("Backend.Farmer.SchemesController")

class SchemesController:
    @staticmethod
    async def summarize_scheme(title: str, description: str, lang: str = "en"):
        try:
            prompt = f"Explain government scheme '{title}' ({description}) for a farmer in {lang}."
            return await fetch_agri_text(prompt)
        except Exception as e:
            logger.error(f"Error summarizing scheme: {e}")
            raise HTTPException(status_code=500, detail="Failed to generate AI scheme summary")

schemes_controller = SchemesController()
