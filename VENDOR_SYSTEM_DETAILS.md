# KrishiAI Vendor Ecosystem — Technical & Functional Specification

## Executive Summary

The **KrishiAI Multi-Vendor Marketplace Ecosystem** is a core component of the KrishiAI platform. It connects agricultural input suppliers, equipment sellers, crop procurement buyers, traders, and food processors directly with farmers.

The system supports three distinct operational models for vendors:
1. **Procurement Vendors (Buyers)**: Purchase raw crops and agricultural produce directly from farmers.
2. **Seller Vendors (Suppliers)**: Sell seeds, fertilizers, pesticides, tools, and farming machinery to farmers.
3. **Hybrid Vendors**: Perform both procurement of crops and retail selling of agricultural inputs.

---

## Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                  FRONTEND (Vite + React)                          |
+-----------------------------------------------------------------------------------+
|  Vendor Registration & Onboarding  |  Vendor Dashboard & Inventory  |  Public Storefront  |
|  - VendorTypeSelectionPage         - VendorDashboardLayout           - VendorMarketplace   |
|  - VendorSignUpPage                - VendorProductsPage              - FarmerBrowseReqs    |
|  - VendorOnboardingPage            - VendorRequirementsPage          - VendorProfilePage   |
|                                    - VendorApplicationsPage                               |
+-----------------------------------------------------------------------------------+
                                         |
                                 REST API (Axios)
                                         v
