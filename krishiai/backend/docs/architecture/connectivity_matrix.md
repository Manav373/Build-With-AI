# KrishiAI — Domain Separation & Connectivity Matrix

This document provides the complete architecture and connectivity map showing how all files in `farmer/`, `vendor/`, and `shared/` are connected.

---

## 1. Domain File Separation

```
krishiai/
│
├── 🌾 farmer/                                    # ALL FARMER CODE
│   ├── frontend/
│   │   ├── pages/                               # 21 Farmer Pages
│   │   │   ├── LandingPage.jsx                  # Main public portal
│   │   │   ├── ChatPage.jsx                     # AI Agronomist Chat
│   │   │   ├── MarketPricePage.jsx              # APMC Mandi Prices
│   │   │   ├── PredictPage.jsx                  # ML Yield Predictor
│   │   │   ├── RecommendPage.jsx                # Crop Recommendations
│   │   │   ├── SatellitePage.jsx                # GEE Satellite Health & NDVI
│   │   │   ├── MandiMapPage.jsx                 # Live APMC Proximity Map
│   │   │   ├── SchemesPage.jsx                  # Government Subsidies & Schemes
│   │   │   ├── FarmerAnalytics.jsx              # National Agronomy Analytics
│   │   │   ├── FarmerHeatmap.jsx                # Geo Heatmap of Farmer Locations
│   │   │   ├── FarmerBrowseRequirementsPage.jsx # Crop Selling to Verified Vendors
│   │   │   ├── VoiceAssistantPage.jsx           # Multilingual Voice Agronomist
│   │   │   ├── CallHistoryPage.jsx              # Voice Assistant Call Logs
│   │   │   ├── CommunityPage.jsx                # Farmer Peer-to-Peer Discussion
│   │   │   ├── WhatsAppPage.jsx                 # Twilio WhatsApp Agronomist
│   │   │   ├── SignInPage.jsx / SignUpPage.jsx  # Auth Pages
│   │   │   ├── HelpPage.jsx / SettingsPage.jsx  # Support & Preferences
│   │   │   └── PrivacyPage.jsx / TermsPage.jsx  # Legal Policies
│   │   ├── components/
│   │   │   ├── feature/                         # Agronomy calculators & cards
│   │   │   ├── landing/                         # Hero, FAQ, Testimonials, CTA
│   │   │   └── layout/                          # Farmer MainLayout, Header, Footer
│   │   ├── context/                             # ChatContext, VoiceAssistantContext
│   │   ├── hooks/                               # useSafeAuth, useAuthenticatedApi
│   │   └── services/                            # api.js
│   ├── backend/
│   │   ├── routes/                              # Farmer Endpoints (web, location, ml, schemes, vapi, community, whatsapp)
│   │   ├── services/                            # ml_model.py, gee_service.py, disease.py, etc.
│   │   └── core/                                # agent.py, web_agent.py, whatsapp_agent.py
│   └── database/
│       └── models/                              # FarmerLocation, MarketRecord, CallHistory, CommunityMessage
│
├── 🏪 vendor/                                    # ALL VENDOR CODE
│   ├── frontend/
│   │   ├── pages/                               # 29 Vendor Pages
│   │   │   ├── VendorDashboardLayout.jsx        # Vendor Shell & Navigation Sidebar
│   │   │   ├── VendorDashboardHome.jsx          # Vendor Metric Dashboard
│   │   │   ├── VendorRequirementsPage.jsx       # Bulk Buying Requirement Creator
│   │   │   ├── VendorApplicationsPage.jsx       # Farmer Bids & Applications
│   │   │   ├── VendorNegotiationPage.jsx        # Real-time Price Negotiation Desk
│   │   │   ├── VendorProcurementOrdersPage.jsx  # Crop Procurement Orders
│   │   │   ├── VendorProductsPage.jsx           # Seller Catalog Manager
│   │   │   ├── VendorCustomerOrdersPage.jsx     # Farmer Input Orders
│   │   │   ├── VendorWarehousePage.jsx          # Slot Booking & Storage
│   │   │   ├── VendorPickupPage.jsx             # Dispatch & Field Logistics
│   │   │   ├── VendorAIQualityPage.jsx          # AI Crop Quality & Grading
│   │   │   ├── VendorPaymentsPage.jsx           # Wallet Settlement Ledger
│   │   │   ├── VendorTendersPage.jsx            # Institutional Bulk RFQs
│   │   │   ├── VendorAnalyticsPage.jsx          # Sales & Procurement KPIs
│   │   │   ├── VendorCompanyProfilePage.jsx     # Business Info & Verification
│   │   │   ├── VendorDocumentsPage.jsx          # APMC / GST License Upload
│   │   │   ├── VendorOnboardingPage.jsx         # 4-Step KYC Wizard
│   │   │   └── VendorMarketplacePage.jsx        # Vendor Public Showroom
│   │   ├── components/
│   │   │   ├── VendorLoginModal.jsx             # Direct Vendor Auth Modal
│   │   │   └── VendorProfile.jsx                # Vendor Profile Editor
│   │   └── services/                            # api.js
│   ├── backend/
│   │   └── routes/                              # vendor.py (Full CRUD, Negotiation, RFQ, Payouts)
│   └── database/
│       └── models/                              # 21 Vendor ORM Tables
│
└── 🔗 shared/                                    # CROSS-CUTTING CORE
    ├── frontend/
    │   ├── context/                             # LanguageContext, LocationContext, ThemeContext, UserRoleContext
    │   ├── hooks/                               # useSafeAuth, useAuthenticatedApi, useWindowSize
    │   ├── components/                          # Preloader, RoleSelectionModal, LocationPermissionPopup, CustomCursor
    │   └── services/                            # api.js (Unified Axios HTTP Client)
    ├── backend/
    │   ├── core/                                # auth.py (Clerk JWKS), config.py (Settings)
    │   ├── services/                            # weather.py, market.py, location_service.py, sms_service.py
    │   └── routes/                              # auth.py, sms.py, mcp.py
    └── database/
        ├── connection.py                        # Unified SQLAlchemy Engine & declarative Base
        └── sync.py                              # Auto-Sync Schema Engine
```

