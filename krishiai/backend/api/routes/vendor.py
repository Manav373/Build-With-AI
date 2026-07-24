"""
Vendor API Routes — KrishiAI Multi-Vendor Marketplace
------------------------------------------------------
Full CRUD for vendors, products, buying requirements,
farmer applications, orders, and admin verification.
"""
import logging
import random
import string
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func

from app.db.database import get_db
from app.models.vendor import (
    Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
    CustomerOrder, ProcurementOrder, Review, VendorNotification,
    VendorType, VendorStatus, DocumentStatus, RequirementStatus,
    ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
)
from app.core.auth import get_current_user

logger = logging.getLogger("VendorAPI")
router = APIRouter(prefix="/api/vendor", tags=["Vendor Marketplace"])


# ─── Utility ─────────────────────────────────────────────────

def generate_code(prefix: str, length: int = 6) -> str:
    """Generate a unique code like BR-2026-07-004218"""
    now = datetime.utcnow()
    rand = ''.join(random.choices(string.digits, k=length))
    return f"{prefix}-{now.year}-{now.month:02d}-{rand}"


# ─── Pydantic Schemas ────────────────────────────────────────

class VendorCreateRequest(BaseModel):
    vendor_type: str = Field(..., description="procurement, seller, or hybrid")
    business_name: str = Field(..., min_length=3, max_length=200)
    owner_name: str = Field(..., min_length=2, max_length=150)
    phone: str = Field(..., min_length=10, max_length=15)
    email: Optional[str] = None
    tagline: Optional[str] = None
    business_description: Optional[str] = None
    business_category: Optional[str] = None
    year_established: Optional[str] = None
    number_of_employees: Optional[str] = None
    gst_number: Optional[str] = None
    secondary_phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    website: Optional[str] = None
    street_address: Optional[str] = None
    landmark: Optional[str] = None
    village_city: Optional[str] = None
    taluka: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    service_areas: Optional[list] = None
    languages_spoken: Optional[list] = None
    # Procurement-specific
    crops_of_interest: Optional[list] = None
    procurement_capacity_mt: Optional[float] = None
    warehouse_locations: Optional[list] = None
    # Seller-specific
    product_categories: Optional[list] = None
    store_open_time: Optional[str] = None
    store_close_time: Optional[str] = None
    weekly_holidays: Optional[list] = None
    delivery_available: Optional[bool] = False
    delivery_radius_km: Optional[int] = None
    # Identity & Business Proof
    id_proof_type: Optional[str] = Field(None, description="aadhaar, pan, voter_id, driving_license")
    id_proof_number: Optional[str] = Field(None, description="Identity card / document number")
    id_proof_file: Optional[str] = Field(None, description="Identity card file URL / base64")
    trade_license_type: Optional[str] = Field(None, description="apmc, seeds_fertilizer, shop_act, fssai, gst_cert")
    trade_license_number: Optional[str] = Field(None, description="Trade / Business license number")
    trade_license_file: Optional[str] = Field(None, description="Trade / Business license document URL")
    # Bank
    bank_account_name: Optional[str] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    # Policies
    return_policy: Optional[str] = None
    refund_policy: Optional[str] = None


class VendorUpdateRequest(BaseModel):
    business_name: Optional[str] = None
    owner_name: Optional[str] = None
    tagline: Optional[str] = None
    business_description: Optional[str] = None
    business_category: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    street_address: Optional[str] = None
    village_city: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None
    cover_image: Optional[str] = None
    service_areas: Optional[list] = None
    languages_spoken: Optional[list] = None
    crops_of_interest: Optional[list] = None
    procurement_capacity_mt: Optional[float] = None
    product_categories: Optional[list] = None
    store_open_time: Optional[str] = None
    store_close_time: Optional[str] = None
    delivery_available: Optional[bool] = None
    delivery_radius_km: Optional[int] = None
    return_policy: Optional[str] = None
    refund_policy: Optional[str] = None


class ProductCreateRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    category: str
    sub_category: Optional[str] = None
    brand: Optional[str] = None
    sku: Optional[str] = None
    mrp: float = Field(..., gt=0)
    selling_price: float = Field(..., gt=0)
    unit: str = "per packet"
    min_order_qty: int = 1
    stock_quantity: int = 0
    key_features: Optional[list] = None
    suitable_crops: Optional[list] = None
    application_season: Optional[str] = None
    weight: Optional[str] = None
    manufacturer: Optional[str] = None
    images: Optional[list] = None
    delivery_options: str = "both"
    return_eligible: bool = True


class BuyingRequirementCreate(BaseModel):
    crop_name: str = Field(..., min_length=2)
    crop_variety: Optional[str] = None
    quantity_required: float = Field(..., gt=0)
    quantity_unit: str = "quintal"
    quality_grade: Optional[str] = None
    max_moisture_percent: Optional[float] = None
    min_price: float = Field(..., gt=0)
    max_price: float = Field(..., gt=0)
    price_unit: str = "per quintal"
    procurement_location: Optional[str] = None
    pickup_district: Optional[str] = None
    pickup_state: Optional[str] = None
    pickup_radius_km: int = 50
    valid_from: str  # ISO date string
    valid_to: str
    payment_terms: str = "on_pickup"
    transport_provided: bool = False
    special_instructions: Optional[str] = None


