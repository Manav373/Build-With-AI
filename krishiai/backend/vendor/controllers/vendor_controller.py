import logging
from fastapi import HTTPException
from sqlalchemy.orm import Session
from database.models.vendor import Vendor, VendorStatus

logger = logging.getLogger("Backend.Vendor.VendorController")

class VendorController:
    @staticmethod
    def get_profile(db: Session, user_id: str):
        vendor = db.query(Vendor).filter(Vendor.user_id == user_id).first()
        if not vendor:
            raise HTTPException(status_code=404, detail="Vendor profile not found")
        return vendor

    @staticmethod
    def list_vendors(db: Session, vendor_type: str = None, state: str = None):
        query = db.query(Vendor).filter(Vendor.status == VendorStatus.VERIFIED)
        if vendor_type:
            query = query.filter(Vendor.vendor_type == vendor_type)
        if state:
            query = query.filter(Vendor.state == state)
        return query.all()

vendor_controller = VendorController()
