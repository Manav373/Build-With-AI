"""
crop_planner.py
---------------
Master orchestrator for KrishiAI's AI/ML intelligence layer.

Combines:
  - CropSimulator  → top 3 crop recommendations
  - ExplainPrediction → rule-based factor explanation
  - WeatherScenarios  → yield under 3 rainfall scenarios
  - CropCalendar      → activity schedule
  - Satellite         → NDVI-based field health

Public API
----------
full_crop_analysis(data: dict) -> dict

The function is importable as:
    from app.services.crop_planner import full_crop_analysis
"""

import logging
from typing import Any

from app.services.crop_simulator      import simulate_crops
from app.services.explain_prediction  import explain_prediction
from app.services.weather_scenarios   import simulate_weather_scenarios
from app.services.crop_calendar       import generate_crop_calendar
from app.services.satellite           import get_satellite_health

logger = logging.getLogger("KrishiAI.CropPlanner")

# ── Confidence heuristic ─────────────────────────────────────────
def _estimate_confidence(data: dict, top_crop: str, top_yield: float) -> int:
    """
    Produce a confidence score (50–99%) based on:
    - Presence of key input fields
    - Yield magnitude relative to a maximum plausible yield
    - Number of nutrients provided
    """
    key_fields = ["Rainfall", "Temperature", "Humidity", "pH",
                  "Nitrogen", "Phosphorus", "Potassium"]
    provided = sum(1 for k in key_fields if data.get(k) is not None)
    completeness = provided / len(key_fields)   # 0.0 – 1.0

    yield_score = min(top_yield / 8.0, 1.0)     # normalise to 8 t/ha max

    raw = 0.5 * completeness + 0.3 * yield_score + 0.2
    confidence = int(round(min(99, max(50, raw * 100))))
    return confidence


def full_crop_analysis(data: dict) -> dict:
    """
    Perform a full AI-driven crop analysis for the given farm conditions.

    Parameters
    ----------
    data : dict
        Expected keys (all optional – defaults applied internally):
            Rainfall    (float, mm)
            Temperature (float, °C)
            Humidity    (float, %)
            pH          (float)
            Nitrogen    (float, kg/ha)
            Phosphorus  (float, kg/ha)
            Potassium   (float, kg/ha)
            Season      (str, "Kharif" | "Rabi" | "Zaid")
            lat         (float) – for satellite health
            lon         (float) – for satellite health

    Returns
    -------
    dict with keys:
        recommendation  – best crop with yield, profit, confidence
        alternatives    – 2nd and 3rd ranked crops
        explanation     – good / bad factors for the recommended crop
        weather_scenarios – yield under normal / low / heavy rainfall
        calendar        – sowing-to-harvest activity schedule
        satellite       – NDVI-based field health (if lat/lon provided)
    """
    # ── 1. Crop simulation ────────────────────────────────────────
    logger.info("Running crop simulation...")
    top_crops = simulate_crops(data)  # returns list of 3 dicts sorted by profit

    if not top_crops:
        logger.error("Crop simulation returned no results.")
        return {"error": "Crop simulation failed – check model artefacts."}

    best     = top_crops[0]
    alts     = top_crops[1:]
    best_crop = best["crop"]
    season    = data.get("Season", "Kharif")

    # ── 2. Confidence ─────────────────────────────────────────────
    confidence = _estimate_confidence(data, best_crop, best["yield"])

    # ── 3. Explanation ────────────────────────────────────────────
    logger.info(f"Explaining prediction for '{best_crop}'...")
    try:
        explanation = explain_prediction(data, best_crop)
    except Exception as e:
        logger.warning(f"Explanation failed: {e}")
        explanation = {"good_factors": [], "bad_factors": [str(e)]}

    # ── 4. Weather scenarios ──────────────────────────────────────
    logger.info("Simulating weather scenarios...")
    try:
        weather_scenarios = simulate_weather_scenarios(data)
    except Exception as e:
        logger.warning(f"Weather simulation failed: {e}")
        weather_scenarios = {"normal": best["yield"], "low_rainfall": None, "heavy_rainfall": None}

    # ── 5. Crop calendar ─────────────────────────────────────────
    logger.info("Generating crop calendar...")
    try:
        calendar = generate_crop_calendar(best_crop, season)
    except Exception as e:
        logger.warning(f"Calendar generation failed: {e}")
        calendar = {"error": str(e)}

    # ── 6. Satellite health ───────────────────────────────────────
    lat = data.get("lat")
    lon = data.get("lon")
    satellite: dict[str, Any] = {}
    if lat is not None and lon is not None:
        logger.info(f"Fetching satellite health for ({lat}, {lon})...")
        try:
            satellite = get_satellite_health(float(lat), float(lon))
        except Exception as e:
            logger.warning(f"Satellite health failed: {e}")
            satellite = {"error": str(e)}
    else:
        satellite = {
            "ndvi": None,
            "crop_health": "Unknown",
            "risk_zone": "Unknown",
            "note": "Provide 'lat' and 'lon' in request for satellite analysis.",
        }

    # ── Assemble final response ───────────────────────────────────
    return {
        "recommendation": {
            "crop":       best_crop,
            "yield":      best["yield"],
            "profit":     best["profit"],
            "confidence": confidence,
        },
        "alternatives": alts,
        "explanation":  explanation,
        "weather_scenarios": weather_scenarios,
        "calendar":     calendar,
        "satellite":    satellite,
    }


# ── Example usage block ──────────────────────────────────────────
if __name__ == "__main__":
    import json, logging
    logging.basicConfig(level=logging.INFO, format="%(levelname)s | %(name)s | %(message)s")

    sample_input = {
        "Rainfall":    900.0,
        "Temperature":  28.0,
        "Humidity":     72.0,
        "pH":            6.5,
        "Nitrogen":     90.0,
        "Phosphorus":   35.0,
        "Potassium":   180.0,
        "Season":    "Kharif",
        "lat":         23.02,   # Ahmedabad
        "lon":         72.57,
    }

    print("\n" + "="*60)
    print("  KrishiAI – Full Crop Analysis")
    print("="*60)
    result = full_crop_analysis(sample_input)
    print(json.dumps(result, indent=2, ensure_ascii=False))
