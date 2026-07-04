
import os
import joblib
import numpy as np
import pandas as pd
import logging

logger = logging.getLogger("KrishiMCP.SatelliteML")

MODEL_DIR = "d:/coding/hackathon prototype/hackathon prototype/krishiai/backend/app/data/models"
MODEL_PATH = os.path.join(MODEL_DIR, "satellite_health_v1.pkl")
SCALER_PATH = os.path.join(MODEL_DIR, "satellite_scaler_v1.pkl")
LE_PATH = os.path.join(MODEL_DIR, "satellite_le_crop_v1.pkl")

_model = None
_scaler = None
_le_crop = None

def load_model():
    global _model, _scaler, _le_crop
    try:
        if os.path.exists(MODEL_PATH):
            _model = joblib.load(MODEL_PATH)
            _scaler = joblib.load(SCALER_PATH)
            _le_crop = joblib.load(LE_PATH)
            logger.info("[SatelliteML] Model artifacts loaded successfully.")
        else:
            logger.warning(f"[SatelliteML] Model not found at {MODEL_PATH}")
    except Exception as e:
        logger.error(f"[SatelliteML] Failed to load model: {e}")

# Initial load
load_model()

def analyze_satellite_health(ndvi: float, moisture: float, evapo: float, temp: float, crop: str = "Wheat", is_urban: bool = False):
    """
    Predict high-fidelity crop health metrics using the trained Random Forest model,
    with environmental corrections for Urban vs Rural contexts.
    """
    # Environmental Correction Factors
    # 1. Atmospheric Correction (Pollution/Aerosol simulation)
    # Urban areas often have more aerosols, slightly reducing spectral clarity
    spectral_clarity = 0.92 if is_urban else 1.0
    adj_ndvi = ndvi * spectral_clarity

    if _model is None:
        # High-fidelity rule-based fallback if model is missing
        logger.debug("[SatelliteML] Model missing, using fallback heuristics")
        
        # Aggressive Urban Suppression: Cities should show as "Red" (Poor Health/Non-Agri)
        # Even if there is green (parks/trees), it's NOT productive crop health.
        urban_factor = 0.35 if is_urban else 1.15
        
        chlorophyll = round(max(0, (15 + (adj_ndvi * 60) + (moisture * 10)) * (0.6 if is_urban else 1.0)), 1)
        lai = round(max(0, (adj_ndvi * 6.5) - 1.2), 1)
        
        # Calculate score with a hard ceiling for urban areas to ensure "Red" visibility
        raw_score = ((adj_ndvi * 100) + (moisture * 20)) * urban_factor
        health_score = int(min(45 if is_urban else 100, max(5, raw_score)))
        
        return {
            "chlorophyll": chlorophyll,
            "lai": lai,
            "health_score": health_score,
            "is_model": False,
            "is_urban_corrected": is_urban
        }

    try:
        # Prepare features
        crop_name = crop.title()
        try:
            crop_enc = _le_crop.transform([crop_name])[0]
        except:
            crop_enc = 0
            
        features = [[crop_enc, 1 if is_urban else 0, adj_ndvi, moisture, evapo, temp]]
        scaled = _scaler.transform(pd.DataFrame(features, columns=["Crop_Enc", "Is_Urban", "NDVI", "Moisture", "Evapo", "Temp"]))
        
        preds = _model.predict(scaled)[0]
        
        # Apply aggressive urban penalty to the model prediction as well
        # Cities should NOT show as "Healthy" in an agricultural context.
        final_health = int(preds[2])
        if is_urban:
            final_health = int(min(45, final_health * 0.4))
        else:
            final_health = int(min(100, final_health * 1.1)) # 10% rural boost

        return {
            "chlorophyll": round(preds[0], 1),
            "lai": round(preds[1], 1),
            "health_score": final_health,
            "is_model": True,
            "is_urban_corrected": is_urban
        }
    except Exception as e:
        logger.error(f"[SatelliteML] Inference error: {e}")
        return {
            "chlorophyll": 25.0,
            "lai": 1.5,
            "health_score": 50,
            "is_model": False
        }
