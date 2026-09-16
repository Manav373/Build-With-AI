from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey
)
from sqlalchemy.orm import relationship
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    phone = Column(String(20), nullable=False, unique=True, index=True)
    email = Column(String(255), nullable=True)
    name = Column(String(150), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="FARMER")  # ADMIN, FARMER, VENDOR
    vendor_type = Column(String(50), nullable=True)
    status = Column(String(30), nullable=False, default="active")  # active, suspended, pending
    is_verified = Column(Boolean, nullable=False, default=False)
    profile_photo = Column(String(500), nullable=True)
    clerk_user_id = Column(String(255), nullable=True)
    language_preference = Column(String(10), default="en")
    state = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_land_acres = Column(Float, default=0.0)
    primary_soil_type = Column(String(100), nullable=True)
    irrigation_type = Column(String(100), nullable=True)
    primary_crops = Column(JSON, nullable=True)
    village = Column(String(100), nullable=True)
    taluka = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(10), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    years_farming = Column(Integer, default=1)
    aadhaar_last4 = Column(String(4), nullable=True)
    kisan_credit_card = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class UnifiedOrder(Base):
    __tablename__ = "unified_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(30), nullable=False, unique=True, index=True)
    order_type = Column(String(30), nullable=False)  # CROP_PROCUREMENT, SUPPLIES, EQUIPMENT
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_name = Column(String(150), nullable=False)
    buyer_phone = Column(String(20), nullable=False)
    seller_name = Column(String(150), nullable=False)
    seller_phone = Column(String(20), nullable=False)
    reference_id = Column(Integer, nullable=True)
    item_title = Column(String(200), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(30), nullable=True)
    unit_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String(30), nullable=False, default="PENDING")  # PENDING, ACCEPTED, IN_TRANSIT, DELIVERED, CANCELLED
    payment_status = Column(String(30), nullable=False, default="HELD_IN_ESCROW")  # HELD_IN_ESCROW, RELEASED, REFUNDED
    payment_method = Column(String(50), nullable=True)
    transaction_reference = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True)
    delivery_method = Column(String(50), nullable=True)
    pickup_address = Column(Text, nullable=True)
    delivery_address = Column(Text, nullable=True)
    driver_name = Column(String(100), nullable=True)
    driver_phone = Column(String(20), nullable=True)
    vehicle_number = Column(String(30), nullable=True)
    tracking_id = Column(String(100), nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    quality_notes = Column(Text, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    complaint_code = Column(String(30), nullable=False, unique=True, index=True)
    complainant_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    complainant_role = Column(String(30), nullable=False)
    complainant_name = Column(String(150), nullable=False)
    accused_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    accused_name = Column(String(150), nullable=True)
    order_id = Column(Integer, ForeignKey("unified_orders.id"), nullable=True)
    subject = Column(String(255), nullable=False)
    category = Column(String(50), nullable=True)  # Quality, Logistics, Payment, Fraud
    description = Column(Text, nullable=False)
    evidence_urls = Column(JSON, nullable=True)
    status = Column(String(30), nullable=False, default="UNDER_INVESTIGATION")  # PENDING, UNDER_INVESTIGATION, RESOLVED, DISMISSED
    priority = Column(String(20), default="Medium")  # Low, Medium, High, Urgent
    admin_notes = Column(Text, nullable=True)
    resolution_summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    resolved_at = Column(DateTime, nullable=True)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, nullable=True)
    actor_name = Column(String(150), nullable=True)
    actor_role = Column(String(50), nullable=True)
    action = Column(String(100), nullable=False)  # VENDOR_KYC_APPROVED, USER_SUSPENDED, PRODUCT_MODERATED, etc.
    target_type = Column(String(50), nullable=False)  # Vendor, User, Product, Order, Complaint
    target_id = Column(String(100), nullable=False)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), default="127.0.0.1")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class GovernmentSchemeDb(Base):
    __tablename__ = "government_schemes_db"

    id = Column(Integer, primary_key=True, index=True)
    scheme_code = Column(String(50), nullable=False, unique=True, index=True)
    title = Column(String(255), nullable=False)
    ministry = Column(String(200), nullable=True)
    category = Column(String(100), nullable=True)
    state = Column(String(100), default="All India")
    description = Column(Text, nullable=False)
    benefits = Column(Text, nullable=False)
    eligibility = Column(Text, nullable=False)
    application_url = Column(String(500), nullable=True)
    subsidy_percentage = Column(Float, default=0.0)
    max_amount_inr = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
