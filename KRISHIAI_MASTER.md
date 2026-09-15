# KRISHIAI — Complete Project Intelligence Document

> **Single source of truth for the entire KrishiAI codebase.**
> Any AI agent reading this file will have full context to understand, modify, and extend this project.

---

## 1. PROJECT IDENTITY

- **Name:** KrishiAI (Track 4: Kisan Alert — Smart Water, Crop & Advisory System)
- **Purpose:** AI-powered agricultural intelligence platform for Indian farmers — crop yield prediction, disease detection, real-time market prices, WhatsApp/Voice advisory, B2B multi-vendor marketplace
- **Target:** 40M+ Indian farmers across Maharashtra, Gujarat, and scaling pan-India
- **Repo:** `Manav373/Build-With-AI`

---

## 2. MONOREPO ARCHITECTURE

```
hackathon prototype/
├── krishiai/                          # Main application monorepo
│   ├── backend/                       # FastAPI Python backend (REST + MCP Server)
│   ├── frontend/
│   │   ├── farmer/                    # React 19 farmer dashboard (port 5173)
│   │   ├── vendor/                    # React 19 vendor portal (port 5174)
│   │   └── admin/                     # React 19 admin console (port 5175)
│   ├── SHARED/                        # Monorepo shared packages
│   │   ├── api-client/                # @krishiai/api — Universal HTTP client + service APIs
│   │   ├── auth/                      # @krishiai/auth — AuthProvider, useAuth, roleUtils, storage
│   │   ├── components/                # @krishiai/components — Shared React components
│   │   ├── config/                    # @krishiai/config — Shared configuration
│   │   ├── constants/                 # @krishiai/constants — Shared constants
│   │   ├── hooks/                     # @krishiai/hooks — Shared React hooks
│   │   ├── types/                     # @krishiai/types — Shared TypeScript/JSDoc types
│   │   ├── ui/                        # @krishiai/ui — Design system (Button, Card, Modal, etc.)
│   │   └── utilities/                 # @krishiai/utils — Shared utility functions
│   ├── SCRIPTS/                       # Build & dev orchestration scripts
│   ├── INFRASTRUCTURE/                # Docker & deployment configs
│   ├── DOCS/                          # (Legacy docs directory — now consolidated here)
│   ├── package.json                   # NPM workspace root
│   ├── pnpm-workspace.yaml            # pnpm workspace config
│   ├── vercel.json                    # Vercel deployment config
│   └── Dockerfile                     # Root Docker config
├── krishi-mobile/                     # React Native / Expo mobile app (minimal/scaffold)
├── build_full_deck.py                 # 14-slide hackathon pitch deck generator (python-pptx)
├── generate_deck_base.py              # Presentation design system helpers
├── blink_status.svg                   # Animated status badge SVG
├── readme_header.svg                  # Animated hero banner SVG
└── .gitignore                         # Project-wide ignore rules
```

### Workspace Configuration (package.json)
```json
{
  "name": "krishiai-monorepo",
  "workspaces": [
    "frontend/farmer", "frontend/vendor", "frontend/admin",
    "SHARED/ui", "SHARED/api-client", "SHARED/auth",
    "SHARED/types", "SHARED/utilities", "SHARED/config"
  ],
  "scripts": {
    "dev": "node SCRIPTS/dev-all.js",
    "dev:farmer": "npm run dev --workspace=@krishiai/farmer",
    "dev:vendor": "npm run dev --workspace=@krishiai/vendor",
    "dev:admin": "npm run dev --workspace=@krishiai/admin",
    "build:all": "node SCRIPTS/build-all.js",
    "audit": "node SCRIPTS/audit-connectivity.js"
  }
}
```

---

## 3. TECH STACK

### Backend
| Component | Technology |
|---|---|
| Framework | FastAPI (Python 3.11+) |
| Server | Uvicorn (ASGI) |
| ORM | SQLAlchemy 2.0.36 |
| Database | SQLite (dev) / PostgreSQL via Supabase (prod) |
| Validation | Pydantic v2 + pydantic-settings |
| LLM Inference | Groq API → `openai/gpt-oss-20b` (primary + fallback) |
| Vision AI | Google Gemini (`gemini-2.5-flash` / `gemini-flash-latest`) via google-genai |
| Satellite | Google Earth Engine (earthengine-api) — Sentinel-2 NDVI |
| ML Models | XGBoost 2.1.1, scikit-learn, RandomForest |
| Speech | faster-whisper (Whisper large-v3), SpeechRecognition |
| WhatsApp | Meta Cloud API (Graph v22.0) + Twilio REST fallback |
| Voice AI | Vapi.ai WebRTC SDK |
| SMS | Twilio REST API |
| Auth | Clerk JWT (RS256 JWKS validation), python-jose |
| Market Data | data.gov.in API (APMC commodity prices) |
| Weather | OpenWeatherMap API + Open-Meteo API |
| Maps | Google Maps Static API (satellite tiles), Nominatim |
| MCP | Model Context Protocol server (fastmcp) |
| Token Counting | tiktoken (cl100k_base encoding) |

