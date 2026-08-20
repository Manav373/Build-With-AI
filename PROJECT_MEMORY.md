# 🌾 KrishiAI — Master Project Memory & Architecture Context

> **AI INSTRUCTION / SYSTEM PROMPT PRELUDE**  
> If you are an AI assistant or coding agent reading this file: **This is the complete, single-source-of-truth project memory for KrishiAI.** Read this file entirely to gain 100% instant understanding of the project's domain, codebase architecture, backend APIs, frontend structure, mobile application, database schema, AI/ML integrations, deployment instructions, and conventions.

---

## 1. 📌 Executive Summary & Problem Context

- **Project Name:** KrishiAI (Track 4: *Kisan Alert - Smart Water, Crop & Advisory System*)
- **Core Mission:** A 24/7 personalized AI Agronomist & Agricultural Intelligence Platform democratizing data-driven farming for 100M+ small & marginal farmers in India.
- **Core Value Proposition:**
  1. **Sub-4s Response Speed (Blink Engine):** Fast multi-tier progressive hydration for low-bandwidth rural networks.
  2. **Zero-App Barrier:** Accessible via Toll-Free Voice calls (Vapi/Twilio), SMS, WhatsApp bot, Mobile App (React Native/Expo), and Web Dashboard.
  3. **Multimodal AI Agronomy:** Google Gemini 1.5/2.0 Flash & Pro for leaf disease diagnosis, soil recommendation, and localized vernacular advisory in 10+ Indian languages (Hindi, Telugu, Tamil, Marathi, Punjabi, Gujarati, etc.).
  4. **Satellite & Hyperlocal Data:** Google Earth Engine (Sentinel-2, Landsat, MODIS) for NDVI, NDWI, EVI, soil moisture, and weather micro-climates.
  5. **Direct Market & Vendor Ecosystem:** Real-time APMC Mandi prices + MSP price floor intelligence + B2B Vendor Marketplace connecting farmers directly with bulk buyers, seed/fertilizer suppliers, and equipment providers.

---

## 2. 📂 Monorepo Structure & Directory Map

