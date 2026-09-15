"""
DATABASE/domains/common – Cross-Domain Common User & System Models
-------------------------------------------------------------------
"""
try:
    from DATABASE.models.common import UserProfile, SystemNotification
except ImportError:
    from database.models.common import UserProfile, SystemNotification

__all__ = [
    "UserProfile", "SystemNotification"
]
