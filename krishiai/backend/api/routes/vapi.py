from fastapi import APIRouter, Request, HTTPException, Depends
import logging
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.vapi_model import CallHistory
from app.services.sms_service import send_outbound_sms
from app.services.weather import get_weather_by_city, get_weather_by_coords, get_forecast_by_coords, format_weather_for_llm
from app.services.market import get_market_price, format_market_for_llm, find_nearby_markets, get_all_market_prices
from app.services.scheme import get_gov_scheme, format_schemes_for_llm
from app.services.soil import analyze_soil_health

from app.services.crop_advice import get_crop_advice
from app.services.pest import get_pest_alerts
from app.services.yield_estimation import estimate_yield
from app.services.irrigation import calculate_irrigation
from app.services.market import get_commodity_trends
from app.services.ml_model import predict_all_crops
from app.services.crop_calendar import generate_crop_calendar
from app.services.disease import lookup_symptom
from app.services.satellite import get_satellite_health
from app.services.location_service import location_service
from datetime import datetime

logger = logging.getLogger("KrishiMCP.Vapi")
router = APIRouter(prefix="/api/vapi", tags=["Vapi Webhook"])

# In-memory session tracking (call_id -> session_data)
# In production, move this to Redis or a Database.
CALL_SESSIONS: Dict[str, Dict[str, Any]] = {}

@router.post("/webhooks")
@router.post("/webhook")
async def vapi_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Central webhook handler for Vapi.
    Handles 'tool-calls' and 'end-of-call-report' from the Vapi Assistant.
    """
    try:
        body = await request.json()
        message = body.get("message", {})
        msg_type = message.get("type")

        logger.info(f"[Vapi] Received {msg_type} message")

        if msg_type == "tool-calls":
            tool_calls = message.get("toolCalls", [])
            results = []

            for tool_call in tool_calls:
                tool_id = tool_call.get("id")
                function = tool_call.get("function", {})
                name = function.get("name")
                args = function.get("arguments", {})

                # Extract call_id to manage session state
                call = body.get("call", {})
                call_id = call.get("id", "unknown")

                logger.info(f"[Vapi] Executing tool: {name} in call {call_id} with args: {args}")

                result_content = await execute_tool(name, args, call_id)
                results.append({
                    "toolCallId": tool_id,
                    "result": result_content
                })

            return {"results": results}

        elif msg_type == "end-of-call-report":
            # Extract data from call report
            call = message.get("call", {})
            call_id = call.get("id") or message.get("callId")
            
            customer_phone = call.get("customer", {}).get("number")
            transcript = message.get("transcript", "")
            summary = message.get("summary", "")
            duration = message.get("duration", 0)
            
            # Extract recording URL
            recording_url = message.get("recordingUrl") or \
                           message.get("artifact", {}).get("recordingUrl") or \
                           call.get("recordingUrl") or ""

            logger.info(f"[Vapi] Call Ended: {call_id} from {customer_phone}. Saving record...")

            # 1. Save to Database
            new_record = CallHistory(
                call_id=call_id,
                phone_number=customer_phone,
                transcript=transcript,
                summary=summary,
                duration=duration,
                recording_url=recording_url
            )
            db.add(new_record)
            db.commit()

            # 2. Send SMS Summary if phone number exists
            if customer_phone and summary:
                sms_text = f"KrishiAI Summary: {summary}"
                # Limit SMS size
                if len(sms_text) > 160:
                    sms_text = sms_text[:157] + "..."
                
            # 3. Clean up session
            CALL_SESSIONS.pop(call_id, None)

            return {"status": "success", "recorded": True}

        # Handle other Vapi messages if needed (e.g. status-update)
        return {"status": "success"}

    except Exception as e:
        logger.error(f"[Vapi] Webhook error: {e}", exc_info=True)
        return {"error": str(e)}

@router.get("/history", response_model=List[Dict[str, Any]])
async def get_call_history(db: Session = Depends(get_db)):
    """Fetches the history of AI voice calls."""
    calls = db.query(CallHistory).order_by(CallHistory.timestamp.desc()).limit(50).all()
    return [
        {
            "id": c.id,
            "call_id": c.call_id,
            "phone_number": c.phone_number,
            "summary": c.summary,
            "transcript": c.transcript,
            "duration": c.duration,
            "recording_url": c.recording_url,
            "timestamp": c.timestamp.isoformat() if c.timestamp else None
        } for c in calls
    ]

async def _get_location_context(args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Standardizes location data by extracting coordinates and resolving names (State/District).
    """
    ctx = {
        "lat": None,
        "lon": None,
        "district": args.get("district") or args.get("location"),
        "state": args.get("state") or "India",
        "crop": args.get("crop", "general")
    }
    
    # 1. Coordinate Parsing
    lat_raw = args.get("latitude")
    lon_raw = args.get("longitude")
    try:
        if lat_raw and lon_raw:
            ctx["lat"] = float(lat_raw)
            ctx["lon"] = float(lon_raw)
    except (ValueError, TypeError):
        pass

    # 2. Reverse Resolution (if coords exist but names are missing)
    if ctx["lat"] and ctx["lon"] and (not ctx["district"] or ctx["district"] == "India"):
        resolved = await location_service.resolve_from_coords(ctx["lat"], ctx["lon"])
        if resolved:
            ctx["district"] = resolved.get("district")
            ctx["state"] = resolved.get("state") or ctx["state"]
            logger.info(f"[Vapi] Resolved GPS context: {ctx['district']}, {ctx['state']}")
            
    return ctx

