"""
farmer/database/models/market.py – Mandi and Market Price ORM models
"""
from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from shared.database.connection import Base


class MarketRecord(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String(100), index=True)
    district = Column(String(100), index=True)
    market = Column(String(100), index=True)
    commodity = Column(String(100), index=True)
    variety = Column(String(100))
    arrival_date = Column(String(50))
    min_price = Column(Float)
    max_price = Column(Float)
    modal_price = Column(Float)
    
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class MarketGeocode(Base):
    __tablename__ = "market_geocodes"

    id = Column(Integer, primary_key=True, index=True)
    query_key = Column(String(255), unique=True, index=True)  # "market_district_state"
    lat = Column(Float)
    lon = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
