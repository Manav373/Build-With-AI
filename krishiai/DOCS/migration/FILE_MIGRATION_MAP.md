# 🗺️ KrishiAI — File Migration Map

> **Complete Mapping of Current Repository Files to Target Monorepo Architecture**

| Current File / Directory | Purpose | Domain | Target Location | Dependencies | Action | Status |
|---|---|---|---|---|---|---|
| `FARMER/src/pages/*` (22 pages) | Farmer UI pages (chat, satellite, mandi, etc.) | FARMER | `FARMER/src/pages/*` | React, React Router, Recharts, Leaflet | KEEP | Verified |
| `FARMER/src/components/*` | Farmer-specific widgets & charts | FARMER | `FARMER/src/components/*` | Lucide, Tailwind | KEEP | Verified |
| `FARMER/src/layouts/*` | Farmer navigation shell & header | FARMER | `FARMER/src/layouts/*` | React Router, Lucide | KEEP | Verified |
| `FARMER/src/context/*` | Language and location state | FARMER | `FARMER/src/context/*` | React Context | KEEP | Verified |
| `FARMER/src/utils/translations/*` | Regional language dictionaries (en, hi, mr, gu) | FARMER | `FARMER/src/utils/translations/*` | None | KEEP | Verified |
| `FARMER/vite.config.js` | Farmer Vite build & dev config | FARMER | `FARMER/vite.config.js` | Vite, React Plugin | REFACTOR | Updated to @shared |
| `FARMER/packages/*` | Redundant local duplicate of shared packages | SHARED | Centralized in `SHARED/*` | None | REMOVE | Consolidated |
| `FARMER/backend/*` | Redundant backend slice inside frontend folder | BACKEND | Centralized in `backend/` | Python/FastAPI | REMOVE | Consolidated |
| `FARMER/profile/*` | Redundant backend profile slice inside frontend | BACKEND | Centralized in `backend/` | SQLAlchemy | REMOVE | Consolidated |
| `VENDOR/src/pages/*` (30 pages) | Vendor UI pages (tenders, warehouse, products, etc.) | VENDOR | `VENDOR/src/pages/*` | React, React Router, Recharts | KEEP | Verified |
| `VENDOR/src/components/*` | Vendor data cards, tables, bidding widgets | VENDOR | `VENDOR/src/components/*` | Lucide, Tailwind | KEEP | Verified |
| `VENDOR/src/layouts/*` | VendorDashboardLayout navigation shell | VENDOR | `VENDOR/src/layouts/*` | React Router, Lucide | KEEP | Verified |
| `VENDOR/vite.config.js` | Vendor Vite build & dev config | VENDOR | `VENDOR/vite.config.js` | Vite, React Plugin | REFACTOR | Updated to @shared |
| `VENDOR/packages/*` | Redundant local duplicate of shared packages | SHARED | Centralized in `SHARED/*` | None | REMOVE | Consolidated |
| `VENDOR/backend/*` | Redundant backend slice inside frontend folder | BACKEND | Centralized in `backend/` | Python/FastAPI | REMOVE | Consolidated |
| `VENDOR/profile/*` | Redundant backend profile slice inside frontend | BACKEND | Centralized in `backend/` | SQLAlchemy | REMOVE | Consolidated |
| `ADMIN/src/pages/*` (8 pages) | Admin governance pages (KYC, complaints, audits) | ADMIN | `ADMIN/src/pages/*` | React, React Router | KEEP | Verified |
| `ADMIN/src/layouts/*` | Admin Master Console layout | ADMIN | `ADMIN/src/layouts/*` | React Router, Lucide | KEEP | Verified |
| `ADMIN/vite.config.js` | Admin Vite build & dev config | ADMIN | `ADMIN/vite.config.js` | Vite, React Plugin | REFACTOR | Updated to @shared |
| `ADMIN/packages/*` | Redundant local duplicate of shared packages | SHARED | Centralized in `SHARED/*` | None | REMOVE | Consolidated |
| `backend/server.py` | FastAPI master server entrypoint | BACKEND | `backend/server.py` | FastAPI, Uvicorn | KEEP | Preserved (Read-Only) |
| `backend/database/*` | SQLAlchemy ORM models, sessions, connection | BACKEND | `backend/database/*` | SQLAlchemy, SQLite | KEEP | Preserved (Read-Only) |
| `backend/farmer/*` | Farmer backend controllers & services | BACKEND | `backend/farmer/*` | FastAPI, Pydantic | KEEP | Preserved (Read-Only) |
| `backend/vendor/*` | Vendor backend controllers & services | BACKEND | `backend/vendor/*` | FastAPI, Pydantic | KEEP | Preserved (Read-Only) |
| `backend/krishiai.db` | Single unified SQLite database file | DATABASE | `backend/krishiai.db` | SQLite / SQLAlchemy | KEEP | Master Database |
| `backend/scripts/dev-all.js` | Portal orchestration script | SCRIPTS | `SCRIPTS/dev-all.js` | Node.js child_process | MOVE | Migrated to SCRIPTS |
| `packages/ui` | Reusable UI atoms (Button, Modal, Table, etc.) | SHARED | `SHARED/ui/*` | React, Tailwind | SHARE | Consolidated |
| `packages/api` | UniversalApiClient & domain client modules | SHARED | `SHARED/api-client/*` | Fetch, JWT | SHARE | Consolidated |
| `packages/auth` | AuthProvider, ProtectedRoute, role utilities | SHARED | `SHARED/auth/*` | React, JWT | SHARE | Consolidated |
| `packages/types` | Centralized schemas, types, interfaces | SHARED | `SHARED/types/*` | None | SHARE | Consolidated |
| `packages/utils` | Pure formatters, date utilities, geocoders | SHARED | `SHARED/utilities/*` | None | SHARE | Consolidated |
| `packages/config` | Ports, domains, constants | SHARED | `SHARED/config/*` | None | SHARE | Consolidated |
| `package.json` | Root workspace orchestrator | CONFIG | `package.json` | npm workspaces | REFACTOR | Updated |
| `pnpm-workspace.yaml` | Monorepo package declaration | CONFIG | `pnpm-workspace.yaml` | pnpm | REFACTOR | Updated |
