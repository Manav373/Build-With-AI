# 🎨 KrishiAI — Frontend Architecture

> **Standards for Components, Routing, Shared Packages, State Management, and Build Systems**

---

## 1. Frontend Technology Stack

The entire frontend across all three domains is standardized on modern, performance-optimized web technologies:

- **Core Framework**: React 19 (`react`, `react-dom`)
- **Bundler & Dev Server**: Vite 7 (`vite`, `@vitejs/plugin-react`)
- **Routing**: React Router 7 (`react-router-dom`)
- **Styling**: Tailwind CSS 3.4 (`tailwindcss`, `postcss`, `autoprefixer`)
- **Icons & UI Primitives**: Lucide React (`lucide-react`)
- **Visualizations**: Recharts (`recharts`)
- **Geospatial & Mapping**: Leaflet & React Leaflet (`leaflet`, `react-leaflet`, `maplibre-gl`)
- **Animations & Interactivity**: Framer Motion (`framer-motion`) & GSAP (`gsap`)

---

## 2. Shared Frontend Layer (`SHARED/`)

To prevent code duplication across domains while preserving absolute domain isolation, all shared elements reside in the root `SHARED/` directory:

```
SHARED/
├── ui/                  # Standardized UI Atoms & Molecules
│   ├── Button.jsx       # Universal themed button with loading state
│   ├── Input.jsx        # Validated input with label & error text
│   ├── Modal.jsx        # Accessible dialog backdrop with ESC & close handlers
│   ├── Card.jsx         # Card container with variants (hover, border, glass)
│   ├── Table.jsx        # Paginated, sortable data table
│   ├── Dropdown.jsx     # Click-outside menu
│   ├── Preloader.jsx    # KrishiAI signature loading animation
│   ├── Loader.jsx       # Inline spinner
│   ├── ErrorState.jsx   # Standardized error fallback
│   ├── EmptyState.jsx   # Standardized empty data prompt
│   ├── Badge.jsx        # Status tags (Active, Pending, Rejected)
│   ├── Select.jsx       # Standard form select
│   ├── Skeleton.jsx     # Content placeholder shimmer
│   └── ConfirmDialog.jsx # Confirmation prompt modal
│
├── api-client/          # Universal HTTP API Client
│   ├── client.js        # UniversalApiClient (JWT auth, token refresh, X-Krishi-Domain)
│   ├── farmerApi.js     # Typed endpoint methods for farmer workflows
│   ├── vendorApi.js     # Typed endpoint methods for vendor workflows
│   ├── adminApi.js      # Typed endpoint methods for admin governance
│   ├── marketplaceApi.js # Shared marketplace & product discovery
│   ├── orderApi.js      # Cross-domain orders & escrow
│   └── aiApi.js         # Multimodal Gemini & ML prediction endpoints
│
├── auth/                # Central Authentication & Protected Routes
│   ├── AuthProvider.jsx # Global session context provider
│   ├── ProtectedRoute.jsx # Route guard verifying authentication & role
│   ├── tokenManager.js  # JWT localStorage storage & auto-refresh
│   ├── authStorage.js   # Session persistence helpers
│   ├── roleUtils.js     # Role verification ('farmer', 'vendor', 'admin')
│   └── useAuth.js       # Hook consuming authentication state
│
├── types/               # Common Schema Definitions & Enums
│   └── index.js         # User, Role, Order, Product, Listing schemas
│
├── utilities/           # Universal Pure Functions
│   ├── formatters.js    # Currency (₹ Lakh/Crore), numbers, phone, GSTIN
│   ├── dateUtils.js     # Relative time (timeAgo), ISO date formatters
│   ├── geoUtils.js      # Haversine distance, lat/lon radius calculation
│   └── validators.js    # Email, phone, GSTIN, PAN validation
│
├── config/              # Centralized Platform Configuration
│   ├── ports.js         # Port definitions (5173, 5174, 5175, 8000)
│   ├── domains.js       # Domain placeholders (farmer, vendor, admin)
│   └── constants.js     # API timeouts, fallback coordinates, status codes
│
└── hooks/               # Universal Custom React Hooks
    ├── useDebounce.js   # Debounce for search inputs
    └── useLocalStorage.js # Safe reactive localStorage access
```

---

## 3. Module Resolution & Aliases

Each domain's `vite.config.js` is configured with uniform aliases pointing to root `SHARED/`:

```javascript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
    '@shared': path.resolve(__dirname, '../SHARED'),
    '@krishiai/ui': path.resolve(__dirname, '../SHARED/ui'),
    '@krishiai/api': path.resolve(__dirname, '../SHARED/api-client'),
    '@krishiai/auth': path.resolve(__dirname, '../SHARED/auth'),
    '@krishiai/types': path.resolve(__dirname, '../SHARED/types'),
    '@krishiai/utils': path.resolve(__dirname, '../SHARED/utilities'),
    '@krishiai/config': path.resolve(__dirname, '../SHARED/config'),
    '@krishiai/hooks': path.resolve(__dirname, '../SHARED/hooks'),
  }
}
```

---

## 4. Cross-Domain Independence Rule

- **Strict Import Boundary**: Domain packages NEVER import from each other directly:
  ```javascript
  // ❌ ILLEGAL: Direct cross-domain import
  import { VendorCard } from '../../VENDOR/src/components/VendorCard';

  // ✅ LEGAL: Importing genuinely reusable components from SHARED
  import { Card, Button } from '@krishiai/ui';
  import { fetchMarketPrices } from '@krishiai/api';
  ```
- All interaction between domains occurs **asynchronously through the central backend and database**.
