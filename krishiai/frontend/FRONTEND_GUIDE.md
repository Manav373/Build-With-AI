# 🌾 KrishiAI Frontend – Comprehensive Developer Guide

KrishiAI's frontend is a React 19 + Vite 7 single-page application with two distinct user experiences: a rich marketing **Landing Page** and a full-featured **AI Chat Dashboard**. This guide documents the exact implementation — component by component, hook by hook.

---

## 🚀 Getting Started

```bash
cd krishiai/frontend

# Install dependencies
npm install

# Create .env file
echo 'VITE_API_BASE_URL=http://localhost:8000' > .env
# Optionally add Clerk auth key:
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...

# Start development server (port 5173)
npm run dev

# Production build
npm run build
```

---

## 🛠 Tech Stack

| Library | Version | Purpose |
| :--- | :--- | :--- |
| **React** | 19.2 | Core UI framework |
| **Vite** | 7.3 | Dev server & bundle tool |
| **Framer Motion** | 12.35 | All animations & transitions |
| **GSAP** | 3.14 | Timeline-based scroll animations |
| **Tailwind CSS** | 3.4 | Utility-class styling |
| **Clerk** | 5.61 | Authentication (sign in/up/user) |
| **React Router DOM** | 7.13 | Multi-page routing (`/`, `/chat`, `/sign-in`, `/sign-up`) |
| **Axios** | 1.13 | HTTP client for backend API calls |
| **Leaflet / React-Leaflet** | 1.9 / 5.0 | Interactive Mandi location map |
| **Recharts** | 3.8 | Price trend bar charts |
| **React Markdown + remark-gfm** | 10.1 | Render AI markdown replies in chat |
| **Lucide React** | 0.577 | Icon system |
| **Lenis** | 1.0 | Smooth scroll for landing page |
| **@react-three/fiber + drei + Three.js** | — | 3D elements (available for landing) |

---

## 📂 Folder Structure

```text
frontend/src/
├── main.jsx                         # App root: routing, auth guard, Preloader
├── App.jsx                          # ChatApp component (main AI chat UI)
├── api.js                           # All Axios API calls to backend
├── index.css                        # Global styles, design tokens, animations
│
├── pages/
│   ├── LandingPage.jsx              # Full marketing landing page
│   ├── SignInPage.jsx               # Clerk-hosted sign-in UI
│   └── SignUpPage.jsx               # Clerk-hosted sign-up UI
│
├── components/
│   ├── Preloader.jsx                # Animated loading screen (Framer Motion)
│   ├── ChatWindow.jsx               # Renders the chat message list
│   ├── MessageInput.jsx             # Text / Image / Voice input bar
│   ├── DashboardSidebar.jsx         # Left nav sidebar with chat history
│   ├── MandiMap.jsx                 # Leaflet map for Mandi locations
│   ├── PriceTrendChart.jsx          # Recharts market price chart
│   ├── BackgroundVideoPlayer.jsx    # Video bg used in landing
│   │
│   ├── common/
│   │   ├── CustomCursor.jsx         # Custom dot cursor (desktop)
│   │   └── FeaturePhone.jsx         # Decorative 3D-style phone mockup
│   │
│   └── landing/                     # Landing page sections (independently rendered)
│       ├── Navbar.jsx
│       ├── ScrollJourney.jsx        # Hero = scroll-driven reveal (GSAP/Framer)
│       ├── Mission.jsx
│       ├── HowItWorks.jsx
│       ├── Stats.jsx
│       ├── MarqueeTicker.jsx        # Infinite scrolling ticker strip
│       ├── Impact.jsx
│       ├── Testimonials.jsx
│       ├── FAQ.jsx
│       ├── CTA.jsx
│       └── Footer.jsx
│
└── hooks/
    └── useWindowSize.js             # Returns { width, height } on resize
```

---

## 🧬 Architecture Deep Dive

### 1. App Entry (`main.jsx`)
The entry point wraps the entire app in three layers:
1. **`<Preloader />`** — Displayed first on every cold load. Shows an animated KrishiAI loading screen (spinning rings, shimmer bar, floating particles) powered entirely by Framer Motion `useSpring`, `AnimatePresence`, and staggered variants. Calls `onDone()` after ~1.4s and is then unmounted.
2. **`<ClerkProvider />`** — Conditionally wraps the app only when `VITE_CLERK_PUBLISHABLE_KEY` is a real key (not a placeholder). This means the app runs without auth in dev by default.
3. **`<AppContent />`** — The React Router `<BrowserRouter>` with four routes: `/`, `/sign-in/*`, `/sign-up/*`, `/chat`.

The `/chat` route uses `<ProtectedChat />` which reads `<SignedIn>` / `<SignedOut>` from Clerk to guard access.

---

### 2. Chat Application (`App.jsx`)
`ChatApp` is the main exported component for the `/chat` route. It manages:

- **Multi-session chat history** (`chatSessions` array) stored in `localStorage` under `krishiai_chat_history_v2`. Sessions are auto-named from the first user message.
- **Pinned Messages** (`pinnedIds` Set) stored in `localStorage` under `krishiai_pinned_msgs`. A pin panel overlays the top-right of the screen.
- **Language switching** between EN / Hindi (हि) / Gujarati (ગુ) / Marathi (म) — adds a suffix instruction to each API payload (`LANG_INSTRUCTIONS`).
- **8 Quick Action buttons** wired to pre-set common farmer queries (Weather, MSP Price, Pest Alert, Soil Health, Yield Estimate, Irrigation, Schemes, Disease).
- **Mobile responsive sidebar** — static on `md+` screens, slides in as overlay on mobile using `mobileMenuOpen` state + Framer Motion `AnimatePresence`.

#### State Map

