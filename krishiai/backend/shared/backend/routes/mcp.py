from fastapi import APIRouter
from mcp.server.fastmcp import FastMCP
from shared.backend.services.weather import get_weather_by_city
from shared.backend.services.market import get_market_price

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
async def market_price(crop: str, location: str) -> str:
    """Get recent crop market prices."""
    res = await get_market_price(crop, location)
    return res['advice']
