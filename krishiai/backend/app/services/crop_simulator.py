"""
crop_simulator.py
-----------------
Tests 5–10 candidate crops against soil/weather conditions and predicts
their expected yield using the trained RandomForest model.

Public API
----------
simulate_crops(data: dict) -> list[dict]
    Returns top-3 crops sorted by estimated profit.
"""

import logging
import pickle
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger("KrishiAI.CropSimulator")

# ── model artefact paths ────────────────────────────────────────
_HERE     = Path(__file__).parent
MODEL_DIR = _HERE / "model"

# ── candidate crops for simulation ─────────────────────────────
CANDIDATE_CROPS = [
    "Soybean", "Cotton", "Wheat", "Bajra", "Rice",
    "Maize", "Groundnut", "Sugarcane", "Jowar", "Tur",
]

# ── market prices (₹/ton) and production costs (₹/ton) ─────────
# Source: approximate MSP / mandi data (2023-24)
CROP_ECONOMICS: dict[str, dict[str, float]] = {
    "Soybean":   {"price": 48000, "cost_per_ton": 2200},
    "Cotton":    {"price": 65000, "cost_per_ton": 3000},
    "Wheat":     {"price": 22000, "cost_per_ton": 1800},
    "Bajra":     {"price": 23500, "cost_per_ton": 1600},
    "Rice":      {"price": 24000, "cost_per_ton": 2000},
    "Maize":     {"price": 20000, "cost_per_ton": 1500},
    "Groundnut": {"price": 60000, "cost_per_ton": 2800},
    "Sugarcane": {"price": 3500,  "cost_per_ton": 400},
    "Jowar":     {"price": 21000, "cost_per_ton": 1400},
    "Tur":       {"price": 70000, "cost_per_ton": 3200},
}

# Seasons used by the label encoder (alphabetical = [Kharif, Rabi, Zaid])
_SEASON_LABEL: dict[str, int] = {"Kharif": 0, "Rabi": 1, "Zaid": 2}

# Cached model objects
_MODEL   = None
_SCALER  = None
_LE      = None


def _load_artefacts() -> bool:
    """
    Load model artefacts lazily. Returns True if successful.
    Falls back to a simplified heuristic if artefacts are absent.
    """
    global _MODEL, _SCALER, _LE
    if _MODEL is not None:
        return True

    model_path  = MODEL_DIR / "crop_model.pkl"
    scaler_path = MODEL_DIR / "scaler.pkl"
    le_path     = MODEL_DIR / "label_encoder.pkl"

    if not all(p.exists() for p in [model_path, scaler_path, le_path]):
        logger.warning("Model artefacts not found – running train_model first.")
        try:
            from app.services.train_model import train_and_save
            train_and_save()
        except Exception as e:
            logger.error(f"Auto-training failed: {e}")
            return False

    try:
        with open(model_path, "rb")  as f: _MODEL  = pickle.load(f)
        with open(scaler_path, "rb") as f: _SCALER = pickle.load(f)
        with open(le_path, "rb")     as f: _LE     = pickle.load(f)
        return True
    except Exception as e:
        logger.error(f"Failed to load artefacts: {e}")
        return False


def _encode_season(season: str) -> int:
    s = season.strip().capitalize()
    # Try the label encoder first (keeps sync with training)
    if _LE is not None:
        try:
            return int(_LE.transform([s])[0])
        except Exception:
            pass
    return _SEASON_LABEL.get(s, 0)


def _predict_yield(data: dict[str, Any], crop: str) -> float:
    """
    Predict yield (ton/ha) for a given crop given the input conditions.
    Falls back to a heuristic formula when model is unavailable.
    """
    if not _load_artefacts():
        # Heuristic fallback
        base = (
            data.get("Rainfall", 800)    / 1000
          + data.get("Nitrogen", 60)     / 100
          + data.get("Temperature", 28)  / 50
        )
        econ = CROP_ECONOMICS.get(crop, {})
        return round(max(0.5, min(base * 2.5 + np.random.uniform(-0.3, 0.3), 8.0)), 2)

    season_enc = _encode_season(data.get("Season", "Kharif"))
    feature_vector = np.array([[
        data.get("Rainfall",    800),
        data.get("Temperature",  28),
        data.get("Humidity",     65),
        data.get("pH",          6.8),
        data.get("Nitrogen",     60),
        data.get("Phosphorus",   40),
        data.get("Potassium",   150),
        season_enc,
    ]])
    scaled = _SCALER.transform(feature_vector)
    predicted = float(_MODEL.predict(scaled)[0])
    return round(max(0.3, min(predicted, 12.0)), 2)   # clip to realistic range


def _estimate_profit(crop: str, yield_ton: float) -> int:
    """Calculate profit in INR assuming 1 hectare."""
    econ = CROP_ECONOMICS.get(crop, {"price": 25000, "cost_per_ton": 2000})
    revenue = yield_ton * econ["price"]
    cost    = yield_ton * econ["cost_per_ton"]
    return int(round(revenue - cost))


def simulate_crops(data: dict) -> list[dict]:
    """
    Simulate multiple candidate crops and return the top 3 by estimated profit.

    Parameters
    ----------
    data : dict with keys matching model features:
        Rainfall, Temperature, Humidity, pH, Nitrogen,
        Phosphorus, Potassium, Season

    Returns
    -------
    list of dicts, e.g.:
        [
          {"crop": "Soybean", "yield": 4.2, "profit": 62000},
          {"crop": "Bajra",   "yield": 3.5, "profit": 51000},
          {"crop": "Cotton",  "yield": 2.8, "profit": 43000},
        ]
    """
    results = []
    for crop in CANDIDATE_CROPS:
        y = _predict_yield(data, crop)
        p = _estimate_profit(crop, y)
        results.append({"crop": crop, "yield": y, "profit": p})

    results.sort(key=lambda x: x["profit"], reverse=True)
    return results[:3]


# ── Standalone ──────────────────────────────────────────────────
if __name__ == "__main__":
    import json, logging
    logging.basicConfig(level=logging.INFO)
    sample = {
        "Rainfall": 900, "Temperature": 28, "Humidity": 70,
        "pH": 6.5, "Nitrogen": 80, "Phosphorus": 40, "Potassium": 180,
        "Season": "Kharif",
    }
    print(json.dumps(simulate_crops(sample), indent=2))
