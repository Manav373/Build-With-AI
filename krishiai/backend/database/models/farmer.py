from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, BigInteger
from database.connection.connection import Base

class FarmerLocation(Base):
    __tablename__ = "farmer_locations"

    id        = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id   = Column(String, index=True, nullable=True)
    lat       = Column(Float, nullable=False)
    lon       = Column(Float, nullable=False)
    village   = Column(String, nullable=True)
    taluka    = Column(String, nullable=True)
    district  = Column(String, nullable=True)
    city      = Column(String, nullable=True)
    state     = Column(String, nullable=True)
    pincode   = Column(String, nullable=True)
    source    = Column(String, default="web")
    timestamp = Column(DateTime, default=datetime.utcnow)

class MarketRecord(Base):
    __tablename__ = "market_prices"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    state = Column(String(100), index=True, nullable=False)
    district = Column(String(100), index=True, nullable=False)
    market = Column(String(150), index=True, nullable=False)
    commodity = Column(String(100), index=True, nullable=False)
    variety = Column(String(100), nullable=True)
    arrival_date = Column(String(50), index=True, nullable=False)
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class MarketGeocode(Base):
    __tablename__ = "market_geocodes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    market = Column(String(150), unique=True, index=True, nullable=False)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)

class CallHistory(Base):
    __tablename__ = "call_history"

    id = Column(BigInteger, primary_key=True, index=True, autoincrement=True)
    call_id = Column(String(255), unique=True, index=True, nullable=True)
    phone_number = Column(String(50), index=True, nullable=False)
    assistant_type = Column(String(50), default="kisan_voice", nullable=False)
    call_type = Column(String(50), default="inbound", nullable=False)
    language = Column(String(50), default="English", nullable=False)
    duration_seconds = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=True)
    transcript = Column(Text, nullable=True)
    recording_url = Column(String(1000), nullable=True)
    status = Column(String(50), default="completed", nullable=False)
    ended_reason = Column(String(100), nullable=True)
    cost = Column(Float, default=0.0, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class CommunityMessage(Base):
    __tablename__ = "community_messages"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), index=True, nullable=True)
    user_name = Column(String(255), default="Farmer", nullable=False)
    user_avatar = Column(String(1000), nullable=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
