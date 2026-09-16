from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from app.core.auth import verify_clerk_token

from typing import Optional
from app.core.web_agent import process_web_query
from app.services.weather import get_weather_by_coords
from app.services.disease import analyze_image_bytes
import logging
import base64
import json
import os
import httpx
from groq import AsyncGroq
from app.utils.speech import transcribe_audio_bytes
from app.services.pii import pii_service
from app.db.database import get_db
from app.models.location import FarmerLocation
from sqlalchemy.orm import Session
from datetime import datetime

logger = logging.getLogger("KrishiMCP.Web")
router = APIRouter(prefix="/api/web", tags=["Frontend REST APIs"])

WEATHER_KEYWORDS = ["weather", "forecast", "temperature", "rain", "humidity", "climate", "barish", "mausam"]

async def _groq_chat_completion_with_fallback(client, **kwargs):
    """Helper to try a model and fallback to a working model."""
    primary_model = kwargs.get("model", "openai/gpt-oss-20b")
    fallback_model = "openai/gpt-oss-120b"
    try:
        return await client.chat.completions.create(**kwargs)
    except Exception as e:
        if "429" in str(e) or "rate_limit" in str(e).lower():
            logger.warning(f"Rate limit hit for {primary_model} in web.py. Falling back to {fallback_model}.")
            kwargs["model"] = fallback_model
            return await client.chat.completions.create(**kwargs)
        raise

@router.post("/chat")
async def chat_endpoint(payload: dict, request: Request, db: Session = Depends(get_db), user_data: dict = Depends(verify_clerk_token)):
    """
    Endpoint for the React frontend to send chat messages.
    """
    try:
        message = payload.get("message", "")
        if not message:
            raise HTTPException(status_code=400, detail="Message is required")
            
        lat = payload.get("lat")
        lon = payload.get("lon")
        city = payload.get("city")
        state = payload.get("state")
        village = payload.get("village")
        taluka = payload.get("taluka")
        history = payload.get("history", [])
        channel = payload.get("channel") or ("voice" if payload.get("phone_id") == "voice_user" else "web")

        # --- STEP 1: Analytics Integrity & Smart Location Resolution ---
        if lat and lon:
            try:
                from api.routes.location import _reverse_geocode
                loc = await _reverse_geocode(float(lat), float(lon))
                
                # Use backend resolved data primarily, fallback to frontend data
                res_village = loc.get("village") or village
                res_taluka = loc.get("taluka") or taluka
                res_district = loc.get("district")
                res_city = loc.get("city") or city
                res_state = loc.get("state") or state
                
                record = FarmerLocation(
                    user_id=user_data.get("sub"),
                    lat=float(lat), lon=float(lon),
                    village=res_village,
                    taluka=res_taluka,
                    district=res_district,
                    city=res_city or "Manual",
                    state=res_state or "Manual",
                    pincode=loc.get("pincode"),
                    source=channel, timestamp=datetime.utcnow()
                )
                db.add(record)
                db.commit()
                
                # Update local vars for AI context
                city, state, village, taluka = res_city, res_state, res_village, res_taluka
            except Exception as db_err:
                logger.warning(f"Failed to log chat location for analytics: {db_err}")
        elif not city or city == "India":
            # If coordinates are missing, auto-resolve location from client IP
            try:
                client_ip = request.headers.get("x-forwarded-for")
                if not client_ip:
                    client_ip = request.client.host if request.client else None
                if client_ip and client_ip in ["127.0.0.1", "localhost", "::1"]:
                    try:
                        async with httpx.AsyncClient() as http_client:
                            resp = await http_client.get("https://api.ipify.org", timeout=2.0)
                            client_ip = resp.text
                    except Exception:
                        pass
                if client_ip:
                    from app.services.location_service import location_service
                    res = await location_service.resolve_from_ip(client_ip)
                    if res:
                        city = res.get("district") or res.get("city") or city
                        state = res.get("state") or state
                        lat = res.get("lat") or lat
                        lon = res.get("lon") or lon
            except Exception as ip_err:
                logger.warning(f"Could not resolve IP for chat location: {ip_err}")

            # If still missing, check user's last recorded location in DB
            if (not lat or not lon) and (not city or city == "India"):
                try:
                    user_id = user_data.get("sub")
                    if user_id:
                        last_loc = db.query(FarmerLocation).filter_by(user_id=user_id).order_by(FarmerLocation.timestamp.desc()).first()
                        if last_loc:
                            city = last_loc.district or last_loc.city or city
                            state = last_loc.state or state
                            lat = last_loc.lat or lat
                            lon = last_loc.lon or lon
                            village = last_loc.village or village
                            taluka = last_loc.taluka or taluka
                except Exception as db_loc_err:
                    logger.warning(f"Could not fetch last user location: {db_loc_err}")

        # --- STEP 2: PII Masking (Secure Chat) ---
        message, token_map = pii_service.mask(message)

        # Prepend location context securely
        if lat and lon:
            parts = [p for p in [village, taluka, city, state] if p and p != "Unknown"]
            location_str = ", ".join(parts) if parts else f"{float(lat):.4f}N, {float(lon):.4f}E"
            clean_city = city or taluka or village or "India"
            clean_state = state or "India"
            message = f"[Farmer's exact GPS: {float(lat):.4f},{float(lon):.4f} | District/City: {clean_city}, State: {clean_state} | Address: {location_str}]\n{message}"
        elif city and city != "India":
            parts = [p for p in [village, taluka, city, state] if p and p != "Unknown"]
            location_str = ", ".join(parts) if parts else (city or state or "India")
            clean_city = city or taluka or village or "India"
            clean_state = state or "India"
            message = f"[Farmer's Location: District/City: {clean_city}, State: {clean_state} | Address: {location_str}]\n{message}"
        elif channel == "voice":
            # For voice assistant, if no location was resolved, default to Delhi, India so weather/mandi tools immediately provide direct answers
            message = f"[Farmer's Location: District/City: Delhi, State: India]\n{message}"

        logger.info(f"Frontend ({channel}) query from {user_data.get('sub', 'unknown')} (masked len: {len(message)})")
        
        # Process the masked query with channel-appropriate prompt
        ai_reply = await process_web_query(message, history=history, channel=channel)
        
        # --- STEP 3: Detokenize Reply (Restore Context) ---
        final_reply = pii_service.unmask(ai_reply, token_map)
        
        return {"reply": final_reply}
    except Exception as e:
        logger.error(f"Error processing web chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vision")
