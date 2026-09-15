# 🌐 KrishiAI — Domain Architecture

> **Boundary Definitions, Feature Matrices, and Segregation of FARMER, VENDOR, and ADMIN Domains**

---

## 1. Domain Segregation Overview

The KrishiAI platform delivers three specialized experiences tailored for distinct user personas, operating from a single codebase and database:

| Dimension | 🌾 FARMER DOMAIN | 🏪 VENDOR DOMAIN | 🛡️ ADMIN DOMAIN |
|---|---|---|---|
| **Audience** | Cultivators, smallholders, farming cooperatives | Agri-input retailers, crop aggregators, logistics providers | Platform directors, compliance officers, moderators |
| **Port / Host** | `5173` / `farmer.krishiai.com` | `5174` / `vendor.krishiai.com` | `5175` / `admin.krishiai.com` |
| **Primary Theme** | Earthy Green / Nature (#16a34a, #15803d) | Deep Slate / Emerald Accent (#0f172a, #059669) | Dark Terminal / Security Slate (#090d16, #3b82f6) |
| **Primary Action** | Diagnose, monitor, discover prices, sell harvest | Procure crops, manage bids, publish catalog, logistics | Verify vendors, audit transactions, resolve disputes |

---

## 2. Farmer Domain (`FARMER/`)

### Core Responsibilities
- **AI Agronomist Consultation**: Real-time multimodal diagnosis with Gemini Vision and multilingual voice synthesis.
- **Satellite Vegetative Analysis**: Google Earth Engine integration showing NDVI, NDRE, NDWI health indices.
- **Mandi Intelligence**: Live APMC mandi pricing records, price trends, and geolocation distance mapping.
- **Crop Prediction & Soil Advisory**: ML models estimating yield based on rainfall, temperature, and soil N-P-K levels.
- **Harvest Selling**: Farmers post crop batches directly to the unified marketplace.
- **Government Schemes**: Discovery and application tracking for agricultural subsidies.

### Page Catalog (22 Pages)
1. `ChatPage`: AI agronomist conversational interface.
2. `SatellitePage`: Satellite vegetation health map.
3. `MarketPricePage`: Real-time Mandi price dashboard.
4. `MandiMapPage`: Interactive map of nearby physical mandis.
5. `PredictPage`: Machine learning crop yield predictor.
6. `RecommendPage`: N-P-K soil-based crop recommendation engine.
7. `FarmerAnalytics`: Farm health and moisture monitoring dashboard.
8. `FarmerHeatmap`: Geographic thermal and moisture stress heatmap.
9. `SchemesPage`: Subsidies and government agricultural welfare schemes.
10. `FarmerBrowseRequirementsPage` (`/sell-crops`): Harvest posting desk.
11. `VoiceAssistantPage`: Regional voice advisory powered by Vapi.
12. `CommunityPage`: Peer farmer forum.
13. `WhatsAppPage`: Automated WhatsApp advisory integration.
14. `CallHistoryPage`: Logs of inbound/outbound voice consultations.
15. `HelpPage`: Comprehensive farmer help and FAQs.
16. `LandingPage`: Farmer landing experience.
17. `PrivacyPage`: Privacy disclosures.
18. `SettingsPage`: Language and profile settings.
19. `SignInPage`: Authentication interface.
20. `SignUpPage`: New farmer onboarding.
21. `TermsPage`: Terms of service.
22. `FarmerDashboardHome`: Master farmer dashboard.

---

## 3. Vendor Domain (`VENDOR/`)

### Core Responsibilities
- **B2B Crop Procurement**: Sourcing raw harvests directly from farmers.
- **Tender & Contract Farming**: Publishing formal procurement tenders and reviewing farmer proposals.
- **Price Negotiations**: Counter-offering and finalizing price per quintal with farmers.
- **Agri-Input Catalog**: Selling certified seeds, fertilizers, and farm equipment.
- **Warehouse & Logistics**: Managing storage slots and fleet tracking with GPS.
- **AI Crop Quality Inspection**: Computer-vision grading for grain purity, moisture, and defects.

### Page Catalog (30 Pages)
1. `VendorDashboardHome`: Overview metrics (bids, inventory, active shipments).
2. `VendorCompanyProfilePage`: Verified credentials and GSTIN.
3. `VendorRequirementsPage`: Browse farmer harvests & publish buying requests.
4. `VendorTendersPage`: Contract farming tender management.
5. `VendorApplicationsPage`: Farmer tender proposal review desk.
6. `VendorNegotiationPage`: Real-time counter-offer negotiation interface.
7. `VendorProcurementOrdersPage`: Bulk procurement order tracking.
8. `VendorAIQualityPage`: AI visual grain inspection and defect grading.
9. `VendorWarehousePage`: Inward/outward storage slot management.
10. `VendorPickupPage`: Fleet scheduling and driver dispatch.
11. `VendorLogisticsPage`: Live GPS route tracking of consignments.
12. `VendorProductsPage`: Agri-input retail catalog.
13. `VendorInventoryPage`: Batch and SKU level stock tracking.
14. `VendorCustomerOrdersPage`: Supply orders placed by farmers.
15. `VendorPaymentsPage`: Escrow balances, invoice generation, payout tracking.
16. `VendorDocumentsPage`: Statutory seed, fertilizer, and GST licenses.
17. `VendorOnboardingPage`: Step-by-step KYC submission wizard.
18. `VendorTypeSelectionPage`: Business persona classification.
19. `VendorNotificationsPage`: Bid alerts and order updates.
20. `VendorAnalyticsPage`: Revenue, fulfillment, and volume analytics.
21. `VendorPromotionsPage`: Discount and marketing campaigns.
22. `VendorReviewsPage`: Farmer feedback and ratings.
23. `VendorSettingsPage`: Account and notification preferences.
24. `VendorSignUpPage`: Registration portal.
25. `VendorMarketplacePage`: Live commodity marketplace feed.
26. `VendorAdminPage`: Internal vendor team management.
27. `VendorProfilePage`: Quick profile overview.
28. `VendorDashboardLayout`: Unified navigation shell.
29. `VendorDashboardPlaceholder`: Fallback view.
30. `index.js`: Page export registry.

---

## 4. Admin Domain (`ADMIN/`)

### Core Responsibilities
- **Platform Telemetry**: Global transaction volume, active users, system latencies.
- **Vendor KYC Moderation**: Approving, rejecting, or auditing vendor statutory documents.
- **Product Catalog Moderation**: Scanning products for banned chemicals and price gouging.
- **Escrow & Order Oversight**: Reviewing cross-domain transactions and authorizing payment releases.
- **Dispute Resolution Desk**: Arbitrating complaints between farmers and vendors.
- **Immutable Audit Logging**: Recording all administrative and high-privilege actions with IP timestamps.

### Page Catalog (8 Pages)
1. `AdminDashboard`: Master ecosystem health, active users, GMV metrics.
2. `AdminUsersPage`: User directory with role management and status toggles.
3. `AdminVendorVerificationPage`: Statutory license and GST KYC queue.
4. `AdminProductModerationPage`: Input catalog compliance and banned substance audits.
5. `AdminOrdersPage`: Cross-domain transaction stream and escrow release control.
6. `AdminComplaintsPage`: Grievance arbitration desk for disputes.
7. `AdminSchemesPage`: Government subsidy publishing and quota manager.
8. `AdminAuditLogsPage`: Security audit trails with IP tracking.
