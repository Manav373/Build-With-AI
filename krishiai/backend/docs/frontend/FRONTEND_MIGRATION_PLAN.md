# FRONTEND_MIGRATION_PLAN.md — KrishiAI

## 1. Current Architecture
KrishiAI has evolved with Farmer, Vendor, and Admin experiences sharing one FastAPI backend.
The current frontend contains code divided across:
- `src/farmer/`: pages, components, context, routes.
- `src/vendor/`: pages, components, routes.
- `src/admin/`: pages, layouts, routes.
- `src/shared/`: components, context, api.
- Legacy root leftovers: `src/components/`, `src/pages/`, `src/services/`.

## 2. Target Architecture
```text
frontend/src/
├── farmer/             # Complete Farmer domain (advisory, vision, crops, satellite, mandi, orders)
├── vendor/             # Complete Vendor domain (buyer procurement, seller store, logistics, quality)
├── admin/              # Complete Admin domain (governance, KYC, moderation, orders, complaints, schemes)
└── shared/
    ├── components/ui/  # Standardized reusable UI primitives (Button, Modal, Input, Select, Table, Card, Loader, EmptyState, ErrorState, ConfirmDialog)
    ├── services/api/   # Centralized API service layer (client, authApi, farmerApi, vendorApi, adminApi, marketplaceApi, orderApi, notificationApi, aiApi)
    ├── hooks/          # Shared hooks (useAuth, useApi, useNotifications)
    ├── context/        # Global AuthContext & Role management
    └── utils/          # Formatting & helpers
```

## 3. Route Migration & Namespace Map

| Domain | Canonical Route | Compatibility Aliases | Description |
| :--- | :--- | :--- | :--- |
| **Public** | `/` | `/`, `/privacy`, `/terms` | Public Landing Page, Features, Ecosystem Entry |
| **Farmer** | `/farmer/*` | `/chat`, `/satellite`, `/predict`, `/recommend`, `/market-prices`, `/mandi-map`, `/schemes`, `/sell-crops`, `/orders`, `/whatsapp`, `/community`, `/call-history`, `/voice-assistant` | Dedicated Farmer experience |
| **Vendor** | `/vendor/*` | `/vendor-dashboard/*`, `/vendors`, `/vendor/:id`, `/vendor-type-select`, `/vendor-onboarding` | Dedicated Vendor experience |
| **Admin** | `/admin/*` | `/admin/dashboard`, `/admin/users`, `/admin/vendors`, `/admin/products`, `/admin/orders`, `/admin/complaints`, `/admin/schemes`, `/admin/audit-logs` | Dedicated Admin Command Center |

## 4. Shared Component Library
- `Button`: Primary, secondary, outline, danger, sizes, loading state
- `Modal`: Accessible dialog, backdrop, close button, actions
- `Input`: Label, error, helper text, leading/trailing icons
- `Select`: Dropdown select with options
- `Table`: Responsive table with empty handling and row highlight
- `Card`: Container with header, body, footer
- `Loader`: Centered spinner with text
- `EmptyState`: Clean empty icon, title, description, action
- `ErrorState`: Alert box with retry trigger
- `Notification`: Toast alert item
- `ConfirmDialog`: Action confirmation modal

## 5. Centralized API Service Layer
- `shared/services/api/client.js`: Universal fetch/axios wrapper with Bearer token injection, automatic refresh on 401, timeout, and error normalization.
- `shared/services/api/authApi.js`: Login, register, me, refresh, logout, OTP.
- `shared/services/api/farmerApi.js`: Web chat, vision analysis, audio transcription, location save/fetch, heatmap, mandi prices, mandi map, voice call history.
- `shared/services/api/vendorApi.js`: Vendor registration, profile, requirements, tenders, applications, catalog products, orders, payouts.
- `shared/services/api/adminApi.js`: Dashboard telemetry, users list & status toggles, vendor KYC decisions, product moderation, orders monitor, complaints resolution, schemes manager, audit trail.
- `shared/services/api/marketplaceApi.js`: Farmer crop listings, vendor discovery, bid submission, offer acceptance.
- `shared/services/api/orderApi.js`: Unified order stream, my-orders, order lifecycle status machine.
- `shared/services/api/notificationApi.js`: Platform real-time in-app notifications.
- `shared/services/api/aiApi.js`: Crop yield prediction, crop recommendation, GEE satellite health, pixel analysis.

## 6. Zero Backend Modification Assurance
All services adapt strictly to the existing backend endpoints:
- Existing `/api/web/*`, `/api/ml/*`, `/api/schemes/*`, `/api/vapi/*`, `/api/location/*`, `/api/community/*`
- Existing `/api/vendor/*`
- Existing `/api/v1/auth/*`, `/api/v1/admin/*`, `/api/v1/marketplace/*`, `/api/v1/orders/*`
No changes are made to backend code, database models, or server migrations.