| State | Type | Purpose |
| :--- | :--- | :--- |
| `chatSessions` | `Array` | All chat history sessions |
| `currentChatId` | `string` | Active session ID |
| `isTyping` | `boolean` | Shows AI typing indicator |
| `language` | `string` | Selected language code |
| `showPriceChart` | `boolean` | Opens `PriceTrendChart` modal |
| `showMandiMap` | `boolean` | Opens `MandiMap` modal |
| `pinnedIds` | `Set<number>` | Message IDs that are pinned |
| `userLocation` | `{lat, lon}` | GPS coordinates if user shared location |
| `mobileMenuOpen` | `boolean` | Mobile sidebar visibility |

---

### 3. API Layer (`api.js`)
All backend calls go through a single `axios` instance (`apiClient`) configured with:
- `baseURL` from `VITE_API_BASE_URL` env variable
- Auto-protocol fix (adds `https://` if a domain is given without protocol)
- `ngrok-skip-browser-warning: true` header (for tunnelled dev environments)

Three exported functions:

| Function | Endpoint | Payload |
| :--- | :--- | :--- |
| `sendChatQuery()` | `POST /api/web/chat` | `{ phone_id, message, lat?, lon?, history[] }` |
| `sendImageQuery()` | `POST /api/web/vision` | `FormData { phone_id, file, language }` |
| `sendVoiceQuery()` | `POST /api/web/audio` | `FormData { file, lat?, lon?, history }` |

History is trimmed to the **last 10 turns** before sending to keep payloads lean. Each message is normalized to `{ role: 'user'|'assistant', content: string }`.

---

### 4. Landing Page (`pages/LandingPage.jsx`)
The landing page assembles **10 independent section components** with a global:
- **Video Background** (`/hero-bg.mp4`) with an image fallback from Unsplash
- **Scroll Progress Bar** — a fixed `<motion.div>` at the top of the viewport that fills as the user scrolls, driven by Framer Motion's `useScroll().scrollYProgress`
- **Grid background** (CSS `.grid-bg` — a subtle green dot grid)
- **Ambient radial blur glows** for depth

Sections render in this order:
`Navbar → ScrollJourney (Hero) → Mission → HowItWorks → Stats → Impact → Testimonials → FAQ → CTA → Footer`

---

### 5. Sidebar (`DashboardSidebar.jsx`)
The 280px-wide sidebar has three sections:
- **New Chat button** — calls `onNewChat()` prop
- **Navigation items** — Home, Dashboard, Mandi Map, Market Prices, Schemes (map to actions via `onAction(id)` prop callback)
- **Chat History** — grouped into `Today / Yesterday / Older` bands. Each item supports inline renaming (click ✏️ icon) and deletion (click 🗑️), with hover-reveal controls.
- **User Profile footer** — shows Clerk `user.imageUrl`, `fullName`, and `emailAddress`. An invisible overlay `<UserButton>` provides the actual Clerk sign-out popup on click.

---

## 🎨 Design System (`index.css`)

### CSS Custom Properties
```css
:root {
  --g:   #166534;  /* Primary green */
  --g2:  #15803d;  /* Secondary green */
  --glt: #86efac;  /* Light green text */
  --y:   #facc15;  /* Accent gold */
  --dk:  #050e07;  /* Background dark */
  --dk2: #0a1a0d;  /* Panel dark */
  --txt: #e2f0e4;  /* Body text */
  --mut: #7aad86;  /* Muted text */
}
```

### Key CSS Classes

| Class | Purpose |
| :--- | :--- |
| `.shimmer-text` | Animated gold→green shimmer on text (brand headings) |
| `.chat-header-glass` | Glassmorphism header bar with `backdrop-blur` |
| `.floating-input-pill` | Rounded frosted-glass input container |
| `.suggestion-chip` | Rounded tag-style suggestion buttons |
| `.quick-action-btn` | Horizontal action pill buttons in chat |
| `.control-btn` | Header icon buttons (pin, language, clear) |
| `.grad-border` | Animated alternating green/gold border |
| `.glow-btn` | Pulsing box-shadow glow effect |
| `.marquee-track` | Infinite horizontal marquee animation |
| `.grid-bg` | Fixed CSS grid dot background |
| `.preloader-*` | All preloader-specific styles |
| `.no-scrollbar` | Hides scrollbar on overflowing elements |

### Fonts
Loaded from Google Fonts:
- **Inter** (weights 300–900) — body, UI text
- **Outfit** (weights 400–900) — headings and brand name

---

## 🔐 Authentication (Clerk)

Clerk is **conditionally enabled**. If `VITE_CLERK_PUBLISHABLE_KEY` is missing or equals `pk_test_placeholder_key`, the app bypasses all Clerk providers and renders the full `ChatApp` directly on `/chat` without any sign-in guard.

When enabled:
- `/sign-in/*` → `SignInPage.jsx` (wraps Clerk's `<SignIn>` component)
- `/sign-up/*` → `SignUpPage.jsx` (wraps Clerk's `<SignUp>` component)
- `/chat` → `ProtectedChat` which uses `<SignedIn>` / `<SignedOut>` / `<RedirectToSignIn>`
- `<DashboardSidebar>` uses `useUser()` to show the real profile picture, name, and email
- `<UserButton>` provides sign-out functionality

---

## 📦 Build & Production

```bash
# Standard production build (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Lint check
npm run lint
```

The Vite config is minimal (`@vitejs/plugin-react` only). The production build outputs static files to `/dist` which can be served from any CDN (Vercel, Netlify, etc). Point `VITE_API_BASE_URL` to your deployed backend (e.g. Railway, Render) in your hosting environment variables.

---

*Developed with ❤️ for the Indian agricultural community.*
