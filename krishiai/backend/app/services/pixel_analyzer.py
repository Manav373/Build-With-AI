"""
KrishiAI Satellite Pixel Analyzer — v2.0
=========================================
Fetches a real Google Maps Satellite tile at the EXACT zoom level the user
sees on screen. Analyzes actual RGB pixels to derive:
  - Visual NDVI (greenness ratio from visible spectral bands)
  - Land-type classification (vegetation, arid, urban, water, salt pan)
  - Area-context label (field-level vs regional-level based on zoom)
  - Calibrated health score based on what the satellite image ACTUALLY shows

Zoom-aware behavior:
  - zoom 10-12: Regional view — analysis covers ~50-200 km² area
  - zoom 13-15: District/Town view — covers ~1-20 km² area
  - zoom 16-18: Field-level view — covers ~0.05-1 km² — most accurate for farms
"""

import os
import io
import httpx
import numpy as np
from typing import Optional


def get_area_label(zoom: int) -> str:
    """Returns a human-readable area description based on zoom level."""
    if zoom >= 17:
        return "Field / Plot Level (~50m radius)"
    elif zoom >= 15:
        return "Farm / Village Level (~200m radius)"
    elif zoom >= 13:
        return "Taluka / Town Level (~1-5 km radius)"
    elif zoom >= 11:
        return "District Level (~20-50 km radius)"
    else:
        return "Regional Level (~100+ km radius)"


def fetch_satellite_tile(lat: float, lon: float, zoom: int = 14, size: int = 400) -> Optional[bytes]:
    """
    Fetches a satellite image tile from Google Maps Static API at the given zoom.
    Higher zoom = more zoomed-in = field-level detail.
    Returns raw image bytes or None if unavailable.
    """
    api_key = (
        os.environ.get("GOOGLE_MAPS_API_KEY")
        or os.environ.get("VITE_GOOGLE_MAPS_API_KEY")
        or ""
    )
    if not api_key:
        return None

    # Clamp zoom to safe bounds for Google Static Maps API
    safe_zoom = max(8, min(20, zoom))
    safe_size = max(200, min(640, size))

    url = (
        f"https://maps.googleapis.com/maps/api/staticmap"
        f"?center={lat},{lon}"
        f"&zoom={safe_zoom}"
        f"&size={safe_size}x{safe_size}"
        f"&maptype=satellite"
        f"&key={api_key}"
    )
    try:
        with httpx.Client(timeout=10.0) as client:
            resp = client.get(url)
            if resp.status_code == 200:
                return resp.content
            else:
                print(f"[PixelAnalyzer] Tile fetch HTTP {resp.status_code}")
    except Exception as e:
        print(f"[PixelAnalyzer] Tile fetch failed: {e}")
    return None


