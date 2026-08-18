"""
Vendor Models — KrishiAI Multi-Vendor Marketplace
---------------------------------------------------
Defines the vendor ecosystem: Vendor profiles, documents,
buying requirements, products, orders, and reviews.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, DateTime,
    ForeignKey, Enum as SAEnum, JSON
)
from sqlalchemy.orm import relationship
from app.db.database import Base
import enum


# ─── Enums ───────────────────────────────────────────────────

class VendorType(str, enum.Enum):
    PROCUREMENT = "procurement"
    SELLER = "seller"
    HYBRID = "hybrid"


class VendorStatus(str, enum.Enum):
    PENDING = "pending"
    UNDER_REVIEW = "under_review"
    VERIFIED = "verified"
    SUSPENDED = "suspended"
    REJECTED = "rejected"


class DocumentStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class RequirementStatus(str, enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    FULFILLED = "fulfilled"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class ProductStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    PUBLISHED = "published"
    OUT_OF_STOCK = "out_of_stock"
    PAUSED = "paused"
    DISCONTINUED = "discontinued"
    REJECTED = "rejected"


class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    PACKED = "packed"
    DISPATCHED = "dispatched"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"
    RETURNED = "returned"
    REFUNDED = "refunded"


class ProcurementOrderStatus(str, enum.Enum):
    CONFIRMED = "confirmed"
    PICKUP_SCHEDULED = "pickup_scheduled"
    PICKUP_IN_PROGRESS = "pickup_in_progress"
    AT_WAREHOUSE = "at_warehouse"
    UNDER_INSPECTION = "under_inspection"
    INSPECTION_PASSED = "inspection_passed"
    INSPECTION_ADJUSTED = "inspection_adjusted"
    PAYMENT_PROCESSING = "payment_processing"
    COMPLETED = "completed"
    DISPUTED = "disputed"
    CANCELLED = "cancelled"


class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    UNDER_NEGOTIATION = "under_negotiation"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"


# ─── Vendor Profile ─────────────────────────────────────────

class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    clerk_user_id = Column(String(255), unique=True, index=True, nullable=True)
    vendor_type = Column(SAEnum(VendorType), nullable=False)
    status = Column(SAEnum(VendorStatus), default=VendorStatus.PENDING)

    # Business Identity
    business_name = Column(String(200), nullable=False)
    owner_name = Column(String(150), nullable=False)
    tagline = Column(String(300), nullable=True)
    business_description = Column(Text, nullable=True)
    business_category = Column(String(100), nullable=True)
    year_established = Column(String(4), nullable=True)
    number_of_employees = Column(String(50), nullable=True)
    gst_number = Column(String(15), unique=True, nullable=True)

    # Identity & Business Document Verification
    id_proof_type = Column(String(50), nullable=True)  # aadhaar, pan, voter_id, driving_license
    id_proof_number = Column(String(50), nullable=True)
    id_proof_file = Column(String(500), nullable=True)
    trade_license_type = Column(String(50), nullable=True)  # apmc, seeds_fertilizer, shop_act, fssai, gst_cert
    trade_license_number = Column(String(50), nullable=True)
    trade_license_file = Column(String(500), nullable=True)

    # Contact
    phone = Column(String(15), nullable=False)
    secondary_phone = Column(String(15), nullable=True)
    whatsapp_number = Column(String(15), nullable=True)
    email = Column(String(200), nullable=True)
    website = Column(String(300), nullable=True)

    # Address
    street_address = Column(String(300), nullable=True)
    landmark = Column(String(200), nullable=True)
    village_city = Column(String(100), nullable=True)
    taluka = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    pincode = Column(String(6), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Images
    profile_image = Column(String(500), nullable=True)
    cover_image = Column(String(500), nullable=True)

    # Service Info
    service_areas = Column(JSON, nullable=True)  # ["Pune", "Nashik", ...]
    languages_spoken = Column(JSON, nullable=True)  # ["Hindi", "Marathi"]

    # Procurement-specific fields
    crops_of_interest = Column(JSON, nullable=True)  # ["Wheat", "Cotton"]
    procurement_capacity_mt = Column(Float, nullable=True)
    warehouse_locations = Column(JSON, nullable=True)

    # Seller-specific fields
    product_categories = Column(JSON, nullable=True)  # ["Seeds", "Fertilizers"]
    store_open_time = Column(String(10), nullable=True)
    store_close_time = Column(String(10), nullable=True)
    weekly_holidays = Column(JSON, nullable=True)  # ["Sunday"]
    delivery_available = Column(Boolean, default=False)
    delivery_radius_km = Column(Integer, nullable=True)

    # Stats (auto-updated)
    total_products = Column(Integer, default=0)
    total_orders = Column(Integer, default=0)
    total_procurement_orders = Column(Integer, default=0)
    farmers_served = Column(Integer, default=0)
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)

    # Verification & Trust
    is_verified = Column(Boolean, default=False)
    is_premium = Column(Boolean, default=False)
    is_trusted = Column(Boolean, default=False)
    trust_score = Column(Integer, default=0)
    verified_at = Column(DateTime, nullable=True)
    admin_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Bank Details
    bank_account_name = Column(String(200), nullable=True)
    bank_account_number = Column(String(20), nullable=True)
    bank_ifsc_code = Column(String(11), nullable=True)
    bank_name = Column(String(100), nullable=True)

    # Policies (seller)
    return_policy = Column(Text, nullable=True)
    refund_policy = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    documents = relationship("VendorDocument", back_populates="vendor", cascade="all, delete-orphan")
    products = relationship("Product", back_populates="vendor", cascade="all, delete-orphan")
    buying_requirements = relationship("BuyingRequirement", back_populates="vendor", cascade="all, delete-orphan")


# ─── Vendor Documents ───────────────────────────────────────

class VendorDocument(Base):
    __tablename__ = "vendor_documents"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    document_type = Column(String(50), nullable=False)  # aadhaar, pan, gst, trade_license, etc.
    document_name = Column(String(200), nullable=False)
    file_url = Column(String(500), nullable=False)
    status = Column(SAEnum(DocumentStatus), default=DocumentStatus.PENDING)
    admin_notes = Column(Text, nullable=True)
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    reviewed_at = Column(DateTime, nullable=True)

    vendor = relationship("Vendor", back_populates="documents")


# ─── Products (Seller / Hybrid) ─────────────────────────────

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    status = Column(SAEnum(ProductStatus), default=ProductStatus.DRAFT)

    # Product Info
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False)
    sub_category = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    sku = Column(String(50), nullable=True)

    # Pricing
    mrp = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    unit = Column(String(30), nullable=False)  # "per kg", "per packet", etc.
    min_order_qty = Column(Integer, default=1)

    # Stock
    stock_quantity = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=5)

    # Details
    key_features = Column(JSON, nullable=True)  # ["High germination", "Disease resistant"]
    suitable_crops = Column(JSON, nullable=True)  # ["Wheat", "Rice"]
    application_season = Column(String(50), nullable=True)  # "Kharif", "Rabi", "All-Season"
    weight = Column(String(50), nullable=True)
    dimensions = Column(String(100), nullable=True)
    manufacturer = Column(String(150), nullable=True)
    expiry_date = Column(DateTime, nullable=True)

    # Images (up to 6)
    images = Column(JSON, nullable=True)  # ["/uploads/prod1.jpg", ...]

    # Delivery
    delivery_options = Column(String(50), default="both")  # "home_delivery", "store_pickup", "both"
    return_eligible = Column(Boolean, default=True)

    # Stats
    rating = Column(Float, default=0.0)
    total_reviews = Column(Integer, default=0)
    total_sold = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    is_best_seller = Column(Boolean, default=False)

    # Admin
    admin_notes = Column(Text, nullable=True)
    rejection_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)

    vendor = relationship("Vendor", back_populates="products")


# ─── Buying Requirements (Procurement / Hybrid) ─────────────

class BuyingRequirement(Base):
    __tablename__ = "buying_requirements"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    requirement_code = Column(String(20), unique=True, index=True)  # "BR-2026-07-0042"
    status = Column(SAEnum(RequirementStatus), default=RequirementStatus.DRAFT)

    # Crop Details
    crop_name = Column(String(100), nullable=False)
    crop_variety = Column(String(100), nullable=True)
    quantity_required = Column(Float, nullable=False)
    quantity_unit = Column(String(20), default="quintal")  # "quintal", "tonne", "kg"
    quality_grade = Column(String(50), nullable=True)
    max_moisture_percent = Column(Float, nullable=True)

    # Pricing
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    price_unit = Column(String(30), default="per quintal")

    # Location
    procurement_location = Column(String(200), nullable=True)
    pickup_district = Column(String(100), nullable=True)
    pickup_state = Column(String(100), nullable=True)
    pickup_radius_km = Column(Integer, default=50)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    # Validity
    valid_from = Column(DateTime, nullable=False)
    valid_to = Column(DateTime, nullable=False)

    # Terms
    payment_terms = Column(String(100), default="on_pickup")
    transport_provided = Column(Boolean, default=False)
    special_instructions = Column(Text, nullable=True)

    # Stats
    total_applications = Column(Integer, default=0)
    quantity_fulfilled = Column(Float, default=0)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    vendor = relationship("Vendor", back_populates="buying_requirements")
    applications = relationship("FarmerApplication", back_populates="requirement", cascade="all, delete-orphan")


# ─── Farmer Applications (for Buying Requirements) ──────────

class FarmerApplication(Base):
    __tablename__ = "farmer_applications"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("buying_requirements.id"), nullable=False)
    farmer_user_id = Column(String(255), nullable=False)  # Clerk user ID of farmer
    status = Column(SAEnum(ApplicationStatus), default=ApplicationStatus.PENDING)

    # Offer Details
    farmer_name = Column(String(150), nullable=True)
    farmer_phone = Column(String(15), nullable=True)
    farmer_location = Column(String(200), nullable=True)
    offered_quantity = Column(Float, nullable=False)
    offered_price = Column(Float, nullable=False)
    crop_quality_self_assessment = Column(String(50), nullable=True)
    crop_images = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)

    # Negotiation
    counter_offer_price = Column(Float, nullable=True)
    negotiation_rounds = Column(Integer, default=0)
    final_agreed_price = Column(Float, nullable=True)

    # Timestamps
    applied_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    responded_at = Column(DateTime, nullable=True)

    requirement = relationship("BuyingRequirement", back_populates="applications")


# ─── Customer Orders (Product Sales) ────────────────────────

class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(20), unique=True, index=True)  # "ORD-2026-07-1234"
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    customer_user_id = Column(String(255), nullable=False)
    status = Column(SAEnum(OrderStatus), default=OrderStatus.PENDING)

    # Customer Info
    customer_name = Column(String(150), nullable=True)
    customer_phone = Column(String(15), nullable=True)
    delivery_address = Column(Text, nullable=True)
    delivery_method = Column(String(30), default="home_delivery")

    # Order Details
    items = Column(JSON, nullable=False)  # [{product_id, name, qty, price, total}]
    subtotal = Column(Float, nullable=False)
    delivery_charges = Column(Float, default=0)
    discount = Column(Float, default=0)
    total_amount = Column(Float, nullable=False)

    # Payment
    payment_method = Column(String(30), nullable=True)
    payment_status = Column(String(20), default="pending")
    payment_id = Column(String(100), nullable=True)

    # Tracking
    packed_at = Column(DateTime, nullable=True)
    dispatched_at = Column(DateTime, nullable=True)
    delivered_at = Column(DateTime, nullable=True)
    tracking_id = Column(String(100), nullable=True)
    cancellation_reason = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─── Procurement Orders ─────────────────────────────────────

class ProcurementOrder(Base):
    __tablename__ = "procurement_orders"

    id = Column(Integer, primary_key=True, index=True)
    order_code = Column(String(20), unique=True, index=True)  # "PO-2026-07-0099"
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    application_id = Column(Integer, ForeignKey("farmer_applications.id"), nullable=False)
    requirement_id = Column(Integer, ForeignKey("buying_requirements.id"), nullable=False)
    farmer_user_id = Column(String(255), nullable=False)
    status = Column(SAEnum(ProcurementOrderStatus), default=ProcurementOrderStatus.CONFIRMED)

    # Crop Details
    crop_name = Column(String(100), nullable=False)
    agreed_quantity = Column(Float, nullable=False)
    quantity_unit = Column(String(20), default="quintal")
    agreed_price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)

    # Pickup
    pickup_date = Column(DateTime, nullable=True)
    pickup_location = Column(String(300), nullable=True)
    transport_type = Column(String(50), nullable=True)
    vehicle_number = Column(String(20), nullable=True)

    # Warehouse Inspection
    warehouse_name = Column(String(200), nullable=True)
    actual_weight = Column(Float, nullable=True)
    quality_grade_received = Column(String(50), nullable=True)
    moisture_percent = Column(Float, nullable=True)
    inspection_notes = Column(Text, nullable=True)
    adjusted_price = Column(Float, nullable=True)
    final_amount = Column(Float, nullable=True)

    # Payment
    payment_method = Column(String(30), nullable=True)
    payment_status = Column(String(20), default="pending")
    payment_id = Column(String(100), nullable=True)
    paid_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─── Reviews ────────────────────────────────────────────────

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    reviewer_user_id = Column(String(255), nullable=False)
    reviewer_name = Column(String(150), nullable=True)
    reviewer_avatar = Column(String(500), nullable=True)

    # Target: either a vendor or a product
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    order_id = Column(Integer, nullable=True)
    review_type = Column(String(20), nullable=False)  # "vendor", "product", "procurement"

    # Rating
    overall_rating = Column(Float, nullable=False)
    criteria_ratings = Column(JSON, nullable=True)  # {"price_fairness": 5, "delivery_speed": 4}
    title = Column(String(200), nullable=True)
    content = Column(Text, nullable=True)
    images = Column(JSON, nullable=True)

    # Moderation
    is_verified_purchase = Column(Boolean, default=False)
    is_visible = Column(Boolean, default=True)
    helpful_count = Column(Integer, default=0)

    # Vendor Response
    vendor_reply = Column(Text, nullable=True)
    vendor_replied_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


# ─── Notifications ──────────────────────────────────────────

class VendorNotification(Base):
    __tablename__ = "vendor_notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    vendor_id = Column(Integer, nullable=True)

    notification_type = Column(String(50), nullable=False)  # "new_order", "new_offer", etc.
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, nullable=True)  # Additional metadata
    is_read = Column(Boolean, default=False)
    channel = Column(String(20), default="in_app")  # "in_app", "push", "whatsapp", "sms"

    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Contract Farming & Bulk RFQ Tenders ─────────────────────

class ContractFarmingAgreement(Base):
    __tablename__ = "contract_farming_agreements"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    contract_code = Column(String(30), unique=True, index=True)
    title = Column(String(200), nullable=False)
    crop_name = Column(String(100), nullable=False)
    target_quantity_mt = Column(Float, nullable=False)
    minimum_land_acres = Column(Float, default=1.0)
    guaranteed_msp_per_quintal = Column(Float, nullable=False)
    bonus_per_quintal_grade_a = Column(Float, default=0.0)
    advance_payment_percent = Column(Float, default=10.0)
    input_support_provided = Column(Boolean, default=True)  # Seeds/Tech support by buyer
    duration_months = Column(Integer, default=6)
    start_date = Column(DateTime, nullable=False)
    status = Column(String(30), default="active")  # active, completed, cancelled
    total_enrolled_farmers = Column(Integer, default=0)
    terms_and_conditions = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class BulkRFQ(Base):
    __tablename__ = "bulk_rfqs"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    rfq_code = Column(String(30), unique=True, index=True)
    crop_name = Column(String(100), nullable=False)
    required_quantity_mt = Column(Float, nullable=False)
    fulfilled_quantity_mt = Column(Float, default=0.0)
    target_price_per_quintal = Column(Float, nullable=False)
    allowed_partial_bids = Column(Boolean, default=True)
    minimum_bid_quantity_mt = Column(Float, default=10.0)
    fpo_only = Column(Boolean, default=False)
    delivery_deadline = Column(DateTime, nullable=False)
    warehouse_destination = Column(String(200), nullable=False)
    status = Column(String(30), default="open")  # open, partially_fulfilled, closed
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Logistics & Fleet Management ───────────────────────────

class LogisticsShipment(Base):
    __tablename__ = "logistics_shipments"

    id = Column(Integer, primary_key=True, index=True)
    shipment_code = Column(String(30), unique=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    order_id = Column(Integer, nullable=True)
    procurement_order_id = Column(Integer, nullable=True)
    driver_name = Column(String(150), nullable=True)
    driver_phone = Column(String(15), nullable=True)
    vehicle_number = Column(String(30), nullable=False)
    vehicle_type = Column(String(50), default="Tempo 407")  # Tractor, E-Rickshaw, Pickup, Truck
    pickup_address = Column(Text, nullable=False)
    delivery_address = Column(Text, nullable=False)
    total_distance_km = Column(Float, default=0.0)
    estimated_arrival = Column(DateTime, nullable=True)
    status = Column(String(30), default="assigned")  # assigned, in_transit, arrived, completed
    eway_bill_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── AI Quality Inspection ──────────────────────────────────

class AIQualityInspection(Base):
    __tablename__ = "ai_quality_inspections"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    procurement_order_id = Column(Integer, nullable=True)
    crop_name = Column(String(100), nullable=False)
    sample_image_url = Column(String(500), nullable=True)
    detected_moisture_percent = Column(Float, nullable=False)
    foreign_matter_percent = Column(Float, default=0.0)
    grain_defect_score = Column(Float, default=0.0)  # 0 to 10 scale
    calculated_grade = Column(String(20), default="Grade A")
    recommended_price_adjustment_percent = Column(Float, default=0.0)
    ai_confidence = Column(Float, default=95.0)
    created_at = Column(DateTime, default=datetime.utcnow)


# ─── Vendor Payouts & Wallet Ledger ─────────────────────────

class VendorPayout(Base):
    __tablename__ = "vendor_payouts"

    id = Column(Integer, primary_key=True, index=True)
    payout_code = Column(String(30), unique=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id"), nullable=False)
    amount = Column(Float, nullable=False)
    payout_type = Column(String(30), default="sales_settlement")  # sales_settlement, procurement_advance
    status = Column(String(30), default="processed")  # pending, processing, processed, failed
    bank_account_last4 = Column(String(4), nullable=True)
    utr_number = Column(String(50), nullable=True)
    processed_at = Column(DateTime, default=datetime.utcnow)

