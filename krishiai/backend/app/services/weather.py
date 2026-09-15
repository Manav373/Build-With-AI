"""
Real-time weather tool using OpenWeatherMap API.
Provides current conditions + 5-day forecast + farming advice.
"""
import httpx
import logging
import os

logger = logging.getLogger("KrishiMCP.WeatherTool")

BASE_URL = "https://api.openweathermap.org/data/2.5"


async def get_weather_by_city(location: str) -> dict:
    """Fetch live weather by city name or 'lat,lon' GPS coordinates."""
    # Robustly check if location contains GPS coordinates like "23.09,72.53" or embedded coords
    import re
    coord_match = re.search(r'(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)', location)
    if coord_match:
        try:
            lat = float(coord_match.group(1))
            lon = float(coord_match.group(2))
            logger.info(f"Detected GPS coordinates in location string: {lat},{lon}")
            return await get_weather_by_coords(lat, lon)
        except ValueError:
            pass

    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        return {"error": "OPENWEATHER_API_KEY not set"}
    try:
        # Build candidate city search queries from most specific to cleaned parts
        candidates = [location]
        if "," in location:
            parts = [p.strip() for p in location.split(",") if p.strip()]
            for p in parts:
                if p not in candidates:
                    candidates.append(p)
                # Strip administrative labels like Tahsil, Tehsil, District, Taluka
                cleaned = p
                for word in ["Tahsil", "Tehsil", "District", "Taluka", "Block"]:
                    cleaned = cleaned.replace(word, "").strip()
                if cleaned and cleaned not in candidates:
                    candidates.append(cleaned)

        async with httpx.AsyncClient(timeout=10) as client:
            for candidate in candidates:
                r = await client.get(f"{BASE_URL}/weather?q={candidate}&appid={key}&units=metric")
                if r.status_code == 200:
                    return _parse(r.json())

            return {"error": f"Could not find weather for '{location}'. Please try a nearby major city name."}
    except Exception as e:
        logger.error(f"Weather city error: {e}")
        return {"error": str(e)}


async def get_weather_by_coords(lat: float, lon: float) -> dict:
    """Fetch live weather by GPS coordinates from browser."""
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        return {"error": "OPENWEATHER_API_KEY not set"}
    try:
        # Get more precise city/neighborhood name via Geocoding API
        precise_name = await get_precise_location_name(lat, lon, key)
        
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{BASE_URL}/weather?lat={lat}&lon={lon}&appid={key}&units=metric")
            if r.status_code == 200:
                data = r.json()
                if precise_name:
                    data["name"] = precise_name # Override with neighborhood name if found
                return _parse(data)
            return {"error": f"API error {r.status_code}"}
    except Exception as e:
        logger.error(f"Weather coords error: {e}")
        return {"error": str(e)}


