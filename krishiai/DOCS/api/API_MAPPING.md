# 📡 KrishiAI — Master API Mapping Catalog

> **Mapping of Frontend Actions to Existing FastAPI Backend Endpoints**
> *(Single Central Backend: Port 8000)*

---

## 1. Authentication & Common Endpoints (`/api/v1/auth`, `/api/v1/common`)

| Frontend Action | Existing Endpoint | HTTP Method | Request Body / Params | Response Format | Frontend State |
|---|---|---|---|---|---|
| User Login | `/api/v1/auth/login` | `POST` | `{ "phone": "...", "otp": "..." }` | `{ "access_token": "...", "user": {...} }` | `useAuth().login()` |
| Token Refresh | `/api/v1/auth/refresh` | `POST` | `{ "refresh_token": "..." }` | `{ "access_token": "...", "refresh_token": "..." }` | `tokenManager.setTokens()` |
| Fetch Profile | `/api/v1/auth/me` | `GET` | Headers: `Authorization: Bearer <token>` | `{ "id": "...", "role": "farmer", ... }` | `user` context |
| Notifications | `/api/v1/common/notifications` | `GET` | Headers: `X-Krishi-Domain: <domain>` | `[ { "id": 1, "title": "...", "read": false } ]` | Notification bell counter |

---

## 2. Farmer Domain Endpoints (`/api/v1/farmer`, `/api`)

| Frontend Action | Existing Endpoint | HTTP Method | Request / Params | Response Format | Consumer Page |
|---|---|---|---|---|---|
| AI Agronomist Chat | `/api/farmer/chat` | `POST` | `{ "message": "...", "image_base64": "..." }` | `{ "reply": "...", "confidence": 0.94 }` | `ChatPage.jsx` |
| Satellite Health Analysis | `/api/farmer/satellite/health` | `GET` | `?lat=28.7&lon=77.1&date=...` | `{ "ndvi": 0.65, "ndre": 0.42, "status": "Healthy" }` | `SatellitePage.jsx` |
| Mandi Price Lookup | `/api/farmer/mandi/prices` | `GET` | `?state=Punjab&commodity=Wheat` | `[ { "market": "Khanna", "modal_price": 2450 } ]` | `MarketPricePage.jsx` |
| Mandi Map Geocodes | `/api/farmer/mandi/nearby` | `GET` | `?lat=...&lon=...&radius=50` | `[ { "market": "...", "lat": 28.6, "lon": 77.2 } ]` | `MandiMapPage.jsx` |
| Crop Yield Prediction | `/api/farmer/predict/yield` | `POST` | `{ "soil_type": "Loamy", "rainfall": 800, ... }` | `{ "predicted_yield_quintals": 42.5 }` | `PredictPage.jsx` |
| Crop Recommendation | `/api/farmer/recommend/crops` | `POST` | `{ "N": 90, "P": 42, "K": 43, "pH": 6.8 }` | `{ "recommended": ["Wheat", "Mustard"] }` | `RecommendPage.jsx` |
| Post Harvest Listing | `/api/v1/farmer/listings` | `POST` | `{ "crop": "Basmati", "quantity": 100, ... }` | `{ "listing_id": "...", "status": "ACTIVE" }` | `FarmerBrowseRequirementsPage.jsx` |
| Government Schemes | `/api/farmer/schemes` | `GET` | `?state=All` | `[ { "name": "PM-Kisan", "benefit": "₹6,000/yr" } ]` | `SchemesPage.jsx` |
| Voice Consultation | `/api/farmer/voice/call` | `POST` | `{ "phone": "...", "language": "hi" }` | `{ "call_sid": "...", "status": "queued" }` | `VoiceAssistantPage.jsx` |

---

## 3. Vendor Domain Endpoints (`/api/v1/vendor`, `/api/vendor`)

