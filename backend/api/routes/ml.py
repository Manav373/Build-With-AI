from fastapi import APIRouter, HTTPException, Depends
from app.core.auth import verify_clerk_token

from typing import List, Optional
from pydantic import BaseModel
from app.services.ml_model import predict, predict_all_crops, predict_future_trend, CURRENT_YEAR
from app.services.satellite_health_model import analyze_satellite_health
from app.services.pixel_analyzer import analyze_location_from_satellite
from app.services.location_service import location_service
from fastapi import Request
import time
import os
from app.services.gee_service import gee_service
import httpx

router = APIRouter(prefix="/api/ml", tags=["Crop Intelligence ML"])

# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------

class PredictRequest(BaseModel):
    crop_name: str
    year: int = CURRENT_YEAR
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: str = "Unknown"
    season: str = "Kharif"
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None
    soil_ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ndvi: Optional[float] = None

class YearYield(BaseModel):
    year: int
    yield_value: float
    lower: float
    upper: float

class PredictResponse(BaseModel):
    predicted_yield: float
    confidence: int
    risk_level: str
    recommended_crop: str
    # Future forecast fields (present when year > 2024)
    is_future: bool = False
    forecast_year: Optional[int] = None
    trend_direction: Optional[str] = None   # "increasing" | "decreasing" | "stable"
    trend_pct: Optional[float] = None       # % change from current year baseline
    year_range_yields: Optional[List[YearYield]] = None  # current year to target trend data
    current_perspective: Optional[dict] = None # Comparison with current year for historical queries

class CropResult(BaseModel):
    crop: str
    predicted_yield: float
    confidence: int
    suitability: int
    reasons: list = []
    est_rainfall: int = 0
    est_temp: float = 0.0

class RecommendResponse(BaseModel):
    recommendations: List[CropResult]
    total_evaluated: int
    best_crop: str

class RecommendRequest(BaseModel):
    year: int = CURRENT_YEAR
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: str = "Unknown"
    season: str = "Kharif"
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    humidity: Optional[float] = None
    soil_ph: Optional[float] = None
    nitrogen: Optional[float] = None
    phosphorus: Optional[float] = None
    potassium: Optional[float] = None
    ndvi: Optional[float] = 0.65

class LocationRequest(BaseModel):
    lat: Optional[float] = None
    lon: Optional[float] = None

class LocationResponse(BaseModel):
    village: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    method: Optional[str] = None # "gps", "ip", "cache"
    error: Optional[str] = None

class SatelliteDataRequest(BaseModel):
    lat: float
    lon: float
    crop: Optional[str] = None
    is_urban: Optional[bool] = False
    zoom: Optional[int] = 14  # map zoom level — passed from frontend

class SatelliteDataResponse(BaseModel):
    ndvi: Optional[float] = None
    moisture: Optional[float] = None
    evapotranspiration: Optional[float] = None
    chlorophyll: Optional[float] = None
    lai: Optional[float] = None
    health_score: Optional[int] = None
    source: str
    ndvi_history: Optional[List[dict]] = None
    preview_url: Optional[str] = None
    error: Optional[str] = None
    is_fallback: bool = False
    is_gee_failed: bool = False  # True when GEE NDVI unavailable — frontend should use local ML

# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

@router.post("/satellite/visual-scan")
async def satellite_visual_scan(req: SatelliteDataRequest):
    """
    KrishiAI Satellite Visual Scanner
    ==================================
    Fetches the REAL satellite tile image from Google Maps at the given
    coordinates, analyzes pixel colors to determine:
    - Land type (vegetation, arid, urban, water, salt pan)
    - Visual NDVI (derived from actual R/G/B spectral bands)
    - Calibrated health score matching what the satellite image SHOWS
    
    This is the most accurate mode — it reads the map, not a model.
    """
    result = analyze_location_from_satellite(
        req.lat,
        req.lon,
        zoom=req.zoom or 14,
        size=512 if (req.zoom or 14) >= 15 else 400,  # Higher res at close zoom
    )
    
    # If pixel analysis succeeded, merge with ML-derived biometrics
    visual_ndvi = result.get("visual_ndvi")
    land_type = result.get("land_type", "unknown")
    health_score = result.get("health_score")
    
    is_urban_land = land_type in ("urban_rocky", "salt_pan", "water")
    
    # Get real-time weather for biometric calibration
    moisture, evapo, temp = 0.25, 3.5, 28.0
    try:
        weather_url = (
            f"https://api.open-meteo.com/v1/forecast"
            f"?latitude={req.lat}&longitude={req.lon}"
            f"&current=soil_moisture_0_to_7cm"
            f"&daily=et0_fao_evapotranspiration&timezone=auto"
        )
        async with httpx.AsyncClient(timeout=4.0) as client:
            wr = await client.get(weather_url)
            if wr.status_code == 200:
                wd = wr.json()
                moisture = wd.get("current", {}).get("soil_moisture_0_to_7cm", moisture)
                evapo = (wd.get("daily", {}).get("et0_fao_evapotranspiration") or [evapo])[0]
    except Exception:
        pass

    # Get full biometric details from ML model using the image-derived NDVI
    if visual_ndvi is not None:
        # Correct call: analyze_satellite_health(ndvi, moisture, evapo, temp, crop, is_urban)
        ml_data = analyze_satellite_health(
            ndvi=visual_ndvi,
            moisture=float(moisture),
            evapo=float(evapo),
            temp=float(temp),
            crop=req.crop or "Wheat",
            is_urban=is_urban_land
        )
        # Override ML health score with image-derived value (image wins)
        ml_data["health_score"] = health_score
        ml_data["ndvi"] = visual_ndvi
        ml_data["land_type"] = land_type
        ml_data["area_label"] = result.get("area_label", "Unknown Area")
        ml_data["capture_zoom"] = result.get("capture_zoom", 14)
        ml_data["pixel_stats"] = result.get("pixel_stats", {})
        ml_data["source"] = f"📸 Visual Pixel Analysis ({land_type.replace('_', ' ').title()})"
        return ml_data
    
    # Fallback: pixel analysis failed (API key missing), use standard ML
    return analyze_satellite_health(
        ndvi=0.35,
        moisture=float(moisture),
        evapo=float(evapo),
        temp=float(temp),
        crop=req.crop or "Wheat",
        is_urban=bool(req.is_urban)
    )

