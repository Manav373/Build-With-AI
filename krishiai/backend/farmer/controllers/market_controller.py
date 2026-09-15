import logging
from fastapi import HTTPException
from shared.backend.services.market import get_all_market_prices, get_live_mandis_data

logger = logging.getLogger("Backend.Farmer.MarketController")

class MarketController:
    @staticmethod
    async def get_prices(state: str = None, commodity: str = None):
        try:
            return await get_all_market_prices(state=state, commodity=commodity)
        except Exception as e:
            logger.error(f"Error fetching market prices: {e}")
            raise HTTPException(status_code=500, detail="Failed to fetch mandi market prices")

    @staticmethod
    async def get_nearest_mandis(lat: float, lon: float, state: str = "Gujarat"):
        try:
            return await get_live_mandis_data(lat=lat, lon=lon, user_state=state)
        except Exception as e:
            logger.error(f"Error finding nearby mandis: {e}")
            raise HTTPException(status_code=500, detail="Failed to calculate nearby mandi distances")

market_controller = MarketController()