```
hackathon prototype/
├── PROJECT_MEMORY.md           <-- [YOU ARE HERE] Master single-file AI memory
├── GEMINI.md / AGENTS.md       <-- System rules for AI coding assistants
├── README.md                   <-- High-level overview & setup
├── VENDOR_SYSTEM_DETAILS.md    <-- Complete Multi-Vendor Ecosystem Guide
├── VENDOR_WORKFLOW.md          <-- Step-by-step Vendor & Farmer interaction flow
├── PROJECT_OVERVIEW.md         <-- Hackathon executive summary & problem-solution
├── TECHNICAL_ARCHITECTURE.md   <-- Deep technical architectural breakdown
├── PRODUCT_FEATURES.md         <-- Feature specifications & functional matrix
├── BUSINESS_STRATEGY.md        <-- Go-To-Market, revenue models & impact
├── IMPLEMENTATION_GUIDE.md     <-- Step-by-step dev & deployment guide
├── build_full_deck.py          <-- Script generating 20+ slide hackathon PowerPoint deck
│
├── krishiai/                   <-- Main Fullstack Web & Backend Service
│   ├── backend/                <-- FastAPI Python Backend (REST + MCP Server)
│   │   ├── app/
│   │   │   ├── main.py         <-- FastAPI entrypoint, lifespan, CORS & routers
│   │   │   ├── core/           <-- Config, security, logging
│   │   │   ├── db/             <-- SQLAlchemy database models & connection
│   │   │   ├── models/         <-- Database ORM & Pydantic schemas (location, market, vendor, etc.)
│   │   │   ├── services/       <-- Core business logic: GEE, Gemini AI, Weather, Market, Voice
│   │   │   └── utils/          <-- Helper utilities & formatters
│   │   ├── api/routes/         <-- All API Route Handlers:
│   │   │   ├── auth.py         <-- Authentication & Farmer/Vendor profiles
│   │   │   ├── community.py    <-- P2P Farmer community discussions & tips
│   │   │   ├── location.py     <-- GPS, District, Weather & Soil lookup
│   │   │   ├── mcp.py          <-- Model Context Protocol (MCP) tool server
│   │   │   ├── ml.py           <-- Crop disease diagnosis & recommendation engine
│   │   │   ├── schemes.py      <-- Government subsidy & welfare scheme matching
│   │   │   ├── sms.py          <-- Twilio/Gupshup SMS advisory gateway
│   │   │   ├── vapi.py         <-- Vapi voice assistant webhooks
│   │   │   ├── vendor.py       <-- Vendor marketplace, B2B requirements & bids
│   │   │   ├── web.py          <-- General web telemetry & analytics
│   │   │   └── whatsapp.py     <-- WhatsApp bot webhook (Twilio WhatsApp API)
│   │   ├── scripts/
│   │   │   ├── seed_vendor_data.py <-- Seed script for comprehensive vendor ecosystem
│   │   │   └── sync_db.py      <-- Database migration & schema sync
│   │   └── requirements.txt
│   │
│   └── frontend/               <-- React 18 + Vite Web Application
│       ├── src/
│       │   ├── pages/          <-- Farmer dashboard, AI diagnosis, Satellite, Mandi, Multi-Vendor Pages
│       │   ├── components/     <-- UI components, layout, landing, and vendor modules
│       │   ├── context/        <-- React context providers (Language, Location, Auth, Chat, Voice, Role)
│       │   └── utils/          <-- Translations (EN, HI, MR, GU) and helpers
│       ├── package.json
│       └── vite.config.js
│
└── krishi-mobile/              <-- React Native + Expo Mobile Application (Offline-first)
│       │   ├── components/     <-- Modular UI: Navbar, AudioRecorder, SatelliteMap, Charts
│       │   ├── context/        <-- AuthContext, LanguageContext, ThemeContext
│       │   ├── services/       <-- Axios API clients (authService, mlService, marketService, etc.)
│       │   ├── styles/ & index.css
│       │   └── main.jsx        <-- React Router & Provider setup
│       └── package.json
│
└── krishi-mobile/              <-- React Native / Expo Mobile App
    ├── app/                    <-- Expo Router directory (tabs, offline, voice, satellite, schemes)
    ├── components/             <-- Reusable mobile UI components
    ├── hooks/ & services/      <-- Offline caching (AsyncStorage), network sync, voice capture
    └── package.json
```

---

## 3. 🛠️ Tech Stack & Key Integrations

| Layer | Technologies & Libraries |
|---|---|
| **Backend** | Python 3.11+, FastAPI, Uvicorn, SQLAlchemy, SQLite/PostgreSQL, Pydantic v2 |
| **AI / LLM** | Google Gemini 1.5 Pro & Flash (Vision + Reasoning), Groq (Llama 3 70B for fast translation), LangChain |
| **Geo / Satellite** | Google Earth Engine (GEE Python API - Sentinel-2, Landsat-8, ERA5), OpenWeatherMap API |
| **Communication / Voice** | Vapi AI (Voice Agent), Twilio (SMS & WhatsApp Webhooks), Deepgram (STT), ElevenLabs (TTS) |
| **Frontend** | React 18, Vite, TailwindCSS, Lucide-React, Leaflet / React-Leaflet, Chart.js / Recharts |
| **Mobile App** | React Native, Expo 51+, Expo Router, AsyncStorage (offline first), React Native Reanimated |
| **MCP Integration** | FastMCP / MCP Server exposing agricultural tools to Claude, Gemini & other AI agents |

---

## 4. 🧠 Core Features & Capabilities Matrix

### A. Blink Engine (Sub-4s Multi-Tier Architecture)
- **Tier 1 (Instant < 200ms):** Cached regional agronomy baselines, standard seasonal recommendations.
- **Tier 2 (Fast < 1.5s):** Real-time weather, APMC Mandi price discovery, soil card integration.
- **Tier 3 (Deep < 3.5s):** Google Earth Engine Sentinel-2 NDVI computation + Gemini Multimodal diagnosis.

### B. Multimodal Crop Health & Disease Diagnostic
- Accepts leaf photos (via WhatsApp, Web, or Mobile App).
- Gemini Vision analyzes lesions, discoloration, pest presence, and fungal spores.
- Outputs: Disease name, confidence %, organic remedies, chemical remedies, and prevention schedule.