class FarmerApplicationCreate(BaseModel):
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    farmer_location: Optional[str] = None
    offered_quantity: float = Field(..., gt=0)
    offered_price: float = Field(..., gt=0)
    crop_quality_self_assessment: Optional[str] = None
    crop_images: Optional[list] = None
    notes: Optional[str] = None


class AdminVerifyRequest(BaseModel):
    action: str = Field(..., description="approve, reject, or request_info")
    notes: Optional[str] = None
    rejection_reason: Optional[str] = None


# ─── Helper ──────────────────────────────────────────────────

def vendor_to_dict(v: Vendor) -> dict:
    """Convert a Vendor ORM object to a JSON-serializable dict."""
    return {
        "id": v.id,
        "clerk_user_id": v.clerk_user_id,
        "vendor_type": v.vendor_type.value if v.vendor_type else None,
        "status": v.status.value if v.status else None,
        "business_name": v.business_name,
        "owner_name": v.owner_name,
        "tagline": v.tagline,
        "business_description": v.business_description,
        "business_category": v.business_category,
        "year_established": v.year_established,
        "number_of_employees": getattr(v, "number_of_employees", None),
        "gst_number": v.gst_number,
        "id_proof_type": v.id_proof_type,
        "id_proof_number": v.id_proof_number,
        "id_proof_file": v.id_proof_file,
        "trade_license_type": v.trade_license_type,
        "trade_license_number": v.trade_license_number,
        "trade_license_file": v.trade_license_file,
        "phone": v.phone,
        "secondary_phone": v.secondary_phone,
        "whatsapp_number": v.whatsapp_number,
        "email": v.email,
        "website": v.website,
        "street_address": v.street_address,
        "landmark": v.landmark,
        "village_city": v.village_city,
        "taluka": v.taluka,
        "district": v.district,
        "state": v.state,
        "pincode": v.pincode,
        "latitude": v.latitude,
        "longitude": v.longitude,
        "profile_image": v.profile_image,
        "cover_image": v.cover_image,
        "service_areas": v.service_areas,
        "languages_spoken": v.languages_spoken,
        "crops_of_interest": v.crops_of_interest,
        "procurement_capacity_mt": v.procurement_capacity_mt,
        "warehouse_locations": v.warehouse_locations,
        "product_categories": v.product_categories,
        "store_open_time": v.store_open_time,
        "store_close_time": v.store_close_time,
        "weekly_holidays": v.weekly_holidays,
        "delivery_available": v.delivery_available,
        "delivery_radius_km": v.delivery_radius_km,
        "total_products": v.total_products,
        "total_orders": v.total_orders,
        "total_procurement_orders": v.total_procurement_orders,
        "farmers_served": v.farmers_served,
        "rating": v.rating,
        "total_reviews": v.total_reviews,
        "is_verified": v.is_verified,
        "is_premium": v.is_premium,
        "is_trusted": v.is_trusted,
        "trust_score": v.trust_score,
        "return_policy": v.return_policy,
        "refund_policy": v.refund_policy,
        "created_at": v.created_at.isoformat() if v.created_at else None,
    }


def product_to_dict(p: Product) -> dict:
    return {
        "id": p.id,
        "vendor_id": p.vendor_id,
        "status": p.status.value if p.status else None,
        "name": p.name,
        "description": p.description,
        "category": p.category,
        "sub_category": p.sub_category,
        "brand": p.brand,
        "sku": p.sku,
        "mrp": p.mrp,
        "selling_price": p.selling_price,
        "unit": p.unit,
        "min_order_qty": p.min_order_qty,
        "stock_quantity": p.stock_quantity,
        "low_stock_threshold": p.low_stock_threshold,
        "key_features": p.key_features,
        "suitable_crops": p.suitable_crops,
        "application_season": p.application_season,
        "weight": p.weight,
        "manufacturer": p.manufacturer,
        "images": p.images,
        "delivery_options": p.delivery_options,
        "return_eligible": p.return_eligible,
        "rating": p.rating,
        "total_reviews": p.total_reviews,
        "total_sold": p.total_sold,
        "is_featured": p.is_featured,
        "is_best_seller": p.is_best_seller,
        "created_at": p.created_at.isoformat() if p.created_at else None,
        "published_at": p.published_at.isoformat() if p.published_at else None,
    }


