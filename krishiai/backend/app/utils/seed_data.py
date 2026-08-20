import logging
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.location import FarmerLocation

logger = logging.getLogger("KrishiMCP.Seed")

# Realistic locations for Indian agricultural hubs
LOCATIONS = [
    # Punjab / Haryana (Wheat Belt)
    {"lat": 30.733, "lon": 76.779, "city": "Chandigarh", "state": "Punjab"},
    {"lat": 31.634, "lon": 74.872, "city": "Amritsar", "state": "Punjab"},
    {"lat": 29.059, "lon": 76.085, "city": "Bhiwani", "state": "Haryana"},
    {"lat": 29.945, "lon": 76.817, "city": "Kurukshetra", "state": "Haryana"},
    
    # Maharashtra (Onion / Cotton / Grapes)
    {"lat": 18.520, "lon": 73.856, "city": "Pune", "state": "Maharashtra"},
    {"lat": 19.997, "lon": 73.789, "city": "Nashik", "state": "Maharashtra"},
    {"lat": 21.145, "lon": 79.088, "city": "Nagpur", "state": "Maharashtra"},
    {"lat": 20.937, "lon": 77.779, "city": "Amravati", "state": "Maharashtra"},
    
    # Uttar Pradesh (Sugarcane / Wheat)
    {"lat": 26.846, "lon": 80.946, "city": "Lucknow", "state": "Uttar Pradesh"},
    {"lat": 25.317, "lon": 82.973, "city": "Varanasi", "state": "Uttar Pradesh"},
    {"lat": 28.628, "lon": 77.306, "city": "Noida", "state": "Uttar Pradesh"},
    {"lat": 27.176, "lon": 78.008, "city": "Agra", "state": "Uttar Pradesh"},
    
    # Gujarat (Cotton / Groundnut)
    {"lat": 23.022, "lon": 72.571, "city": "Ahmedabad", "state": "Gujarat"},
    {"lat": 22.307, "lon": 70.802, "city": "Rajkot", "state": "Gujarat"},
    {"lat": 21.170, "lon": 72.831, "city": "Surat", "state": "Gujarat"},
    
    # Karnataka (Coffee / Silk / Maize)
    {"lat": 12.971, "lon": 77.594, "city": "Bengaluru", "state": "Karnataka"},
    {"lat": 15.364, "lon": 75.124, "city": "Hubli", "state": "Karnataka"},
    {"lat": 12.295, "lon": 76.639, "city": "Mysuru", "state": "Karnataka"},
    
    # Andhra Pradesh / Telangana (Rice / Chillies)
    {"lat": 17.385, "lon": 78.486, "city": "Hyderabad", "state": "Telangana"},
    {"lat": 16.506, "lon": 80.648, "city": "Vijayawada", "state": "Andhra Pradesh"},
    {"lat": 17.686, "lon": 83.218, "city": "Visakhapatnam", "state": "Andhra Pradesh"},
]

async def seed_farmer_locations(db: Session, count: int = 150):
    """
    Seeds the database with realistic farmer location data if it's currently empty.
    Useful for demonstration and populating the analytics dashboard.
    """
    existing_count = db.query(FarmerLocation).count()
    if existing_count > 10:
        logger.info(f"[Seed] Dashboard already has {existing_count} records. Skipping seeding.")
        return

    logger.info(f"[Seed] Populating Intelligence Dashboard with {count} sample records...")
    
    records = []
    base_time = datetime.utcnow()
    
    for i in range(count):
        # Pick a base city
        base = random.choice(LOCATIONS)
        
        # Add slight jitter to markers so they don't overlap perfectly
        lat_jitter = random.uniform(-0.15, 0.15)
        lon_jitter = random.uniform(-0.15, 0.15)
        
        # Spread activity over the last 7 days
        days_ago = random.randint(0, 6)
        hours_ago = random.randint(0, 23)
        timestamp = base_time - timedelta(days=days_ago, hours=hours_ago)
        
        source = random.choices(["web", "whatsapp", "voice"], weights=[40, 50, 10])[0]
        
        record = FarmerLocation(
            lat=base["lat"] + lat_jitter,
            lon=base["lon"] + lon_jitter,
            city=base["city"],
            state=base["state"],
            source=source,
            timestamp=timestamp
        )
        records.append(record)
    
    db.add_all(records)
    db.commit()
    logger.info(f"[Seed] Successfully populated {count} farmer records.")
