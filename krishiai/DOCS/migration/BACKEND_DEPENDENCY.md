# 🔌 KrishiAI — Backend Dependency & Limitations Catalog

> **Documentation of Frontend Dependencies, Existing APIs, and Backend Capability Alignments**
> *(Adhering to the Absolute Backend Protection Rule)*

---

## 1. Governance Principles

As dictated by the **Absolute Backend Protection Rule**:
1. The backend is strictly read-only.
2. If any frontend domain requires an endpoint that is not implemented in the backend, the frontend MUST NOT modify backend code.
3. The frontend utilizes existing API endpoints or isolated graceful fallbacks, and the dependency is explicitly cataloged in this document.

---

## 2. Cataloged Dependencies & Endpoint Mappings

### Dependency Item 1: Vendor Dashboard Summary Stats
- **Requirement**: Display consolidated counts of pending bids, active shipments, and total warehouse capacity on the Vendor Dashboard.
- **Affected Frontend Feature**: `VENDOR/src/pages/VendorDashboardHome.jsx`
- **Existing API**:
  - `GET /api/vendor/me` (Returns vendor profile, active status, business type)
  - `GET /api/vendor/orders` (Returns current order list)
  - `GET /api/vendor/requirements` (Returns buying requirements)
- **Missing Capability**: Dedicated single-trip `/api/vendor/dashboard/stats` aggregator endpoint.
- **Frontend Action**: The frontend aggregates summary numbers dynamically on the client side using existing `/api/vendor/me`, `/api/vendor/orders`, and `/api/vendor/requirements` endpoints with local fallback defaults when the aggregator endpoint returns 404.
- **Backend Change Required**: *(Do not implement)* Future enhancement can add `GET /api/v1/vendor/dashboard/stats` aggregating count of records.

---

### Dependency Item 2: Mandi Price Real-Time Geocoding
- **Requirement**: Display distance in kilometers from the farmer's GPS coordinates to physical APMC Mandis.
- **Affected Frontend Feature**: `FARMER/src/components/feature/MandiMap.jsx` & `MarketPricePage.jsx`
- **Existing API**:
  - `GET /api/farmer/mandi/prices` (Returns commodity rates for selected district)
  - `GET /api/farmer/mandi/nearby` (Returns lat/lon of mandis)
- **Missing Capability**: Dynamic road-network driving route distance matrix.
- **Frontend Action**: Frontend uses `@krishiai/utils` (`geoUtils.js` Haversine distance calculator) to calculate direct aerial distance from the user's coordinates to the APMC coordinates provided by the backend.
- **Backend Change Required**: *(Do not implement)* Future OSRM / Google Maps API proxy endpoint.

---

### Dependency Item 3: Admin Instant Dispute Arbitration
- **Requirement**: Real-time escrow payment freeze/release action on reported transactions.
- **Affected Frontend Feature**: `ADMIN/src/pages/AdminComplaintsPage.jsx` & `AdminOrdersPage.jsx`
- **Existing API**:
  - `GET /api/admin/orders` (Lists orders)
  - `GET /api/admin/complaints` (Lists active grievances)
  - `POST /api/admin/complaints/{id}/resolve` (Updates complaint status)
- **Missing Capability**: Direct banking / payment gateway webhook trigger.
- **Frontend Action**: Updates complaint status to 'Resolved' or 'Escalated' via `POST /api/admin/complaints/{id}/resolve`, which updates the single database state.
- **Backend Change Required**: *(Do not implement)* Razorpay / Cashfree escrow payout webhook integration.

---

## 3. Standard for Handling Future Dependencies
If any future frontend feature discovers an unmapped backend endpoint:
1. Do not touch Python / FastAPI files.
2. Check existing routes in `DOCS/api/API_MAPPING.md`.
3. Provide isolated, type-safe fallback in the frontend service layer.
4. Record the gap in this document.