@router.post("/predict", response_model=PredictResponse)
async def api_predict_yield(req: PredictRequest, user_data: dict = Depends(verify_clerk_token)):
    """
    Predict yield for a specific crop based on environment factors.
    If year > current year, activates Future Forecast Mode with trend extrapolation.
    """
    try:
        result = predict(req.model_dump())
        is_future = req.year > CURRENT_YEAR

        if is_future:
            # Forecast: Journey from now into the future (e.g., 2026 -> 2030)
            trend_data = predict_future_trend(req.model_dump(), base_year=CURRENT_YEAR, target_year=req.year)
            result.update(trend_data)
        elif req.year < CURRENT_YEAR:
            # Historical Comparison: Bridge from Past to Present (e.g., 2018 -> 2026)
            trend_data = predict_future_trend(req.model_dump(), base_year=req.year, target_year=CURRENT_YEAR)
            result.update(trend_data)
            
            # Predict current day for perspective comparison
            current_r = predict({**req.model_dump(), "year": CURRENT_YEAR})
            result["current_perspective"] = {
                "year": CURRENT_YEAR,
                "yield": current_r["predicted_yield"],
                "delta": round(current_r["predicted_yield"] - result["predicted_yield"], 2),
                "delta_pct": round(((current_r["predicted_yield"] - result["predicted_yield"]) / max(0.1, result["predicted_yield"])) * 100, 1)
            }
        else:
            # Current year: No trend needed unless requested, but we can show stable
            result["year_range_yields"] = []

        result["is_future"] = is_future
        result["forecast_year"] = req.year
        return PredictResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/recommend", response_model=RecommendResponse)
async def api_recommend_crops(req: RecommendRequest, user_data: dict = Depends(verify_clerk_token)):
    """
    Compare performance across all supported crops and suggest the best one.
    """
    try:
        data = predict_all_crops(req.model_dump())
        recommendations = data["recommendations"]
        total = data["total_evaluated"]
        best = data["best_crop"] or "Unknown"
        return RecommendResponse(recommendations=recommendations, total_evaluated=total, best_crop=best)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resolve-location", response_model=LocationResponse)
async def api_resolve_location(req: LocationRequest, request: Request, user_data: dict = Depends(verify_clerk_token)):
    """
    Resolve coordinates or client IP to a district/state from our database.
    """
    try:
        # 1. Try GPS coordinates if provided
        if req.lat is not None and req.lon is not None:
            res = await location_service.resolve_from_coords(req.lat, req.lon)
            if res:
                return LocationResponse(**res)
        
        # 2. Fallback to IP
        client_ip = request.headers.get("x-forwarded-for")
        if not client_ip:
            client_ip = request.client.host
        
        # Localhost fallback during development
        if client_ip in ["127.0.0.1", "localhost", "::1"]:
            try:
                async with httpx.AsyncClient() as client:
                    resp = await client.get("https://api.ipify.org", timeout=2.0)
                    client_ip = resp.text
            except:
                pass

        if client_ip:
            res = await location_service.resolve_from_ip(client_ip)
            if res:
                return LocationResponse(**res)
        
        return LocationResponse(error="Could not detect location automatically.")
    except Exception as e:
        return LocationResponse(error=str(e))