### C. Smart Soil & Crop Recommendation
- Synthesizes N-P-K soil card values, seasonal rainfall predictions, temperature forecasts, and current Mandi market profitability.
- Recommends top 3 crops with expected yield and estimated profit per acre.

### D. Hyperlocal APMC Mandi & Price Floor Tracker
- Real-time price tracking across 3,000+ Indian APMC mandis.
- Compares MSP (Minimum Support Price) with local mandi rates to prevent farmer distress sales.

### E. B2B Vendor Marketplace & Farm-to-Fork Linkage
- Farmers can view contracts, crop requirements from certified FMCG/retail buyers, and list harvest lots.
- Verified vendors can bid directly on farmer produce and offer genuine inputs (certified seeds, bio-fertilizers).

### F. Voice & Omnichannel Assistance (Vapi + Twilio)
- Toll-free phone calls answered by AI agronomist with real-time conversational STT/TTS in Indian regional languages.
- Twilio WhatsApp interactive bot with rich media cards and menu prompts.

---

## 5. 🔌 Backend API Routes & Key Endpoints

| Route File | Prefix | Purpose | Key Endpoints |
|---|---|---|---|
| `auth.py` | `/api/auth` | User/Farmer/Vendor Authentication | `POST /login`, `POST /signup`, `GET /me` |
| `ml.py` | `/api/ml` | Disease detection & Crop Advisory | `POST /predict-disease`, `POST /recommend-crops` |
| `location.py` | `/api/location`| Weather, GEE Satellite & Soil data | `GET /weather`, `GET /satellite-indices`, `GET /soil` |
| `whatsapp.py` | `/api/whatsapp`| WhatsApp Webhook (Twilio) | `POST /webhook`, `POST /send-alert` |
| `vapi.py` | `/api/vapi` | Voice Assistant Webhook | `POST /webhook`, `POST /call-status` |
| `sms.py` | `/api/sms` | SMS Alerts & Advisory | `POST /send-advisory` |
| `schemes.py` | `/api/schemes` | Govt Scheme Matching | `GET /search`, `GET /eligible` |
| `community.py`| `/api/community`| Farmer Q&A Forum | `GET /posts`, `POST /posts`, `POST /answers` |
| `vendor.py` | `/api/vendor` | Vendor Marketplace & Contracts | `GET /products`, `GET /requirements`, `POST /bid` |
| `mcp.py` | `/api/mcp` | MCP Agent Tools | `GET /tools`, `POST /execute` |

---

## 6. 💻 How to Run the System Locally

### Backend (FastAPI)
```bash
cd "krishiai/backend"
# Create/activate virtual environment
python -m venv venv
venv\Scripts\activate      # Windows
# Install dependencies
pip install -r requirements.txt
# Run dev server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend (React + Vite)
```bash
cd "krishiai/frontend"
npm install
npm run dev
# Accessible at http://localhost:5173
```

### Mobile App (Expo)
```bash
cd "krishi-mobile"
npm install
npx expo start
```

---

## 7. 🔑 Key Environment Variables (`.env`)

```env
# AI & LLM Keys
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Communication
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_number
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VAPI_API_KEY=your_vapi_key
VAPI_PHONE_NUMBER_ID=your_vapi_phone_id

# Database & Core
DATABASE_URL=sqlite:///./krishi.db
SECRET_KEY=your_jwt_secret_key
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Geo / Satellite
GOOGLE_APPLICATION_CREDENTIALS=path/to/gee_service_account.json
OPENWEATHER_API_KEY=your_openweather_key
```

---

## 8. 🎯 Golden Rules & AI Guidelines for Modifying this Codebase

1. **Preserve Sub-4s Philosophy:** When modifying ML routes or GEE pipelines, maintain caching and asynchronous background tasks to avoid blocking the main event loop.
2. **Vernacular & Multilingual First:** Ensure any new farmer-facing feature or alert output supports translation and vernacular display.
3. **Database Consistency:** When adding new models, register them in `app/main.py` and ensure SQLite compatibility while writing standard SQLAlchemy ORM definitions.
4. **Clean Decoupling:** Keep route controllers in `api/routes/` clean by placing external API integrations in `app/services/`.
5. **No Broken Links or Placeholders:** Ensure frontend icons, Leaflet map tiles, and interactive modals function with proper fallback handlers.
