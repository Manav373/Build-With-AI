"""
weather_scenarios.py
--------------------
Simulates yield predictions under three rainfall scenarios using the
trained crop yield model.

Public API
----------
simulate_weather_scenarios(data: dict) -> dict
    Returns predicted yields for normal, low-rainfall, and heavy-rainfall
    weather scenarios.
"""

import logging
import pickle
from copy import deepcopy
from pathlib import Path
from typing import Any

import numpy as np

logger = logging.getLogger("KrishiAI.WeatherScenarios")

_HERE     = Path(__file__).parent
MODEL_DIR = _HERE / "model"

_SEASON_LABEL: dict[str, int] = {"Kharif": 0, "Rabi": 1, "Zaid": 2}
_MODEL  = None
_SCALER = None
_LE     = None


def _load_artefacts() -> bool:
    global _MODEL, _SCALER, _LE
    if _MODEL is not None:
        return True

    paths = [MODEL_DIR / "crop_model.pkl",
             MODEL_DIR / "scaler.pkl",
             MODEL_DIR / "label_encoder.pkl"]

    if not all(p.exists() for p in paths):
        logger.warning("Artefacts missing – attempting auto-train.")
        try:
            from app.services.train_model import train_and_save
            train_and_save()
        except Exception as e:
            logger.error(f"Auto-train failed: {e}")
            return False

    try:
        with open(paths[0], "rb") as f: _MODEL  = pickle.load(f)
        with open(paths[1], "rb") as f: _SCALER = pickle.load(f)
        with open(paths[2], "rb") as f: _LE     = pickle.load(f)
        return True
    except Exception as e:
        logger.error(f"Error loading artefacts: {e}")
        return False


def _encode_season(season: str) -> int:
    s = season.strip().capitalize()
    if _LE is not None:
        try:
            return int(_LE.transform([s])[0])
        except Exception:
            pass
    return _SEASON_LABEL.get(s, 0)


def _predict_single(data: dict) -> float:
    """Predict yield for a single input dict."""
    if not _load_artefacts():
        # Heuristic fallback
        return round(
            data.get("Rainfall", 800) / 500
          + data.get("Nitrogen", 60)  / 80
          + 0.5, 2
        )

    season_enc = _encode_season(data.get("Season", "Kharif"))
    x = np.array([[
        data.get("Rainfall",    800),
        data.get("Temperature",  28),
        data.get("Humidity",     65),
        data.get("pH",          6.8),
        data.get("Nitrogen",     60),
        data.get("Phosphorus",   40),
        data.get("Potassium",   150),
        season_enc,
    ]])
    x_scaled = _SCALER.transform(x)
    return round(max(0.3, min(float(_MODEL.predict(x_scaled)[0]), 12.0)), 2)


def simulate_weather_scenarios(data: dict) -> dict:
    """
    Predict yield under three weather scenarios.

    Scenarios
    ---------
    - normal        : input data as-is
    - low_rainfall  : Rainfall *= 0.80, Humidity *= 0.90
    - heavy_rainfall: Rainfall *= 1.20, Humidity *= 1.10 (capped at 100)

    Parameters
    ----------
    data : dict
        Must contain at least 'Rainfall'. Other keys are optional with
        sensible defaults.

    Returns
    -------
    dict, e.g.::
        {
            "normal":        4.2,
            "low_rainfall":  2.9,
            "heavy_rainfall":3.5,
        }
    """
    normal = _predict_single(data)

    # Low-rainfall scenario
    low_data = deepcopy(data)
    low_data["Rainfall"] = data.get("Rainfall", 800) * 0.80
    low_data["Humidity"] = min(100.0, data.get("Humidity", 65) * 0.90)
    low_yield = _predict_single(low_data)

    # Heavy-rainfall scenario
    heavy_data = deepcopy(data)
    heavy_data["Rainfall"] = data.get("Rainfall", 800) * 1.20
    heavy_data["Humidity"] = min(100.0, data.get("Humidity", 65) * 1.10)
    heavy_yield = _predict_single(heavy_data)

    return {
        "normal":         normal,
        "low_rainfall":   low_yield,
        "heavy_rainfall": heavy_yield,
    }


# ── Standalone ──────────────────────────────────────────────────
if __name__ == "__main__":
    import json, logging
    logging.basicConfig(level=logging.INFO)
    sample = {
        "Rainfall": 900, "Temperature": 28, "Humidity": 70,
        "pH": 6.5, "Nitrogen": 80, "Phosphorus": 40, "Potassium": 180,
        "Season": "Kharif",
    }
    print(json.dumps(simulate_weather_scenarios(sample), indent=2))
