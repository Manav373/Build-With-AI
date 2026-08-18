"""
explain_prediction.py
---------------------
Rule-based explanation engine for crop yield predictions.
No SHAP or ML interpretability libraries required.

Public API
----------
explain_prediction(data: dict, crop: str) -> dict
    Returns good_factors and bad_factors as human-readable strings.
"""

import logging
from typing import Any

logger = logging.getLogger("KrishiAI.ExplainPrediction")

# ─────────────────────────────────────────────────────────────────────────────
# Per-crop ideal agronomic ranges
# Sources: ICAR crop production guides (approximate)
# ─────────────────────────────────────────────────────────────────────────────
CROP_RANGES: dict[str, dict[str, tuple[float, float]]] = {
    "Soybean": {
        "Rainfall":    (600,  1200),
        "Temperature": (20,   30),
        "Humidity":    (60,   90),
        "pH":          (6.0,  7.5),
        "Nitrogen":    (40,   120),
        "Phosphorus":  (30,   80),
        "Potassium":   (100,  300),
    },
    "Cotton": {
        "Rainfall":    (500,  1000),
        "Temperature": (21,   37),
        "Humidity":    (50,   85),
        "pH":          (5.8,  8.0),
        "Nitrogen":    (60,   150),
        "Phosphorus":  (20,   60),
        "Potassium":   (80,   250),
    },
    "Wheat": {
        "Rainfall":    (400,   900),
        "Temperature": (10,   25),
        "Humidity":    (40,   75),
        "pH":          (6.0,  7.5),
        "Nitrogen":    (80,   200),
        "Phosphorus":  (40,   90),
        "Potassium":   (100,  300),
    },
    "Bajra": {
        "Rainfall":    (300,   700),
        "Temperature": (25,   40),
        "Humidity":    (30,   70),
        "pH":          (5.5,  8.0),
        "Nitrogen":    (30,   100),
        "Phosphorus":  (15,   50),
        "Potassium":   (50,   200),
    },
    "Rice": {
        "Rainfall":    (1000, 2000),
        "Temperature": (20,   35),
        "Humidity":    (70,   95),
        "pH":          (5.5,  7.0),
        "Nitrogen":    (80,   200),
        "Phosphorus":  (30,   80),
        "Potassium":   (100,  300),
    },
    "Maize": {
        "Rainfall":    (600,  1100),
        "Temperature": (18,   35),
        "Humidity":    (50,   85),
        "pH":          (5.8,  7.5),
        "Nitrogen":    (80,   200),
        "Phosphorus":  (30,   80),
        "Potassium":   (80,   250),
    },
    "Groundnut": {
        "Rainfall":    (500,   900),
        "Temperature": (24,   36),
        "Humidity":    (50,   80),
        "pH":          (6.0,  7.0),
        "Nitrogen":    (20,   60),
        "Phosphorus":  (30,   80),
        "Potassium":   (80,   250),
    },
    "Sugarcane": {
        "Rainfall":    (1000, 1800),
        "Temperature": (20,   35),
        "Humidity":    (65,   95),
        "pH":          (6.0,  7.5),
        "Nitrogen":    (150,  350),
        "Phosphorus":  (50,   100),
        "Potassium":   (150,  400),
    },
    "Jowar": {
        "Rainfall":    (300,   750),
        "Temperature": (24,   38),
        "Humidity":    (30,   70),
        "pH":          (5.5,  8.0),
        "Nitrogen":    (30,   100),
        "Phosphorus":  (15,   50),
        "Potassium":   (50,   200),
    },
    "Tur": {
        "Rainfall":    (600,  1000),
        "Temperature": (18,   32),
        "Humidity":    (50,   80),
        "pH":          (6.0,  7.5),
        "Nitrogen":    (20,   60),
        "Phosphorus":  (20,   60),
        "Potassium":   (60,   200),
    },
}

_GENERIC_RANGES: dict[str, tuple[float, float]] = {
    "Rainfall":    (500,  1200),
    "Temperature": (18,   38),
    "Humidity":    (40,   90),
    "pH":          (5.5,  8.0),
    "Nitrogen":    (30,   150),
    "Phosphorus":  (15,   80),
    "Potassium":   (60,   300),
}