### Frontend (All 3 apps share this stack)
| Component | Technology |
|---|---|
| Framework | React 19.2 |
| Bundler | Vite 7.3 |
| Styling | TailwindCSS 3.4 + custom design tokens |
| Animations | Framer Motion 12.x, GSAP 3.14 |
| Icons | lucide-react |
| Routing | react-router-dom 7.13 |
| HTTP | Axios 1.13 |
| Auth | @clerk/clerk-react 5.61 |
| Maps | Leaflet 1.9 + react-leaflet 5.0, MapLibre GL |
| Charts | Recharts 3.8 |
| Markdown | react-markdown 10.1 + remark-gfm |
| 3D | Three.js 0.183 + @react-three/fiber + drei |
| Voice | @vapi-ai/web 2.5 |
| Scroll | @studio-freight/lenis |

### Mobile
| Component | Technology |
|---|---|
| Framework | React Native + Expo Router |
| Status | Scaffold/minimal (expo-env.d.ts + .env only) |

---

## 4. ENVIRONMENT VARIABLES

### Backend (.env)
```
OPENWEATHER_API_KEY=          # OpenWeatherMap API key
GEMINI_API_KEY=               # Google Gemini Vision API key
GROQ_API_KEY=                 # Groq LLM inference API key
TWILIO_ACCOUNT_SID=           # Twilio account SID
TWILIO_AUTH_TOKEN=            # Twilio auth token
TWILIO_PHONE_NUMBER=          # Twilio WhatsApp number (whatsapp:+...)
MOCK_WHATSAPP=True            # Enable WhatsApp mock mode
DATA_GOV_API_KEY=             # data.gov.in single API key
DATA_GOV_API_KEYS=            # Comma-separated data.gov.in keys (round-robin)
DATABASE_URL=                 # PostgreSQL URL (or sqlite:///./krishiai.db)
FORCE_SQLITE=True             # Force local SQLite mode
GOOGLE_MAPS_API_KEY=          # Google Maps Static API key
AGROMONITORING_API_KEY=       # Agromonitoring satellite API key
WHATSAPP_VERIFY_TOKEN=        # Meta webhook verification token
WHATSAPP_PHONE_ID=            # Meta WhatsApp phone number ID
WHATSAPP_ACCESS_TOKEN=        # Meta Graph API access token
CLERK_FRONTEND_API=           # Clerk frontend API domain
```

### Frontend (.env — all 3 apps)
```
VITE_API_BASE_URL=            # Backend API base URL (http://127.0.0.1:8000/)
VITE_CLERK_PUBLISHABLE_KEY=   # Clerk publishable key
VITE_VAPI_PUBLIC_KEY=         # Vapi voice AI public key
VITE_VAPI_ASSISTANT_ID=       # Vapi assistant ID
VITE_WINDY_API_KEY=           # Windy weather radar API key
VITE_GOOGLE_MAPS_API_KEY=     # Google Maps JS API key
```

---

## 5. BACKEND — COMPLETE FILE MAP

### Entry Points
| File | Purpose |
|---|---|
| `server.py` | Uvicorn launcher: `uvicorn app.main:app` on PORT (default 8000) |
| `app/main.py` | FastAPI app factory with lifespan, CORS, security headers, router registration |

### Configuration & Database
| File | Purpose |
|---|---|
| `app/core/config.py` | Pydantic `Settings` class — loads env vars |
| `app/db/database.py` | SQLAlchemy engine/session factory — SQLite/PostgreSQL with IPv4 forcing, SSL, pool recycling |
| `scripts/sync_db.py` | Database schema synchronization on startup |

### Authentication
| File | Purpose |
|---|---|
| `app/core/auth.py` | Clerk JWT verification via JWKS — `verify_clerk_token()` dependency, `get_current_user()` extracts user ID. Falls back to `guest_user` on failure |
| `app/services/auth_service.py` | Auth service layer |
| `middleware/auth/auth_middleware.py` | HTTP auth middleware |
| `middleware/authorization/roles.py` | Role-based authorization |

