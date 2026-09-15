"""
farmer/database/models/location.py – FarmerLocation ORM model
"""
from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime
from shared.database.connection import Base


class FarmerLocation(Base):
    __tablename__ = "farmer_locations"

    id        = Column(Integer, primary_key=True, index=True)
    user_id   = Column(String, index=True, nullable=True)  # Clerk User ID
    lat       = Column(Float, nullable=False)
    lon       = Column(Float, nullable=False)
    village   = Column(String, nullable=True)
    taluka    = Column(String, nullable=True)              # Tehsil/Block
    district  = Column(String, nullable=True)
    city      = Column(String, default="Unknown")          # City/Town name
    state     = Column(String, default="Unknown")
    pincode   = Column(String, nullable=True)
    source    = Column(String, default="web")              # "web" | "whatsapp"
    timestamp = Column(DateTime, default=datetime.utcnow)