@router.post("/satellite/fast", response_model=SatelliteDataResponse)
async def api_satellite_data_fast(req: SatelliteDataRequest, user_data: dict = Depends(verify_clerk_token)):
    """
    BLINK ENGINE - FAST TRACK: Target < 3s.
    Current Health (NDVI) + Real-time Weather.
    """
    lat, lon = req.lat, req.lon
    
    # 1. Fetch Weather (Very Fast)
    moisture = 0.25 
    evapo = 0.5
    try:
        om_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=soil_moisture_0_to_7cm&daily=et0_fao_evapotranspiration&timezone=auto"
        async with httpx.AsyncClient() as client:
            om_resp = await client.get(om_url, timeout=5.0)
            if om_resp.status_code == 200:
                om_data = om_resp.json()
                curr = om_data.get("current", {})
                if curr.get("soil_moisture_0_to_7cm") is not None:
                    moisture = float(curr["soil_moisture_0_to_7cm"])
                daily = om_data.get("daily", {})
                if daily and "et0_fao_evapotranspiration" in daily:
                    evapo = float(daily["et0_fao_evapotranspiration"][0])
    except: pass

    # 2. Fetch Blink NDVI (Instant)
    ndvi_val = None
    gee_failed = False
    try:
        res = gee_service.get_blink_ndvi(lat, lon)
        # Treat mock mode (GEE auth failed) same as GEE failure
        if res.get('is_mock'):
            gee_failed = True
        else:
            raw = res.get('ndvi')
            if raw is not None:
                ndvi_val = raw
            else:
                gee_failed = True
    except:
        gee_failed = True

    # 3. High-Fidelity Health Analysis (ML Driven)
    health_data = analyze_satellite_health(
        ndvi=ndvi_val or 0.3,
        moisture=moisture,
        evapo=evapo,
        temp=28, # Current weather fallback
        crop=req.crop or "Wheat",
        is_urban=req.is_urban
    )
    chlorophyll = health_data["chlorophyll"]
    lai = health_data["lai"]
    source = "GEE Blink Engine (Fast Track)" if not gee_failed else "GEE Unavailable"

    return SatelliteDataResponse(
        ndvi=round(ndvi_val, 3) if ndvi_val is not None else None,
        moisture=round(moisture, 3),
        evapotranspiration=round(evapo, 3),
        chlorophyll=chlorophyll,
        lai=lai,
        health_score=health_data.get("health_score"),
        source=source,
        ndvi_history=[],  # Loaded in Deep Track
        preview_url=None,  # Loaded in Deep Track
        error=None,
        is_gee_failed=gee_failed
    )

@router.post("/satellite/data", response_model=SatelliteDataResponse)
async def api_satellite_data(req: SatelliteDataRequest, user_data: dict = Depends(verify_clerk_token)):
    """
    BLINK ENGINE - DEEP TRACK: High-Fidelity History + Soil Moisture.
    """
    lat, lon = req.lat, req.lon
    
    # Defaults — ndvi_val=None means "no new NDVI from deep track"
    moisture = None
    evapo = None
    ndvi_val = None
    ndvi_history = []
    preview_url = None
    source_info = "GEE Blink Engine (Deep Track)"
    err_msg = None
    is_fallback = False

    try:
        # 1. Weather (independent of GEE)
        async with httpx.AsyncClient() as client:
            om_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=soil_moisture_0_to_7cm&daily=et0_fao_evapotranspiration&timezone=auto"
            om_resp = await client.get(om_url, timeout=5.0)
            if om_resp.status_code == 200:
                om_data = om_resp.json()
                sm = om_data.get("current", {}).get("soil_moisture_0_to_7cm")
                et = om_data.get("daily", {}).get("et0_fao_evapotranspiration", [None])[0]
                if sm is not None:
                    moisture = float(sm)
                if et is not None:
                    evapo = float(et)

        # 2. GEE Full Batch (may fail)
        batch_res = gee_service.get_all_satellite_data(lat, lon)
        # Treat mock mode (GEE auth failed) same as GEE failure
        if batch_res.get('is_mock'):
            raise Exception("GEE is in mock mode — credentials not available")
        raw_ndvi = batch_res.get("ndvi")
        if raw_ndvi is not None:
            ndvi_val = raw_ndvi  # Only set if GEE actually returned a value
        ndvi_history = batch_res.get("history", [])
        gee_moisture = batch_res.get("moisture")
        if gee_moisture is not None:
            moisture = gee_moisture
        preview_url = batch_res.get("preview_url")

    except Exception as e:
        err_msg = str(e)
        source_info = "Fallback Mode"
        is_fallback = True
        # Keep ndvi_val=None so frontend won't overwrite fast-track real data

    # Only compute derived metrics if we have a real NDVI from deep track
    health_data = analyze_satellite_health(
        ndvi=ndvi_val or 0.3,
        moisture=moisture or 0.2,
        evapo=evapo or 0.5,
        temp=28,
        crop=req.crop or "Wheat",
        is_urban=req.is_urban
    )
    chlorophyll = health_data["chlorophyll"]
    lai = health_data["lai"]

    return SatelliteDataResponse(
        ndvi=round(ndvi_val, 3) if ndvi_val is not None else None,
        moisture=round(moisture, 3) if moisture else None,
        evapotranspiration=round(evapo, 3) if evapo else None,
        chlorophyll=chlorophyll,
        lai=lai,
        health_score=health_data.get("health_score"),
        source=source_info,
        ndvi_history=ndvi_history,
        preview_url=preview_url,
        error=err_msg,
        is_fallback=is_fallback
    )