---

## 2. Frontend Connectivity Architecture

```
                               ┌───────────────────────────┐
                               │     frontend/main.jsx     │
                               │  (Central React Router)   │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
       @farmer/pages/*                @vendor/pages/*               @shared/components/*
    (21 Farmer Domain Pages)       (29 Vendor Domain Pages)       (Preloader, RoleModal, Cursor)
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                                  @shared/services/api.js
                                 (Unified Axios REST Client)
```

---

## 3. Backend Connectivity Architecture

```
                               ┌───────────────────────────┐
                               │   backend/app/main.py     │
                               │     (FastAPI Server)      │
                               └─────────────┬─────────────┘
                                             │
               ┌─────────────────────────────┼─────────────────────────────┐
               ▼                             ▼                             ▼
    farmer.backend.routes         vendor.backend.routes         shared.backend.routes
  (web, ml, vapi, schemes)             (vendor.py)                 (auth, sms, mcp)
               │                             │                             │
               └─────────────────────────────┼─────────────────────────────┘
                                             ▼
                                shared.database.connection
                                   (SessionLocal, Base)
                                             │
                     ┌───────────────────────┴───────────────────────┐
                     ▼                                               ▼
           farmer.database.models                          vendor.database.models
         (FarmerLocation, Market)                    (Vendor, Product, Requirement)
```

---

## 4. Cross-Domain Business Workflow

```
[ FARMER DOMAIN ]                                               [ VENDOR DOMAIN ]
-----------------                                               -----------------
Farmer browses requirements                                     Vendor posts buying requirement
  @farmer/pages/FarmerBrowseRequirementsPage.jsx  ──────────►     @vendor/pages/VendorRequirementsPage.jsx
                                                                         │
Farmer submits offer                                                     ▼
  POST /api/vendor/buying-requirements/{id}/apply ──────────►   Vendor receives bid in negotiation hub
                                                                  @vendor/pages/VendorNegotiationPage.jsx
                                                                         │
Farmer accepts counter-price                                             ▼
  POST /api/vendor/applications/{id}/negotiate    ◄──────────   Vendor sends counter-offer
                                                                         │
                                                                         ▼
                                                                Procurement Order Created
                                                                  @vendor/pages/VendorProcurementOrdersPage.jsx
                                                                         │
                                                                         ▼
                                                                AI Crop Quality Grading
                                                                  @vendor/pages/VendorAIQualityPage.jsx
                                                                         │
                                                                         ▼
                                                                Direct Farmer Bank Payout
                                                                  @vendor/pages/VendorPaymentsPage.jsx
```
