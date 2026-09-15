# 🧭 KrishiAI — Routing Architecture & Route Catalog

## 1. Application-Specific Routing

Each application manages its own independent React Router route configuration with zero cross-app pollution.

---

## 2. Route Directory & Catalogs

### A. Farmer Application (`apps/farmer/src/routes/`)
- `/`: Landing & Overview
- `/chat`: AI Agronomist Interactive Chat
- `/analytics`: Soil & Nutrient Field Analytics
- `/heatmap`: Thermal & Moisture Heatmap
- `/market-prices`: Real-time Mandi Price Trends
- `/predict`: Yield & Production Prediction
- `/recommend`: Multi-Crop Recommendation Engine
- `/satellite`: GEE Satellite Vegetation Indices (NDVI, NDRE, NDWI)
- `/mandi-map`: Geospatial Live Mandi Locator
- `/schemes`: Government Subsidies & Schemes Catalog
- `/sell-crops`: Farmer Requirements & Crop Listing Desk
- `/whatsapp`: WhatsApp Automated Advisory
- `/community`: Farmer Peer Discussion & Q&A
- `/call-history`: Voice Advisory Log
- `/voice-assistant`: Hands-free Regional Voice Consultation

### B. Vendor Application (`apps/vendor/src/routes/`)
- `/`: Redirects to `/vendor-dashboard`
- `/vendor-dashboard`: Core Dashboard & Analytics
- `/vendor-dashboard/company-profile`: Business Profile & Verification
- `/vendor-dashboard/requirements`: Crop Procurement Listings
- `/vendor-dashboard/tenders`: Contract Farming Tenders
- `/vendor-dashboard/applications`: Farmer Tender Proposals
- `/vendor-dashboard/negotiation`: Real-time Price Negotiation
- `/vendor-dashboard/procurement-orders`: Farmer-to-Vendor Bulk Orders
- `/vendor-dashboard/ai-quality`: AI Crop Quality Grading
- `/vendor-dashboard/warehouse`: Inward/Outward Inventory
- `/vendor-dashboard/pickup`: Fleet Dispatch & Pickup Scheduling
- `/vendor-dashboard/logistics`: Shipment Tracking
- `/vendor-dashboard/products`: Catalog Management
- `/vendor-dashboard/inventory`: Stock Tracking
- `/vendor-dashboard/orders`: Direct-to-Farmer Supply Orders
- `/vendor-dashboard/promotions`: Discounts & Deals
- `/vendor-dashboard/reviews`: Ratings & Feedback
- `/vendor-dashboard/payments`: Escrow Ledger & Payout Requests
- `/vendor-dashboard/documents`: Statutory Certificates & KYC
- `/vendor-dashboard/settings`: Account & Store Configurations

### C. Admin Application (`apps/admin/src/routes/`)
- `/`: Redirects to `/admin/dashboard`
- `/admin/dashboard`: Platform Health, Telemetry & KPI Overview
- `/admin/users`: Cross-Domain User Directory (Farmers, Vendors, Admins)
- `/admin/vendor-verification`: Statutory KYC & License Approvals
- `/admin/product-moderation`: Catalog Compliance & Banned Chemical Filter
- `/admin/orders`: Escrow & Logistics Transaction Stream
- `/admin/complaints`: Grievance & Dispute Arbitration Desk
- `/admin/schemes`: Government Subsidy Dataset Management
- `/admin/audit-logs`: Immutable Security & Administrative Audit Trail
