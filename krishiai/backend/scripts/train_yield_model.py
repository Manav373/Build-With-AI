
import os
import pandas as pd
import numpy as np
import joblib
import random
from pathlib import Path
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder

# Configuration
SAVE_DIR = Path("d:/coding/hackathon prototype/hackathon prototype/krishiai/backend/app/services/model")
os.makedirs(SAVE_DIR, exist_ok=True)

# 1. Generate Synthetic Indian Yield Dataset (Based on ICAR/FAO data)
def generate_yield_dataset(n_samples=15000):
    crops = ["Wheat", "Rice", "Maize", "Cotton", "Sugarcane", "Jowar", "Bajra", "Groundnut", "Soyabean", "Gram"]
    seasons = ["Kharif", "Rabi", "Summer", "Whole Year"]
    districts = ["Pune", "Nashik", "Ahmedabad", "Rajkot", "Amritsar", "Ludhiana", "Warangal", "Indore", "Nagpur"]
    
    data = []
    for _ in range(n_samples):
        year = random.randint(2010, 2024)
        crop = random.choice(crops)
        season = random.choice(seasons)
        district = random.choice(districts)
        
        # Heuristic benchmarks (Yield in t/ha)
        if crop == "Wheat": base = 3.2; rain_ideal = 450; temp_ideal = 21
        elif crop == "Rice": base = 3.8; rain_ideal = 1300; temp_ideal = 26
        elif crop == "Sugarcane": base = 75.0; rain_ideal = 1600; temp_ideal = 28
        elif crop == "Cotton": base = 1.8; rain_ideal = 750; temp_ideal = 28
        else: base = 2.5; rain_ideal = 600; temp_ideal = 25
        
        rain = random.uniform(200, 2000)
        temp = random.uniform(15, 45)
        ph = random.uniform(5.5, 8.5)
        
        # Calculate yield based on feature response
        rain_eff = 1.0 - (abs(rain - rain_ideal) / 2000.0)
        temp_eff = 1.0 - (abs(temp - temp_ideal) / 30.0)
        ph_eff = 1.0 - (abs(ph - 6.5) / 5.0)
        
        # Technology uplift over years
        tech_uplift = 1.0 + (year - 2010) * 0.015
        
        yield_val = base * rain_eff * temp_eff * ph_eff * tech_uplift
        yield_val = max(0.5, yield_val + random.uniform(-0.2, 0.2))
        
        data.append([year, season, crop, district, rain, temp, ph, yield_val])
        
    df = pd.DataFrame(data, columns=['Year', 'Season', 'Crop', 'District', 'Rainfall', 'Temperature', 'pH', 'Yield'])
    return df

print("Generating synthetic Indian Crop Yield dataset...")
df = generate_yield_dataset()

# 2. Preprocessing
le_season = LabelEncoder()
le_crop = LabelEncoder()
le_district = LabelEncoder()

df['Season'] = le_season.fit_transform(df['Season'])
df['Crop'] = le_crop.fit_transform(df['Crop'])
df['District'] = le_district.fit_transform(df['District'])

features = ['Year', 'Season', 'Crop', 'District', 'Rainfall', 'Temperature', 'pH']
X = df[features]
y = df['Yield']

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# 3. Training a LIGHTWEIGHT model to avoid MemoryError
# Reducing n_estimators and max_depth significantly
print("Training Lightweight Random Forest Yield Model (Production Optimized)...")
model = RandomForestRegressor(n_estimators=30, max_depth=10, random_state=42, n_jobs=1)
model.fit(X_scaled, y)

# 4. Save Artifacts
print(f"Saving artifacts to {SAVE_DIR}...")
joblib.dump(model, SAVE_DIR / "crop_model_v2.pkl", compress=3) # Use lower compression to speed up load and reduce memory spike
joblib.dump(scaler, SAVE_DIR / "scaler.pkl")
joblib.dump(le_season, SAVE_DIR / "label_encoder.pkl")
joblib.dump(le_crop, SAVE_DIR / "crop_encoder.pkl")
joblib.dump(le_district, SAVE_DIR / "district_encoder.pkl")

print("Training Complete. Lightweight Crop Model is ready.")