### AI Agent System
| File | Purpose |
|---|---|
| `app/core/agent.py` | **Core AI agent** — 11-tool schema, Groq LLM tool-calling loop, in-memory cache (10min TTL), failed generation parser, XML/JSON tool leak recovery, tiktoken history truncation |
| `app/core/web_agent.py` | Web-channel system prompt + `process_web_query()` |
| `app/core/whatsapp_agent.py` | WhatsApp-channel system prompt + `process_whatsapp_query()` with per-phone session memory |

### 11 AI Tool Functions
| Tool Name | File | Parameters | Purpose |
|---|---|---|---|
| `get_weather` | `app/services/weather.py` | `location` | Current weather via OpenWeatherMap (city name or GPS coords) |
| `crop_advice` | `app/services/crop_advice.py` | `crop`, `location`, `weather_summary?` | Dynamic AI farming advice via Groq LLM |
| `get_market_price` | `app/services/market.py` | `crop`, `location` | Real-time APMC market prices via data.gov.in |
| `detect_crop_disease` | `app/services/disease.py` | `image_url` | Gemini Vision crop disease analysis |
| `transcribe_audio` | `app/utils/speech.py` | `audio_url` | Whisper large-v3 transcription |
| `get_gov_scheme` | `app/services/scheme.py` | `state`, `crop` | Government subsidies lookup via Groq |
| `analyze_soil_health` | `app/services/soil.py` | `soil_type`, `crop?`, `symptoms?` | AI soil analysis & amendment recommendations |
| `get_pest_alerts` | `app/services/pest.py` | `crop`, `temp_c?`, `humidity?` | Pest threat prediction |
| `estimate_yield` | `app/services/yield_estimation.py` | `crop`, `area_acres`, `variety?`, `conditions?` | AI yield estimation |
| `calculate_irrigation` | `app/services/irrigation.py` | `crop`, `area_acres`, `growth_stage?`, `method?`, `rainfall_mm?` | Water requirement calculation |
| `get_commodity_trends` | `app/services/market.py` | `commodity`, `state?` | 7-day market price trends |

### ML & Satellite Services
| File | Purpose |
|---|---|
| `app/services/ml_model.py` | XGBoost/RandomForest crop yield prediction — `predict()`, `predict_all_crops()`, `predict_future_trend()` |
| `app/services/gee_service.py` | Google Earth Engine — Sentinel-2 NDVI, `get_blink_ndvi()`, `get_all_satellite_data()` |
| `app/services/satellite.py` | Satellite data service |
| `app/services/satellite_health_model.py` | `analyze_satellite_health()` — ML-derived biometrics from NDVI/moisture/ET |
| `app/services/pixel_analyzer.py` | `analyze_location_from_satellite()` — Google Maps tile pixel analysis for land type detection |
| `app/services/train_model.py` | Full model training pipeline |
| `app/services/train_model_lite.py` | Lightweight model training |
| `app/services/model/` | Directory with trained `.pkl` model artifacts (crop_model_v2.pkl, encoders, scaler) |

### Other Services
| File | Purpose |
|---|---|
| `app/services/crop_calendar.py` | Sowing/harvesting calendar |
| `app/services/crop_planner.py` | Crop planning service |
| `app/services/crop_simulator.py` | Crop growth simulation |
| `app/services/dataset_builder.py` | Training dataset construction |
| `app/services/explain_prediction.py` | SHAP/feature importance explanation |
| `app/services/expand_all_states.py` | State-level data expansion |
| `app/services/fetch_real_data.py` | Real APMC data fetcher |
| `app/services/location_service.py` | GPS/IP location resolution |
| `app/services/sms_service.py` | Twilio SMS sending |
| `app/services/weather_scenarios.py` | Weather scenario analysis |
| `app/services/pii.py` | PII masking/unmasking service for chat safety |

### Utility Modules
| File | Purpose |
|---|---|
| `app/utils/ai_utils.py` | AI utility helpers |
| `app/utils/memory.py` | Conversation memory management |
| `app/utils/seed_data.py` | Initial data seeding |
| `app/utils/speech.py` | Audio transcription (Whisper) — `transcribe_audio()`, `transcribe_audio_bytes()` |

### Middleware
| File | Purpose |
|---|---|
| `middleware/error/error_handler.py` | Global error handler |
| `middleware/logging/request_logger.py` | Request logging |
| `middleware/upload/upload_validator.py` | File upload validation |

### Backend Scripts
| File | Purpose |
|---|---|
| `scripts/audit_all_endpoints.py` | Endpoint audit tool |
| `scripts/optimize_model.py` | ML model optimization |
| `scripts/seed_vendor_data.py` | Vendor test data seeder |
| `scripts/sync_db.py` | Database schema sync |
| `scripts/test_modular_imports.py` | Import testing |
| `scripts/train_satellite_model.py` | Satellite model training |
| `scripts/train_yield_model.py` | Yield model training |

