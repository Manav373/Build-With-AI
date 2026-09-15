try:
    from DATABASE.models.common import UserProfile, SystemNotification
    from DATABASE.models.farmer import FarmerLocation, MarketRecord, MarketGeocode, CallHistory, CommunityMessage
    from DATABASE.models.vendor import (
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )
except ImportError:
    from database.models.common import UserProfile, SystemNotification
    from database.models.farmer import FarmerLocation, MarketRecord, MarketGeocode, CallHistory, CommunityMessage
    from database.models.vendor import (
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )

__all__ = [
    "UserProfile", "SystemNotification",
    "FarmerLocation", "MarketRecord", "MarketGeocode", "CallHistory", "CommunityMessage",
    "Vendor", "VendorDocument", "Product", "BuyingRequirement", "FarmerApplication",
    "CustomerOrder", "ProcurementOrder", "Review", "VendorNotification",
    "ContractFarmingAgreement", "BulkRFQ", "LogisticsShipment", "AIQualityInspection", "VendorPayout",
    "VendorType", "VendorStatus", "DocumentStatus", "RequirementStatus",
    "ProductStatus", "OrderStatus", "ProcurementOrderStatus", "ApplicationStatus"
]
