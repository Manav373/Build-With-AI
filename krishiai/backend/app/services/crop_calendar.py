"""
crop_calendar.py
----------------
Generates a crop-specific activity calendar (sowing → harvest) based on
crop type and season.

Public API
----------
generate_crop_calendar(crop: str, season: str) -> dict
    Returns a dict with sowing, fertilizer, irrigation, and harvest dates.
"""

import logging

logger = logging.getLogger("KrishiAI.CropCalendar")

# ─────────────────────────────────────────────────────────────────────────────
# Crop calendar database
# Keys are (crop_normalised, season_normalised).
# If season is not relevant for a crop, use "any".
# ─────────────────────────────────────────────────────────────────────────────
_CALENDAR_DB: dict[tuple[str, str], dict[str, str]] = {
    # ── Soybean ──────────────────────────────────────────────────
    ("soybean", "kharif"): {
        "sowing":      "15 June – 5 July",
        "transplanting": "Not applicable (direct sowing)",
        "fertilizer":  "Basal at sowing; top-dress urea at 30 DAS",
        "irrigation":  "Every 7–10 days; critical at flowering (60–70 DAS)",
        "pest_watch":  "Girdle beetle & leaf miner – check weekly from 25 DAS",
        "harvest":     "5–15 October (90–100 DAS)",
    },
    ("soybean", "rabi"): {
        "sowing":      "Not recommended in Rabi – Kharif crop only",
        "fertilizer":  "N/A",
        "irrigation":  "N/A",
        "harvest":     "N/A",
    },

    # ── Cotton ───────────────────────────────────────────────────
    ("cotton", "kharif"): {
        "sowing":      "1–15 May (irrigated); 15 June – 15 July (rainfed)",
        "transplanting": "Not applicable",
        "fertilizer":  (
            "Basal: DAP + MOP at sowing; "
            "1st top-dress at 30 DAS; 2nd top-dress at 60 DAS"
        ),
        "irrigation":  "Every 10–15 days; avoid waterlogging",
        "pest_watch":  "Bollworm monitoring from 60 DAS; use pheromone traps",
        "harvest":     "November – January (160–180 DAS)",
    },

    # ── Wheat ────────────────────────────────────────────────────
    ("wheat", "rabi"): {
        "sowing":      "15 October – 15 November (timely); up to 25 Nov (late)",
        "transplanting": "Not applicable",
        "fertilizer":  (
            "Basal: full P & K + 1/3 N at sowing; "
            "1st irrigation top-dress at CRI (21 DAS); "
            "2nd top-dress at tillering (45 DAS)"
        ),
        "irrigation":  (
            "6 critical irrigations: CRI (21 DAS), tillering (45), "
            "jointing (65), flowering (85), milking (105), dough (115)"
        ),
        "pest_watch":  "Yellow rust & aphids – check from February",
        "harvest":     "15 March – 15 April (120–135 DAS)",
    },
    ("wheat", "kharif"): {
        "sowing":      "Not suitable – wheat is a Rabi crop",
        "fertilizer":  "N/A",
        "irrigation":  "N/A",
        "harvest":     "N/A",
    },

    # ── Bajra (Pearl Millet) ──────────────────────────────────────
    ("bajra", "kharif"): {
        "sowing":      "15 June – 15 July",
        "transplanting": "Not applicable",
        "fertilizer":  (
            "Basal: full P & K + 50% N at sowing; "
            "remaining 50% N at 30 DAS"
        ),
        "irrigation":  "Every 10 days in dry spells; drought-tolerant",
        "pest_watch":  "Downy mildew from seedling stage; stem borer at tillering",
        "harvest":     "September – October (75–90 DAS)",
    },
    ("bajra", "rabi"): {
        "sowing":      "October – November (summer/irrigated bajra)",
        "fertilizer":  "Same as Kharif schedule",
        "irrigation":  "Every 12–15 days",
        "harvest":     "January – February",
    },

    # ── Rice ─────────────────────────────────────────────────────
    ("rice", "kharif"): {
        "sowing":      "Nursery: 15 May – 15 June; Transplant: 15 June – 15 July",
        "transplanting": "21–25 day old seedlings; 2–3 seedlings/hill",
        "fertilizer":  (
            "Basal: full P & K + 1/3 N at transplanting; "
            "1/3 N at tillering (25–30 DAT); "
            "1/3 N at panicle initiation (55–60 DAT)"
        ),
        "irrigation":  "2–5 cm standing water; drain 7–10 days before harvest",
        "pest_watch":  "Brown planthopper weeks 4–8; blast disease watch during humid spells",
        "harvest":     "October – November (110–130 DAT)",
    },
    ("rice", "rabi"): {
        "sowing":      "November – December (Boro/winter rice, irrigated areas only)",
        "transplanting": "December – January",
        "fertilizer":  "Same split schedule as Kharif",
        "irrigation":  "Continuous flooding; drain before harvest",
        "harvest":     "March – April",
    },

    # ── Maize ────────────────────────────────────────────────────
    ("maize", "kharif"): {
        "sowing":      "June – July",
        "transplanting": "Not applicable",
        "fertilizer":  "150:75:75 NPK kg/ha split in 3 doses",
        "irrigation":  "Every 10 days; critical at tasseling and grain fill",
        "pest_watch":  "Fall armyworm – check weekly from V3 stage",
        "harvest":     "September – October (90–95 DAS)",
    },
    ("maize", "rabi"): {
        "sowing":      "October – November",
        "fertilizer":  "Same NPK schedule",
        "irrigation":  "Every 10–12 days",
        "harvest":     "February – March",
    },

    # ── Groundnut ────────────────────────────────────────────────
    ("groundnut", "kharif"): {
        "sowing":      "15 June – 15 July",
        "transplanting": "Not applicable (direct pod sowing)",
        "fertilizer":  "Basal: 20:40:40 NPK kg/ha; gypsum 200 kg/ha at pegging",
        "irrigation":  "Every 10–12 days; critical at pegging & pod development",
        "pest_watch":  "Leafminer and tikka disease – check from 30 DAS",
        "harvest":     "October – November (110–130 DAS)",
    },

    # ── Sugarcane ─────────────────────────────────────────────────
    ("sugarcane", "any"): {
        "sowing":      "Planting: January – March (spring); October – November (autumn)",
        "transplanting": "Not applicable (sett planting)",
        "fertilizer":  (
            "Basal: full P & K at planting; "
            "N split into 4 doses: planting, 30, 90, 150 DAP"
        ),
        "irrigation":  "Every 7–10 days (summer); 15 days (winter); 300–350 cm total",
        "pest_watch":  "Early shoot borer (1–3 months); Top shoot borer (4–6 months)",
        "harvest":     "10–12 months after planting (Oct–March)",
    },

    # ── Jowar (Sorghum) ──────────────────────────────────────────
    ("jowar", "kharif"): {
        "sowing":      "15 June – 15 July",
        "transplanting": "Not applicable",
        "fertilizer":  "80:40:40 NPK kg/ha; top-dress N at 30 DAS",
        "irrigation":  "Every 10–12 days; drought-tolerant after establishment",
        "pest_watch":  "Shoot fly in seedling stage; midge at flowering",
        "harvest":     "September – October (90–110 DAS)",
    },
    ("jowar", "rabi"): {
        "sowing":      "September – October",
        "fertilizer":  "60:30:30 NPK kg/ha",
        "irrigation":  "Every 12–15 days",
        "harvest":     "January – February (110–120 DAS)",
    },

    # ── Tur (Pigeon Pea) ─────────────────────────────────────────
    ("tur", "kharif"): {
        "sowing":      "15 June – 15 July",
        "transplanting": "Not applicable",
        "fertilizer":  (
            "Basal: 20:50:25 NPK kg/ha; rhizobium seed treatment; "
            "PSB inoculant recommended"
        ),
        "irrigation":  "2–3 supplemental irrigations at flowering and pod fill",
        "pest_watch":  "Pod borer (Helicoverpa) – critical from October onwards",
        "harvest":     "January – February (150–180 DAS)",
    },
}

