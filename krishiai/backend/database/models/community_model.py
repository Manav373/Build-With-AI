"""
farmer/database/models/community_model.py – Community messages ORM model
"""
from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from shared.database.connection import Base


class CommunityMessage(Base):
    __tablename__ = "community_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)  # Clerk ID
    user_name = Column(String)
    user_avatar = Column(String, nullable=True)
    content = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)
