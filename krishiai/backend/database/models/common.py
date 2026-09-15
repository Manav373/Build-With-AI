from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, JSON
from database.connection.connection import Base

class UserProfile(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(150), nullable=True)
    phone = Column(String(20), nullable=True, index=True)
    email = Column(String(150), nullable=True)
    role = Column(String(50), default="farmer")  # "farmer" | "vendor" | "admin"
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SystemNotification(Base):
    __tablename__ = "system_notifications"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    recipient_id = Column(String(255), index=True, nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
