"""
DATABASE/models/admin.py – Admin & Governance ORM Models
-----------------------------------------------------------
Defines admin governance entities: audit logs, platform moderation,
complaints, and vendor verification records.
"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, JSON, Boolean
try:
    from DATABASE.connection.connection import Base
except ImportError:
    try:
        from database.connection.connection import Base
    except ImportError:
        from app.db.database import Base


class AdminAuditLog(Base):
    __tablename__ = "admin_audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False) # 'VERIFY_VENDOR', 'MODERATE_PRODUCT', etc.
    target_type = Column(String, nullable=False) # 'vendor', 'product', 'user', 'order'
    target_id = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complainant_id = Column(String, index=True, nullable=False)
    complainant_role = Column(String, nullable=False) # 'FARMER' | 'VENDOR'
    respondent_id = Column(String, nullable=True)
    related_order_id = Column(String, nullable=True)
    category = Column(String, nullable=False) # 'PAYMENT', 'QUALITY', 'DELIVERY', 'FRAUD'
    description = Column(Text, nullable=False)
    status = Column(String, default="PENDING") # 'PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED'
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class PlatformSetting(Base):
    __tablename__ = "platform_settings"

    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=False)
    description = Column(String, nullable=True)
    updated_by = Column(String, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
