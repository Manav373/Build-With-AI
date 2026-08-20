# KrishiAI ML Model Storage

This directory contains the machine learning models and encoders used for crop yield prediction.

## Model Versions

| File | Size | Purpose | Strategy |
| :--- | :--- | :--- | :--- |
| `crop_model.pkl` | 1.4 GB | **Research/Training** | 300 Trees, Raw Pickle, Uncompressed. Keep local only. |
| `crop_model_v2.pkl` | 1.6 MB | **Production/Deployment** | 50 Trees, Depth=10, Joblib Compressed. Fits in 512MB RAM. |

## Training Workflows

We have separated the training logic to support both "High Accuracy" local research and "Memory-Safe" production deployment.

### 1. Local Training (`train_model.py`)
- **Use for**: Research, accuracy testing, and local development.
- **Specs**: 300 estimators, no depth limit.
- **Output**: `crop_model.pkl` (~1.4 GB).
- **Run**: `py -m app.services.train_model`

### 2. Render Deployment (`train_model_lite.py`)
- **Use for**: Production deployment on Render (512MB RAM limit).
- **Specs**: 50 estimators, `max_depth=10`.
- **Output**: `crop_model_v2.pkl` (~1.6 MB).
- **Run**: `py -m app.services.train_model_lite`

## Other Artefacts
- `crop_encoder.pkl`: Label encoder for crop names.
- `district_encoder.pkl`: Label encoder for district names.
- `label_encoder.pkl`: Decoder for seasonal identifiers.
- `scaler.pkl`: StandardScaler for normalization of features (Rainfall, Temp, pH).