# Fallback for unknown crops or missing season
_DEFAULT_CALENDAR: dict[str, str] = {
    "sowing":     "Refer to local KVK / ATMA for recommended window",
    "fertilizer": "Apply balanced NPK as per soil test; consult agronomist",
    "irrigation": "As per crop water requirement; typically every 7–14 days",
    "harvest":    "Refer to variety-specific maturity period",
}


def _normalise(text: str) -> str:
    return text.strip().lower()


def generate_crop_calendar(crop: str, season: str) -> dict:
    """
    Return a crop management calendar for the given crop and season.

    Parameters
    ----------
    crop   : str – e.g. "Soybean", "wheat", "RICE"
    season : str – e.g. "Kharif", "rabi", "Zaid"

    Returns
    -------
    dict with at least:
        sowing, fertilizer, irrigation, harvest
    Plus optional: transplanting, pest_watch
    """
    crop_key   = _normalise(crop)
    season_key = _normalise(season)

    # Try exact match first
    cal = _CALENDAR_DB.get((crop_key, season_key))
    if cal is None:
        # Try "any" season
        cal = _CALENDAR_DB.get((crop_key, "any"))
    if cal is None:
        logger.warning(f"No calendar data for crop='{crop}', season='{season}' – using defaults.")
        cal = _DEFAULT_CALENDAR.copy()
        cal["note"] = (
            f"No specific calendar found for {crop.title()} in {season.title()} season. "
            "Please consult your local agricultural extension officer."
        )

    return cal


# ── Standalone ──────────────────────────────────────────────────
if __name__ == "__main__":
    import json
    for c, s in [
        ("Soybean", "Kharif"), ("Wheat", "Rabi"),
        ("Cotton", "Kharif"), ("Bajra", "Kharif"),
        ("Rice", "Kharif"),   ("Sugarcane", "Kharif"),
    ]:
        print(f"\n{'='*50}")
        print(f"  {c} – {s}")
        print('='*50)
        print(json.dumps(generate_crop_calendar(c, s), indent=2))
