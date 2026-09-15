# 🌾 KrishiAI — Enterprise Multi-Domain Agricultural Platform

> **AI Agronomist & Agricultural Intelligence Ecosystem**  
> *Track 4: Kisan Alert — Smart Water, Crop & Advisory System*

---

## 🏛️ Ecosystem Architecture

KrishiAI is organized as a high-performance **Monorepo** consisting of three dedicated user domains backed by a single central FastAPI server and one unified relational database:

```text
                                 KRISHIAI PLATFORM
                             (Single Monorepo Repository)
                                          │
                     ┌────────────────────┼────────────────────┐
                     │                    │                    │
                     ▼                    ▼                    ▼
             🌾 FARMER DOMAIN     🏪 VENDOR DOMAIN     🛡️ ADMIN DOMAIN
              Port: 5173           Port: 5174           Port: 5175
             (22 Pages)           (30 Pages)           (8 Pages)
                     │                    │                    │
                     └────────────────────┼────────────────────┘
                                          │
                                          ▼
                                📦 SHARED FRONTEND LAYER
                                (ui, api-client, auth, etc.)
                                          │
                                          ▼
                             🔒 ONE CENTRAL BACKEND
                         (FastAPI Python 3.11 • Port 8000)
                                          │
                                          ▼
                             🗄️ ONE MASTER DATABASE
                           (SQLAlchemy / SQLite / PG)
```

---

## 📂 Master Directory Structure

```text
krishiai/
├── frontend/
│   ├── farmer/              # 🌾 Farmer Domain Web Application (Port 5173)
│   │   ├── src/pages/       # 22 Farmer pages (AI chat, Satellite NDVI, Mandi rates, Yield predict)
│   │   ├── src/components/  # Farmer widgets, charts, and maps
│   │   ├── src/layouts/     # MainLayout (Farmer navbar & sidebar)
│   │   ├── vite.config.js   # Dedicated Vite configuration
│   │   └── package.json     # @krishiai/farmer
│   │
│   ├── vendor/              # 🏪 Vendor Domain Web Application (Port 5174)
│   │   ├── src/pages/       # 30 Vendor pages (Procurement tenders, B2B bids, Warehouse slots)
│   │   ├── src/components/  # Commercial procurement tables, bidding modals
│   │   ├── src/layouts/     # VendorDashboardLayout
│   │   ├── vite.config.js   # Dedicated Vite configuration
│   │   └── package.json     # @krishiai/vendor
│   │
│   └── admin/               # 🛡️ Admin Governance Console (Port 5175)
│       ├── src/pages/       # 8 Governance pages (KYC verification, Moderation, Audit logs)
│       ├── src/components/  # Platform metric cards, audit log streams
│       ├── src/layouts/     # AdminLayout
│       ├── vite.config.js   # Dedicated Vite configuration
│       └── package.json     # @krishiai/admin
│
├── backend/                 # 🔒 READ-ONLY Central FastAPI Backend (Port 8000)
│   ├── app/                # Application routes and dependencies
│   ├── api/                # API router index
│   ├── database/           # SQLAlchemy models and migrations
│   ├── farmer/             # Farmer controllers and services
│   ├── vendor/             # Vendor controllers and services
│   ├── shared/             # Unified database session provider
│   ├── krishiai.db         # Master SQLite physical database
│   └── server.py           # Uvicorn master server entrypoint
│
├── DATABASE/                # 🗄️ Master Database Specifications & Documentation
│   ├── documentation/      # Database Architecture, ERDs, and design rules
│   ├── configuration/      # Connection pooling & PostgreSQL production configs
│   ├── schema-documentation/ # Full column schemas for all 30+ relational tables
│   └── README.md           # Database guide
│
├── SHARED/                  # 📦 Centralized Monorepo Reusable Library
│   ├── ui/                 # Reusable UI primitives (@krishiai/ui)
│   ├── api-client/         # UniversalApiClient (@krishiai/api)
│   ├── auth/               # Multi-domain AuthContext (@krishiai/auth)
│   ├── types/              # Common schemas & role models (@krishiai/types)
│   ├── utilities/          # Currency formatters, geo-distance, dateUtils (@krishiai/utils)
│   ├── config/             # Domain URLs, ports, constants (@krishiai/config)
│   ├── hooks/              # Reusable React hooks (useDebounce, useLocalStorage)
│   └── README.md
│
├── INFRASTRUCTURE/          # 🌐 Deployment & Container Configurations
│   ├── docker/             # Docker Compose & container specs
│   ├── deployment/         # Nginx reverse proxy configuration
│   └── README.md
│
├── DOCS/                    # 📚 Complete Platform Documentation
│   ├── architecture/       # System, domain, frontend, and data flow architecture
│   ├── migration/          # Migration plan, file migration map, backend dependency log
│   ├── api/                # Complete API mapping catalog
│   ├── database/           # Database architecture
│   ├── deployment/         # Subdomain deployment guide
│   └── testing/            # Testing plan & verification checklist
│
├── SCRIPTS/                 # 🛠️ Root Automation Suite
│   ├── dev-all.js          # Concurrent portal runner
│   ├── audit-connectivity.js # Live HTTP health audit
│   ├── build-all.js        # Independent build verification
│   └── README.md
│
├── package.json             # Root Monorepo Orchestration
├── pnpm-workspace.yaml      # Monorepo Workspace Configuration
└── README.md
```

---

## ⚡ Quick Start

### 1. Start the Central Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
pip install -r requirements.txt
python server.py             # Runs on http://localhost:8000 (Swagger docs at /docs)
```

### 2. Launch All 3 Frontend Portals
From the repository root:
```bash
npm run dev:all
```
This concurrently starts:
- 🌾 **Farmer Portal**: `http://localhost:5173`
- 🏪 **Vendor Portal**: `http://localhost:5174`
- 🛡️ **Admin Console**: `http://localhost:5175`

### 3. Run Individual Portals
```bash
npm run dev:farmer    # Port 5173
npm run dev:vendor    # Port 5174
npm run dev:admin     # Port 5175
```

### 4. Build All Domains for Production
```bash
npm run build:all
```

### 5. Audit Platform Connectivity & Health
```bash
npm run audit
```
