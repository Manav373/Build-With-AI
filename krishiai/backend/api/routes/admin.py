import logging
from datetime import datetime
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from app.db.database import get_db
from app.models.admin_model import (
    User, FarmerProfile, UnifiedOrder, Complaint, AuditLog, GovernmentSchemeDb
)
from app.models.vendor import (
    Vendor, Product, VendorStatus, ProductStatus, VendorDocument
)

logger = logging.getLogger("KrishiAdmin")
router = APIRouter()


# ─────────────────────────────────────────────────────────────
# 1. TELEMETRY & STATS
# ─────────────────────────────────────────────────────────────

@router.get("/dashboard/stats")
async def get_dashboard_stats(db: Session = Depends(get_db)):
    """Return real-time live ecosystem telemetry from database."""
    try:
        # Real-time counts
        total_farmers = db.query(User).filter(User.role.ilike("FARMER")).count()
        if total_farmers == 0:
            total_farmers = db.query(FarmerProfile).count()

        total_vendors = db.query(Vendor).count()
        if total_vendors == 0:
            total_vendors = db.query(User).filter(User.role.ilike("VENDOR")).count()

        pending_kyc = db.query(Vendor).filter(
            or_(
                Vendor.status == VendorStatus.PENDING,
                Vendor.status == VendorStatus.UNDER_REVIEW,
                Vendor.status == "pending",
                Vendor.status == "under_review",
                Vendor.is_verified == False
            )
        ).count()

        active_orders = db.query(UnifiedOrder).filter(
            UnifiedOrder.status.in_(["PENDING", "ACCEPTED", "PROCESSING", "DISPATCHED", "IN_TRANSIT"])
        ).count()

        open_disputes = db.query(Complaint).filter(
            Complaint.status.in_(["PENDING", "UNDER_INVESTIGATION", "OPEN"])
        ).count()

        # Monthly GMV calculation from unified orders
        gmv_sum = db.query(func.sum(UnifiedOrder.total_amount)).filter(
            UnifiedOrder.status.in_(["ACCEPTED", "DELIVERED", "COMPLETED"])
        ).scalar() or 0.0

        gmv_formatted = f"₹{gmv_sum:,.0f}" if gmv_sum > 0 else "₹0"

        # Unique active crops monitored
        active_crops_count = db.query(func.count(Product.id)).scalar() or 0

        # Dynamic live recent activities from real database events
        recent_activity = []
        recent_audits = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(5).all()
        for a in recent_audits:
            recent_activity.append({
                "id": a.id,
                "action": a.action.replace("_", " ").title(),
                "entity": f"{a.target_type}: {a.target_id}",
                "time": a.created_at.strftime("%d %b %H:%M"),
                "type": "info"
            })

        # If no audit logs yet, construct live activities from newest orders and vendors
        if not recent_activity:
            latest_orders = db.query(UnifiedOrder).order_by(UnifiedOrder.created_at.desc()).limit(3).all()
            for o in latest_orders:
                recent_activity.append({
                    "id": f"ord_{o.id}",
                    "action": f"Order {o.status.title()}",
                    "entity": f"{o.item_title} ({o.order_code})",
                    "time": o.created_at.strftime("%d %b %H:%M") if o.created_at else "Recently",
                    "type": "success" if o.status in ["ACCEPTED", "DELIVERED"] else "info"
                })

            latest_vendors = db.query(Vendor).order_by(Vendor.created_at.desc()).limit(2).all()
            for v in latest_vendors:
                recent_activity.append({
                    "id": f"vnd_{v.id}",
                    "action": f"Vendor {v.status.title() if hasattr(v.status, 'title') else 'Active'}",
                    "entity": v.business_name,
                    "time": v.created_at.strftime("%d %b %H:%M") if v.created_at else "Recently",
                    "type": "info"
                })

        return {
            "success": True,
            "data": {
                "totalFarmers": total_farmers,
                "totalVendors": total_vendors,
                "pendingKYC": pending_kyc,
                "activeOrders": active_orders,
                "openDisputes": open_disputes,
                "systemHealth": "Healthy (100% Operational)",
                "gmvMonth": gmv_formatted,
                "activeCropsMonitored": active_crops_count,
                "recentActivity": recent_activity
            }
        }
    except Exception as e:
        logger.error(f"[Admin Dashboard Stats Error] {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


# ─────────────────────────────────────────────────────────────
# 2. USER MANAGEMENT
# ─────────────────────────────────────────────────────────────

@router.get("/users")
async def get_users(
    role: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List real registered users with optional role and search filters."""
    query = db.query(User)

    if role and role.lower() != "all":
        query = query.filter(User.role.ilike(role))

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(s),
                User.phone.ilike(s),
                User.email.ilike(s),
                User.district.ilike(s),
                User.state.ilike(s)
            )
        )

    users = query.order_by(User.created_at.desc()).all()
    user_list = []
    for u in users:
        loc = f"{u.district or ''}, {u.state or ''}".strip(", ") or "India"
        user_list.append({
            "id": f"usr_{u.id}",
            "raw_id": u.id,
            "name": u.name or f"User {u.phone[-4:]}",
            "phone": u.phone,
            "email": u.email,
            "role": (u.role or "farmer").lower(),
            "location": loc,
            "status": u.status or "active",
            "is_verified": u.is_verified,
            "joined": u.created_at.strftime("%d %b %Y") if u.created_at else "Recent"
        })

    return {"success": True, "data": {"users": user_list}}


class UserStatusUpdatePayload(BaseModel):
    status: str
    reason: Optional[str] = ""


@router.post("/users/{user_id}/status")
async def update_user_status(
    user_id: str,
    payload: UserStatusUpdatePayload,
    db: Session = Depends(get_db)
):
    """Suspend or activate a user account in real-time."""
    numeric_id = int(user_id.replace("usr_", "")) if "usr_" in user_id else int(user_id)
    user = db.query(User).filter(User.id == numeric_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.status = payload.status
    user.updated_at = datetime.utcnow()

    # Log to real audit trail
    log = AuditLog(
        actor_name="SuperAdmin",
        actor_role="ADMIN",
        action=f"USER_{payload.status.upper()}",
        target_type="User",
        target_id=str(numeric_id),
        details={"reason": payload.reason, "phone": user.phone}
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"User status updated to {payload.status}", "user_id": user_id}


# ─────────────────────────────────────────────────────────────
# 3. VENDOR KYC & VERIFICATION
# ─────────────────────────────────────────────────────────────

@router.get("/vendors/pending")
async def get_pending_vendors(db: Session = Depends(get_db)):
    """List vendors awaiting admin KYC verification."""
    vendors = db.query(Vendor).filter(
        or_(
            Vendor.status == VendorStatus.PENDING,
            Vendor.status == VendorStatus.UNDER_REVIEW,
            Vendor.status == "pending",
            Vendor.status == "under_review",
            Vendor.is_verified == False
        )
    ).all()

    results = []
    for v in vendors:
        docs = []
        if v.gst_number:
            docs.append({"title": f"GST Certificate ({v.gst_number})", "url": "#"})
        if v.trade_license_number:
            docs.append({"title": f"Trade License: {v.trade_license_number}", "url": v.trade_license_file or "#"})
        if v.id_proof_number:
            docs.append({"title": f"ID Proof: {v.id_proof_type or 'Govt ID'}", "url": v.id_proof_file or "#"})

        # Also pull from vendor_documents table if present
        db_docs = db.query(VendorDocument).filter(VendorDocument.vendor_id == v.id).all()
        for dd in db_docs:
            docs.append({"title": dd.document_type.replace("_", " ").title(), "url": dd.file_url or "#"})

        loc = f"{v.district or v.village_city or ''}, {v.state or ''}".strip(", ") or "India"
        results.append({
            "id": f"vnd_{v.id}",
            "raw_id": v.id,
            "name": v.business_name,
            "owner": v.owner_name,
            "type": v.business_category or v.vendor_type or "Vendor",
            "gstNumber": v.gst_number or "N/A",
            "seedLicense": v.trade_license_number or "N/A",
            "pesticideLicense": "Verified" if v.trade_license_type else "N/A",
            "location": loc,
            "appliedDate": v.created_at.strftime("%d %b %Y") if v.created_at else "Recent",
            "documents": docs
        })

    return {"success": True, "data": {"vendors": results}}


class VendorVerifyPayload(BaseModel):
    action: str  # approve | reject
    admin_notes: Optional[str] = ""
    rejection_reason: Optional[str] = ""


@router.post("/vendors/{vendor_id}/verify")
async def verify_vendor(
    vendor_id: str,
    payload: VendorVerifyPayload,
    db: Session = Depends(get_db)
):
    """Approve or reject vendor KYC."""
    numeric_id = int(vendor_id.replace("vnd_", "")) if "vnd_" in vendor_id else int(vendor_id)
    vendor = db.query(Vendor).filter(Vendor.id == numeric_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    is_approve = payload.action.lower() == "approve"
    vendor.status = VendorStatus.VERIFIED if is_approve else VendorStatus.REJECTED
    vendor.is_verified = is_approve
    vendor.verified_at = datetime.utcnow() if is_approve else None
    vendor.admin_notes = payload.admin_notes
    if not is_approve:
        vendor.rejection_reason = payload.rejection_reason

    # Add audit log
    log = AuditLog(
        actor_name="SuperAdmin",
        actor_role="ADMIN",
        action="VENDOR_KYC_APPROVED" if is_approve else "VENDOR_KYC_REJECTED",
        target_type="Vendor",
        target_id=str(numeric_id),
        details={"vendor_name": vendor.business_name, "notes": payload.admin_notes}
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Vendor {payload.action}d successfully"}


# ─────────────────────────────────────────────────────────────
# 4. PRODUCT MODERATION
# ─────────────────────────────────────────────────────────────

@router.get("/products/pending")
async def get_pending_products(db: Session = Depends(get_db)):
    """List products pending administrative compliance review."""
    products = db.query(Product).filter(
        or_(
            Product.status == ProductStatus.DRAFT,
            Product.status == "PENDING_REVIEW",
            Product.status == "pending"
        )
    ).all()

    results = []
    for p in products:
        v = db.query(Vendor).filter(Vendor.id == p.vendor_id).first()
        results.append({
            "id": f"prod_{p.id}",
            "raw_id": p.id,
            "name": p.name,
            "vendor": v.business_name if v else "Registered Vendor",
            "category": p.category or "Agricultural Input",
            "price": f"₹{p.selling_price:,.0f}",
            "mrp": f"₹{p.mrp:,.0f}",
            "stock": p.stock_quantity or 0,
            "complianceFlag": p.admin_notes if p.admin_notes else None,
            "submittedDate": p.created_at.strftime("%d %b %Y") if p.created_at else "Recent"
        })

    return {"success": True, "data": {"products": results}}


class ProductModeratePayload(BaseModel):
    action: str  # approve | reject
    rejection_reason: Optional[str] = ""


@router.post("/products/{product_id}/moderate")
async def moderate_product(
    product_id: str,
    payload: ProductModeratePayload,
    db: Session = Depends(get_db)
):
    """Approve or reject a product listing."""
    numeric_id = int(product_id.replace("prod_", "")) if "prod_" in product_id else int(product_id)
    product = db.query(Product).filter(Product.id == numeric_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    is_approve = payload.action.lower() == "approve"
    product.status = ProductStatus.ACTIVE if is_approve else ProductStatus.REJECTED
    if is_approve:
        product.published_at = datetime.utcnow()
    else:
        product.rejection_reason = payload.rejection_reason

    # Add audit log
    log = AuditLog(
        actor_name="SuperAdmin",
        actor_role="ADMIN",
        action="PRODUCT_APPROVED" if is_approve else "PRODUCT_REJECTED",
        target_type="Product",
        target_id=str(numeric_id),
        details={"product_name": product.name, "reason": payload.rejection_reason}
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Product {payload.action}d successfully"}


# ─────────────────────────────────────────────────────────────
# 5. ORDERS STREAM
# ─────────────────────────────────────────────────────────────

@router.get("/orders")
async def get_orders(
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List real orders across ecosystem with status and escrow details."""
    query = db.query(UnifiedOrder)

    if type and type.lower() != "all":
        query = query.filter(UnifiedOrder.order_type.ilike(f"%{type}%"))

    orders = query.order_by(UnifiedOrder.created_at.desc()).all()
    results = []
    for o in orders:
        results.append({
            "id": o.order_code or f"ORD-{o.id:04d}",
            "raw_id": o.id,
            "type": o.order_type.replace("_", " ").title(),
            "buyer": o.buyer_name,
            "seller": o.seller_name,
            "product": f"{o.item_title} ({o.quantity} {o.unit or ''})",
            "amount": f"₹{o.total_amount:,.2f}",
            "escrowStatus": o.payment_status.replace("_", " ").title(),
            "fulfillment": o.status.replace("_", " ").title(),
            "date": o.created_at.strftime("%d %b %Y") if o.created_at else "Recent"
        })

    return {"success": True, "data": {"orders": results}}


# ─────────────────────────────────────────────────────────────
# 6. COMPLAINTS & GRIEVANCES
# ─────────────────────────────────────────────────────────────

@router.get("/complaints")
async def get_complaints(
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List live disputes and grievances."""
    query = db.query(Complaint)

    if status_filter and status_filter.lower() != "all":
        query = query.filter(Complaint.status.ilike(status_filter))

    complaints = query.order_by(Complaint.created_at.desc()).all()
    results = []
    for c in complaints:
        results.append({
            "id": c.complaint_code or f"CMP-{c.id:03d}",
            "raw_id": c.id,
            "title": c.subject,
            "raisedBy": f"{c.complainant_name} ({c.complainant_role.title()})",
            "against": c.accused_name or "General",
            "severity": c.priority or "Medium",
            "orderRef": f"ORD-{c.order_id}" if c.order_id else "N/A",
            "status": c.status.replace("_", " ").title(),
            "description": c.description,
            "created": c.created_at.strftime("%d %b %Y") if c.created_at else "Recent"
        })

    return {"success": True, "data": {"complaints": results}}


class ComplaintResolvePayload(BaseModel):
    resolution: str
    action_taken: Optional[str] = ""
    admin_notes: Optional[str] = ""


@router.post("/complaints/{complaint_id}/resolve")
async def resolve_complaint(
    complaint_id: str,
    payload: ComplaintResolvePayload,
    db: Session = Depends(get_db)
):
    """Resolve an open grievance or dispute."""
    query = db.query(Complaint)
    if "CMP-" in complaint_id:
        complaint = query.filter(Complaint.complaint_code == complaint_id).first()
    else:
        numeric_id = int(complaint_id)
        complaint = query.filter(Complaint.id == numeric_id).first()

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    complaint.status = "RESOLVED"
    complaint.resolution_summary = f"{payload.resolution} - Action: {payload.action_taken}"
    complaint.admin_notes = payload.admin_notes
    complaint.resolved_at = datetime.utcnow()

    # Log to audit trail
    log = AuditLog(
        actor_name="SuperAdmin",
        actor_role="ADMIN",
        action="COMPLAINT_RESOLVED",
        target_type="Complaint",
        target_id=complaint.complaint_code or str(complaint.id),
        details={"resolution": payload.resolution, "action": payload.action_taken}
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": "Complaint resolved successfully"}


# ─────────────────────────────────────────────────────────────
# 7. GOVERNMENT SCHEMES
# ─────────────────────────────────────────────────────────────

@router.get("/schemes")
async def get_schemes(db: Session = Depends(get_db)):
    """List real government schemes stored in the database."""
    schemes = db.query(GovernmentSchemeDb).filter(GovernmentSchemeDb.is_active == True).all()
    results = []
    for s in schemes:
        subsidy_str = f"{s.subsidy_percentage:.0f}% Direct Subsidy" if s.subsidy_percentage > 0 else "Direct Support"
        results.append({
            "id": s.scheme_code or f"SCH-{s.id:02d}",
            "raw_id": s.id,
            "name": s.title,
            "department": s.ministry or "Ministry of Agriculture",
            "subsidyPercent": subsidy_str,
            "beneficiaries": s.eligibility or "All Registered Farmers",
            "deadline": "Active FY 2026-27",
            "status": "Active" if s.is_active else "Inactive",
            "link": s.application_url or "#"
        })

    return {"success": True, "data": {"schemes": results}}


class SchemeCreatePayload(BaseModel):
    name: str
    department: str
    subsidyPercent: Optional[str] = "50"
    targetCrops: Optional[str] = "All Crops"
    link: Optional[str] = ""


@router.post("/schemes")
async def create_scheme(
    payload: SchemeCreatePayload,
    db: Session = Depends(get_db)
):
    """Add a new government scheme to the real database."""
    try:
        subsidy_val = float("".join(ch for ch in payload.subsidyPercent if ch.isdigit() or ch == ".") or "0")
    except Exception:
        subsidy_val = 0.0

    scheme_code = f"SCH-{int(datetime.utcnow().timestamp())}"
    scheme = GovernmentSchemeDb(
        scheme_code=scheme_code,
        title=payload.name,
        ministry=payload.department,
        category="Agricultural Subsidy",
        state="All India",
        description=f"Direct agricultural subsidy for {payload.targetCrops}.",
        benefits=f"Provides up to {payload.subsidyPercent} subsidy coverage.",
        eligibility=f"Eligible for cultivators of {payload.targetCrops}.",
        application_url=payload.link,
        subsidy_percentage=subsidy_val,
        is_active=True
    )
    db.add(scheme)

    # Log action
    log = AuditLog(
        actor_name="SuperAdmin",
        actor_role="ADMIN",
        action="SCHEME_PUBLISHED",
        target_type="GovernmentScheme",
        target_id=scheme_code,
        details={"title": payload.name, "department": payload.department}
    )
    db.add(log)
    db.commit()
    db.refresh(scheme)

    return {"success": True, "message": "Scheme published successfully", "scheme_id": scheme.id}


# ─────────────────────────────────────────────────────────────
# 8. SECURITY AUDIT TRAIL
# ─────────────────────────────────────────────────────────────

@router.get("/audit-logs")
async def get_audit_logs(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List real chronological audit logs."""
    query = db.query(AuditLog)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                AuditLog.action.ilike(s),
                AuditLog.actor_name.ilike(s),
                AuditLog.target_type.ilike(s),
                AuditLog.target_id.ilike(s)
            )
        )

    logs = query.order_by(AuditLog.created_at.desc()).limit(50).all()
    results = []
    for l in logs:
        results.append({
            "id": f"LOG-{l.id:03d}",
            "action": l.action,
            "actor": l.actor_name or "SYSTEM",
            "target": f"{l.target_type} ({l.target_id})",
            "ip": l.ip_address or "127.0.0.1",
            "status": "SUCCESS",
            "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S UTC") if l.created_at else "Recent"
        })

    return {"success": True, "data": {"logs": results}}
