# 🏛️ KrishiAI — Master Project Architecture

> **Comprehensive Architecture Specification for the KrishiAI Unified Agricultural Platform**

---

## 1. System Vision & Core Objective

KrishiAI is an enterprise-scale agricultural platform designed to bridge the digital divide between **Farmers**, **Agri-Vendors**, and **Platform Administrators**.

The platform is engineered around three non-negotiable principles:
1. **One Monorepo Repository**: All code, configurations, and documentation reside in a single repository.
2. **Three Distinct Frontend Domains**:
   - **🌾 FARMER** (`farmer.krishiai.com` / Port 5173): Personalized crop advisory, satellite health, mandi prices, yield prediction, disease detection, government schemes.
   - **🏪 VENDOR** (`vendor.krishiai.com` / Port 5174): B2B procurement, tenders, warehouse management, catalog publishing, order fulfillment, price negotiations.
   - **🛡️ ADMIN** (`admin.krishiai.com` / Port 5175): Ecosystem telemetry, user verification, KYC approval, escrow arbitration, complaint resolution, compliance audit logs.
3. **One Central Backend & One Master Database**:
   - The three frontends are different user experiences of the **same central KrishiAI platform**.
   - All state mutations and workflows synchronize through **ONE central FastAPI server** (Port 8000) and **ONE master database** (`krishiai.db` SQLite / PostgreSQL).

---

## 2. High-Level System Architecture Diagram

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
                         (@krishiai/ui, @krishiai/api, etc.)
                                          │
                                          ▼
                                🔌 COMMON API CLIENT
                         (JWT, Refresh, X-Krishi-Domain)
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

## 3. Directory Layout

```
KrishiAI/
├── FARMER/                  # Farmer Domain Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/          # 22 Farmer-specific Pages
│   │   ├── components/     # Farmer Widgets, Charts & Cards
│   │   ├── layouts/        # MainLayout (Farmer Navigation)
│   │   ├── routes/         # Farmer Route Definitions
│   │   ├── services/       # Farmer API Consumers
│   │   └── App.jsx
│   ├── vite.config.js      # Port 5173
│   └── package.json
│
├── VENDOR/                  # Vendor Domain Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/          # 30 Vendor-specific Pages
│   │   ├── components/     # Procurement, Bids & Warehouse Tables
│   │   ├── layouts/        # VendorDashboardLayout
│   │   ├── routes/         # Vendor Route Definitions
│   │   └── App.jsx
│   ├── vite.config.js      # Port 5174
│   └── package.json
│
├── ADMIN/                   # Admin Domain Frontend (Vite + React)
│   ├── src/
│   │   ├── pages/          # 8 Admin Governance Pages
│   │   ├── components/     # Governance Tables & Metric Cards
│   │   ├── layouts/        # AdminLayout
│   │   └── App.jsx
│   ├── vite.config.js      # Port 5175
│   └── package.json
│
├── backend/                 # READ-ONLY Central FastAPI Backend (Port 8000)
│   ├── app/                # Main Application & Middlewares
│   ├── api/                # API Routers
│   ├── database/           # SQLAlchemy Models & Migrations
│   ├── farmer/             # Farmer Backend Controllers
│   ├── vendor/             # Vendor Backend Controllers
│   ├── shared/             # Shared DB Sessions & Helpers
│   └── server.py           # Master Uvicorn Server Entrypoint
│
├── DATABASE/                # Central Master Database Documentation & Specs
│   ├── documentation/      # Database Architecture & ERD Specifications
│   ├── configuration/      # Pooling & Connection Parameters
│   └── schema-documentation/
│
├── SHARED/                  # Monorepo Shared Frontend Library
│   ├── ui/                 # Reusable UI Atoms & Molecules
│   ├── api-client/         # UniversalApiClient & Domain API Modules
│   ├── auth/               # AuthProvider, ProtectedRoute, roleUtils
│   ├── types/              # Common Data Models & Enums
│   ├── utilities/          # Formatters, Geocoding, Validators
│   └── config/             # Domain URLs, Ports & Constants
│
├── INFRASTRUCTURE/          # Docker & Multi-Domain Deployment Configs
├── DOCS/                    # Complete Platform Documentation
├── SCRIPTS/                 # Dev, Build & Connectivity Verification Tools
├── package.json             # Root Monorepo Orchestrator
└── pnpm-workspace.yaml      # Monorepo Workspace Definitions
```

---

## 4. Key Architectural Guarantees

1. **Domain Isolation**: No frontend domain imports code from another frontend domain directly (`FARMER` ↛ `VENDOR`, `VENDOR` ↛ `ADMIN`). All shared logic resides strictly inside `SHARED/`.
2. **Backend Protection**: The backend is treated as immutable read-only infrastructure during frontend restructuring. All contracts and DB schemas remain preserved.
3. **Unified Single Database**: No separate databases exist for farmer, vendor, or admin. All domain entities live in the single database.
4. **Independent Domain Builds**: Each domain can be developed, tested, and bundled independently via dedicated Vite configurations.
