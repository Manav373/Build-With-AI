"""
dataset_builder.py
------------------
Loads and merges free agricultural datasets (weather.csv, soil.csv, crop_yield.csv)
and produces a clean final_dataset.csv for model training.

Now restructured to handle 100% authentic Kaggle Historical Data.
"""

import os
import logging
import numpy as np
import pandas as pd
from pathlib import Path

logger = logging.getLogger("KrishiAI.DatasetBuilder")

_HERE = Path(__file__).parent
DATA_DIR = _HERE / "data"
OUTPUT_PATH = _HERE / "data" / "final_dataset.csv"

def build_dataset(
    data_dir: Path = DATA_DIR,
    output_path: Path = OUTPUT_PATH,
) -> pd.DataFrame:
    """
    Since we are using 100% authentic data, we rely on fetch_real_data.py
    to parse the authentic Kaggle dataset.
    """
    from app.services.fetch_real_data import download_and_prepare_real_data
    df = download_and_prepare_real_data()

    # ── Canonical column set ──
    canonical = ["Year", "District", "Season", "Crop", "Rainfall", "Temperature", "pH", "Yield"]
    
    for col in canonical:
        if col not in df.columns:
            df[col] = np.nan

    df = df[canonical].copy()

    # ── Clean up ──
    df["Crop"]    = df["Crop"].astype(str).str.strip().str.title()
    df["Season"]  = df["Season"].astype(str).str.strip().str.title()
    df["District"]= df["District"].astype(str).str.strip().str.title()
    df["Year"]    = pd.to_numeric(df["Year"], errors="coerce").fillna(2000).astype(int)
    
    numeric_cols = ["Rainfall", "Temperature", "pH", "Yield"]
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
    
    df.dropna(subset=["Crop", "Yield"], inplace=True)
    df.reset_index(drop=True, inplace=True)

    # ── Save ──
    output_path.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    logger.info(f"Saved final_dataset.csv → {output_path}  ({len(df)} rows)")
    return df

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    result = build_dataset()
    print(f"Dataset shape: {result.shape}")
    print(result.head())
