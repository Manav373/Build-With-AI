# Best File Structure for KrishiAI (Full Stack)

This file structure represents the industry best practices for a scalable full-stack application with a React (Vite) frontend and a Python (FastAPI/Flask) backend, specifically tailored for the KrishiAI platform.

## Root Directory (`/krishiai`)

```text
krishiai/
│
├── frontend/                 # React (Vite) Frontend Application
│   ├── .env                  # Environment variables for frontend
│   ├── index.html            # Entry HTML file
│   ├── package.json          # Frontend dependencies and scripts
│   ├── tailwind.config.js    # Tailwind CSS configuration
│   ├── vite.config.js        # Vite configuration
│   ├── public/               # Static assets served directly (favicon, manifest, etc.)
│   │   ├── icons/            # App icons
│   │   └── images/           # Static images
│   │
│   └── src/                  # Source code for React application
│       ├── App.jsx           # Root component
│       ├── main.jsx          # Entry point (React rendering)
│       ├── index.css         # Global CSS / Tailwind directives
│       │
│       ├── assets/           # Processed static assets (images, fonts, css)
│       │
│       ├── components/       # Reusable UI components
│       │   ├── common/       # Generic components (Button, Input, Modal, Loader)
│       │   ├── layout/       # Layout components (Navbar, Sidebar, Footer, PageWrapper)
│       │   └── feature/      # Feature-specific components (e.g., MapComponent)
│       │
│       ├── pages/            # Top-level Page components (mapped to routes)
│       │   ├── Home.jsx      # E.g., Home page
│       │   ├── Dashboard.jsx
│       │   ├── FarmerAnalytics.jsx
│       │   └── MarketPricePage.jsx
│       │
│       ├── context/          # React Context providers (Global State)
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx
│       │
│       ├── hooks/            # Custom React Hooks
│       │   ├── useAuth.js
│       │   ├── useGeolocation.js
│       │   └── useFetchData.js
│       │
│       ├── services/         # API service files (Axios/Fetch configurations)
│       │   ├── api.js        # Axios instance/interceptors
│       │   └── cropService.js
│       │
│       ├── store/            # Redux/Zustand global state store (if used)
│       │   ├── useAppStore.js
│       │
│       ├── utils/            # Helper functions and utilities
│       │   ├── formatters.js # Date/currency formatting
│       │   ├── constants.js  # App-wide constants
│       │   └── validators.js # Form validation logic
│       │
│       └── AppRoutes.jsx     # Application routing logic
│
├── backend/                  # Python Backend Application
│   ├── .env                  # Environment variables for backend
│   ├── requirements.txt      # Python dependencies
│   ├── main.py               # Application entry point/server
│   ├── krishiai.db           # SQLite database (if used locally)
│   │
│   ├── api/                  # API routing and controllers (Endpoints)
│   │   ├── routes/           # Route definitions
│   │   │   ├── auth.py
│   │   │   ├── crops.py
│   │   │   └── metrics.py
│   │   └── dependencies.py   # API dependencies (auth token verification, DB sessions)
│   │
│   ├── app/                  # Application core logic
│   │   ├── core/             # Application-wide settings and configs
│   │   │   ├── config.py     # Pydantic BaseSettings
│   │   │   └── security.py   # Hashing, JWT logic
│   │   │
│   │   ├── models/           # Database models (SQLAlchemy ORM models)
│   │   │   ├── user.py
│   │   │   └── predictions.py
│   │   │
│   │   ├── schemas/          # Pydantic schemas (Data Validation & Serialization)
│   │   │   ├── user_schema.py
│   │   │   └── response_schema.py
│   │   │
│   │   ├── crud/             # Create, Read, Update, Delete database operations
│   │   │   ├── crud_user.py
│   │   │
│   │   ├── services/         # Business logic and external API integrations
│   │   │   ├── ml_service.py # ML model inference logic
│   │   │   └── vapi_service.py # External integration
│   │   │
│   │   ├── utils/            # Helper functions
│   │   │   ├── logger.py
│   │   │
│   │   └── db/               # Database setup and migrations
│   │       ├── database.py   # DB connection / SessionLocal
│   │
│   └── tests/                # Backend unit and integration tests
│       ├── test_api.py
│       └── conftest.py
│
├── .github/                  # CI/CD workflows
├── docs/                     # Project documentation
├── .gitignore                # Root Git ignore rules
└── README.md                 # Project root documentation
```

## Key Architectural Principles Applied

1.  **Separation of Concerns**: frontend and backend completely decoupled.
2.  **Scalable React Patterns**: Clear separation of dumb/presentational components (`components/`) and complex stateful components (`pages/`).
3.  **Modular Python Backend**: Grouping by concerns (routers, schemas, models, crud operations).
4.  **Reusable Utilities**: `utils/` and `services/` abstract reusable logic.
