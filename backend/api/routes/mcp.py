from fastapi import APIRouter
from mcp.server.fastmcp import FastMCP
from typing import Dict, Any
from app.services.weather import get_weather_by_city
from app.services.crop_advice import get_crop_advice
from app.services.market import get_market_price
from app.services.disease import analyze_crop_image
from app.utils.speech import transcribe_audio
from app.services.scheme import get_gov_scheme

router = APIRouter(prefix="/api/tools", tags=["KrishiAI Tools"])

# Initialize FastMCP to expose these as MCP tools
mcp_server = FastMCP(name="KrishiMCP")

@mcp_server.tool()
async def weather(location: str) -> str:
    """Get weather advice for a specific location."""
    res = await get_weather_by_city(location)
    if "error" in res:
        return f"Weather data unavailable: {res['error']}"
    return f"Weather in {res['city']}: {res['temp_c']}°C, {res['description']}. Advice: Watch for {res['humidity']}% humidity."

@mcp_server.tool()
async def advice_for_crop(crop: str, location: str, weather: str) -> str:
    """Get AI generated farming advice based on crop, location, and weather."""
    res = await get_crop_advice(crop, location, weather)
    return f"Sowing advice: {res['sowing_advice']}. Fertilizer: {res['fertilizer']}."

@mcp_server.tool()
async def market_price(crop: str, location: str) -> str:
    """Get recent crop market prices."""
    res = await get_market_price(crop, location)
    return res['advice']

@mcp_server.tool()
async def crop_disease(image_url: str) -> str:
    """Detect plant disease from an image URL."""
    res = await analyze_crop_image(image_url)
    return res

@mcp_server.tool()
async def transcribe(audio_url: str) -> str:
    """Transcribe farmer audio messages into text."""
    res = await transcribe_audio(audio_url)
    return res['transcription']

@mcp_server.tool()
async def gov_schemes(state: str, crop: str) -> str:
    """Get relevant agricultural schemes for a state and crop."""
    res = await get_gov_scheme(state, crop)
    return ", ".join(res['schemes']) if res['schemes'] else "No schemes found."


