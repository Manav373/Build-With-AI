# 🗄️ DATABASE — KrishiAI Unified Master Database

> **Single Unified Database Architecture Storing All Platform Domain Data**

This folder serves as the **central, unified database repository** for the entire KrishiAI platform. All domain data across **Farmer**, **Vendor**, **Admin**, and **Common** domains is maintained within this single database ecosystem.

---

## 🏛️ Architecture & Directory Layout

```
DATABASE/
├── __init__.py                  # Master package exports (Base, engine, SessionLocal, get_db, all models)
├── README.md                    # Database documentation
│
├── data/                        # Physical Database Store
│   ├── krishiai.db              # Single SQLite database containing all 30+ domain tables
│   └── seed_all_domains.py      # Database health check & domain record inspection script
│
├── connection/                  # SQLAlchemy Engine & Migration Helpers
│   ├── __init__.py
│   ├── connection.py            # Unified SessionLocal, Engine, declarative Base, and get_db()
│   └── sync.py                  # Auto-sync schema and table migration engine
│
├── models/                      # Unified ORM Entities (SQLAlchemy)
│   ├── __init__.py              # Central model index exporting all domain entities
│   ├── farmer.py                # FarmerLocation, MarketRecord, MarketGeocode, CallHistory, CommunityMessage
│   ├── vendor.py                # Vendor, Product, BuyingRequirement, Order, WarehouseSlot, Tender, etc.
│   ├── admin.py                 # AdminAuditLog, Complaint, PlatformSetting
│   ├── common.py                # UserProfile, SystemNotification
│   ├── community_model.py       # Peer-to-peer farmer discussions
│   ├── location.py              # Geolocation coordinates
│   ├── market.py                # Mandi price records & market cache
│   └── vapi_model.py            # Voice assistant call history logs
│
└── domains/                     # Domain Data Modules
    ├── farmer/                  # Farmer domain data & models
    ├── vendor/                  # Vendor domain data & models
    ├── admin/                   # Admin governance domain data & models
    └── common/                  # Cross-domain shared schemas
```

---

## 📊 Domains & Tables Catalog

| Domain | Entities / Tables | Purpose |
|---|---|---|
| **🌾 FARMER** | `farmer_locations`, `market_records`, `market_geocodes`, `call_history`, `community_messages` | Agronomist chat history, mandi rates, crop diagnosis, geo-locations |
| **🏪 VENDOR** | `vendors`, `vendor_documents`, `products`, `buying_requirements`, `farmer_applications`, `customer_orders`, `procurement_orders`, `reviews`, `vendor_notifications` | B2B tenders, price negotiations, buyer catalog, AI quality inspection, warehouse |
| **🛡️ ADMIN** | `admin_audit_logs`, `complaints`, `platform_settings` | Governance audit trails, vendor moderation, platform escrow dispute resolution |
| **🔗 COMMON** | `user_profiles`, `system_notifications` | SSO user credentials, roles (FARMER, VENDOR, ADMIN), platform notifications |

---

## 💻 Python Usage Examples

### 1. Database Dependency Injection (FastAPI)
```python
from fastapi import Depends
from sqlalchemy.orm import Session
from DATABASE import get_db

@app.get("/items")
def read_items(db: Session = Depends(get_db)):
    ...
```

### 2. Querying Domain Models
```python
# Unified imports directly from DATABASE
from DATABASE import (
    FarmerLocation,
    MarketRecord,
    Vendor,
    BuyingRequirement,
    AdminAuditLog,
    UserProfile
)

# Example query
farmers = db.query(FarmerLocation).filter(FarmerLocation.state == "Punjab").all()
active_tenders = db.query(BuyingRequirement).filter(BuyingRequirement.status == "OPEN").all()
```

### 3. Inspect Database Tables & Records
```bash
python DATABASE/data/seed_all_domains.py
```
