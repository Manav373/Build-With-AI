# 🗄️ KrishiAI — Master Database Architecture

> **Single Unified Database Serving Farmer, Vendor, and Admin Domains**
> *(Master Physical Store: `backend/krishiai.db` SQLite / PostgreSQL)*

---

## 1. The Single Database Mandate

In strict accordance with the KrishiAI master specification:
- **No Domain Silos**: There is strictly **ONE master database** powering the KrishiAI platform.
- **No Separate DB Instances**: Farmer, Vendor, and Admin data reside in the same physical relational schema.
- **Relational Integrity**: Cross-domain entities (such as a Farmer applying for a Vendor Tender, or an Admin arbitrating an Order) share foreign keys and referential integrity inside this single store.

---

## 2. Master Entity Catalog (30+ Tables)

```text
                               ┌───────────────────────────┐
                               │       users (COMMON)      │
                               │ id, user_id, phone, role  │
                               └─────────────┬─────────────┘
                                             │
                 ┌───────────────────────────┼───────────────────────────┐
                 │                           │                           │
                 ▼                           ▼                           ▼
    ┌─────────────────────────┐ ┌─────────────────────────┐ ┌─────────────────────────┐
    │     FARMER DOMAIN       │ │      VENDOR DOMAIN      │ │      ADMIN DOMAIN       │
    ├─────────────────────────┤ ├─────────────────────────┤ ├─────────────────────────┤
    │ farmer_locations        │ │ vendors                 │ │ admin_audit_logs        │
    │ market_prices           │ │ vendor_documents        │ │ complaints              │
    │ market_geocodes         │ │ products                │ │ platform_settings       │
    │ call_history            │ │ buying_requirements     │ └─────────────────────────┘
    │ community_messages      │ │ farmer_applications     │
    └─────────────────────────┘ │ customer_orders         │
                                │ procurement_orders      │
                                │ reviews                 │
                                │ warehouse_slots         │
                                └─────────────────────────┘
```

### A. Common Master Tables
1. `users`: Master single-sign-on table storing user credentials, mobile numbers, and primary role (`farmer`, `vendor`, `admin`).
2. `system_notifications`: Targeted broadcast and transactional alerts.

### B. Farmer Domain Tables
1. `farmer_locations`: GPS coordinates, village, taluka, district, and state of farmer land holdings.
2. `market_prices`: Historical and live APMC mandi records (min, max, modal prices by commodity and variety).
3. `market_geocodes`: Cached latitude/longitude for APMC physical yards across India.
4. `call_history`: Voice advisory transcripts, recordings, and duration logs.
5. `community_messages`: Peer-to-peer farmer discussions and agronomy tips.

### C. Vendor Domain Tables
1. `vendors`: Corporate entity records, GSTIN, trade licenses, verification status.
2. `vendor_documents`: KYC attachments (Fertilizer License, Seed Certification, PAN, GST).
3. `products`: Agri-inputs retail catalog (seeds, fertilizers, machinery) with pricing and stock.
4. `buying_requirements`: B2B procurement tenders published by bulk aggregators.
5. `farmer_applications`: Proposals and bids submitted by farmers against vendor tenders.
6. `customer_orders`: Retail supply orders placed by farmers for agri-inputs.
7. `procurement_orders`: Large-scale crop purchase contracts between vendors and farmers.
8. `warehouse_slots`: Storage space management, inward batch codes, and shelf-life tracking.
9. `reviews`: Rating and feedback scores between farmers and vendors.

### D. Admin Governance Tables
1. `admin_audit_logs`: Immutable record of every administrative action, IP address, and changed entity.
2. `complaints`: Grievances submitted by farmers or vendors with dispute status and arbitration findings.
3. `platform_settings`: Global platform flags (maintenance mode, transaction commission rates, AI model endpoints).

---

## 3. Database Connectivity & Engine Configuration

- **ORM Framework**: SQLAlchemy 2.0+ (declarative Base)
- **Local Development**: SQLite (`sqlite:///./krishiai.db`)
- **Production Staging & Live**: PostgreSQL (`postgresql://user:pass@host:5432/krishiai`) via `DATABASE_URL` environment variable.
- **Connection Pool**: `QueuePool` with `pool_size=20`, `max_overflow=10`, `pool_recycle=3600`.
- **Central Access Point**: `backend.database.connection.connection.get_db` handles session injection across all FastAPI endpoints.