def requirement_to_dict(r: BuyingRequirement) -> dict:
    return {
        "id": r.id,
        "vendor_id": r.vendor_id,
        "requirement_code": r.requirement_code,
        "status": r.status.value if r.status else None,
        "crop_name": r.crop_name,
        "crop_variety": r.crop_variety,
        "quantity_required": r.quantity_required,
        "quantity_unit": r.quantity_unit,
        "quality_grade": r.quality_grade,
        "max_moisture_percent": r.max_moisture_percent,
        "min_price": r.min_price,
        "max_price": r.max_price,
        "price_unit": r.price_unit,
        "procurement_location": r.procurement_location,
        "pickup_district": r.pickup_district,
        "pickup_state": r.pickup_state,
        "pickup_radius_km": r.pickup_radius_km,
        "valid_from": r.valid_from.isoformat() if r.valid_from else None,
        "valid_to": r.valid_to.isoformat() if r.valid_to else None,
        "payment_terms": r.payment_terms,
        "transport_provided": r.transport_provided,
        "special_instructions": r.special_instructions,
        "total_applications": r.total_applications,
        "quantity_fulfilled": r.quantity_fulfilled,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }


# ══════════════════════════════════════════════════════════════
# VENDOR REGISTRATION & PROFILE
# ══════════════════════════════════════════════════════════════

