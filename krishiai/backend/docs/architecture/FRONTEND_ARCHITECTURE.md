# 🌾 KrishiAI — Frontend Monorepo Architecture

## 1. Executive Summary

KrishiAI utilizes a modern JavaScript/TypeScript workspace monorepo architecture that hosts **three specialized frontend applications** alongside **six shared core packages** in a single repository:

```text
                         KRISHIAI
                    ONE GIT REPOSITORY
                           │
                    ┌──────┴──────┐
                    │   MONOREPO  │
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
          ▼                ▼                ▼
       FARMER            VENDOR            ADMIN
        APP                APP              APP
    (Port 5173)        (Port 5174)      (Port 5175)
          │                │                │
          └────────────────┼────────────────┘
                           │
                    SHARED PACKAGES
                           │
    ┌──────────┬───────────┼───────────┬──────────┬──────────┐
    │          │           │           │          │          │
   UI         API        AUTH        TYPES      UTILS      CONFIG
    │          │           │           │          │          │
    └──────────┴───────────┼───────────┴──────────┴──────────┘
                           │
                           ▼
                    EXISTING BACKEND
                  (FastAPI: Port 8000)
                           │
                           ▼
                    EXISTING DATABASE
                      (PostgreSQL)
```

---

## 2. Directory Layout

```text
krishiai/
├── apps/
│   ├── farmer/               # Farmer Application (farmer.krishiai.com)
│   ├── vendor/               # Vendor Portal (vendor.krishiai.com)
│   └── admin/                # Admin Console (admin.krishiai.com)
│
├── packages/
│   ├── ui/                   # Shared UI Components (Button, Modal, Card, Table...)
│   ├── api/                  # Centralized HTTP Client & API Modules
│   ├── auth/                 # Multi-role Auth Context & Protected Route Guards
│   ├── types/                # Shared Types, Entities & Status Enums
│   ├── utils/                # Formatters, Validators, Helpers
│   └── config/               # Domains, Ports & Environment Config
│
├── docs/                     # Comprehensive Architecture & Migration Docs
├── package.json              # Workspace root scripts & dependencies
├── pnpm-workspace.yaml       # Workspace configuration for pnpm / CI/CD
└── README.md                 # Project Overview & Quickstart Guide
```

---

## 3. Strict Architectural Rules

1. **Zero Backend Modifications:** The FastAPI backend (`backend/`), database (`database/`), and API endpoints remain untouched. All frontend apps adapt to existing APIs.
2. **Domain Isolation:**
   - `apps/farmer` never imports from `apps/vendor` or `apps/admin`.
   - `apps/vendor` never imports from `apps/farmer` or `apps/admin`.
   - `apps/admin` never imports from `apps/farmer` or `apps/vendor`.
3. **Shared Single Source of Truth:** Reusable logic and UI reside exclusively in `packages/*`.
4. **Independent Builds:** Each app can be built and deployed completely independently with its own `vite.config.js` and `package.json`.
