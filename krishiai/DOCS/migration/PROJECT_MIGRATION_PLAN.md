# 📋 KrishiAI — Master Project Migration Plan

> **Step-by-step Execution Blueprint for Project Restructuring, Code Centralization, and Domain Decoupling**

---

## 1. Problem Statement & Baseline Analysis

Before restructuring, the KrishiAI codebase suffered from several structural anti-patterns:
- **Redundant Package Duplication**: Reusable UI and API modules were copied redundantly into `FARMER/packages`, `VENDOR/packages`, and `ADMIN/packages`.
- **Misplaced Backend Slices**: Fragmented backend directories (`FARMER/backend`, `VENDOR/backend`, `FARMER/profile`, `VENDOR/profile`) existed inside the frontend folders, violating the single backend principle.
- **Scattered Utilities**: Root directories had unorganized configs, scripts, and documentation without a centralized monorepo structure.

---

## 2. Target Clean Architecture

```
KrishiAI/
├── FARMER/             # Pure Farmer Frontend (Port 5173)
├── VENDOR/             # Pure Vendor Frontend (Port 5174)
├── ADMIN/              # Pure Admin Frontend (Port 5175)
├── backend/            # Central READ-ONLY FastAPI Backend (Port 8000)
├── DATABASE/           # Unified Master Database Specs & Documentation
├── SHARED/             # Central Monorepo Reusable Frontend Library
├── INFRASTRUCTURE/     # Monorepo Docker & Deployment Configurations
├── DOCS/               # Complete Platform Documentation
├── SCRIPTS/            # Root Orchestration & Connectivity Scripts
├── package.json        # Unified Workspaces Orchestrator
└── pnpm-workspace.yaml # Monorepo Workspace Definitions
```

---

## 3. Phased Migration Blueprint

### Phase 1: Analysis & Architectural Documentation
- Establish `DOCS/` hierarchy.
- Document domain boundaries, data flows, and file migration inventory.

### Phase 2: Establish Centralized `SHARED/` Workspace
- Consolidate reusable packages into root `SHARED/`:
  - `SHARED/ui/`: Standardized UI components (Button, Modal, Card, Table, Preloader, etc.)
  - `SHARED/api-client/`: UniversalApiClient with JWT authorization and domain awareness.
  - `SHARED/auth/`: AuthProvider, ProtectedRoute, role utilities, and token storage.
  - `SHARED/types/`: Centralized interfaces and data schemas.
  - `SHARED/utilities/`: Formatters, geocoders, and validators.
  - `SHARED/config/`: Ports, domains, and constants.
  - `SHARED/hooks/`: Cross-domain React hooks.

### Phase 3: Establish Central `DATABASE/`, `INFRASTRUCTURE/`, and `SCRIPTS/`
- Create root `DATABASE/` documenting schema architectures, connection pooling, and table references.
- Create root `INFRASTRUCTURE/` containing Docker Compose and reverse proxy templates.
- Establish root `SCRIPTS/` containing `dev-all.js`, `audit-connectivity.js`, and `build-all.js`.

### Phase 4: Clean & Decouple Domain Frontends
- **FARMER**:
  - Point `@shared` and `@krishiai/*` aliases in `vite.config.js` to root `SHARED/`.
  - Remove duplicate `FARMER/packages`, `FARMER/backend`, and `FARMER/profile`.
- **VENDOR**:
  - Point `@shared` and `@krishiai/*` aliases in `vite.config.js` to root `SHARED/`.
  - Remove duplicate `VENDOR/packages`, `VENDOR/backend`, and `VENDOR/profile`.
- **ADMIN**:
  - Point `@shared` and `@krishiai/*` aliases in `vite.config.js` to root `SHARED/`.
  - Remove duplicate `ADMIN/packages`.

### Phase 5: Monorepo Orchestration & Root Configuration
- Update root `package.json` to declare `FARMER`, `VENDOR`, `ADMIN`, and `SHARED/*` workspaces.
- Update `pnpm-workspace.yaml`.
- Update root `README.md` with complete architecture guide and port map.

### Phase 6: Build Verification
- Execute `npm run build:farmer`, `npm run build:vendor`, `npm run build:admin`.
- Confirm zero compilation or bundling errors.

### Phase 7: Live Runtime & E2E Verification
- Run `node SCRIPTS/audit-connectivity.js` to verify HTTP 200 on all 4 engines (8000, 5173, 5174, 5175).
- Audit backend logs to verify active dynamic API handling.

---

## 4. Rollback Plan
- Full backups of all file paths are maintained in conversation transcripts and Git history.
- If any build failure occurs during package aliasing, the local package path can be temporarily reinstated while resolving alias paths.
