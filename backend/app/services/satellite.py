"""
satellite.py
------------
Simulates satellite-based crop health assessment using NDVI (Normalized
Difference Vegetation Index).

For production, replace the simulation with a real satellite API call
(e.g. NASA EarthData, Sentinel Hub, Google Earth Engine, or ISRO BHUVAN).

Public API
----------
get_satellite_health(lat: float, lon: float) -> dict
    Returns NDVI, crop health label, and risk zone for the given coordinates.
"""

import hashlib
import logging
import math
from typing import Any

import numpy as np

logger = logging.getLogger("KrishiAI.Satellite")

# ── NDVI thresholds ──────────────────────────────────────────────
_NDVI_THRESHOLDS = {
    "healthy":  0.60,
    "moderate": 0.40,
    # below moderate → "Poor"
}

# ── Risk zone labels ─────────────────────────────────────────────
def _ndvi_to_health(ndvi: float) -> tuple[str, str]:
    """Return (crop_health, risk_zone) from NDVI value."""
    if ndvi >= _NDVI_THRESHOLDS["healthy"]:
        return "Healthy", "Low"
    if ndvi >= _NDVI_THRESHOLDS["moderate"]:
        return "Moderate", "Medium"
    return "Poor", "High"


def _simulate_ndvi(lat: float, lon: float) -> float:
    """
    Generate a deterministic-but-realistic pseudo-NDVI value based on
    geographic coordinates.

    Strategy:
    - Use a hash of (lat, lon) rounded to 3dp to get a stable seed.
    - Apply a sinusoidal geographic pattern to mimic real vegetation
      distribution (higher NDVI near tropics, lower at extremes).
    - Add small Gaussian noise.

    Returns
    -------
    float in [0.0, 1.0]
    """
    lat_r = round(lat, 3)
    lon_r = round(lon, 3)
    seed_str = f"{lat_r:.3f}:{lon_r:.3f}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2 ** 32)
    rng = np.random.default_rng(seed)

    # Geographic vegetation signal (peaks at sub-equatorial latitudes ~20°N/S)
    geo_signal = 0.5 + 0.25 * math.cos(math.radians(lat) * 3.0)

    # Random component ±0.15
    noise = rng.uniform(-0.15, 0.15)

    ndvi = geo_signal + noise
    return round(float(np.clip(ndvi, 0.05, 0.95)), 4)


def _additional_metrics(ndvi: float, lat: float, lon: float) -> dict:
    """Generate simulated companion vegetation metrics."""
    seed_str = f"extra:{round(lat, 2)}:{round(lon, 2)}"
    seed = int(hashlib.md5(seed_str.encode()).hexdigest(), 16) % (2 ** 32)
    rng = np.random.default_rng(seed)

    evi  = round(float(np.clip(ndvi * 0.85 + rng.uniform(-0.05, 0.05), 0.0, 1.0)), 4)
    savi = round(float(np.clip(ndvi * 0.90 + rng.uniform(-0.03, 0.03), 0.0, 1.0)), 4)
    moisture_index = round(float(rng.uniform(0.2, 0.8)), 4)

    return {"evi": evi, "savi": savi, "moisture_index": moisture_index}


def get_satellite_health(lat: float, lon: float) -> dict:
    """
    Return simulated NDVI-based crop health for the given GPS coordinates.

    Parameters
    ----------
    lat : float – latitude  (e.g. 23.0225 for Ahmedabad)
    lon : float – longitude (e.g. 72.5714 for Ahmedabad)

    Returns
    -------
    dict, e.g.::
        {
            "ndvi":         0.61,
            "crop_health":  "Healthy",
            "risk_zone":    "Low",
            "evi":          0.52,
            "savi":         0.55,
            "moisture_index": 0.63,
            "note":         "Simulated NDVI – replace with real satellite API for production"
        }

    Notes
    -----
    NDVI Interpretation:
        > 0.60  → Healthy vegetation
        0.40–0.60 → Moderate vegetation
        < 0.40  → Poor / sparse vegetation
    """
    if not (-90 <= lat <= 90) or not (-180 <= lon <= 180):
        raise ValueError(f"Invalid coordinates: lat={lat}, lon={lon}")

    ndvi = _simulate_ndvi(lat, lon)
    health, risk = _ndvi_to_health(ndvi)
    extras = _additional_metrics(ndvi, lat, lon)

    result: dict[str, Any] = {
        "ndvi":            ndvi,
        "crop_health":     health,
        "risk_zone":       risk,
        **extras,
        "note": (
            "Simulated NDVI. Integrate Sentinel-2 / ISRO Bhuvan API for "
            "real-time satellite imagery in production."
        ),
    }

    logger.debug(f"Satellite health for ({lat}, {lon}): {result}")
    return result


# ── Standalone ──────────────────────────────────────────────────
if __name__ == "__main__":
    import json, logging
    logging.basicConfig(level=logging.INFO)
    test_locations = [
        ("Ahmedabad, GJ",   23.0225,  72.5714),
        ("Nagpur, MH",      21.1458,  79.0882),
        ("Chandigarh, PB",  30.7333,  76.7794),
        ("Chennai, TN",     13.0827,  80.2707),
        ("Dense forest",     0.0,    100.0),
    ]
    for name, la, lo in test_locations:
        res = get_satellite_health(la, lo)
        print(f"\n{name}:")
        print(json.dumps(res, indent=2))