def analyze_pixel_colors(image_bytes: bytes, zoom: int = 14) -> dict:
    """
    Analyzes the pixel color distribution of a satellite image.
    Returns classified land-use and visual NDVI estimate.
    
    At higher zoom (field level), we analyze a tighter center crop for precision.
    At lower zoom (regional), we analyze a larger portion of the image.

    Color signature mapping (Google satellite imagery):
    - Dark/Medium Green (G >> R, G >> B):  Dense vegetation / crops
    - Yellow-Green (G > R slightly):        Sparse vegetation / fallow
    - Brown/Red-Brown (R > G, R > B):       Arid soil / harvested fields
    - Dark Grey/Blue-Grey (R≈G≈B, dark):   Rocky / Urban / Roads
    - Light Grey/White (R≈G≈B, bright):    Salt pans / Buildings / Clouds
    - Blue dominant (B >> R, B >> G):       Water bodies
    """
    try:
        from PIL import Image
    except ImportError:
        print("[PixelAnalyzer] PIL not installed — run: pip install Pillow")
        return _fallback_analysis()

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        w, h = img.size

        # At higher zoom, focus tightly on the center (the clicked point).
        # At lower zoom, analyze a larger area to capture regional patterns.
        if zoom >= 16:
            margin = 0.25   # Tight 50% center crop for field-level
        elif zoom >= 13:
            margin = 0.20   # 60% center crop for farm/town level
        else:
            margin = 0.10   # 80% crop for regional

        cx1 = int(w * margin)
        cy1 = int(h * margin)
        cx2 = int(w * (1 - margin))
        cy2 = int(h * (1 - margin))
        center_crop = img.crop((cx1, cy1, cx2, cy2))

        pixels = np.array(center_crop, dtype=np.float32)
        R = pixels[:, :, 0]
        G = pixels[:, :, 1]
        B = pixels[:, :, 2]
        total = R.size

        # ── Land Type Classification ─────────────────────────────────────────

        # Dense vegetation: Green significantly dominates
        dense_veg_mask = (G > 80) & (G > R * 1.2) & (G > B * 1.1) & (R < 160)
        dense_veg_pct = float(np.sum(dense_veg_mask) / total)

        # Sparse vegetation / light green
        sparse_veg_mask = (G > R) & (G > B) & (G > 55) & ~dense_veg_mask
        sparse_veg_pct = float(np.sum(sparse_veg_mask) / total)

        # Arid/dry soil: Red-Brown dominant
        arid_mask = (R > G * 1.08) & (R > B * 1.05) & (R > 75) & (G < 165)
        arid_pct = float(np.sum(arid_mask) / total)

        # Water: Blue dominant and not too bright
        water_mask = (B > R * 1.15) & (B > G * 1.08) & (B > 45) & (R < 180)
        water_pct = float(np.sum(water_mask) / total)

        # Urban/Rocky: Grey (R≈G≈B, moderate brightness)
        grey_mask = (
            (np.abs(R.astype(int) - G.astype(int)) < 22) &
            (np.abs(G.astype(int) - B.astype(int)) < 22) &
            (R > 50) & (R < 195)
        )
        grey_pct = float(np.sum(grey_mask) / total)

        # Salt pan / Bright barren: High uniform brightness
        saltpan_mask = (R > 175) & (G > 170) & (B > 158) & \
                       (np.abs(R.astype(int) - G.astype(int)) < 28)
        saltpan_pct = float(np.sum(saltpan_mask) / total)

        # ── Visual NDVI Proxy ────────────────────────────────────────────────
        # (G - R) / (G + R) — green channel as NIR substitute
        vndvi_map = (G - R) / (G + R + 1e-6)
        visual_ndvi_raw = float(np.median(vndvi_map))
        # Scale to realistic NDVI range: raw is ~[-1,1], scale to [-0.1, 0.9]
        visual_ndvi = max(-0.1, min(0.88, visual_ndvi_raw * 2.8 + 0.12))

        # ── Dominant Land Classification ─────────────────────────────────────
        scores = {
            "dense_vegetation": dense_veg_pct,
            "sparse_vegetation": sparse_veg_pct,
            "arid_soil": arid_pct,
            "water": water_pct,
            "urban_rocky": grey_pct,
            "salt_pan": saltpan_pct,
        }
        land_type = max(scores, key=scores.get)

        # ── Health Score from dominant land ──────────────────────────────────
        if land_type == "dense_vegetation":
            health_score = max(68, min(95, int(dense_veg_pct * 210 + 60)))
            visual_ndvi = max(0.60, visual_ndvi)
        elif land_type == "sparse_vegetation":
            health_score = max(42, min(68, int(sparse_veg_pct * 140 + 38)))
            visual_ndvi = max(0.32, min(0.60, visual_ndvi))
        elif land_type == "arid_soil":
            health_score = max(12, min(38, int(arid_pct * 55 + 12)))
            visual_ndvi = min(0.28, max(0.04, visual_ndvi))
        elif land_type == "water":
            health_score = 8
            visual_ndvi = -0.05
        elif land_type == "urban_rocky":
            health_score = max(18, min(40, int(grey_pct * 55)))
            visual_ndvi = min(0.32, visual_ndvi)
        elif land_type == "salt_pan":
            health_score = max(4, min(18, int(saltpan_pct * 28)))
            visual_ndvi = min(0.12, visual_ndvi)
        else:
            health_score = int(max(5, min(95, visual_ndvi * 100)))

        # ── Mean RGB for debugging ───────────────────────────────────────────
        return {
            "visual_ndvi": round(visual_ndvi, 3),
            "health_score": health_score,
            "land_type": land_type,
            "area_label": get_area_label(zoom),
            "capture_zoom": zoom,
            "pixel_stats": {
                "dense_vegetation_pct": round(dense_veg_pct * 100, 1),
                "sparse_vegetation_pct": round(sparse_veg_pct * 100, 1),
                "arid_soil_pct": round(arid_pct * 100, 1),
                "water_pct": round(water_pct * 100, 1),
                "urban_rocky_pct": round(grey_pct * 100, 1),
                "salt_pan_pct": round(saltpan_pct * 100, 1),
            },
            "source": f"satellite_pixel_analysis_z{zoom}",
            "mean_r": round(float(np.mean(R)), 1),
            "mean_g": round(float(np.mean(G)), 1),
            "mean_b": round(float(np.mean(B)), 1),
        }
    except Exception as e:
        print(f"[PixelAnalyzer] Analysis error: {e}")
        return _fallback_analysis()


def _fallback_analysis() -> dict:
    return {
        "visual_ndvi": None,
        "health_score": None,
        "land_type": "unknown",
        "area_label": "Unknown area",
        "capture_zoom": 14,
        "pixel_stats": {},
        "source": "pixel_analysis_failed",
    }


def analyze_location_from_satellite(lat: float, lon: float, zoom: int = 14, size: int = 400) -> dict:
    """
    Full pipeline: fetch tile at exact zoom → analyze pixels → return calibrated health data.
    Primary entry point called by the API endpoint.
    """
    img_bytes = fetch_satellite_tile(lat, lon, zoom=zoom, size=size)
    if img_bytes is None:
        result = _fallback_analysis()
        result["lat"] = lat
        result["lon"] = lon
        return result

    result = analyze_pixel_colors(img_bytes, zoom=zoom)
    result["lat"] = lat
    result["lon"] = lon
    result["zoom_level"] = zoom
    return result
