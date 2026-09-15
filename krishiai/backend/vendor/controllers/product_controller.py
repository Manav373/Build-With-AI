import logging
from sqlalchemy.orm import Session
from database.models.vendor import Product, ProductStatus

logger = logging.getLogger("Backend.Vendor.ProductController")

class ProductController:
    @staticmethod
    def list_products(db: Session, category: str = None, limit: int = 50):
        query = db.query(Product).filter(Product.status == ProductStatus.ACTIVE)
        if category:
            query = query.filter(Product.category == category)
        return query.limit(limit).all()

product_controller = ProductController()