| Frontend Action | Existing Endpoint | HTTP Method | Request / Params | Response Format | Consumer Page |
|---|---|---|---|---|---|
| Vendor Profile | `/api/vendor/me` | `GET` | Headers: `Authorization: Bearer <token>` | `{ "company_name": "...", "gstin": "..." }` | `VendorCompanyProfilePage.jsx` |
| Browse Marketplace | `/api/vendor/marketplace/listings` | `GET` | `?crop=Wheat&page=1` | `{ "items": [...], "total": 128 }` | `VendorRequirementsPage.jsx` |
| Create Buying Tender | `/api/v1/vendor/tenders` | `POST` | `{ "crop": "Paddy", "min_quintals": 500, ... }` | `{ "tender_id": "...", "status": "OPEN" }` | `VendorTendersPage.jsx` |
| Review Farmer Bids | `/api/v1/vendor/applications` | `GET` | `?tender_id=...` | `[ { "bid_id": "...", "farmer_name": "..." } ]` | `VendorApplicationsPage.jsx` |
| Counter-Offer / Negotiate | `/api/v1/vendor/negotiate` | `POST` | `{ "bid_id": "...", "offer_price": 2400 }` | `{ "status": "COUNTERED" }` | `VendorNegotiationPage.jsx` |
| Manage Retail Catalog | `/api/vendor/products` | `GET`, `POST` | `{ "name": "Bio-Fertilizer", "price": 450 }` | `{ "product_id": "...", ... }` | `VendorProductsPage.jsx` |
| Warehouse Slot Status | `/api/vendor/warehouse/slots` | `GET` | Headers: `Authorization: Bearer <token>` | `{ "total_slots": 200, "occupied": 142 }` | `VendorWarehousePage.jsx` |
| Live Consignment Tracking | `/api/vendor/logistics/routes` | `GET` | `?shipment_id=...` | `{ "lat": 28.5, "lon": 77.3, "status": "In-Transit" }` | `VendorLogisticsPage.jsx` |

---

## 4. Admin Domain Endpoints (`/api/v1/admin`, `/api/admin`)

| Frontend Action | Existing Endpoint | HTTP Method | Request / Params | Response Format | Consumer Page |
|---|---|---|---|---|---|
| Ecosystem Telemetry | `/api/admin/dashboard` | `GET` | Headers: `Authorization: Bearer <token>` | `{ "total_farmers": 14200, "gmv": "₹4.8Cr" }` | `AdminDashboard.jsx` |
| User Directory & Status | `/api/admin/users` | `GET`, `PATCH` | `?role=vendor&status=pending` | `[ { "id": "...", "name": "...", "status": "ACTIVE" } ]` | `AdminUsersPage.jsx` |
| Vendor KYC Queue | `/api/admin/kyc/pending` | `GET` | None | `[ { "vendor_id": "...", "gst_doc": "..." } ]` | `AdminVendorVerificationPage.jsx` |
| Approve / Reject KYC | `/api/admin/kyc/{id}/decision` | `POST` | `{ "status": "APPROVED", "reason": "OK" }` | `{ "success": true }` | `AdminVendorVerificationPage.jsx` |
| Product Compliance Audit | `/api/admin/products/moderate` | `GET`, `POST` | `{ "product_id": "...", "flag": false }` | `{ "moderation_status": "APPROVED" }` | `AdminProductModerationPage.jsx` |
| Escrow Release Orders | `/api/admin/orders` | `GET`, `POST` | `{ "order_id": "...", "action": "RELEASE" }` | `{ "escrow_status": "RELEASED" }` | `AdminOrdersPage.jsx` |
| Dispute Arbitration | `/api/admin/complaints` | `GET`, `POST` | `{ "complaint_id": "...", "resolution": "..." }` | `{ "status": "RESOLVED" }` | `AdminComplaintsPage.jsx` |
| Immutable Audit Logs | `/api/admin/audit-logs` | `GET` | `?limit=100` | `[ { "timestamp": "...", "ip": "...", "action": "..." } ]` | `AdminAuditLogsPage.jsx` |
