"""
train_model.py
--------------
Local High-Accuracy Training Script.
Generates an unconstrained high-accuracy model (~1.4GB).
"""

import logging
import pickle
from pathlib import Path

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import time

# setup logger
logging.basicConfig(level=logging.INFO, format='%(levelname)s:%(name)s:%(message)s')
logger = logging.getLogger("KrishiAI.TrainLocal")

_HERE = Path(__file__).parent
DATA_PATH = _HERE / "data" / "final_dataset.csv"
MODEL_DIR = _HERE / "model"

def train():
    if not DATA_PATH.exists():
        logger.error(f"Dataset not found at {DATA_PATH}")
        return

    df = pd.read_csv(DATA_PATH)
    logger.info(f"Loaded authentic dataset: {df.shape}")

    # encoding
    le_season = LabelEncoder()
    le_crop = LabelEncoder()
    le_district = LabelEncoder()

    df['Season'] = le_season.fit_transform(df['Season'])
    df['Crop'] = le_crop.fit_transform(df['Crop'])
    df['District'] = le_district.fit_transform(df['District'])

    X = df[['Year', 'Season', 'Crop', 'District', 'Rainfall', 'Temperature', 'pH']]
    y = df['Yield']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    logger.info("Starting High-Accuracy Training (300 Estimators)...")
    start_time = time.time()
    
    # ── LOCAL HIGH-ACCURACY PARAMS ──
    model = RandomForestRegressor(
        n_estimators=300,
        max_depth=None,
        min_samples_leaf=3,
        n_jobs=-1,
        random_state=42,
    )

    model.fit(X_train_scaled, y_train)
    duration = time.time() - start_time
    
    # ── Performance Analysis ──
    preds = model.predict(X_test_scaled)
    mae = mean_absolute_error(y_test, preds)
    mse = mean_squared_error(y_test, preds)
    r2  = r2_score(y_test, preds)
    
    # ── Feature Importance (Judge Friendly) ──
    importances = model.feature_importances_
    feature_names = X.columns
    feat_report = sorted(zip(importances, feature_names), reverse=True)

    print("\n" + "="*50)
    print("      KRISHIAI MODEL TRAINING REPORT (LOCAL)      ")
    print("="*50)
    print(f"Training Duration : {duration:.2f} seconds")
    print(f"Dataset Size      : {len(df)} records")
    print("-" * 50)
    print(f"Mean Absolute Error (MAE) : {mae:.4f} q/ha")
    print(f"Mean Squared Error (MSE)  : {mse:.4f}")
    print(f"R-Squared Score (Accuracy): {r2*100:.2f}%")
    print("-" * 50)
    print("TOP PREDICTIVE FEATURES:")
    for score, name in feat_report:
        print(f" - {name:12}: {score*100:5.2f}% impact")
    print("="*50 + "\n")

    logger.info(f"Model trained – Target R²: {r2:.4f}")

    # ── persist artefacts (Uncompressed for Local) ──
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    with open(MODEL_DIR / "crop_model.pkl",    "wb") as f:
        pickle.dump(model, f)
    with open(MODEL_DIR / "scaler.pkl",        "wb") as f:
        pickle.dump(scaler, f)
    with open(MODEL_DIR / "label_encoder.pkl", "wb") as f:
        pickle.dump(le_season, f)
    with open(MODEL_DIR / "crop_encoder.pkl", "wb") as f:
        pickle.dump(le_crop, f)
    with open(MODEL_DIR / "district_encoder.pkl", "wb") as f:
        pickle.dump(le_district, f)

    logger.info(f"Artefacts saved to {MODEL_DIR}")
    return {"mae": mae, "r2": r2}

if __name__ == "__main__":
    train()