# Human-readable factor descriptions
_FACTOR_TEMPLATES: dict[str, dict[str, str]] = {
    "Rainfall": {
        "high": "High rainfall ({val} mm) is well-suited for {crop}",
        "low":  "Low rainfall ({val} mm) may stress {crop} during critical growth stages",
        "ok":   "Rainfall ({val} mm) is in the ideal range for {crop}",
        "very_high": "Excess rainfall ({val} mm) risks waterlogging and fungal disease for {crop}",
    },
    "Temperature": {
        "high": "High temperature ({val}°C) may cause heat stress in {crop}",
        "low":  "Low temperature ({val}°C) slows germination for {crop}",
        "ok":   "Temperature ({val}°C) is optimal for {crop} growth",
    },
    "Humidity": {
        "high": "Very high humidity ({val}%) increases fungal/bacterial risk for {crop}",
        "low":  "Low humidity ({val}%) may accelerate water loss in {crop}",
        "ok":   "Humidity ({val}%) is comfortable for {crop}",
    },
    "pH": {
        "high": "Alkaline soil (pH {val}) may reduce nutrient availability for {crop}",
        "low":  "Acidic soil (pH {val}) may limit phosphorus uptake for {crop}",
        "ok":   "Soil pH ({val}) is optimal for {crop}",
    },
    "Nitrogen": {
        "high": "Nitrogen level ({val} kg/ha) is excellent for {crop} vegetative growth",
        "low":  "Low nitrogen ({val} kg/ha) may reduce leaf area and yield for {crop}",
        "ok":   "Nitrogen level ({val} kg/ha) is adequate for {crop}",
        "very_high": "Excessive nitrogen ({val} kg/ha) may cause lodging or delay maturity in {crop}",
    },
    "Phosphorus": {
        "high": "Phosphorus level ({val} kg/ha) supports strong root development in {crop}",
        "low":  "Low phosphorus ({val} kg/ha) may slightly reduce yield in {crop}",
        "ok":   "Phosphorus ({val} kg/ha) is sufficient for {crop}",
    },
    "Potassium": {
        "high": "Potassium ({val} kg/ha) is sufficient and aids disease resistance in {crop}",
        "low":  "Low potassium ({val} kg/ha) may weaken stem strength in {crop}",
        "ok":   "Potassium ({val} kg/ha) is within the healthy range for {crop}",
    },
}


def _classify_value(
    value: float, lo: float, hi: float
) -> str:
    """Classify value relative to the ideal range [lo, hi]."""
    span = hi - lo
    if value < lo - 0.15 * span:
        return "low"
    if value > hi + 0.15 * span:
        return "very_high" if value > hi + 0.4 * span else "high"
    return "ok"


def _make_sentence(factor: str, status: str, value: float, crop: str) -> str:
    templates = _FACTOR_TEMPLATES.get(factor, {})
    tpl = templates.get(status, templates.get("ok", f"{factor} ({value}) noted for {crop}"))
    return tpl.format(val=value, crop=crop)


def explain_prediction(data: dict, crop: str) -> dict:
    """
    Generate a rule-based explanation for the predicted yield of *crop*
    given the agronomic conditions in *data*.

    Parameters
    ----------
    data : dict
        Keys: Rainfall, Temperature, Humidity, pH, Nitrogen,
              Phosphorus, Potassium, Season
    crop : str
        The crop being analysed (e.g. "Soybean").

    Returns
    -------
    dict with keys:
        good_factors : list[str]
        bad_factors  : list[str]
    """
    crop_title = crop.strip().title()
    ranges = CROP_RANGES.get(crop_title, _GENERIC_RANGES)

    good_factors: list[str] = []
    bad_factors:  list[str] = []

    for factor, (lo, hi) in ranges.items():
        raw_val = data.get(factor)
        if raw_val is None:
            continue
        value = float(raw_val)

        status = _classify_value(value, lo, hi)
        sentence = _make_sentence(factor, status, round(value, 2), crop_title)

        if status == "ok" or status == "high":
            # "high" within tolerable range → still a good factor
            good_factors.append(sentence)
        else:
            bad_factors.append(sentence)

    # Always ensure at least one entry in each list
    if not good_factors:
        good_factors.append(f"Field conditions are being assessed for {crop_title}")
    if not bad_factors:
        bad_factors.append(f"No critical limiting factors detected for {crop_title}")

    return {"good_factors": good_factors, "bad_factors": bad_factors}


# ── Standalone ──────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    sample = {
        "Rainfall": 950, "Temperature": 27, "Humidity": 72,
        "pH": 6.4, "Nitrogen": 90, "Phosphorus": 20, "Potassium": 190,
    }
    result = explain_prediction(sample, "Soybean")
    print(json.dumps(result, indent=2))
