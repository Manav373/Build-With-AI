import logging
from sqlalchemy.orm import Session
from database.models.vendor import ProcurementOrder, CustomerOrder

logger = logging.getLogger("Backend.Vendor.OrderController")

class OrderController:
    @staticmethod
    def list_procurement_orders(db: Session, vendor_id: int):
        return db.query(ProcurementOrder).filter(ProcurementOrder.vendor_id == vendor_id).all()

    @staticmethod
    def list_customer_orders(db: Session, vendor_id: int):
        return db.query(CustomerOrder).filter(CustomerOrder.vendor_id == vendor_id).all()

order_controller = OrderController()
