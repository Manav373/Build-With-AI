# 💻 KrishiAI — Frontend Architecture

## 1. Technical Stack
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS & Modern Glassmorphism
- **Routing**: React Router v6 with Lazy-Loaded Domains
- **State & Context**: Centralized Context API (`LanguageContext`, `ThemeContext`, `LocationContext`, `MobileMenuContext`, `UserRoleContext`)

## 2. Directory Structure (`frontend/src/`)
```
frontend/src/
├── farmer/         # Farmer UI pages, components, hooks, services, and route definitions
├── vendor/         # Vendor UI pages, components, hooks, services, and route definitions
├── shared/         # Universal UI components (Navbar, Preloader, Modals, Audio/Voice, Maps)
├── App.jsx         # App router and authentication guards
└── main.jsx        # Root application mounting & provider tree
```