---

## 6. DATABASE MODELS (SQLAlchemy ORM)

### FarmerLocation (`farmer_locations`)
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | String | Clerk User ID |
| lat, lon | Float | GPS coordinates |
| village, taluka, district, city, state | String | Reverse-geocoded |
| pincode | String | |
| source | String | "web" / "whatsapp" / "chat" / "voice" |
| timestamp | DateTime | |

### MarketRecord (`market_prices`)
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| state, district, market, commodity, variety | String | Indexed |
| arrival_date | String | |
| min_price, max_price, modal_price | Float | |
| updated_at | DateTime | |

### MarketGeocode (`market_geocodes`)
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| query_key | String | Unique, "market_district_state" |
| lat, lon | Float | |

### CommunityMessage (`community_messages`)
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| user_id | String | Clerk ID |
| user_name, user_avatar | String | |
| content | Text | |
| timestamp | DateTime | |

### CallHistory (`call_history`)
| Column | Type | Notes |
|---|---|---|
| id | Integer PK | |
| call_id | String | Unique |
| phone_number | String | |
| transcript, summary | Text | |
| duration | Float | |
| timestamp | DateTime | |
| status | String | "completed" |
| recording_url | String | |

### Vendor Ecosystem (12 Tables)

**Vendor (`vendors`)** — 60+ columns:
- Identity: `clerk_user_id`, `vendor_type` (ENUM: procurement/seller/hybrid), `status` (ENUM: pending/under_review/verified/suspended/rejected)
- Business: `business_name`, `owner_name`, `tagline`, `business_description`, `business_category`, `year_established`, `number_of_employees`, `gst_number`
- KYC: `id_proof_type`, `id_proof_number`, `id_proof_file`, `trade_license_type`, `trade_license_number`, `trade_license_file`
- Contact: `phone`, `secondary_phone`, `whatsapp_number`, `email`, `website`
- Address: `street_address`, `landmark`, `village_city`, `taluka`, `district`, `state`, `pincode`, `latitude`, `longitude`
- Images: `profile_image`, `cover_image`
- Service: `service_areas` (JSON), `languages_spoken` (JSON)
- Procurement: `crops_of_interest` (JSON), `procurement_capacity_mt`, `warehouse_locations` (JSON)
- Seller: `product_categories` (JSON), `store_open_time`, `store_close_time`, `weekly_holidays` (JSON), `delivery_available`, `delivery_radius_km`
- Stats: `total_products`, `total_orders`, `total_procurement_orders`, `farmers_served`, `rating`, `total_reviews`
- Trust: `is_verified`, `is_premium`, `is_trusted`, `trust_score`, `verified_at`, `admin_notes`, `rejection_reason`
- Bank: `bank_account_name`, `bank_account_number`, `bank_ifsc_code`, `bank_name`
- Relationships: → `VendorDocument`, `Product`, `BuyingRequirement`

**VendorDocument (`vendor_documents`)** — KYC document uploads

**Product (`products`)** — Seller marketplace listings with pricing, stock, images, ratings

**BuyingRequirement (`buying_requirements`)** — Procurement crop purchase orders with price range, location, validity period

**FarmerApplication (`farmer_applications`)** — Farmer responses to buying requirements with negotiation tracking

**CustomerOrder (`customer_orders`)** — Product purchase orders with delivery, payment, tracking

**ProcurementOrder (`procurement_orders`)** — Crop procurement orders with pickup, warehouse inspection, quality grading

**Review (`reviews`)** — Multi-target reviews (vendor/product/procurement) with criteria ratings

**VendorNotification (`vendor_notifications`)** — In-app/push/WhatsApp/SMS notifications

**ContractFarmingAgreement (`contract_farming_agreements`)** — Guaranteed MSP contracts with input support

**BulkRFQ (`bulk_rfqs`)** — Bulk request-for-quote tenders with partial bids

**LogisticsShipment (`logistics_shipments`)** — Fleet management with vehicle tracking, e-way bills

**AIQualityInspection (`ai_quality_inspections`)** — Vision AI crop quality grading

**VendorPayout (`vendor_payouts`)** — Payment settlement ledger

---

## 7. API ROUTES — COMPLETE ENDPOINT MAP

