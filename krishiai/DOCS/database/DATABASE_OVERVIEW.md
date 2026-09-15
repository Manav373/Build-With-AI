# 🗄️ DATABASE — KrishiAI Single Unified Database

> **Single Source of Truth for Farmer, Vendor, and Admin Domains**

---

## 🏛️ One Database Architecture

KrishiAI operates on **ONE common relational database**. There are no separate databases for Farmer, Vendor, or Admin. 

- **Physical Store**: `backend/krishiai.db` (SQLite for local development) / PostgreSQL in production via `DATABASE_URL`.
- **ORM Engine**: SQLAlchemy 2.0+ declarative models in `backend/database/models/`.
- **Session Provider**: `get_db()` dependency in `backend/database/connection/connection.py`.

```text
                                ONE DATABASE
                         (PostgreSQL / SQLite)
                                     │
           ┌─────────────────────────┼─────────────────────────┐
           │                         │                         │
           ▼                         ▼                         ▼
     🌾 FARMER                   🏪 VENDOR                 🛡️ ADMIN
- farmer_locations           - vendors                 - admin_audit_logs
- market_prices              - products                - complaints
- market_geocodes            - buying_requirements     - platform_settings
- call_history               - customer_orders         
- community_messages         - warehouse_slots         
```

---

## 📁 Directory Layout

```
DATABASE/
├── documentation/             # ERD diagrams, relationships & design rules
├── configuration/             # Pooling settings, SQLite/PostgreSQL connection specs
├── schema-documentation/      # Detailed column definitions for all 30+ tables
└── README.md                  # This file
```

---

## 🔒 Access Rule

Frontend applications **NEVER** connect directly to the database. All reads and writes must pass through the **Central FastAPI Backend** (`http://localhost:8000`), ensuring security, authorization, and data integrity.
