"""
DATABASE/domains/admin – Admin & Governance Domain Models & Schema
-------------------------------------------------------------------
"""
try:
    from DATABASE.models.admin import AdminAuditLog, Complaint, PlatformSetting
except ImportError:
    from database.models.admin import AdminAuditLog, Complaint, PlatformSetting

__all__ = [
    "AdminAuditLog", "Complaint", "PlatformSetting"
]