### Web Frontend REST (`/api/web` — web.py)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/web/chat` | Clerk JWT | AI chat — PII masking, location context, agent processing |
| POST | `/api/web/vision` | Clerk JWT | Crop image upload → Gemini Vision → Groq narration |
| POST | `/api/web/audio` | Clerk JWT | Voice upload → Whisper transcription → AI response |
| GET | `/api/web/market-trends` | Clerk JWT | 7-day market trend data for charts |
| GET | `/api/web/live-mandis` | Clerk JWT | Live APMC mandi records (GPS or all-India) |
| GET | `/api/web/nearby-markets` | Clerk JWT | Google Places nearby market discovery |
| GET | `/api/web/all-market-prices` | Clerk JWT | Paginated commodity prices with filters |
| GET | `/api/web/commodity-trends` | Clerk JWT | Single commodity 7-day price trend |

### WhatsApp Webhook (`/api/whatsapp` — whatsapp.py)
| Method | Path | Purpose |
|---|---|---|
| GET | `/api/whatsapp/webhook` | Meta Cloud API webhook verification |
| POST | `/api/whatsapp/webhook` | Receive messages (Meta JSON + Twilio form-encoded) |
- Handles: text, image (disease detection), audio (voice transcription), location, interactive buttons
- Smart keyword bypass: weather, market, scheme, yield, soil, pest, irrigation, trends, nearby mandis
- Multilingual: English, Hindi, Gujarati, Marathi, Tamil, Telugu, Bengali, Punjabi
- Dual provider: Meta Graph API (primary) + Twilio (fallback)

### ML Intelligence (`/api/ml` — ml.py)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/ml/predict` | Clerk JWT | Yield prediction (current/future/historical with trend) |
| POST | `/api/ml/recommend` | Clerk JWT | Multi-crop comparison & recommendation |
| POST | `/api/ml/resolve-location` | Clerk JWT | GPS/IP → district/state resolution |
| POST | `/api/ml/satellite/fast` | Clerk JWT | Blink Engine Fast Track — NDVI + weather (<3s) |
| POST | `/api/ml/satellite/data` | Clerk JWT | Blink Engine Deep Track — full GEE history + preview |
| POST | `/api/ml/satellite/visual-scan` | None | Pixel-level satellite image analysis |