async def vision_endpoint(
    phone_id: str = Form(...), 
    file: UploadFile = File(...),
    language: str = Form("en"),
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Directly analyze the uploaded crop image with Gemini Vision,
    then ask Groq to narrate the findings in farmer-friendly language.
    """
    try:
        contents = await file.read()
        mime_type = file.content_type or "image/jpeg"
        logger.info(f"Received vision upload: {file.filename} ({len(contents)} bytes, {mime_type}, lang={language})")

        # Step 1: Get raw analysis from Gemini Vision directly (no LLM tool call)
        vision_result = await analyze_image_bytes(contents, mime_type)
        logger.info(f"Gemini Vision result: {vision_result[:100]}...")

        # Step 2: Ask Groq to present it in a farmer-friendly conversational style
        groq_api_key = os.getenv("GROQ_API_KEY")
        if groq_api_key and "unavailable" not in vision_result.lower() and "error" not in vision_result.lower():
            client = AsyncGroq(api_key=groq_api_key, max_retries=0)
            
            # Map language code to full name for the prompt
            lang_map = {
                "en": "English",
                "hi": "Hindi",
                "gu": "Gujarati",
                "mr": "Marathi"
            }
            target_lang = lang_map.get(language, "English")

            # Mask PII in vision result if any (e.g. metadata or background text)
            pii_masked_result, token_map = pii_service.mask(vision_result)

            narrate_prompt = (
                f"An expert agronomist analyzed the farmer's crop photo and found this:\n\n"
                f"{pii_masked_result}\n\n"
                f"Please present this information to the farmer in a warm, easy-to-understand way. "
                f"IMPORTANT: You MUST write your entire response in {target_lang}. "
                f"Start with what disease was found, then what to do immediately, then treatment. "
                f"Whenever listing treatments or structured data, use a **Markdown Table**. "
                f"At the very end, add a section called `### 🔗 References & Related Searches` containing 2 Google search/image markdown links related to the disease."
            )
            resp = await _groq_chat_completion_with_fallback(
                client,
                model="openai/gpt-oss-20b",
                messages=[{"role": "user", "content": narrate_prompt}]
            )
            
            # Unmask reply to restore context if AI referenced it
            final_reply = pii_service.unmask(resp.choices[0].message.content, token_map)
            return {"reply": final_reply}

        # If Gemini unavailable (quota/error), prompt user to describe symptoms
        # which will use the symptom text catalog via the chat endpoint
        fallback_msg = (
            "📷 **Image received!**\n\n"
            "I can see your crop photo, but my visual analysis system is temporarily at capacity.\n\n"
            "👉 **Please describe the symptoms you see**, for example:\n"
            "- *'yellow leaves'* or *'brown spots'* or *'white powder'*\n"
            "- *'wilting'* or *'holes in leaves'* or *'leaf curl'*\n\n"
            "I'll immediately give you a diagnosis and treatment recommendation! 🌱"
        )
        return {"reply": fallback_msg}

    except Exception as e:
        logger.error(f"Error processing vision: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/audio")
async def audio_endpoint(
    file: UploadFile = File(...), 
    lat: Optional[float] = Form(None), 
    lon: Optional[float] = Form(None),
    city: Optional[str] = Form(None),
    state: Optional[str] = Form(None),
    village: Optional[str] = Form(None),
    taluka: Optional[str] = Form(None),
    history: str = Form("[]"),
    db: Session = Depends(get_db),
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Endpoint for frontend to upload audio file, transcribe it, mask it, and get AI response.
    """
    try:
        contents = await file.read()
        filename = file.filename or "audio.webm"
        
        # 1. Transcribe
        text = await transcribe_audio_bytes(contents, filename)
        if not text:
            return {"reply": "I couldn't hear that clearly. Could you please try again?"}
            
        logger.info(f"Voice Transcription: {text}")

        # --- Analytics Integrity (Save Raw Location) ---
        if lat and lon:
            try:
                from api.routes.location import _reverse_geocode
                loc = await _reverse_geocode(float(lat), float(lon))
                
                res_village = loc.get("village") or village
                res_taluka = loc.get("taluka") or taluka
                res_district = loc.get("district")
                res_city = loc.get("city") or city
                res_state = loc.get("state") or state

                record = FarmerLocation(
                    user_id=user_data.get("sub"),
                    lat=float(lat), lon=float(lon),
                    village=res_village,
                    taluka=res_taluka,
                    district=res_district,
                    city=res_city or "Voice",
                    state=res_state or "Voice",
                    pincode=loc.get("pincode"),
                    source="voice", timestamp=datetime.utcnow()
                )
                db.add(record)
                db.commit()
                
                city, state, village, taluka = res_city, res_state, res_village, res_taluka
            except Exception as db_err:
                logger.warning(f"Failed to log voice location for analytics: {db_err}")

        # --- PII Masking ---
        masked_text, token_map = pii_service.mask(text)
        
        # 2. Process with Agent
        try:
            history_list = json.loads(history)
        except:
            history_list = []
            
        if lat and lon:
            parts = [p for p in [village, taluka, city, state] if p and p != "Unknown"]
            location_str = ", ".join(parts) if parts else f"{float(lat):.4f}N, {float(lon):.4f}E"
            query = f"[Farmer's exact GPS: {float(lat):.4f},{float(lon):.4f} | Location: {location_str}]\n{masked_text}"
        elif city and city != "India":
            query = f"[Farmer's Location: District/City: {city}, State: {state or 'India'}]\n{masked_text}"
        else:
            query = f"[Farmer's Location: District/City: Delhi, State: India]\n{masked_text}"
            
        ai_reply = await process_web_query(query, history=history_list, channel="voice")
        
        # --- Detokenize Reply ---
        final_reply = pii_service.unmask(ai_reply, token_map)
        
        return {
            "transcription": text, # Frontend gets raw transcription for display
            "reply": final_reply
        }
    except Exception as e:
        logger.error(f"Error in audio endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/market-trends")
async def market_trends_endpoint(user_data: dict = Depends(verify_clerk_token)):
    """
    Endpoint for the frontend Live Mandi Prices chart.
    Returns day-by-day market trends for the last 7 days.
    """
    from app.services.market import get_market_trends_data
    try:
        data = await get_market_trends_data()
        return {"trends": data}
    except Exception as e:
        logger.error(f"Error fetching market trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/live-mandis")
async def live_mandis_endpoint(
    lat: Optional[float] = None, 
    lon: Optional[float] = None, 
    all_india: bool = False,
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Endpoint for the frontend MandiMap.
    Fetches the strictly Live Govt APMC records. 
    If all_india is True, ignores coordinates and fetches nationwide.
    """
    from app.services.market import get_live_mandis_data
    try:
        data = await get_live_mandis_data(lat, lon, all_india=all_india)
        return {"mandis": data}
    except Exception as e:
        logger.error(f"Error fetching live mandis: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/nearby-markets")
async def nearby_markets_endpoint(
    lat: float, 
    lon: float, 
    radius: int = 80000, 
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Finds alternative APMC markets near a specific coordinate.
    Uses real-time Google Places discovery.
    """
    from app.services.market import find_nearby_markets
    try:
        data = await find_nearby_markets(lat, lon, radius)
        return {"nearby": data}
    except Exception as e:
        logger.error(f"Error discovering nearby markets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/all-market-prices")
async def all_market_prices_endpoint(
    state: Optional[str] = None,
    district: Optional[str] = None,
    commodity: Optional[str] = None,
    market: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    force_refresh: bool = False,
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Paginated endpoint to fetch all market commodity records with search filters.
    """
    from app.services.market import get_all_market_prices
    try:
        data = await get_all_market_prices(state, district, market, commodity, limit, offset, force_refresh=force_refresh)
        return data
    except Exception as e:
        logger.error(f"Error fetching all market prices: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/commodity-trends")
async def commodity_trends_endpoint(
    commodity: str,
    state: Optional[str] = None,
    user_data: dict = Depends(verify_clerk_token)
):
    """
    Returns 7-day price trend for a specific commodity.
    Used for the interactive analytics charts.
    """
    from app.services.market import get_commodity_trends
    try:
        data = await get_commodity_trends(commodity, state)
        return data
    except Exception as e:
        logger.error(f"Error fetching commodity trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/weather")
async def weather_endpoint(
    lat: Optional[float] = None,
    lon: Optional[float] = None,
    city: Optional[str] = None
):
    """
    Real-time weather & 5-day forecast by GPS coordinates or city name.
    Used by mobile and web dashboards to personalize farmer weather.
    """
    from app.services.weather import get_weather_by_coords, get_weather_by_city, get_forecast_by_coords, _generate_agri_advisory
    try:
        if lat is not None and lon is not None:
            current = await get_weather_by_coords(float(lat), float(lon))
            forecast = await get_forecast_by_coords(float(lat), float(lon))
            advisory = _generate_agri_advisory(current, forecast)
            return {
                "success": True,
                "current": current,
                "forecast": forecast,
                "advisory": advisory
            }
        elif city:
            current = await get_weather_by_city(city)
            advisory = _generate_agri_advisory(current)
            return {
                "success": True,
                "current": current,
                "forecast": [],
                "advisory": advisory
            }
        else:
            raise HTTPException(status_code=400, detail="Provide either lat & lon, or city")
    except Exception as e:
        logger.error(f"Error in weather_endpoint: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tts")
@router.get("/tts")
async def text_to_speech_endpoint(
    text: Optional[str] = None,
    lang: str = "en",
    payload: Optional[dict] = None
):
    """
    Synthesizes natural speech using Edge TTS (100% free studio-grade neural voices).
    Returns audio/mpeg stream directly to browser.
    """
    try:
        input_text = text
        if not input_text and payload:
            input_text = payload.get("text")
            lang = payload.get("lang", lang)

        if not input_text:
            raise HTTPException(status_code=400, detail="Text is required")

        # Clean text for speech
        import re
        clean_text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', input_text)
        clean_text = re.sub(r'https?://\S+', '', clean_text)
        clean_text = re.sub(r'[*#_`|~-]', ' ', clean_text)
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()
        
        # Limit length for spoken voice summary
        if len(clean_text) > 400:
            clean_text = clean_text[:380] + "..."

        try:
            import edge_tts
            voice_map = {
                "hi": "hi-IN-SwaraNeural",
                "gu": "gu-IN-DhwaniNeural",
                "mr": "mr-IN-AarohiNeural",
                "en": "en-IN-NeerjaNeural"
            }
            voice = voice_map.get(lang, "en-IN-NeerjaNeural")
            communicate = edge_tts.Communicate(clean_text, voice)
            audio_bytes = b""
            async for chunk in communicate.stream():
                if chunk["type"] == "audio":
                    audio_bytes += chunk["data"]

            from fastapi import Response
            return Response(content=audio_bytes, media_type="audio/mpeg")
        except Exception as tts_err:
            logger.warning(f"edge_tts generation failed: {tts_err}")
            raise HTTPException(status_code=500, detail=str(tts_err))

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"TTS endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

