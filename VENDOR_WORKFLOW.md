# 🌾 KrishiAI — Complete Vendor Workflow & Data Flow Specification

This document provides a comprehensive specification of the **KrishiAI Vendor System**, detailing the end-to-end workflow, data pipelines, business state transitions, and step-by-step mapping of **"where to where things go"** across the platform.

---

## 📑 Table of Contents
1. [System Architecture Overview](#1-system-architecture-overview)
2. [Vendor Roles & Business Models](#2-vendor-roles--business-models)
3. [End-to-End Workflow Diagram](#3-end-to-end-workflow-diagram)
4. [Detailed Step-by-Step Lifecycle Flows](#4-detailed-step-by-step-lifecycle-flows)
   - [Flow 1: Vendor Registration & Business Onboarding](#flow-1-vendor-registration--business-onboarding)
   - [Flow 2: Admin Moderation & Account Verification](#flow-2-admin-moderation--account-verification)
   - [Flow 3: Product Listing, AI Moderation & Marketplace Publishing](#flow-3-product-listing-ai-moderation--marketplace-publishing)
   - [Flow 4: B2B Crop Procurement, Bidding & Negotiation](#flow-4-b2b-crop-procurement-bidding--negotiation)
   - [Flow 5: AI Crop Inspection, Warehouse Storage & Logistics](#flow-5-ai-crop-inspection-warehouse-storage--logistics)
   - [Flow 6: Financials, Wallet Balance & Bank Payouts](#flow-6-financials-wallet-balance--bank-payouts)
5. [Data Flow Mapping: "Where Things Go"](#5-data-flow-mapping-where-things-go)
6. [Complete Dashboard Navigation & Router Map](#6-complete-dashboard-navigation--router-map)

---

## 1. System Architecture Overview

The **KrishiAI Vendor Ecosystem** connects three primary entities:
- **Vendors** (Input Sellers, Crop Buyers, or Hybrid Enterprise Hubs)
- **Farmers** (Crop Sellers & Agri-Input Buyers)
- **Admins** (Marketplace Moderation & Quality Auditors)

```
                       ┌────────────────────────────────┐
                       │   Role Selection & Onboarding   │
                       └───────────────┬────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │  Admin Moderation & Approval   │
                       └───────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼                                             ▼
  ┌───────────────────────────┐                 ┌───────────────────────────┐
  │  Procurement Vendor Flow  │                 │    Agri Input Seller Flow │
  └─────────────┬─────────────┘                 └─────────────┬─────────────┘
                │                                             │
  • Post Buying Requirements                     • List Seeds / Bio-Fertilizers
  • Contract Farming & Tenders                   • Product Moderation Approval
  • Farmer Offer Negotiation                     • Public Store Marketplace
  • AI Quality Moisture Scan                     • Customer Order Delivery
  • Farm-Gate Fleet Dispatch                     • Revenue Bank Settlement
                │                                             │
                └──────────────────────┬──────────────────────┘
                                       │
                                       ▼
                       ┌────────────────────────────────┐
                       │   Revenue Analytics & Payout   │
                       └────────────────────────────────┘
```

---

## 2. Vendor Roles & Business Models

The system supports **3 Vendor Business Types**:

| Vendor Type | Code | Core Functions | Key Dashboard Tabs |
|---|---|---|---|
| 🏭 **Procurement Vendor** | `procurement` | Bulk crop buying, contract farming agreements, tenders, farm-gate pickup | Requirements, Tenders, Applications, Negotiation, AI Quality, Logistics |
| 🏪 **Input Seller** | `seller` | Retailing seeds, bio-fertilizers, pesticides, tools, and heavy machinery | Products, Inventory, Orders, Customers, Promotions, Reviews |
| 🔄 **Hybrid Vendor** | `hybrid` | **Both** buying raw crops from farmers AND selling input products | All 23 Dashboard Tabs Active |

---

## 3. End-to-End Workflow Diagram

```
[Vendor Registration] ---> [Admin Verification] ---> [Vendor Dashboard Active]
                                                               │
     ┌─────────────────────────────────────────────────────────┴────────────────────────────────────────────────────────┐
     │                                                                                                                  │
     ▼ (Input Seller Path)                                                                                              ▼ (Crop Procurement Path)
[Add Product Listing]                                                                                             [Post Buying Requirement / Tender]
     │                                                                                                                  │
     ▼                                                                                                                  ▼
[Status: Pending Review]                                                                                          [Visible on Farmer "Sell Crops" Page]
     │                                                                                                                  │
     ▼ (Admin Approves via /vendor-dashboard/admin)                                                                    ▼ (Farmer Submits Crop Offer)
[Status: Published]                                                                                               [Application Appears in Dashboard]
     │                                                                                                                  │
     ▼                                                                                                                  ▼
[Visible in Public Marketplace /vendors]                                                                          [Negotiation Desk: Counter / Accept]
     │                                                                                                                  │
     ▼ (Farmer Orders Product)                                                                                          ▼ (Deal Finalized)
[Order Status: Packed -> Dispatched -> Delivered]                                                                [AI Crop Quality Scan (Moisture & Grade)]
     │                                                                                                                  │
     ▼                                                                                                                  ▼
[Revenue Credited to Vendor Wallet Balance] <----------------────────────────────────────────────────── [Farm-Gate Pickup Truck Dispatched]
     │
     ▼
[Withdrawal Payout to HDFC Bank Account via RazorpayX (UTR Generated)]
```

---

## 4. Detailed Step-by-Step Lifecycle Flows

### Flow 1: Vendor Registration & Business Onboarding
1. **User Action**: Clicks **"🏪 Vendor Portal"** or chooses **"Vendor"** in the Role Selection Modal.
2. **Navigation**: `/vendor-type-select` → Selects business type (`procurement`, `seller`, or `hybrid`).
3. **Auth Screen**: `/vendor-sign-up` → Authenticates via Clerk (or enters demo login credentials).
4. **Onboarding Wizard**: `/vendor-onboarding?type=hybrid`
   - **Step 1**: Business Info (Company Name, Owner Name, Contact Phone, Email).
   - **Step 2**: GSTIN, APMC Mandi License number, Aadhaar ID verification.
   - **Step 3**: Bank Account Details (Bank Name, Account Number, IFSC code).
   - **Step 4**: Service Parameters (Delivery radius in km, operating hours, warehouse location).
5. **Database Result**: Creates `Vendor` record with `status = "pending"` or `status = "verified"`.
6. **Destination**: Redirects user to `/vendor-dashboard`.

---

### Flow 2: Admin Moderation & Account Verification
1. **User Role**: System Admin accessing `/vendor-dashboard/admin`.
2. **Pending Queue**: Fetches pending requests via `GET /api/vendor/admin/pending`.
3. **Review Action**: Admin views vendor GST details and clicks **"Verify Vendor Account"** or **"Reject"**.
4. **Backend API**: Executes `POST /api/vendor/admin/verify/{vendor_id}` with `{ "action": "approve" }`.
5. **State Transition**:
   - `Vendor.status` changes from `pending` → `verified`.
   - `Vendor.is_verified` set to `True`.
   - `Vendor.verified_at` stamped with current timestamp.
6. **Result**: Verified badge `✓ VERIFIED VENDOR` appears on the vendor's public store profile.

---

### Flow 3: Product Listing, AI Moderation & Marketplace Publishing
1. **Vendor Action**: Navigates to `/vendor-dashboard/products` and clicks **"Add New Product"**.
2. **Submission**: Fills in Name, Category, MRP, Selling Price, Stock Quantity, Unit (kg/packet/litre), and Image URL.
3. **Backend API**: `POST /api/vendor/products`
4. **Database State**: `Product` created with `status = "pending_review"`.
5. **Moderation Queue**: Product appears in Admin Approval Center at `/vendor-dashboard/admin`.
6. **Admin Approval**: Admin clicks **"Approve & Publish"** (`POST /api/vendor/admin/products/{id}/review?action=approve`).
7. **State Transition**:
   - `Product.status` changes from `pending_review` → `published`.
   - `Product.published_at` set to current timestamp.
8. **Destination**: Product immediately becomes live on the public Marketplace directory (`/vendors`) and vendor store profile (`/vendor/:vendorId`).

---

### Flow 4: B2B Crop Procurement, Bidding & Negotiation
1. **Vendor Action**: Navigates to `/vendor-dashboard/requirements` or `/vendor-dashboard/tenders` and clicks **"Post Buying Requirement"**.
2. **Form Entry**: Specifies Target Crop (e.g., *Cotton शंकर-6*), Required Quantity (*200 Quintal*), Target Price (*₹7,400/qtl*), Max Moisture (*8%*), Delivery Location, and Deadline.
3. **Backend API**: `POST /api/vendor/requirements` (creates `VendorRequirement` or `BulkRFQ`).
4. **Farmer Discovery**: Requirement immediately publishes to the public Farmer Portal at `/sell-crops` (*Sell Produce to Buyers*).
5. **Farmer Offer**: Farmer clicks **"Submit Sale Offer"** (`POST /api/vendor/requirements/{id}/apply`).
6. **Vendor Inbox**: Application lands in Vendor Dashboard under `/vendor-dashboard/applications`.
7. **Negotiation Desk**: Vendor opens `/vendor-dashboard/negotiation` to view counter-prices.
   - Vendor enters counter price (e.g. *₹7,350/qtl*) and clicks **"Counter"**.
   - Round increments (Round 1 → Round 2).
   - Once agreed, vendor clicks **"Accept Deal"**.
8. **Result**: Converts into confirmed Procurement Order (`PO-2026-08-0099`) under `/vendor-dashboard/procurement-orders`.

---

### Flow 5: AI Crop Inspection, Warehouse Storage & Logistics
1. **AI Quality Inspection**:
   - Vendor/Auditor opens `/vendor-dashboard/ai-quality`.
   - Uploads crop sample photo or runs camera scan.
   - Backend `POST /api/vendor/ai-inspection/scan` analyzes computer vision parameters:
     - **Grade**: Grade A (Premium Export Quality)
     - **Moisture**: 7.2% (Within safe storage limit)
     - **Foreign Matter**: 0.4%
     - **Mandi Price Benchmark**: ₹7,450/qtl
2. **Logistics Dispatch**:
   - Vendor opens `/vendor-dashboard/logistics`.
   - Clicks **"Dispatch Fleet"** (`POST /api/vendor/logistics/dispatch`).
   - Generates Digital e-Way Bill (`EWAY-MH-2026-90812`), assigns GPS Pickup Truck (`MH-12-Q-4829`), and tracks driver live location.
3. **Warehouse Entry**:
   - Truck arrives at warehouse (`/vendor-dashboard/warehouse`).
   - Actual weight recorded (*198.5 quintals*).
   - Grain assigned to **Storage Bay #4** at *Hadapsar Central Cold Storage*.

---

### Flow 6: Financials, Wallet Balance & Bank Payouts
1. **Revenue Accrual**:
   - Upon successful product delivery or crop receipt verification, transaction amount is credited to Vendor Wallet Balance (`total_revenue`).
2. **Financial Intelligence**:
   - Vendor views revenue trends, area graphs, and wallet balance at `/vendor-dashboard/analytics`.
3. **Payout Request**:
   - Vendor enters withdrawal amount (e.g., *₹50,000*) and clicks **"Request Bank Withdrawal"**.
4. **Backend API**: `POST /api/vendor/financials/payout`
5. **Execution**:
   - Deducts withdrawal amount from `wallet_balance`.
   - Initiates RazorpayX / IMPS payout to registered HDFC bank account.
   - Generates UTR reference code (`UTR20260813948210`).
   - Appends payout record to Financial History Table.

---

## 5. Data Flow Mapping: "Where Things Go"

| Trigger / User Event | Where it originates (UI) | API Endpoint Hit | DB Model Mutated | Where it goes next (UI) |
|---|---|---|---|---|
| **Vendor Onboarding** | `/vendor-onboarding` | `POST /api/vendor/register` | `Vendor` | `/vendor-dashboard` |
| **Admin Vendor Verification** | `/vendor-dashboard/admin` | `POST /api/vendor/admin/verify/{id}` | `Vendor` | `/vendors` (Badge added) |
| **Add Product** | `/vendor-dashboard/products` | `POST /api/vendor/products` | `Product` | `/vendor-dashboard/admin` (Pending Review) |
| **Admin Approve Product** | `/vendor-dashboard/admin` | `POST /api/vendor/admin/products/{id}/review` | `Product` | `/vendors` & `/vendor/:id` (Live Marketplace) |
| **Post Crop Buying Req** | `/vendor-dashboard/requirements` | `POST /api/vendor/requirements` | `VendorRequirement` | `/sell-crops` (Farmer view) |
| **Farmer Crop Offer** | `/sell-crops` | `POST /api/vendor/requirements/{id}/apply` | `FarmerRequirementApplication` | `/vendor-dashboard/applications` |
| **Price Negotiation** | `/vendor-dashboard/negotiation` | `POST /api/vendor/applications/{id}/negotiate` | `FarmerRequirementApplication` | `/vendor-dashboard/procurement-orders` |
| **AI Crop Scan** | `/vendor-dashboard/ai-quality` | `POST /api/vendor/ai-inspection/scan` | `AIQualityInspection` | Quality Certificate on PO |
| **Fleet Dispatch** | `/vendor-dashboard/logistics` | `POST /api/vendor/logistics/dispatch` | `LogisticsShipment` | `/vendor-dashboard/logistics` (Live GPS Tracker) |
| **Warehouse Entry** | `/vendor-dashboard/warehouse` | `POST /api/vendor/warehouse/assign` | `WarehouseStorage` | Capacity Gauge Meter |
| **Stock Edit** | `/vendor-dashboard/inventory` | `PUT /api/vendor/products/{id}/stock` | `Product` | Stock Table & Low-Stock Alerts |
| **Coupon Create** | `/vendor-dashboard/promotions` | `POST /api/vendor/promotions` | `Promotion` | Product Checkout & Promos Grid |
| **Request Bank Payout** | `/vendor-dashboard/analytics` | `POST /api/vendor/financials/payout` | `VendorPayout` & `Vendor` | Wallet Balance & UTR Table |

---

## 6. Complete Dashboard Navigation & Router Map

Below is the complete mapping of all **23 Dashboard Tabs** in [`main.jsx`](file:///c:/Users/Asus%20Laptop/OneDrive/Desktop/Create%20with%20AI/krishiai-vendor/frontend/src/main.jsx) and [`VendorDashboardLayout.jsx`](file:///c:/Users/Asus%20Laptop/OneDrive/Desktop/Create%20with%20AI/krishiai-vendor/frontend/src/pages/VendorDashboardLayout.jsx):

```
/vendor-dashboard
├── (Index) --------------------> VendorDashboardHome.jsx       (Overview metrics & quick action buttons)
├── company-profile ------------> VendorCompanyProfilePage.jsx  (Business details, GSTIN, APMC license)
├── store-profile ---------------> VendorCompanyProfilePage.jsx  (Store hours, logo, delivery radius)
├── requirements ---------------> VendorRequirementsPage.jsx    (Crop buying posts & quantity targets)
├── tenders --------------------> VendorTendersPage.jsx         (Bulk RFQ tenders & contract farming)
├── applications ---------------> VendorApplicationsPage.jsx    (Farmer crop sale bids)
├── negotiation ----------------> VendorNegotiationPage.jsx     (Interactive price negotiation desk)
├── procurement-orders ---------> VendorProcurementOrdersPage.jsx (Confirmed B2B crop purchase orders)
├── ai-quality -----------------> VendorAIQualityPage.jsx       (AI moisture & crop grade scanner)
├── warehouse ------------------> VendorWarehousePage.jsx       (Storage capacity & cold storage sensors)
├── pickup ---------------------> VendorWarehousePage.jsx       (Pickup appointment calendar)
├── logistics ------------------> VendorLogisticsPage.jsx       (e-Way Bill & live GPS truck tracker)
├── products -------------------> VendorProductsPage.jsx        (Product catalog manager & images)
├── inventory ------------------> VendorInventoryPage.jsx       (Stock quantity table & batch expiry)
├── orders ---------------------> VendorCustomerOrdersPage.jsx  (Retail input sales fulfillment)
├── customers ------------------> VendorCustomerOrdersPage.jsx  (Farmer customer contact directory)
├── promotions -----------------> VendorPromotionsPage.jsx      (Coupon code builder & discounts)
├── reviews --------------------> VendorReviewsPage.jsx         (Farmer ratings & review replies)
├── payments -------------------> VendorSettingsPage.jsx        (Bank payout account & IFSC code)
├── analytics ------------------> VendorAnalyticsPage.jsx       (Revenue charts, wallet balance & payouts)
├── admin ----------------------> VendorAdminPage.jsx           (Admin moderation & product approvals)
├── notifications --------------> VendorSettingsPage.jsx        (SMS & WhatsApp alert preferences)
├── documents ------------------> VendorDocumentsPage.jsx       (Aadhaar, PAN, APMC & GST doc vault)
└── settings -------------------> VendorSettingsPage.jsx        (Security & account preferences)
```