async def get_precise_location_name(lat: float, lon: float, key: str) -> str:
    """Reverse geocode to get the most accurate neighborhood/city name."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            # First try OWM Reverse Geocoding API
            geo_url = f"http://api.openweathermap.org/geo/1.0/reverse?lat={lat}&lon={lon}&limit=1&appid={key}"
            r = await client.get(geo_url)
            if r.status_code == 200:
                geo_data = r.json()
                if geo_data:
                    return geo_data[0].get("name", "")
            else:
                logger.warning(f"OWM Geocoding returned {r.status_code}")
    except Exception as e:
        logger.error(f"OWM Geocoding error: {e}")

    # Fallback to OpenStreetMap Nominatim (more accurate for rural/villages)
    try:
        logger.info(f"Falling back to Nominatim for accurate location: {lat}, {lon}")
        async with httpx.AsyncClient(timeout=5, headers={"User-Agent": "KrishiAI-WeatherBot/1.0"}) as client:
            nom_url = f"https://nominatim.openstreetmap.org/reverse?lat={lat}&lon={lon}&format=json&addressdetails=1"
            r = await client.get(nom_url)
            if r.status_code == 200:
                addr = r.json().get("address", {})
                # Try to get the most localized name possible
                return (addr.get("village") or addr.get("suburb") or 
                        addr.get("town") or addr.get("district") or 
                        addr.get("city") or "")
    except Exception as e:
        logger.error(f"Nominatim fallback error: {e}")
        
    return ""


async def get_forecast_by_coords(lat: float, lon: float) -> list[dict]:
    """Fetch 5-day / 3-hour forecast by GPS coordinates."""
    key = os.getenv("OPENWEATHER_API_KEY")
    if not key:
        return []
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            r = await client.get(f"{BASE_URL}/forecast?lat={lat}&lon={lon}&appid={key}&units=metric&cnt=8")
            if r.status_code == 200:
                items = r.json().get("list", [])
                return [
                    {
                        "time": item["dt_txt"],
                        "temp": item["main"]["temp"],
                        "description": item["weather"][0]["description"],
                        "rain_mm": item.get("rain", {}).get("3h", 0),
                    }
                    for item in items[:4]  # next 12 hours
                ]
        return []
    except Exception as e:
        logger.error(f"Forecast error: {e}")
        return []


def _parse(data: dict) -> dict:
    import datetime
    main = data.get("main", {})
    weather = data.get("weather", [{}])[0]
    sys = data.get("sys", {})
    
    return {
        "city": data.get("name", "Unknown"),
        "temp_c": round(main.get("temp", 0), 1),
        "feels_like": round(main.get("feels_like", 0), 1),
        "humidity": main.get("humidity", 0),
        "pressure": main.get("pressure", 1013),
        "wind_kmh": round(data.get("wind", {}).get("speed", 0) * 3.6, 1),
        "description": weather.get("description", "").capitalize(),
        "visibility_km": round(data.get("visibility", 10000) / 1000, 1),
        "clouds_pct": data.get("clouds", {}).get("all", 0),
        "sunrise": datetime.datetime.fromtimestamp(sys.get("sunrise", 0)).strftime("%H:%M") if sys.get("sunrise") else "N/A",
        "sunset": datetime.datetime.fromtimestamp(sys.get("sunset", 0)).strftime("%H:%M") if sys.get("sunset") else "N/A",
    }


def _generate_agri_advisory(w: dict, forecast: list = None) -> str:
    """Generate a high-accuracy farming tip based on current and future weather."""
    temp = w.get("temp_c", 25)
    hum = w.get("humidity", 50)
    wind = w.get("wind_kmh", 0)
    rain_imminent = False
    
    if forecast:
        rain_imminent = any(f.get("rain_mm", 0) > 0.5 for f in forecast[:4])

    if rain_imminent:
        return "⚠️ Rain expected soon. Avoid fertilizer application or spraying today to prevent runoff."
    if wind > 20:
        return "💨 High wind speeds detected. Postpone any pesticide spraying to avoid drift."
    if temp > 35:
        return "☀️ Extreme heat detected. Ensure light irrigation in the evening to protect crops from heat stress."
    if hum > 80 and temp > 25:
        return "🔬 High humidity and warmth detected. Fungal risk is high; check leaves for spots regularly."
    if temp < 10:
        return "❄️ Low temperatures detected. Protect sensitive crops from frost damage if possible."
    if 20 <= temp <= 30 and hum < 70 and not rain_imminent:
        return "🌱 Optimal conditions detected. Great time for sowing or general field maintenance."
    
    return "✅ Weather is stable for normal agricultural activities."


def format_weather_for_llm(w: dict, forecast: list = None) -> str:
    """Convert weather dict into a high-accuracy, agri-focused block for the AI."""
    if "error" in w:
        return f"Weather data unavailable: {w['error']}"
    
    advisory = _generate_agri_advisory(w, forecast)
    
    lines = [
        f"📍 Exact Location: {w['city']}",
        f"🌡 Current Temp: {w['temp_c']}°C (Feels like {w['feels_like']}°C)",
        f"💧 Humidity: {w['humidity']}% | 💨 Wind: {w['wind_kmh']} km/h",
        f"🌤 Conditions: {w['description']}, Visibility: {w['visibility_km']} km",
        f"🌾 AGRI-ADVISORY: {advisory}"
    ]
    
    if forecast:
        next_steps = []
        for f in forecast[:2]: # Next 6 hours
            time_obj = f['time'].split(" ")[1][:5]
            next_steps.append(f"{time_obj}: {f['temp']}°C, {f['description']}")
        lines.append(f"⏱ Short-term Forecast: {', '.join(next_steps)}")
        
        rain_hours = [f for f in forecast if f.get("rain_mm", 0) > 0.5]
        if rain_hours:
            lines.append(f"🌧 Precipitation Alert: Rain expected around {rain_hours[0]['time'].split(' ')[1][:5]} ({rain_hours[0].get('rain_mm', 0)}mm)")
        else:
            lines.append("📅 12-Hour Outlook: No significant rain expected.")

    return "\n".join(lines)