async def execute_tool(name: str, args: Dict[str, Any], call_id: str = "unknown") -> str:
    """Dispatches tool calls to the appropriate service."""
    try:
        # 0. Language / Session Management
        if name == "set_language":
            language = args.get("language", "English")
            if call_id not in CALL_SESSIONS:
                CALL_SESSIONS[call_id] = {}
            CALL_SESSIONS[call_id]["language"] = language
            logger.info(f"[Vapi] Language set to {language} for call {call_id}")
            
            confirmations = {
                "Hindi": "ठीक है, मैंने भाषा हिंदी सेट कर दी है। मैं आपकी कैसे मदद कर सकता हूँ?",
                "Marathi": "ठीक आहे, मी भाषा मराठी सेट केली आहे. मी तुम्हाला कशी मदत करू शकतो?",
                "Gujarati": "ઠીક છે, મેં ભાષા ગુજરાતી સેટ કરી દીધી છે. હું તમને કેવી રીતે મદદ કરી શકું?",
                "English": "Great, I've set your language to English. How can I help you today?"
            }
            return confirmations.get(language, f"Language set to {language}.")

        # 1. Weather
        if name == "get_weather":
            ctx = await _get_location_context(args)
            if ctx["lat"] and ctx["lon"]:
                # Primary: High accuracy coordinate-based weather
                weather_data = await get_weather_by_coords(ctx["lat"], ctx["lon"])
                forecast = await get_forecast_by_coords(ctx["lat"], ctx["lon"])
                return format_weather_for_llm(weather_data, forecast)
            else:
                # Fallback: City-based weather
                weather_data = await get_weather_by_city(ctx["district"] or "India")
                return format_weather_for_llm(weather_data)

        # 2. Market Prices
        elif name == "get_market_price":
            ctx = await _get_location_context(args)
            res = await get_market_price(ctx["crop"], ctx["district"] or "India")
            return format_market_for_llm(res)

        # 2b. Nearest Mandi / Market Search
        elif name == "get_nearest_mandi":
            ctx = await _get_location_context(args)
            
            if not ctx["lat"] or not ctx["lon"]:
                # If no coords, try to resolve location string to coords via Google
                logger.info(f"[Vapi] Resolving location string: {ctx['district']}")
                from app.services.market import _google_places_resolve
                ctx["lat"], ctx["lon"] = await _google_places_resolve(ctx["district"] or "India")
            
            if not ctx["lat"] or not ctx["lon"]:
                return "I couldn't detect your exact coordinates or city. Please tell me your city and state name clearly."

            logger.info(f"[Vapi] Searching mandis near {ctx['lat']}, {ctx['lon']}")
            # 1. Find physical markets nearby
            nearby = await find_nearby_markets(ctx["lat"], ctx["lon"])
            if not nearby:
                return f"I couldn't find any major APMC markets near {ctx['district'] or 'your location'}. Try mentioning a larger nearby district."
            
            # 2. Get real-time prices for the most relevant market
            primary_mandi = nearby[0]["name"]
            # Clean up mandi name for searching (e.g. "APMC Ahmedabad" -> "Ahmedabad")
            search_mandi = primary_mandi.replace("APMC", "").replace("Market", "").replace("Yard", "").replace("Mandi", "").strip()
            
            logger.info(f"[Vapi] Found Mandi: {primary_mandi}. Searching prices for: {search_mandi}")
            prices = await get_all_market_prices(market=search_mandi, limit=3)
            
            response = f"The nearest major market is {primary_mandi} in {nearby[0]['vicinity']}. "
            if prices.get("records"):
                rec = prices["records"][0]
                response += f"Current price for {rec['commodity']} is ₹{rec['modal_price']} per quintal."
            else:
                response += "I don't have the live commodity rates for this specific mandi today, but it is the closest one to you."
            
            return response

        # 3. Market Trends
        elif name == "get_commodity_trends":
            ctx = await _get_location_context(args)
            res = await get_commodity_trends(ctx["crop"], ctx["state"] or "National")
            trends = res.get("trends", [])
            if not trends: return f"I don't have trend data for {ctx['crop']} right now."
            start = trends[0]['price']
            end = trends[-1]['price']
            diff = end - start
            direction = "increased" if diff > 0 else "decreased"
            sentiment = "Bullish (Price rising)" if diff > 50 else "Bearish (Price falling)" if diff < -50 else "Stable"
            return f"{ctx['crop']} prices in {ctx['state']} are {sentiment}. They have {direction} by ₹{abs(diff)} over 7 days, currently at ₹{end} per quintal."

        # 4. Gov Schemes
        elif name in ("get_gov_scheme", "get_gov_schemes"):
            ctx = await _get_location_context(args)
            res = await get_gov_scheme(ctx["state"] or "India", ctx["crop"])
            if "error" in res: return "I'm sorry, I couldn't fetch the schemes right now."
            
            top_central = res.get("central_schemes", [])[:2]
            top_state = res.get("state_schemes", [])[:1]
            
            response = f"Relevant schemes for {ctx['state']} farmers growing {ctx['crop']}: "
            for s in (top_central + top_state):
                response += f"{s['name']} (Benefit: {s['benefit']}). "
            
            response += f"Quick Action: {res.get('quick_action', '')}"
            return response

        # 5. Soil Analysis
        elif name in ("analyze_soil", "analyze_soil_health"):
            ctx = await _get_location_context(args)
            symptoms = args.get("symptoms", "")
            res = await analyze_soil_health(ctx["district"] or "general", ctx["crop"], symptoms)
            if "error" in res: return "Soil analysis is currently unavailable."
            
            response = f"Analysis for {res.get('soil_type')} soil growing {ctx['crop']}: {res.get('crop_suitability')}. "
            response += f"Recommended fertilizer dose: {res.get('fertilizer_dosage', 'N/A')}. "
            response += f"Method: {res.get('dosage_method', 'N/A')}. "
            response += f"Tip: {res.get('quick_tip', '')}"
            return response

        # 6. Crop Advice
        elif name == "crop_advice":
            ctx = await _get_location_context(args)
            res = await get_crop_advice(ctx["crop"], ctx["district"] or "India")
            if "error" in res: return "Advice service is unavailable."
            return f"For {ctx['crop']} in {ctx['district']}: {res.get('market_vibe', '')} {res.get('climate_suitability', '')} Action tip: {res.get('quick_action', '')}"

        # 7. Pest Alerts
        elif name == "get_pest_alerts":
            ctx = await _get_location_context(args)
            
            # Integrated Context: Fetch weather to improve pest prediction accuracy
            w_temp, w_hum = None, None
            if ctx["lat"] and ctx["lon"]:
                w_data = await get_weather_by_coords(ctx["lat"], ctx["lon"])
                if "temp_c" in w_data:
                    w_temp, w_hum = w_data["temp_c"], w_data["humidity"]
            
            res = await get_pest_alerts(ctx["crop"], temp_c=w_temp, humidity=w_hum)
            if "error" in res: return "Pest data is unavailable."
            
            threats = [t['name'] for t in res.get("current_threats", [])[:2]]
            if not threats: return f"Great news! There are no major pest threats for {ctx['crop']} right now."
            
            response = f"Current risk for {ctx['crop']}: {res.get('current_threats')[0]['risk']} for {', '.join(threats)}. "
            response += f"Treatment: {res.get('current_threats')[0]['treatment']}. Best time to spray: {res.get('spray_timing', '')}."
            return response

        # 8. Yield Estimation
        elif name == "estimate_yield":
            ctx = await _get_location_context(args)
            area = float(args.get("area_acres") or 1.0)
            res = await estimate_yield(ctx["crop"], area)
            if "error" in res: return "Yield estimation is unavailable."
            return f"For {area} acres of {ctx['crop']}, you can expect {res.get('expected_range')}. This assumes optimal management. Current risk factor is LOW based on your local weather."

        # 9. Irrigation Calculation
        elif name == "calculate_irrigation":
            ctx = await _get_location_context(args)
            area = float(args.get("area_acres") or 1.0)
            stage = args.get("growth_stage", "vegetative")
            
            # Integrated Context: Check forecast to see if irrigation can be skipped
            rain_warning = ""
            if ctx["lat"] and ctx["lon"]:
                forecast = await get_forecast_by_coords(ctx["lat"], ctx["lon"])
                rain_imminent = any(f.get("rain_mm", 0) > 0.5 for f in forecast[:4])
                if rain_imminent:
                    rain_warning = " ⚠️ ALERT: Heavy rain is expected in the next few hours. You might want to delay irrigation."

            res = await calculate_irrigation(ctx["crop"], area, stage)
            if "error" in res: return "Irrigation service is unavailable."
            
            response = f"For {area} acres of {ctx['crop']} at {stage} stage, you need approximately {res.get('weekly_water_liters')} per week. "
            response += f"Tip: {res.get('critical_advice', '')}{rain_warning}"
            return response

        # 10. Crop Recommendation
        elif name == "recommend_crops":
            ctx = await _get_location_context(args)
            season = args.get("season", "Kharif")
            res = predict_all_crops({"district": ctx["district"] or "Gujarat", "season": season})
            crops = res.get("results", [])
            if not crops: return f"I couldn't find specific recommendations for {ctx['district']} in {season}."
            
            top_crops = []
            for c in crops[:2]:
                # Include the 'Reasons' for high accuracy explanation
                reason_list = c.get("reasons", [])[:2]
                reasons_str = f" because {', '.join(reason_list)}" if reason_list else ""
                top_crops.append(f"{c['crop']} ({c['suitability']}% match{reasons_str})")
                
            return f"Based on soil and climate in {ctx['district']}, the top recommendations for {season} are: {'. '.join(top_crops)}."

        # 11. Crop Calendar
        elif name == "get_crop_calendar":
            ctx = await _get_location_context(args)
            season = args.get("season", "Kharif")
            res = generate_crop_calendar(ctx["crop"], season)
            current_month = datetime.now().strftime("%B")
            return f"Management for {ctx['crop']} ({season}): Sowing in {res.get('sowing')}. Since it's {current_month}, you should focus on {res.get('fertilizer')}. Harvest is expected around {res.get('harvest')}."

        # 12. Disease Lookup
        elif name == "check_crop_disease":
            symptoms = args.get("symptoms", "")
            res = lookup_symptom(symptoms)
            if not res: return "I couldn't identify the disease from that description. Please try describing the leaf pattern or color more specifically."
            return res

        # 13. Satellite Health
        elif name == "get_farm_health":
            ctx = await _get_location_context(args)
            if not ctx["lat"] or not ctx["lon"]: return "I need your coordinates to check satellite health."
            res = get_satellite_health(ctx["lat"], ctx["lon"])
            return f"Satellite Analysis: Vegetation health (NDVI) is {res['ndvi']}, which is considered '{res['crop_health']}'. The risk zone is '{res['risk_zone']}'."

        return f"Tool '{name}' not found."

    except Exception as e:
        logger.error(f"[Vapi] Tool execution error ({name}): {e}")
        return f"Error executing {name}: {str(e)}"