### Vendor Marketplace (`/api/vendor` — vendor.py, 1624 lines)
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/api/vendor/register` | Clerk JWT | Register new vendor (procurement/seller/hybrid) |
| GET | `/api/vendor/me` | Clerk JWT | Get own vendor profile |
| PUT | `/api/vendor/me` | Clerk JWT | Update own vendor profile |
| GET | `/api/vendor/profile/{vendor_id}` | None | Public vendor profile with products/requirements/reviews |
| GET | `/api/vendor/list` | None | List verified vendors (filters, pagination, sorting) |
| GET | `/api/vendor/marketplace` | None | Alias for vendor listing |
| POST | `/api/vendor/products` | Clerk JWT | Create product listing |
| GET | `/api/vendor/products` | Clerk JWT | List own products |
| PUT | `/api/vendor/products/{id}` | Clerk JWT | Update product |
| POST | `/api/vendor/products/{id}/submit` | Clerk JWT | Submit product for admin review |
| DELETE | `/api/vendor/products/{id}` | Clerk JWT | Soft-delete (discontinue) product |
| GET | `/api/vendor/marketplace/products` | None | Browse all published products |
| POST | `/api/vendor/requirements` | Clerk JWT | Create buying requirement |
| GET | `/api/vendor/requirements` | Clerk JWT | List own requirements |
| GET | `/api/vendor/requirements/browse` | None | Browse active requirements (for farmers) |
| POST | `/api/vendor/requirements/{id}/apply` | Clerk JWT | Farmer applies to requirement |
| GET | `/api/vendor/requirements/{id}/applications` | Clerk JWT | List applications for requirement |
| PUT | `/api/vendor/applications/{id}/status` | Clerk JWT | Update application status |
| POST | `/api/vendor/admin/verify/{vendor_id}` | Clerk JWT | Admin verify/reject vendor |
| GET | `/api/vendor/admin/pending` | Clerk JWT | Admin list pending vendors |
| (+ more: orders, reviews, notifications, contracts, RFQs, logistics, payouts, analytics) |

### Other Routes
| Prefix | File | Purpose |
|---|---|---|
| `/api/tools` | `api/routes/mcp.py` | MCP tool endpoints (FastMCP server) |
| `/api/sms` | `api/routes/sms.py` | Twilio SMS endpoints |
| `/api/vapi` | `api/routes/vapi.py` | Vapi voice assistant webhooks |
| `/api/location` | `api/routes/location.py` | Farmer location intelligence (heatmap, CSV export) |
| `/api/schemes` | `api/routes/schemes.py` | Government schemes API |
| `/api/community` | `api/routes/community.py` | Community forum (WebSocket + REST) |
| `/api/auth` | `api/routes/auth.py` | OTP/auth endpoints |

---

## 8. FRONTEND — FARMER APP (`krishiai/frontend/farmer`)

**Package:** `@krishiai/farmer` | **Port:** 5173

### Dependencies (Key)
React 19, Vite 7.3, TailwindCSS 3.4, Framer Motion, GSAP, Three.js, Leaflet, Recharts, Clerk Auth, Vapi Web SDK, react-markdown

### Source Files (139 files in `src/`)

**Components — Landing Page:**
`Hero.jsx`, `Features.jsx`, `HowItWorks.jsx`, `Impact.jsx`, `Stats.jsx`, `Testimonials.jsx`, `Partners.jsx`, `Mission.jsx`, `FAQ.jsx`, `CTA.jsx`, `Footer.jsx`, `MarqueeTicker.jsx`, `ScrollJourney.jsx`

**Components — Common:**
`Navbar.jsx`, `CustomCursor.jsx`, `FeaturePhone.jsx`, `Preloader.jsx`, `LocationPermissionPopup.jsx`, `RoleSelectionModal.jsx`, `ScrollToTop.jsx`, `DomainSwitcherBar.jsx`

**Components — Feature:**
`ChatWindow.jsx` (AI chatbot), `MessageInput.jsx` (text/voice/image input), `MandiMap.jsx` (Leaflet market map), `PriceTrendChart.jsx` (Recharts price charts), `VapiCall.jsx` (voice assistant), `WeatherAnalysisModal.jsx`

**Pages:**
- `LandingPage.jsx` — Marketing landing page
- `FarmerDashboard.jsx` — Main farmer dashboard with AI chat
- `FarmerChatPage.jsx` — Dedicated AI chat page
- `FarmerMandiPage.jsx` — Live mandi prices & map
- `FarmerPredictionPage.jsx` — Crop yield prediction
- `FarmerSatellitePage.jsx` — Satellite health monitoring
- `FarmerCropSimulatorPage.jsx` — Crop growth simulation
- `FarmerWeatherPage.jsx` — Weather intelligence
- `FarmerBrowseRequirementsPage.jsx` — Browse vendor buying requirements
- `FarmerSchemesPage.jsx` — Government schemes
- `CommunityPage.jsx` — Farmer peer community forum
- `CropCalendarPage.jsx` — Sowing/harvesting calendar
- `FarmerHeatmap.jsx` — Geographic query heatmap
- `VendorMarketplacePage.jsx` — Browse vendor products
- `VendorPublicProfile.jsx` — View vendor profile

**Context Providers:**
`ChatContext.jsx`, `LanguageContext.jsx`, `LocationContext.jsx`, `MobileMenuContext.jsx`, `ThemeContext.jsx`, `UserRoleContext.jsx`, `VoiceAssistantContext.jsx`

**Services:**
`api.js` (Axios-based API client with Clerk token injection)

---

## 9. FRONTEND — VENDOR PORTAL (`krishiai/frontend/vendor`)

**Package:** `@krishiai/vendor` | **Port:** 5174

### Source Files (66 files in `src/`)

**Pages (22 vendor pages):**
- `VendorOnboardingPage.jsx` — Multi-step registration with KYC
- `VendorDashboardHome.jsx` — Analytics overview
- `VendorDashboardLayout.jsx` — Sidebar layout with navigation
- `VendorProductsPage.jsx` — Product CRUD management
- `VendorInventoryPage.jsx` — Stock management
- `VendorRequirementsPage.jsx` — Buying requirement management
- `VendorApplicationsPage.jsx` — Review farmer applications
- `VendorNegotiationPage.jsx` — Price negotiation
- `VendorCustomerOrdersPage.jsx` — Customer order management
- `VendorProcurementOrdersPage.jsx` — Procurement order tracking
- `VendorPickupPage.jsx` — Pickup scheduling
- `VendorLogisticsPage.jsx` — Fleet management
- `VendorAIQualityPage.jsx` — AI quality inspection
- `VendorPaymentsPage.jsx` — Payment & payout tracking
- `VendorAnalyticsPage.jsx` — Business analytics
- `VendorMarketplacePage.jsx` — Product catalog view
- `VendorProfilePage.jsx` — Profile management
- `VendorCompanyProfilePage.jsx` — Company details
- `VendorDocumentsPage.jsx` — KYC document uploads
- `VendorReviewsPage.jsx` — Review management
- `VendorSettingsPage.jsx` — Vendor settings
- `VendorNotificationsPage.jsx` — Notification center
- `VendorPromotionsPage.jsx` — Promotional campaigns
- `VendorAdminPage.jsx` — Internal vendor admin
- `VendorSignUpPage.jsx` — Vendor registration entry

**Context Providers:**
`ChatContext.jsx`, `LanguageContext.jsx`, `LocationContext.jsx`, `MobileMenuContext.jsx`, `ThemeContext.jsx`, `UserRoleContext.jsx`, `VoiceAssistantContext.jsx`

**Vendor Components:**
`VendorLoginModal.jsx`, `VendorProfile.jsx`, `sampleVendorData.js`

---

## 10. FRONTEND — ADMIN CONSOLE (`krishiai/frontend/admin`)

**Package:** `@krishiai/admin` | **Port:** 5175

### Layout & Routing
- `AdminLayout.jsx` — Master layout with sidebar (8 nav items), mobile topbar, user profile, logout
- `adminRoutes.jsx` — Lazy-loaded route definitions

### Admin Pages (8 pages)
| Page | Route | Purpose |
|---|---|---|
| `AdminDashboard.jsx` | `/admin/dashboard` | KPI overview — farmers, vendors, orders, disputes, microservice health |
| `AdminUsersPage.jsx` | `/admin/users` | User directory — search, filter, suspend/activate with audit reason |
| `AdminVendorVerificationPage.jsx` | `/admin/vendor-verification` | KYC inspection desk — approve/reject with document review |
| `AdminProductModerationPage.jsx` | `/admin/product-moderation` | Product catalog moderation — compliance checks |
| `AdminOrdersPage.jsx` | `/admin/orders` | Cross-domain transaction audit — escrow, logistics |
| `AdminComplaintsPage.jsx` | `/admin/complaints` | Grievance mediation desk — dispute resolution |
| `AdminSchemesPage.jsx` | `/admin/schemes` | Government scheme publishing |
| `AdminAuditLogsPage.jsx` | `/admin/audit-logs` | Security audit trail — immutable event log |

---

## 11. SHARED PACKAGES

### @krishiai/ui (Design System)
Components: `Preloader.jsx`, `Button.jsx`, `Card.jsx`, `Modal.jsx`, `Input.jsx`, `Select.jsx`, `Table.jsx`, `Loader.jsx`

### @krishiai/auth
- `AuthProvider.jsx` — Context provider with login/logout/register/switchDomain
- `useAuth.js` — Hook accessing user, token, role, isAdmin, isVendor, isFarmer
- `roleUtils.js` — Role constants (FARMER, VENDOR, ADMIN, SUPER_ADMIN), domain access control
- `authStorage.js` — localStorage wrapper for tokens/profile/domain

### @krishiai/api (API Client)
- `client.js` — Universal Axios client with auto Bearer token, domain header, ngrok bypass, 401 token refresh
- `adminApi.js` — Admin-specific API methods (dashboard stats, users, KYC, moderation, orders, complaints, schemes, audit logs)

### Design Tokens (CSS)
```
Light: --g: #166534, --bg: #f8faf7, --surface: #ffffff
Dark:  --bg: #050e07, --sidebar-bg: #030905, --surface: #030905, --text: #e2f0e4
Font:  Outfit (headings), Inter (body)
Colors: krishi-light=#f0fdf4, krishi-primary=#166534, krishi-secondary=#14532d, krishi-accent=#facc15
```

---

## 12. SMART BYPASS SYSTEM (WhatsApp)

Keyword-matched queries skip the LLM tool-calling loop for <1s response time:

| Keywords | Action | Languages Supported |
|---|---|---|
| weather, forecast, mausam, barish | Direct GPS weather fetch | EN, HI, GU, MR |
| price, mandi, bhav, daam | Direct market price fetch | EN, HI, GU, MR |
| scheme, yojana, subsidy | Direct scheme lookup | EN, HI, GU, MR |
| mandi, market near, nearby | Direct GPS mandi search | EN, HI, GU, MR |
| menu, help, features | Show translated feature menu | 8 languages |

Queries not matching bypass → full LLM agent with 11 tools.

---

## 13. ML PIPELINE

### Crop Yield Prediction Model
- **Algorithm:** XGBoost / RandomForest ensemble (300+ estimators)
- **Training Data:** 10+ years ICAR district data
- **Features (15):** temperature, rainfall, soil NPK, pH, organic carbon, 8-week NDVI time-series, sowing date, district
- **Output:** Yield in quintals/hectare
- **Performance:** R²=0.92, MAE=0.42 q/ha, RMSE=0.58 q/ha
- **Serialized:** `crop_model_v2.pkl`, `crop_encoder.pkl`, `district_encoder.pkl`, `label_encoder.pkl`, `scaler.pkl`
- **Inference:** <45ms, <180ms p95 API response

### Satellite Health Model
- **Input:** NDVI, soil moisture, evapotranspiration, temperature
- **Output:** Health score (0-100), chlorophyll, LAI, land type classification
- **Sources:** Google Earth Engine (Sentinel-2), Open-Meteo, Google Maps Static tiles

---

## 14. DEPLOYMENT

### Vercel (Frontend + Backend)
```json
{
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "frontend/dist" } },
    { "src": "backend/api/index.py", "use": "@vercel/python" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "backend/api/index.py" },
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

