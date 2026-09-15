"""
DATABASE/__init__.py – KrishiAI Unified Master Database
---------------------------------------------------------
Single unified database package storing all domain models, connections,
and data schemas across Farmer, Vendor, Admin, and Common domains.
"""

try:
    from DATABASE.connection.connection import Base, engine, SessionLocal, get_db, DATABASE_URL
    from DATABASE.models import (
        UserProfile, SystemNotification,
        FarmerLocation, MarketRecord, MarketGeocode, CallHistory, CommunityMessage,
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )
    from DATABASE.models.admin import AdminAuditLog, Complaint, PlatformSetting
except ImportError:
    from database.connection.connection import Base, engine, SessionLocal, get_db, DATABASE_URL
    from database.models import (
        UserProfile, SystemNotification,
        FarmerLocation, MarketRecord, MarketGeocode, CallHistory, CommunityMessage,
        Vendor, VendorDocument, Product, BuyingRequirement, FarmerApplication,
        CustomerOrder, ProcurementOrder, Review, VendorNotification,
        ContractFarmingAgreement, BulkRFQ, LogisticsShipment, AIQualityInspection, VendorPayout,
        VendorType, VendorStatus, DocumentStatus, RequirementStatus,
        ProductStatus, OrderStatus, ProcurementOrderStatus, ApplicationStatus
    )
    from database.models.admin import AdminAuditLog, Complaint, PlatformSetting

__all__ = [
    "Base", "engine", "SessionLocal", "get_db", "DATABASE_URL",
    "UserProfile", "SystemNotification",
    "FarmerLocation", "MarketRecord", "MarketGeocode", "CallHistory", "CommunityMessage",
    "Vendor", "VendorDocument", "Product", "BuyingRequirement", "FarmerApplication",
    "CustomerOrder", "ProcurementOrder", "Review", "VendorNotification",
    "ContractFarmingAgreement", "BulkRFQ", "LogisticsShipment", "AIQualityInspection", "VendorPayout",
    "VendorType", "VendorStatus", "DocumentStatus", "RequirementStatus",
    "ProductStatus", "OrderStatus", "ProcurementOrderStatus", "ApplicationStatus",
    "AdminAuditLog", "Complaint", "PlatformSetting"
]
