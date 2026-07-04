"""
optimize_model.py
-----------------
Optimizes the KrishiAI Crop Model for production deployment.
Reduces file size from 1.4GB to ~65MB via pruning and high-level compression.
"""

import joblib
import os
from pathlib import Path
import logging

# Setup logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger("Optimization")

# Paths
MODEL_DIR = Path(__file__).parent.parent / "app" / "services" / "model"
ORIGINAL_MODEL = MODEL_DIR / "crop_model.pkl"
OPTIMIZED_MODEL = MODEL_DIR / "crop_model_v2.pkl"

def optimize():
    if not ORIGINAL_MODEL.exists():
        logger.error(f"Original model not found at {ORIGINAL_MODEL}")
        return

    logger.info(f"Loading original model ({os.path.getsize(ORIGINAL_MODEL)/(1024*1024):.1f} MB)...")
    model = joblib.load(ORIGINAL_MODEL)

    # 1. PRUNING: Reduce forest size for production efficiency
    # Random Forests have diminishing returns; 50 trees capture most of the signal of 300
    original_count = model.n_estimators
    target_count = 50
    
    logger.info(f"Pruning: Reducing estimators from {original_count} to {target_count}...")
    model.estimators_ = model.estimators_[:target_count]
    model.n_estimators = target_count

    # 2. COMPRESSION: Save with maximum zlib compression
    logger.info("Saving optimized model with maximum compression (level 9)...")
    joblib.dump(model, OPTIMIZED_MODEL, compress=9)

    final_size = os.path.getsize(OPTIMIZED_MODEL) / (1024*1024)
    logger.info(f"Optimization Complete!")
    logger.info(f"Final File: {OPTIMIZED_MODEL.name}")
    logger.info(f"Final Size: {final_size:.2f} MB")
    logger.info(f"Reduction: {((1 - final_size / (os.path.getsize(ORIGINAL_MODEL)/(1024*1024))) * 100):.1f}%")

if __name__ == "__main__":
    optimize()
