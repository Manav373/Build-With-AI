"""
DATABASE/domains/vendor – Vendor Domain Data Models & Schema
-------------------------------------------------------------
"""
try:
    from DATABASE.models.vendor import (
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )
except ImportError:
    from database.models.vendor import (
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )

__all__ = [
    "Vendor", "VendorDocument", "Product", "BuyingRequirement", "FarmerApplication",
    "CustomerOrder", "ProcurementOrder", "Review", "VendorNotification",
    "ContractFarmingAgreement", "BulkRFQ", "LogisticsShipment", "AIQualityInspection", "VendorPayout",
    "VendorType", "VendorStatus", "DocumentStatus", "RequirementStatus",
    "ProductStatus", "OrderStatus", "ProcurementOrderStatus", "ApplicationStatus"
]