@router.post("/register")
async def register_vendor(
    req: VendorCreateRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Register a new vendor with type selection and business profile."""
    # Validate vendor type
    try:
        vtype = VendorType(req.vendor_type)
    except ValueError:
        raise HTTPException(400, f"Invalid vendor_type: {req.vendor_type}. Must be procurement, seller, or hybrid.")

    # Check if user already has a vendor account
    existing = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if existing:
        if current_user == "guest_user":
            # For guest/testing, update existing profile
            for key, val in req.model_dump(exclude_unset=True).items():
                if val is not None and hasattr(existing, key):
                    setattr(existing, key, val)
            existing.vendor_type = vtype
            existing.status = VendorStatus.PENDING
            existing.updated_at = datetime.utcnow()
            db.commit()
            db.refresh(existing)
            logger.info(f"[Vendor] Updated guest vendor profile: {existing.business_name} (ID: {existing.id})")
            return {"success": True, "message": "Vendor profile updated successfully.", "vendor": vendor_to_dict(existing)}
        else:
            raise HTTPException(409, "You already have a vendor account. Go to your dashboard.")

    # Check unique GST
    if req.gst_number:
        gst_exists = db.query(Vendor).filter(Vendor.gst_number == req.gst_number, Vendor.clerk_user_id != current_user).first()
        if gst_exists:
            raise HTTPException(409, "This GST number is already associated with another vendor.")

    vendor = Vendor(
        clerk_user_id=current_user,
        vendor_type=vtype,
        status=VendorStatus.PENDING,
        business_name=req.business_name,
        owner_name=req.owner_name,
        phone=req.phone,
        email=req.email,
        tagline=req.tagline,
        business_description=req.business_description,
        business_category=req.business_category,
        year_established=req.year_established,
        number_of_employees=req.number_of_employees,
        gst_number=req.gst_number,
        secondary_phone=req.secondary_phone,
        whatsapp_number=req.whatsapp_number,
        website=req.website,
        street_address=req.street_address,
        landmark=req.landmark,
        village_city=req.village_city,
        taluka=req.taluka,
        district=req.district,
        state=req.state,
        pincode=req.pincode,
        latitude=req.latitude,
        longitude=req.longitude,
        profile_image=req.profile_image,
        cover_image=req.cover_image,
        service_areas=req.service_areas,
        languages_spoken=req.languages_spoken,
        crops_of_interest=req.crops_of_interest,
        procurement_capacity_mt=req.procurement_capacity_mt,
        warehouse_locations=req.warehouse_locations,
        product_categories=req.product_categories,
        store_open_time=req.store_open_time,
        store_close_time=req.store_close_time,
        weekly_holidays=req.weekly_holidays,
        delivery_available=req.delivery_available or False,
        delivery_radius_km=req.delivery_radius_km,
        id_proof_type=req.id_proof_type,
        id_proof_number=req.id_proof_number,
        id_proof_file=req.id_proof_file,
        trade_license_type=req.trade_license_type,
        trade_license_number=req.trade_license_number,
        trade_license_file=req.trade_license_file,
        bank_account_name=req.bank_account_name,
        bank_account_number=req.bank_account_number,
        bank_ifsc_code=req.bank_ifsc_code,
        bank_name=req.bank_name,
        return_policy=req.return_policy,
        refund_policy=req.refund_policy,
    )
    db.add(vendor)
    db.commit()
    db.refresh(vendor)

    logger.info(f"[Vendor] New {vtype.value} vendor registered: {vendor.business_name} (ID: {vendor.id})")
    return {"success": True, "message": "Vendor registered successfully. Pending admin verification.", "vendor": vendor_to_dict(vendor)}


@router.get("/me")
async def get_my_vendor_profile(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get the current user's vendor profile."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        return {"success": False, "vendor": None, "message": "No vendor account found."}
    return {"success": True, "vendor": vendor_to_dict(vendor)}


@router.put("/me")
async def update_my_vendor_profile(
    req: VendorUpdateRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update the current vendor's profile."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor account not found.")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(vendor, key, value)

    vendor.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(vendor)
    return {"success": True, "vendor": vendor_to_dict(vendor)}


@router.get("/profile/{vendor_id}")
async def get_vendor_public_profile(vendor_id: int, db: Session = Depends(get_db)):
    """Get a vendor's public profile by ID."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    
    # Include products for seller/hybrid
    products = []
    if vendor.vendor_type in [VendorType.SELLER, VendorType.HYBRID]:
        prods = db.query(Product).filter(
            Product.vendor_id == vendor.id,
            Product.status == ProductStatus.PUBLISHED
        ).limit(20).all()
        products = [product_to_dict(p) for p in prods]

    # Include active buying requirements for procurement/hybrid
    requirements = []
    if vendor.vendor_type in [VendorType.PROCUREMENT, VendorType.HYBRID]:
        reqs = db.query(BuyingRequirement).filter(
            BuyingRequirement.vendor_id == vendor.id,
            BuyingRequirement.status == RequirementStatus.ACTIVE
        ).limit(20).all()
        requirements = [requirement_to_dict(r) for r in reqs]

    # Reviews
    reviews = db.query(Review).filter(
        Review.vendor_id == vendor.id,
        Review.is_visible == True
    ).order_by(Review.created_at.desc()).limit(10).all()
    reviews_list = [{
        "id": r.id,
        "reviewer_name": r.reviewer_name,
        "reviewer_avatar": r.reviewer_avatar,
        "overall_rating": r.overall_rating,
        "title": r.title,
        "content": r.content,
        "images": r.images,
        "is_verified_purchase": r.is_verified_purchase,
        "helpful_count": r.helpful_count,
        "vendor_reply": r.vendor_reply,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    } for r in reviews]

    return {
        "success": True,
        "vendor": vendor_to_dict(vendor),
        "products": products,
        "buying_requirements": requirements,
        "reviews": reviews_list,
    }


# ══════════════════════════════════════════════════════════════
# VENDOR LISTING & MARKETPLACE
# ══════════════════════════════════════════════════════════════

@router.get("/list")
async def list_vendors(
    vendor_type: Optional[str] = None,
    category: Optional[str] = None,
    district: Optional[str] = None,
    search: Optional[str] = None,
    sort_by: str = "rating",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """List all verified vendors with filters."""
    query = db.query(Vendor).filter(Vendor.status == VendorStatus.VERIFIED)

    if vendor_type:
        try:
            vt = VendorType(vendor_type)
            if vt == VendorType.PROCUREMENT:
                query = query.filter(Vendor.vendor_type.in_([VendorType.PROCUREMENT, VendorType.HYBRID]))
            elif vt == VendorType.SELLER:
                query = query.filter(Vendor.vendor_type.in_([VendorType.SELLER, VendorType.HYBRID]))
            else:
                query = query.filter(Vendor.vendor_type == vt)
        except ValueError:
            pass

    if category:
        query = query.filter(Vendor.business_category.ilike(f"%{category}%"))

    if district:
        query = query.filter(Vendor.district.ilike(f"%{district}%"))

    if search:
        query = query.filter(or_(
            Vendor.business_name.ilike(f"%{search}%"),
            Vendor.owner_name.ilike(f"%{search}%"),
            Vendor.district.ilike(f"%{search}%"),
            Vendor.business_category.ilike(f"%{search}%"),
        ))

    # Sorting
    if sort_by == "rating":
        query = query.order_by(Vendor.rating.desc())
    elif sort_by == "reviews":
        query = query.order_by(Vendor.total_reviews.desc())
    elif sort_by == "experience":
        query = query.order_by(Vendor.year_established.asc())
    elif sort_by == "newest":
        query = query.order_by(Vendor.created_at.desc())

    total = query.count()
    vendors = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "success": True,
        "total": total,
        "page": page,
        "limit": limit,
        "vendors": [vendor_to_dict(v) for v in vendors],
    }


# ══════════════════════════════════════════════════════════════
# PRODUCTS (Seller / Hybrid)
# ══════════════════════════════════════════════════════════════

@router.post("/products")
async def create_product(
    req: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new product listing."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor account not found.")
    if vendor.vendor_type == VendorType.PROCUREMENT:
        raise HTTPException(403, "Procurement vendors cannot create product listings.")
    if vendor.status != VendorStatus.VERIFIED:
        raise HTTPException(403, "Your vendor account must be verified before listing products.")

    if req.selling_price > req.mrp:
        raise HTTPException(400, "Selling price cannot exceed MRP.")

    product = Product(
        vendor_id=vendor.id,
        status=ProductStatus.DRAFT,
        name=req.name,
        description=req.description,
        category=req.category,
        sub_category=req.sub_category,
        brand=req.brand,
        sku=req.sku,
        mrp=req.mrp,
        selling_price=req.selling_price,
        unit=req.unit,
        min_order_qty=req.min_order_qty,
        stock_quantity=req.stock_quantity,
        key_features=req.key_features,
        suitable_crops=req.suitable_crops,
        application_season=req.application_season,
        weight=req.weight,
        manufacturer=req.manufacturer,
        images=req.images,
        delivery_options=req.delivery_options,
        return_eligible=req.return_eligible,
    )
    db.add(product)
    vendor.total_products = (vendor.total_products or 0) + 1
    db.commit()
    db.refresh(product)

    return {"success": True, "message": "Product created as draft.", "product": product_to_dict(product)}


@router.get("/products")
async def list_my_products(
    status: Optional[str] = None,
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """List the current vendor's products."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor account not found.")

    query = db.query(Product).filter(Product.vendor_id == vendor.id)
    if status:
        try:
            query = query.filter(Product.status == ProductStatus(status))
        except ValueError:
            pass
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {"success": True, "total": total, "products": [product_to_dict(p) for p in products]}


@router.put("/products/{product_id}")
async def update_product(
    product_id: int,
    req: ProductCreateRequest,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Update a product."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(404, "Product not found.")

    update_data = req.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(product, key, value)
    product.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(product)
    return {"success": True, "product": product_to_dict(product)}


@router.post("/products/{product_id}/submit")
async def submit_product_for_review(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Submit a draft product for admin review."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(404, "Product not found.")
    if product.status not in [ProductStatus.DRAFT, ProductStatus.REJECTED]:
        raise HTTPException(400, f"Product in '{product.status.value}' state cannot be submitted.")

    product.status = ProductStatus.PENDING_REVIEW
    product.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Product submitted for admin review."}


@router.delete("/products/{product_id}")
async def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Delete a product (soft delete → discontinued)."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(404, "Product not found.")

    product.status = ProductStatus.DISCONTINUED
    product.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Product discontinued."}


@router.get("/marketplace/products")
async def browse_marketplace_products(
    category: Optional[str] = None,
    search: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    sort_by: str = "rating",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Public: Browse marketplace products from all verified sellers."""
    query = db.query(Product).filter(Product.status == ProductStatus.PUBLISHED)

    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter(or_(
            Product.name.ilike(f"%{search}%"),
            Product.description.ilike(f"%{search}%"),
            Product.brand.ilike(f"%{search}%"),
        ))
    if min_price:
        query = query.filter(Product.selling_price >= min_price)
    if max_price:
        query = query.filter(Product.selling_price <= max_price)

    if sort_by == "rating":
        query = query.order_by(Product.rating.desc())
    elif sort_by == "price_low":
        query = query.order_by(Product.selling_price.asc())
    elif sort_by == "price_high":
        query = query.order_by(Product.selling_price.desc())
    elif sort_by == "newest":
        query = query.order_by(Product.published_at.desc())
    elif sort_by == "best_seller":
        query = query.order_by(Product.total_sold.desc())

    total = query.count()
    products = query.offset((page - 1) * limit).limit(limit).all()
    return {"success": True, "total": total, "products": [product_to_dict(p) for p in products]}


# ══════════════════════════════════════════════════════════════
# BUYING REQUIREMENTS (Procurement / Hybrid)
# ══════════════════════════════════════════════════════════════

@router.post("/requirements")
async def create_buying_requirement(
    req: BuyingRequirementCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Create a new buying requirement."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    if vendor.vendor_type == VendorType.SELLER:
        raise HTTPException(403, "Seller vendors cannot create buying requirements.")
    if vendor.status != VendorStatus.VERIFIED:
        raise HTTPException(403, "Your vendor account must be verified.")

    # Validate price range (max spread 40%)
    if req.max_price > 0 and req.min_price > 0:
        spread = (req.max_price - req.min_price) / req.min_price
        if spread > 0.4:
            raise HTTPException(400, "Price range spread cannot exceed 40%.")

    # Check active requirement limit (max 10)
    active_count = db.query(BuyingRequirement).filter(
        BuyingRequirement.vendor_id == vendor.id,
        BuyingRequirement.status == RequirementStatus.ACTIVE
    ).count()
    if active_count >= 10:
        raise HTTPException(400, "Maximum 10 active buying requirements allowed.")

    requirement = BuyingRequirement(
        vendor_id=vendor.id,
        requirement_code=generate_code("BR"),
        status=RequirementStatus.DRAFT,
        crop_name=req.crop_name,
        crop_variety=req.crop_variety,
        quantity_required=req.quantity_required,
        quantity_unit=req.quantity_unit,
        quality_grade=req.quality_grade,
        max_moisture_percent=req.max_moisture_percent,
        min_price=req.min_price,
        max_price=req.max_price,
        price_unit=req.price_unit,
        procurement_location=req.procurement_location,
        pickup_district=req.pickup_district,
        pickup_state=req.pickup_state,
        pickup_radius_km=req.pickup_radius_km,
        valid_from=datetime.fromisoformat(req.valid_from),
        valid_to=datetime.fromisoformat(req.valid_to),
        payment_terms=req.payment_terms,
        transport_provided=req.transport_provided,
        special_instructions=req.special_instructions,
    )
    db.add(requirement)
    db.commit()
    db.refresh(requirement)

    return {"success": True, "message": "Buying requirement created.", "requirement": requirement_to_dict(requirement)}


@router.post("/requirements/{req_id}/publish")
async def publish_requirement(
    req_id: int,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Publish a draft buying requirement to make it visible to farmers."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")
    requirement = db.query(BuyingRequirement).filter(
        BuyingRequirement.id == req_id, BuyingRequirement.vendor_id == vendor.id
    ).first()
    if not requirement:
        raise HTTPException(404, "Requirement not found.")
    if requirement.status != RequirementStatus.DRAFT:
        raise HTTPException(400, "Only draft requirements can be published.")

    requirement.status = RequirementStatus.ACTIVE
    requirement.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": "Buying requirement is now active and visible to farmers."}


@router.get("/requirements")
async def list_my_requirements(
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """List the current vendor's buying requirements."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")

    query = db.query(BuyingRequirement).filter(BuyingRequirement.vendor_id == vendor.id)
    if status:
        try:
            query = query.filter(BuyingRequirement.status == RequirementStatus(status))
        except ValueError:
            pass

    total = query.count()
    reqs = query.order_by(BuyingRequirement.created_at.desc()).offset((page - 1) * limit).limit(limit).all()
    return {"success": True, "total": total, "requirements": [requirement_to_dict(r) for r in reqs]}


@router.get("/marketplace/requirements")
async def browse_buying_requirements(
    crop: Optional[str] = None,
    district: Optional[str] = None,
    state: Optional[str] = None,
    min_price: Optional[float] = None,
    sort_by: str = "newest",
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    """Public: Browse active buying requirements from procurement vendors (for farmers)."""
    query = db.query(BuyingRequirement).filter(
        BuyingRequirement.status == RequirementStatus.ACTIVE,
        BuyingRequirement.valid_to >= datetime.utcnow()
    )

    if crop:
        query = query.filter(BuyingRequirement.crop_name.ilike(f"%{crop}%"))
    if district:
        query = query.filter(BuyingRequirement.pickup_district.ilike(f"%{district}%"))
    if state:
        query = query.filter(BuyingRequirement.pickup_state.ilike(f"%{state}%"))
    if min_price:
        query = query.filter(BuyingRequirement.max_price >= min_price)

    if sort_by == "newest":
        query = query.order_by(BuyingRequirement.created_at.desc())
    elif sort_by == "price_high":
        query = query.order_by(BuyingRequirement.max_price.desc())
    elif sort_by == "quantity":
        query = query.order_by(BuyingRequirement.quantity_required.desc())

    total = query.count()
    reqs = query.offset((page - 1) * limit).limit(limit).all()

    # Enrich with vendor info
    results = []
    for r in reqs:
        vendor = db.query(Vendor).filter(Vendor.id == r.vendor_id).first()
        data = requirement_to_dict(r)
        if vendor:
            data["vendor"] = {
                "id": vendor.id,
                "business_name": vendor.business_name,
                "profile_image": vendor.profile_image,
                "district": vendor.district,
                "rating": vendor.rating,
                "is_verified": vendor.is_verified,
                "is_trusted": vendor.is_trusted,
                "farmers_served": vendor.farmers_served,
            }
        results.append(data)

    return {"success": True, "total": total, "requirements": results}


# ══════════════════════════════════════════════════════════════
# FARMER APPLICATIONS
# ══════════════════════════════════════════════════════════════

@router.post("/requirements/{req_id}/apply")
async def submit_farmer_application(
    req_id: int,
    req: FarmerApplicationCreate,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Farmer submits a crop offer against a buying requirement."""
    requirement = db.query(BuyingRequirement).filter(
        BuyingRequirement.id == req_id,
        BuyingRequirement.status == RequirementStatus.ACTIVE
    ).first()
    if not requirement:
        raise HTTPException(404, "Buying requirement not found or not active.")

    if requirement.valid_to < datetime.utcnow():
        raise HTTPException(400, "This buying requirement has expired.")

    # Check if farmer already applied
    existing = db.query(FarmerApplication).filter(
        FarmerApplication.requirement_id == req_id,
        FarmerApplication.farmer_user_id == current_user,
        FarmerApplication.status.in_([ApplicationStatus.PENDING, ApplicationStatus.SHORTLISTED, ApplicationStatus.UNDER_NEGOTIATION])
    ).first()
    if existing:
        raise HTTPException(409, "You already have an active application for this requirement.")

    application = FarmerApplication(
        requirement_id=req_id,
        farmer_user_id=current_user,
        farmer_name=req.farmer_name,
        farmer_phone=req.farmer_phone,
        farmer_location=req.farmer_location,
        offered_quantity=req.offered_quantity,
        offered_price=req.offered_price,
        crop_quality_self_assessment=req.crop_quality_self_assessment,
        crop_images=req.crop_images,
        notes=req.notes,
    )
    db.add(application)

    requirement.total_applications = (requirement.total_applications or 0) + 1
    db.commit()
    db.refresh(application)

    return {"success": True, "message": "Your crop offer has been submitted. The vendor will review it soon.", "application_id": application.id}


@router.get("/applications")
async def list_farmer_applications(
    requirement_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Vendor: List all farmer applications for their buying requirements."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")

    # Get all requirement IDs for this vendor
    req_ids = [r.id for r in db.query(BuyingRequirement.id).filter(BuyingRequirement.vendor_id == vendor.id).all()]
    if not req_ids:
        return {"success": True, "total": 0, "applications": []}

    query = db.query(FarmerApplication).filter(FarmerApplication.requirement_id.in_(req_ids))
    if requirement_id:
        query = query.filter(FarmerApplication.requirement_id == requirement_id)
    if status:
        try:
            query = query.filter(FarmerApplication.status == ApplicationStatus(status))
        except ValueError:
            pass

    total = query.count()
    apps = query.order_by(FarmerApplication.applied_at.desc()).offset((page - 1) * limit).limit(limit).all()

    results = []
    for a in apps:
        results.append({
            "id": a.id,
            "requirement_id": a.requirement_id,
            "farmer_user_id": a.farmer_user_id,
            "status": a.status.value,
            "farmer_name": a.farmer_name,
            "farmer_phone": a.farmer_phone,
            "farmer_location": a.farmer_location,
            "offered_quantity": a.offered_quantity,
            "offered_price": a.offered_price,
            "crop_quality_self_assessment": a.crop_quality_self_assessment,
            "crop_images": a.crop_images,
            "notes": a.notes,
            "counter_offer_price": a.counter_offer_price,
            "negotiation_rounds": a.negotiation_rounds,
            "final_agreed_price": a.final_agreed_price,
            "applied_at": a.applied_at.isoformat() if a.applied_at else None,
        })

    return {"success": True, "total": total, "applications": results}


@router.post("/applications/{app_id}/respond")
async def respond_to_application(
    app_id: int,
    action: str = Query(..., description="shortlist, reject, counter_offer, accept"),
    counter_price: Optional[float] = None,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Vendor responds to a farmer application."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")

    app = db.query(FarmerApplication).filter(FarmerApplication.id == app_id).first()
    if not app:
        raise HTTPException(404, "Application not found.")

    # Verify this application belongs to the vendor's requirement
    req = db.query(BuyingRequirement).filter(
        BuyingRequirement.id == app.requirement_id,
        BuyingRequirement.vendor_id == vendor.id
    ).first()
    if not req:
        raise HTTPException(403, "This application does not belong to your requirements.")

    if action == "shortlist":
        app.status = ApplicationStatus.SHORTLISTED
    elif action == "reject":
        app.status = ApplicationStatus.REJECTED
    elif action == "counter_offer":
        if not counter_price:
            raise HTTPException(400, "Counter offer price is required.")
        if app.negotiation_rounds >= 5:
            raise HTTPException(400, "Maximum negotiation rounds (5) reached.")
        app.status = ApplicationStatus.UNDER_NEGOTIATION
        app.counter_offer_price = counter_price
        app.negotiation_rounds = (app.negotiation_rounds or 0) + 1
    elif action == "accept":
        app.status = ApplicationStatus.ACCEPTED
        app.final_agreed_price = counter_price or app.offered_price
    else:
        raise HTTPException(400, "Invalid action. Use: shortlist, reject, counter_offer, accept")

    app.responded_at = datetime.utcnow()
    app.updated_at = datetime.utcnow()
    db.commit()

    return {"success": True, "message": f"Application {action}ed successfully."}


# ══════════════════════════════════════════════════════════════
# ADMIN VERIFICATION
# ══════════════════════════════════════════════════════════════

@router.get("/admin/pending")
async def list_pending_vendors(
    db: Session = Depends(get_db),
    # In production, add admin-only guard here
):
    """Admin: List all pending vendor applications."""
    vendors = db.query(Vendor).filter(
        Vendor.status.in_([VendorStatus.PENDING, VendorStatus.UNDER_REVIEW])
    ).order_by(Vendor.created_at.asc()).all()
    return {"success": True, "total": len(vendors), "vendors": [vendor_to_dict(v) for v in vendors]}


@router.post("/admin/verify/{vendor_id}")
async def admin_verify_vendor(
    vendor_id: int,
    req: AdminVerifyRequest,
    db: Session = Depends(get_db),
    # In production, add admin-only guard here
):
    """Admin: Approve, reject, or request more info for a vendor."""
    vendor = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")

    if req.action == "approve":
        vendor.status = VendorStatus.VERIFIED
        vendor.is_verified = True
        vendor.verified_at = datetime.utcnow()
        vendor.admin_notes = req.notes
        msg = "Vendor approved and verified."
    elif req.action == "reject":
        vendor.status = VendorStatus.REJECTED
        vendor.rejection_reason = req.rejection_reason or req.notes
        vendor.admin_notes = req.notes
        msg = "Vendor application rejected."
    elif req.action == "request_info":
        vendor.status = VendorStatus.UNDER_REVIEW
        vendor.admin_notes = req.notes
        msg = "Additional information requested from vendor."
    else:
        raise HTTPException(400, "Invalid action. Use: approve, reject, request_info")

    vendor.updated_at = datetime.utcnow()
    db.commit()
    logger.info(f"[Admin] Vendor {vendor_id} ({vendor.business_name}): {req.action}")
    return {"success": True, "message": msg}


@router.post("/admin/products/{product_id}/review")
async def admin_review_product(
    product_id: int,
    action: str = Query(..., description="approve or reject"),
    notes: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Admin: Approve or reject a product listing."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(404, "Product not found.")
    if product.status != ProductStatus.PENDING_REVIEW:
        raise HTTPException(400, "Product is not pending review.")

    if action == "approve":
        product.status = ProductStatus.PUBLISHED
        product.published_at = datetime.utcnow()
        product.admin_notes = notes
        msg = "Product approved and published."
    elif action == "reject":
        product.status = ProductStatus.REJECTED
        product.rejection_reason = notes
        product.admin_notes = notes
        msg = "Product rejected."
    else:
        raise HTTPException(400, "Invalid action.")

    product.updated_at = datetime.utcnow()
    db.commit()
    return {"success": True, "message": msg}


# ══════════════════════════════════════════════════════════════
# DASHBOARD ANALYTICS
# ══════════════════════════════════════════════════════════════

@router.get("/dashboard/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user: str = Depends(get_current_user)
):
    """Get dashboard KPI stats for the current vendor."""
    vendor = db.query(Vendor).filter(Vendor.clerk_user_id == current_user).first()
    if not vendor:
        raise HTTPException(404, "Vendor not found.")

    stats = {
        "vendor_type": vendor.vendor_type.value,
        "status": vendor.status.value,
        "is_verified": vendor.is_verified,
        "rating": vendor.rating,
        "total_reviews": vendor.total_reviews,
        "trust_score": vendor.trust_score,
    }

    # Seller stats
    if vendor.vendor_type in [VendorType.SELLER, VendorType.HYBRID]:
        stats["total_products"] = db.query(Product).filter(Product.vendor_id == vendor.id).count()
        stats["published_products"] = db.query(Product).filter(
            Product.vendor_id == vendor.id, Product.status == ProductStatus.PUBLISHED
        ).count()
        stats["pending_products"] = db.query(Product).filter(
            Product.vendor_id == vendor.id, Product.status == ProductStatus.PENDING_REVIEW
        ).count()
        stats["total_customer_orders"] = db.query(CustomerOrder).filter(
            CustomerOrder.vendor_id == vendor.id
        ).count()
        stats["pending_orders"] = db.query(CustomerOrder).filter(
            CustomerOrder.vendor_id == vendor.id, CustomerOrder.status == OrderStatus.PENDING
        ).count()

        # Low stock products
        stats["low_stock_products"] = db.query(Product).filter(
            Product.vendor_id == vendor.id,
            Product.status == ProductStatus.PUBLISHED,
            Product.stock_quantity <= Product.low_stock_threshold
        ).count()

    # Procurement stats
    if vendor.vendor_type in [VendorType.PROCUREMENT, VendorType.HYBRID]:
        stats["active_requirements"] = db.query(BuyingRequirement).filter(
            BuyingRequirement.vendor_id == vendor.id,
            BuyingRequirement.status == RequirementStatus.ACTIVE
        ).count()
        stats["total_requirements"] = db.query(BuyingRequirement).filter(
            BuyingRequirement.vendor_id == vendor.id
        ).count()

        # Pending applications
        req_ids = [r.id for r in db.query(BuyingRequirement.id).filter(
            BuyingRequirement.vendor_id == vendor.id
        ).all()]
        if req_ids:
            stats["pending_applications"] = db.query(FarmerApplication).filter(
                FarmerApplication.requirement_id.in_(req_ids),
                FarmerApplication.status == ApplicationStatus.PENDING
            ).count()
            stats["total_applications"] = db.query(FarmerApplication).filter(
                FarmerApplication.requirement_id.in_(req_ids)
            ).count()
        else:
            stats["pending_applications"] = 0
            stats["total_applications"] = 0

        stats["total_procurement_orders"] = db.query(ProcurementOrder).filter(
            ProcurementOrder.vendor_id == vendor.id
        ).count()

    return {"success": True, "stats": stats}