+-----------------------------------------------------------------------------------+
|                                 BACKEND (FastAPI + SQLAlchemy)                    |
+-----------------------------------------------------------------------------------+
|  API Router: /api/vendor/*                                                        |
|  - Authentication & Auth Guard (Clerk / JWT)                                       |
|  - Vendor Registration & Identity Verification                                    |
|  - Product Management & Admin Review Workflow                                     |
|  - Crop Procurement Requirements & Farmer Offer Negotiation                      |
|  - Order Fulfillment & Warehouse Inspection Tracking                             |
|  - Admin Moderation & Trust Scoring System                                        |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                                   DATABASE (SQLite / PostgreSQL)                   |
+-----------------------------------------------------------------------------------+
|  tables: vendors, vendor_documents, products, buying_requirements,                |
|          farmer_applications, customer_orders, procurement_orders, reviews,         |
|          vendor_notifications                                                     |
+-----------------------------------------------------------------------------------+
```

---

## Data Models & Schema (`backend/app/models/vendor.py`)

### 1. `vendors` (Vendor Profile)
Primary entity storing business identity, verification details, and location intelligence.

| Field | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique vendor ID |
| `clerk_user_id` | String | Associated user account ID |
| `vendor_type` | Enum | `procurement`, `seller`, `hybrid` |
| `status` | Enum | `pending`, `under_review`, `verified`, `suspended`, `rejected` |
| `business_name` | String | Name of enterprise / store |
| `owner_name` | String | Owner / Manager name |
| `phone` / `email` | String | Contact details |
| `gst_number` | String | Unique GST registration number |
| `id_proof_type` / `_number` / `_file` | String | Aadhaar, PAN, Voter ID, DL |
| `trade_license_type` / `_number` / `_file` | String | APMC, Seeds/Fertilizer License, Shop Act, FSSAI |
| `street_address`, `district`, `state`, `pincode` | String | Business address |
| `latitude`, `longitude` | Float | Geo-coordinates for location matching |
| `is_verified` / `is_trusted` | Boolean | Admin verification & trust status |
| `trust_score` | Integer | System confidence rating (0 - 100) |
| `rating` / `total_reviews` | Float / Int | Aggregated farmer review metrics |

---

### 2. `products` (Seller / Hybrid Catalog)
Agricultural input products listed for sale.

| Field | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Unique product ID |
| `vendor_id` | Integer (FK) | Owner vendor |
| `status` | Enum | `draft`, `pending_review`, `published`, `out_of_stock`, `discontinued`, `rejected` |
| `name` / `category` | String | Product name & category (Seeds, Fertilizers, Equipment, etc.) |
| `mrp` / `selling_price` | Float | Pricing in INR |
| `unit` | String | Pricing unit (`per kg`, `per packet`, `per piece`) |
| `stock_quantity` | Integer | Available inventory count |
| `low_stock_threshold` | Integer | Trigger for low stock alert |
| `suitable_crops` | JSON | Applicable crops (e.g. `["Wheat", "Cotton"]`) |
| `application_season` | String | `Kharif`, `Rabi`, `Zaid`, `All-Season` |
| `delivery_options` | String | `home_delivery`, `store_pickup`, `both` |

---

### 3. `buying_requirements` (Procurement / Hybrid)
Procurement posts created by buyers looking to purchase crops from farmers.

| Field | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Requirement ID |
| `vendor_id` | Integer (FK) | Buyer vendor ID |
| `requirement_code` | String | Unique reference code (e.g. `BR-2026-08-4821`) |
| `status` | Enum | `draft`, `active`, `fulfilled`, `expired`, `cancelled` |
| `crop_name` / `crop_variety` | String | Targeted crop and variety |
| `quantity_required` / `quantity_unit` | Float / String | E.g., `500` `quintal` |
| `quality_grade` | String | E.g., `Grade A`, `Export Quality` |
| `max_moisture_percent` | Float | Maximum allowable moisture % |
| `min_price` / `max_price` | Float | Price offering range per unit |
| `pickup_district` / `pickup_radius_km` | String / Int | Procurement boundary |
| `valid_from` / `valid_to` | DateTime | Active window |
| `payment_terms` | String | E.g., `on_pickup`, `within_24h` |

---

### 4. `farmer_applications` (Crop Bids)
Crop sale offers submitted by farmers against active buying requirements.

| Field | Type | Description |
|---|---|---|
| `id` | Integer (PK) | Application ID |
| `requirement_id` | Integer (FK) | Target requirement |
| `farmer_user_id` | String | Clerk ID of applying farmer |
| `status` | Enum | `pending`, `shortlisted`, `under_negotiation`, `accepted`, `rejected` |
| `offered_quantity` | Float | Crop quantity available for sale |
| `offered_price` | Float | Expected price per unit |
| `counter_offer_price` | Float | Vendor counter-price during negotiation |
| `negotiation_rounds` | Integer | Negotiation counter (Max 5 rounds) |
| `final_agreed_price` | Float | Agreed settlement price |
| `crop_images` | JSON | Photos uploaded by farmer |

---

### 5. `procurement_orders` & `customer_orders`
- **`customer_orders`**: Standard retail checkout orders for inputs purchased by farmers.
- **`procurement_orders`**: B2B crop procurement fulfillment workflow tracking:
  - Pickup scheduling & vehicle assignment
  - Warehouse receipt & weight verification
  - Moisture & quality grade inspection
  - Final price adjustment & digital payout release

---

### 6. Advanced Feature Models
- **`contract_farming_agreements`**: Long-term agreements between buyers and farmers with guaranteed MSP, grade bonuses, and input support.
- **`bulk_rfqs`**: High-capacity procurement tenders with multi-farmer/FPO partial bid fulfillment rules.
- **`logistics_shipments`**: Farm-gate pickup vehicle dispatching, driver contacts, distance estimation, and digital e-Way Bills.
- **`ai_quality_inspections`**: Computer vision quality scoring (moisture %, foreign matter %, grain defects) & price adjustment recommendations.
- **`vendor_payouts`**: Wallet ledger, bank account settlements, NEFT UTR numbers, and payout transaction receipts.

---

## REST API Endpoints (`backend/api/routes/vendor.py`)

### Vendor Account & Profile
- `POST /api/vendor/register` — Register new vendor with business details & document links.
- `GET /api/vendor/me` — Fetch logged-in vendor's profile & verification status.
- `PUT /api/vendor/me` — Update business profile details.
- `GET /api/vendor/profile/{vendor_id}` — Public profile endpoint returning catalog, requirements & reviews.
- `GET /api/vendor/list` — Browse directory of verified vendors with filters (type, district, category).

### Seller Product Catalog
- `POST /api/vendor/products` — Create new product listing in `draft` mode.
- `GET /api/vendor/products` — List vendor's own products (filtered by status/category).
- `PUT /api/vendor/products/{product_id}` — Edit product details or pricing.
- `POST /api/vendor/products/{product_id}/submit` — Submit draft product for admin moderation.
- `DELETE /api/vendor/products/{product_id}` — Soft delete (discontinue) product.
- `GET /api/vendor/marketplace/products` — Public endpoint for farmers to browse & search products.

### Buyer Procurement Requirements & Tenders
- `POST /api/vendor/requirements` — Create crop buying requirement.
- `POST /api/vendor/requirements/{req_id}/publish` — Publish requirement to make it active for farmers.
- `GET /api/vendor/requirements` — View vendor's created buying requirements.
- `GET /api/vendor/marketplace/requirements` — Public endpoint for farmers to view crop buying posts.
- `POST /api/vendor/tenders` — Publish high-volume bulk RFQ tender.
- `GET /api/vendor/tenders` — List active bulk procurement tenders.
- `POST /api/vendor/contracts` — Launch Contract Farming agreement program.
- `GET /api/vendor/contracts` — View active Contract Farming agreements.

### Farm-Gate Logistics & Fleet Tracker
- `POST /api/vendor/logistics/dispatch` — Dispatch transport vehicle & generate digital e-Way Bill.
- `GET /api/vendor/logistics/shipments` — View active pickup shipments & driver GPS tracking.

### AI Quality Inspection & Pricing Advisor
- `POST /api/vendor/ai-inspection/scan` — Run AI computer vision scan for crop moisture, defects & grade adjustment.

### Financial Analytics & Payout Settlements
- `GET /api/vendor/financials/overview` — Wallet balance, revenue graphs, and payout transaction history.
- `POST /api/vendor/financials/payout` — Initiate instant bank payout settlement.

### Farmer Offers & Negotiation
- `POST /api/vendor/requirements/{req_id}/apply` — Farmer submits crop offer.
- `GET /api/vendor/applications` — Vendor views incoming crop offers.
- `POST /api/vendor/applications/{app_id}/respond` — Vendor actions: `shortlist`, `reject`, `counter_offer`, `accept`.

### Admin Moderation & Analytics
- `GET /api/vendor/admin/pending` — Admin view of unverified vendor submissions.
- `POST /api/vendor/admin/verify/{vendor_id}` — Admin actions: `approve`, `reject`, `request_info`.
- `POST /api/vendor/admin/products/{product_id}/review` — Admin product approval/rejection.
- `GET /api/vendor/dashboard/stats` — Dashboard KPIs (orders, low stock items, active requirements, pending applications).

---

## Frontend Components & Pages (`frontend/src/pages`)

| Page Component | Path | Description |
|---|---|---|
| `VendorTypeSelectionPage.jsx` | `/vendor/select-type` | Choose Procurement (Buyer), Seller (Supplier), or Hybrid mode |
| `VendorSignUpPage.jsx` | `/vendor/signup` | Initial credentials & basic business info |
| `VendorOnboardingPage.jsx` | `/vendor/onboarding` | 4-step wizard: ID proof, Trade License, Bank info, Store settings |
| `VendorDashboardLayout.jsx` | `/vendor/dashboard/*` | Sidebar navigation, header, theme toggle & notification badge |
| `VendorDashboardHome.jsx` | `/vendor/dashboard` | Main metrics summary, recent orders, quick actions |
| `VendorProductsPage.jsx` | `/vendor/dashboard/products` | Catalog management table, add/edit modal, stock manager |
| `VendorRequirementsPage.jsx` | `/vendor/dashboard/requirements` | Crop buying post manager, grade specifiers, validity controls |
| `VendorTendersPage.jsx` | `/vendor-dashboard/tenders` | Contract farming program launcher & bulk RFQ tenders manager |
| `VendorApplicationsPage.jsx` | `/vendor/dashboard/applications` | Farmer offer negotiation bench (accept, counter-offer) |
| `VendorAIQualityPage.jsx` | `/vendor-dashboard/ai-quality` | AI crop quality scanner, lab moisture tester, & grade pricing advisor |
| `VendorLogisticsPage.jsx` | `/vendor-dashboard/logistics` | Vehicle fleet dispatcher, driver contact, & digital e-Way Bill viewer |
| `VendorAnalyticsPage.jsx` | `/vendor-dashboard/analytics` | Revenue & procurement charts, wallet balance, bank payout ledger |
| `VendorMarketplacePage.jsx` | `/vendors` | Public directory of verified vendors |
| `FarmerBrowseRequirementsPage.jsx` | `/farmer/requirements` | Farmer UI to find crop buyers and apply with crop photos |
| `VendorProfilePage.jsx` | `/vendor/:id` | Public profile showing badges, products, requirements, and reviews |

---

## Key Features & Business Rules

1. **Strict Admin Verification**:
   - Newly registered vendors enter `pending` state.
   - Products require admin approval before appearing in public searches to prevent fraudulent listings.
2. **Price Spread Safety Guard**:
   - Procurement buying requirements cap price range spread at **40%** to prevent predatory pricing practices.
3. **Structured Negotiation**:
   - Vendors and farmers can negotiate prices up to **5 rounds** per application before requiring settlement or rejection.
4. **Active Requirement Cap**:
   - Procurement vendors can maintain up to **10 active buying requirements** simultaneously to ensure liquidity.
5. **Trust Scoring System**:
   - Trust scores are updated based on verified document completion, fulfilled orders, farmer reviews, and average dispatch time.
6. **Smart Logistics & e-Way Integration**:
   - Automated digital e-Way Bill generation upon farm-gate vehicle dispatch with live driver phone & tracking.
7. **AI Quality Inspection & Dynamic Pricing**:
   - Computer vision crop analysis scores grain samples for moisture and foreign matter, automatically recommending grade-based price bonuses/deductions.