### Docker
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Render Deployment (Backend Web Service)

The backend is pre-configured for one-click deployment on [Render](https://render.com).

#### Option A: Monorepo Deployment (Direct from GitHub)
1. In Render Dashboard, click **New +** → **Web Service** (or **Blueprint**).
2. Connect your repository `Manav373/Build-With-AI`.
3. Configure the settings:
   - **Name:** `krishiai-backend`
   - **Region:** `Singapore` (ap-southeast-1) or `Oregon`
   - **Root Directory:** `krishiai/backend`
   - **Runtime:** `Python`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. In **Environment Variables**, configure:
   - `PYTHON_VERSION`: `3.11.9`
   - `PYTHONPATH`: `.`
   - `FORCE_SQLITE`: `true` (or provide `DATABASE_URL` for Supabase Postgres)
   - `GROQ_API_KEY`: Your Groq API key
   - `GEMINI_API_KEY`: Your Gemini API key
   - `OPENWEATHER_API_KEY`: Your OpenWeather key
   - `DATA_GOV_API_KEY`: Your Data.gov.in key
   - `ALLOWED_ORIGINS`: `https://krishiai-bot.vercel.app,https://krishiai.vercel.app`

#### Option B: Standalone Compressed Bundle (`krishiai-backend.zip`)
- Run `py compress_backend.py` from project root to create `krishiai-backend.zip` (1.6 MB).
- Extract or push directly into a standalone `krishiai-backend` repository.
- Connect to Render with **Root Directory** as `./`.

### Production URLs
- Frontend: `https://krishiai-bot.vercel.app` / `https://krishiai.vercel.app`
- Backend: `https://krishiai-frontend-118806637740.us-central1.run.app`
- Vapi Dashboard: `https://dashboard.vapi.ai`

### CORS Origins (Configured)
Localhost ports 5173-5178, 3000, 8081 + production Vercel URLs + Vapi + GCP Run

---

## 15. HOW TO RUN LOCALLY

### Backend
```bash
cd krishiai/backend
python -m venv .venv && .venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env                              # Fill in API keys
python server.py                                  # Starts on http://localhost:8000
```

### Frontend (All 3 apps)
```bash
cd krishiai
npm install                                       # Install all workspace deps
npm run dev                                        # Starts farmer(5173) + vendor(5174) + admin(5175)
# OR individually:
npm run dev:farmer
npm run dev:vendor
npm run dev:admin
```

### Database
- Default: SQLite (`krishiai.db` in backend directory, auto-created)
- Production: Set `DATABASE_URL` to PostgreSQL (Supabase)
- Tables auto-created on startup via `sync_db.py` → `Base.metadata.create_all()`

---

## 16. KEY ARCHITECTURAL PATTERNS

1. **Dual-Channel AI Agent:** Shared 11-tool agent core (`agent.py`) with channel-specific system prompts (web_agent.py, whatsapp_agent.py)
2. **Smart Bypass:** Keyword detection skips LLM for direct function calls on common queries (<1s vs ~3s)
3. **Failed Generation Recovery:** Regex parser handles Groq's broken XML/JSON tool call formats
4. **PII Masking:** All chat messages masked before LLM processing, unmasked in response
5. **In-Memory Cache:** 10-minute TTL for weather, market, scheme queries
6. **History Truncation:** tiktoken-based history pruning to stay within 4000 token context window
7. **Graceful Degradation:** All frontends include mock data fallbacks when backend is offline
8. **Domain Isolation:** Each frontend operates under its own domain (farmer/vendor/admin) with `X-Krishi-Domain` header
9. **Monorepo Sharing:** Vite aliases resolve `@krishiai/*` packages to SHARED/ directory

---

## 17. .gitignore SUMMARY

**Ignored:** `.env`, `__pycache__/`, `*.py[cod]`, `.vscode/`, `.idea/`, `node_modules/`, `dist/`, `.vercel`, `*.db`, `*.csv`, `*.pkl`, `cloudflared.exe`, `localtonet.*`, `backend/scratch/`

**Explicitly Tracked PKLs:** `crop_model_v2.pkl`, `crop_encoder.pkl`, `district_encoder.pkl`, `label_encoder.pkl`, `scaler.pkl`
