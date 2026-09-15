# 🌐 KrishiAI — Domain Architecture

## 1. Domain Specialization Matrix

| Domain | Target Host | Local Port | Primary Audience | Key Workflows |
|---|---|---|---|---|
| **Farmer** | `farmer.krishiai.com` | `5173` | Farmers, Agronomists | AI Advisory, Disease Detection, Satellite Health, Mandi Prices, Schemes, Crop Selling |
| **Vendor** | `vendor.krishiai.com` | `5174` | Input Suppliers, Bulk Buyers, Millers | Procurement Tenders, Crop Bids, Warehouse & AI Quality, Product Catalog, Inventory, Logistics |
| **Admin** | `admin.krishiai.com` | `5175` | Platform Admins, Govt Officials | User Directory, Vendor KYC Approval, Product Moderation, Escrow Oversight, Dispute Mediation |

---

## 2. Cross-Domain Data Synchronization

No direct frontend-to-frontend communication exists. All interaction flows through the shared backend database:

### Workflow 1: Crop Procurement & Bidding
```text
1. Farmer posts crop requirement / listing (/sell-crops)
          ↓
2. POST /api/v1/marketplace/listings (FastAPI Backend)
          ↓
3. PostgreSQL Database updates
          ↓
4. Vendor views open listings & submits bid (/vendor-dashboard/requirements)
          ↓
5. POST /api/v1/marketplace/listings/{id}/offer
          ↓
6. Farmer receives offer notification & accepts
          ↓
7. Unified Order created in ESCROW state
          ↓
8. Admin monitors order & escrow release (/admin/orders)
```

### Workflow 2: Vendor Statutory Verification (KYC)
```text
1. Vendor completes onboarding & uploads GSTIN + Seed License (/vendor-onboarding)
          ↓
2. POST /api/vendor/register
          ↓
3. Admin receives application in KYC Queue (/admin/vendor-verification)
          ↓
4. Admin reviews documents & clicks "Verify & Activate"
          ↓
5. POST /api/v1/admin/vendors/{id}/verify (Action: "approve")
          ↓
6. Vendor receives verified status & gains full store privileges
```
