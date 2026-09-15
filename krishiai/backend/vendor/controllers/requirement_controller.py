import logging
from sqlalchemy.orm import Session
from database.models.vendor import BuyingRequirement, RequirementStatus

logger = logging.getLogger("Backend.Vendor.RequirementController")

class RequirementController:
    @staticmethod
    def list_active_requirements(db: Session, crop_name: str = None):
        query = db.query(BuyingRequirement).filter(BuyingRequirement.status == RequirementStatus.ACTIVE)
        if crop_name:
            query = query.filter(BuyingRequirement.crop_name.ilike(f"%{crop_name}%"))
        return query.all()

requirement_controller = RequirementController()
