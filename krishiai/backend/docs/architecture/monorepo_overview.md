# KrishiAI Monorepo Architecture Overview

## 1. High-Level Monorepo Structure

KrishiAI uses a **domain-driven modular monorepo** architecture that clearly delineates domains while allowing seamless cross-domain data sharing and centralized authentication:

```
krishiai/
├── farmer/                      # Farmer Domain Module
│   ├── frontend/                # Farmer UI pages, components, views
│   ├── backend/                 # Farmer REST routes, AI agents, services
│   └── database/                # Farmer ORM models (location, market, call history)
│
├── vendor/                      # Vendor Domain Module
│   ├── frontend/                # Vendor UI pages, procurement & seller tools
│   ├── backend/                 # Vendor REST routes, negotiation, orders, ledger
│   └── database/                # Vendor ORM models (21 marketplace & procurement tables)
│
├── shared/                      # Cross-Cutting Shared Module
│   ├── frontend/                # Shared contexts, hooks, common UI, API client
│   ├── backend/                 # Shared core auth, weather, mandi benchmarks, SMS
│   └── database/                # Unified DB connection, base metadata, sync helper
│
├── infrastructure/              # Deployment & DevOps
│   ├── deployment/              # Dockerfiles, docker-compose, nginx config
│   ├── config/                  # .env templates and configuration guides
│   └── scripts/                 # Migration scripts & model training
│
└── docs/                        # Complete Technical Documentation
    ├── architecture/            # Architecture diagrams & domain workflows
    ├── api/                     # REST & WebSocket endpoint catalog
    ├── database/                # Database schema ERD & table definitions
    ├── farmer/                  # Farmer domain capabilities
    └── vendor/                  # Vendor domain capabilities
```

## 2. Key Design Principles

1. **Centralized Identity & Role Hierarchy**:
   - Single Clerk authentication session.
   - Dynamic user role context (`UserRoleContext.jsx`) allowing instant switching between Farmer and Vendor profiles.

2. **Unified Data Layer, Segmented Models**:
   - One shared SQLite database connection (`shared/database/connection.py`).
   - Domain-specific model files (`farmer/database/models/` and `vendor/database/models/`) inheriting from the same declarative `Base`.

3. **Cross-Domain Communication via Well-Defined APIs**:
   - No tight coupling between Farmer and Vendor source code.
   - Cross-domain interactions (like farmer applications on vendor requirements) occur through REST API endpoints and foreign keys.

4. **Zero-Overhead Path Aliasing**:
   - `vite.config.js` configures `@farmer`, `@vendor`, and `@shared` path aliases for fast, clean imports.
