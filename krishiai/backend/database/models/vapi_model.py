"""
farmer/database/models/vapi_model.py – Call history ORM model for voice assistant
"""
from sqlalchemy import Column, String, Integer, DateTime, Text, Float
from shared.database.connection import Base
from datetime import datetime


class CallHistory(Base):
    __tablename__ = "call_history"

    id = Column(Integer, primary_key=True, index=True)
    call_id = Column(String, unique=True, index=True)
    phone_number = Column(String, index=True)
    transcript = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    duration = Column(Float, default=0.0)
    timestamp = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="completed")
    recording_url = Column(String, nullable=True)
