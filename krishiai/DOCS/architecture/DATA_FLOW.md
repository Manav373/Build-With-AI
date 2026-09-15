# 🔄 KrishiAI — Cross-Domain Data Flow & Integration Workflows

> **End-to-End Dynamic Interaction Patterns Synchronized Exclusively Through One Backend & One Database**

---

## 1. The Core Connectivity Principle

The three domains (**FARMER**, **VENDOR**, **ADMIN**) never communicate directly. All cross-domain workflows are executed through **ONE Central Backend (FastAPI)** and persisted in **ONE Master Database (SQLite/PostgreSQL)**:

```text
               ┌──────────────┐
               │    FARMER    │
               │  (Port 5173) │
               └──────┬───────┘
                      │ HTTP Request
                      ▼
               ┌──────────────┐
               │ FASTAPI API  │ ◄────── UniversalApiClient
               │  (Port 8000) │         (JWT + X-Krishi-Domain)
               └──────┬───────┘
                      │ SQLAlchemy ORM
                      ▼
               ┌──────────────┐
               │ ONE DATABASE │
               │ (krishiai.db)│
               └──────┬───────┘
                      │ Query / Fetch
                      ├───────────────────────┐
                      ▼                       ▼
               ┌──────────────┐        ┌──────────────┐
               │    VENDOR    │        │    ADMIN     │
               │  (Port 5174) │        │  (Port 5175) │
               └──────────────┘        └──────────────┘
```

---

## 2. Master Business Flows

### Flow 1: Farmer Harvest Posting to Vendor Procurement
1. **Farmer creates harvest listing**:
   - UI: Farmer navigates to `/sell-crops` (`FarmerBrowseRequirementsPage.jsx`) and submits harvest details (crop name, quantity in quintals, expected price, photos).
   - API: Calls `POST /api/v1/farmer/listings` via `@krishiai/api`.
   - Backend: Validates input and persists record to `products` or `farmer_listings` table in `krishiai.db`.
2. **Vendor discovers listing**:
   - UI: Vendor accesses `/marketplace` or `/requirements` (`VendorRequirementsPage.jsx`).
   - API: Calls `GET /api/v1/vendor/marketplace/listings`.
   - Result: Farmer's posted harvest appears dynamically in the Vendor's feed.
3. **Admin monitors transaction**:
   - UI: Admin navigates to `/marketplace` (`AdminProductModerationPage.jsx`).
   - API: Calls `GET /api/v1/admin/listings`.
   - Result: Admin views real-time listing volume and moderates content if necessary.

---

### Flow 2: Vendor Tender & Farmer Proposal
1. **Vendor publishes tender**:
   - UI: Vendor navigates to `/tenders` (`VendorTendersPage.jsx`) and creates a buying tender (e.g., 500 Quintals of Sharbati Wheat with specific moisture criteria).
   - API: Calls `POST /api/v1/vendor/tenders`.
   - Backend: Persists to `buying_requirements` table with status `OPEN`.
2. **Farmer discovers & applies to tender**:
   - UI: Farmer views tenders on the Marketplace desk.
   - API: Calls `POST /api/v1/farmer/tenders/{id}/apply`.
   - Backend: Inserts application into `farmer_applications` table.
3. **Vendor reviews & negotiates**:
   - UI: Vendor navigates to `/applications` (`VendorApplicationsPage.jsx`) and counter-offers on price via `/negotiations` (`VendorNegotiationPage.jsx`).
   - API: Calls `POST /api/v1/vendor/negotiate`.

---

### Flow 3: Order Execution & Escrow Release
1. **Offer Accepted & Order Created**:
   - Agreement between Farmer and Vendor creates a confirmed order record in `customer_orders` / `procurement_orders`.
2. **Order Lifecycle**:
   - Status transitions from `PENDING` ➔ `CONFIRMED` ➔ `DISPATCHED` ➔ `DELIVERED`.
   - Both Farmer (`/orders`) and Vendor (`/orders`) see live order status updates queried from the central backend.
3. **Admin Escrow Settlement**:
   - Admin monitors the order via `/orders` (`AdminOrdersPage.jsx`).
   - Upon confirmed delivery, payment is released from escrow to the farmer's account.

---

## 3. Dynamic Real-Time Synchronization

- **No Hardcoded Static Data**: All tables, cards, and feeds fetch live state on mount and update on mutation.
- **Request Metadata**: Every frontend API call sends the `X-Krishi-Domain` header (`farmer`, `vendor`, or `admin`) alongside the `Bearer <jwt_token>` to identify the source domain for backend analytics and authorization.
