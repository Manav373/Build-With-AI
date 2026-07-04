# KrishiAI Frontend: Deep Dive Architecture & Library Details

This document provides an exhaustive, highly detailed breakdown of the KrishiAI frontend repository. It covers the core library ecosystem, the Single-Page Application (SPA) architecture, and exactly how the user interfaces interact with the backend.

---

## 1. Complete Library Breakdown (`package.json`)

The KrishiAI frontend is a modern React 19 application bundled with Vite. It incorporates advanced styling, 3D elements, native-feeling animations, and geographic mapping. Here is every single dependency explained:

### Core Framework & Routing
- **`react` & `react-dom` (19.2)**: The core UI rendering engine. KrishiAI uses the absolute latest React 19 features, heavily relying on hooks (`useState`, `useEffect`, `useContext`, `useMemo`) for state management.
- **`react-router-dom` (7.13)**: Handles all client-side navigation without refreshing the page. In `main.jsx`, it maps routes like `/chat`, `/analytics`, `/satellite`, and `/mandi-map` to their respective components inside the shared `<MainLayout />`.
- **`vite` & `@vitejs/plugin-react`**: The ultra-fast development server and production bundler that replaces tools like Webpack.

### Authentication & API
- **`@clerk/clerk-react`**: The complete Identity and Authentication layer. It powers `SignInPage.jsx` and `SignUpPage.jsx`. In `main.jsx`, it guards the dashboard routes using `<SignedIn>` and `<RedirectToSignIn>` components.
- **`axios`**: The HTTP client used exclusively in `src/api.js` to send requests to the FastAPI backend (e.g., sending chat messages, uploading images, posting coordinates).

### Styling & Animation (The "Wow" Factor)
- **`tailwindcss`, `postcss`, `autoprefixer`**: The utility-first CSS framework that drives 95% of the styling. Customized extensively with specific glowing drop-shadows and glassmorphism (translucent backgrounds with `backdrop-blur`).
- **`framer-motion`**: Used pervasively throughout the app for mount/unmount animations (`<AnimatePresence>`), layout transitions, the loading `<Preloader />`, and interactive button states (`whileHover`, `whileTap`).
- **`gsap`**: Greensock Animation Platform. Used for complex, timeline-based scroll animations (specifically in the marketing landing page).
- **`@studio-freight/lenis`**: A lightweight library that intercepts browser scrolling and smooths it out (smooth scroll). Used heavily on the marketing landing page for a premium "Apple-like" scroll feel.

### Data Visualization & Mapping
- **`leaflet` & `react-leaflet`**: The underlying engine for the interactive map inside `MandiMap.jsx` and `MandiMapPage.jsx`. It allows farmers to see the physical locations of local markets.
- **`recharts`**: A composable charting library. Used in `PriceTrendChart.jsx` and `FarmerAnalytics.jsx` to render responsive bar charts, line graphs, and heatmaps showing market trends.

### 3D Rendering & Media
- **`three`, `@react-three/fiber`, `@react-three/drei`**: A complete suite for rendering WebGL 3D elements natively inside React. Used to create decorative floating elements on the landing page (like the 3D phone mockup).
- **`react-markdown` & `remark-gfm`**: Because the backend Llama 3 models respond in strict Markdown tabular/bold format, these libraries intercept that string and safely render it as rich HTML inside `ChatWindow.jsx`.
- **`lucide-react`**: The exclusive SVG icon library used for every icon in the sidebar, input fields, and UI toolbars.

---

## 2. Directory Structure & File Architecture

The repository is structured to separate global layouts, modular pages, and reusable components.

### 🏠 The Entry Point (`src/main.jsx`)
This file wraps the entire app. Its flow:
1. **Preloader**: Shows the Framer Motion loading screen on initial cold boot.
2. **ClerkProvider**: Injects the global session token.
3. **BrowserRouter**: Routes the user.
4. **MainLayout Guard**: If going to a protected dashboard route, it ensures the user has a valid Clerk session.

### 🌐 Data Layer (`src/api.js`)
All communication with the backend lives here to avoid scattering `axios` calls across UI components. It reads `VITE_API_BASE_URL` from `.env` and exports functions like `sendChatQuery()`, `sendImageQuery()`, and `sendVoiceQuery()`.

### 🧭 Global Contexts (`src/context/`)
- **`ChatContext.jsx`**: A massive state container that manages the array of chat messages, handles the concept of "Pinned" messages, logs user GPS coordinates, and handles the "Is Typing" loading state. 
- **`LanguageContext.jsx`**: Wraps the app to propagate the user's selected language (Hindi, English, Gujarati, etc.).

### 📂 Components (`src/components/`)
These are reusable pieces of UI that drop into pages:
- **`DashboardSidebar.jsx`**: The left-hand navigation menu. Handles chat history lists and mobile sliding logic.
- **`ChatWindow.jsx`**: The vertical scroll view of AI messages and User messages. Uses `react-markdown` to format the text.
- **`MessageInput.jsx`**: The bottom input bar on the chat screen. Supports text entry, attaching images to fire to Vision AI, and has logic to ping the user's browser location.
- **`MandiMap.jsx`**: The Leaflet implementation.
- **`landing/` module**: A folder containing 10 specific chunks (`Navbar.jsx`, `HowItWorks.jsx`, `FAQ.jsx`) that are assembled like legos to build `LandingPage.jsx`.

### 📄 Pages (`src/pages/`)
These are the top-level route targets mapped in `main.jsx`.
- **`LandingPage.jsx`**: The public-facing site.
- **`SignInPage.jsx` / `SignUpPage.jsx`**: Auth wrapper pages.
- **`App.jsx` (`<ChatApp>`)**: The primary AI chat interface.

**Deep Analytics Dashboard Modules:**
These pages represent the expanded "Pro" toolset of the application:
1. **`FarmerAnalytics.jsx`**: High-level statistical overviews using Recharts.
2. **`FarmerHeatmap.jsx`**: Visual regional data representations.
3. **`MarketPricePage.jsx`**: A dedicated UI for searching and tracking live APMC prices.
4. **`PredictPage.jsx`**: Interacts with the XGBoost backend to provide Yield estimates.
5. **`RecommendPage.jsx`**: Crop and fertilizer agronomy.
6. **`SatellitePage.jsx`**: For remote sensing/NDVI views.
7. **`SchemesPage.jsx`**: Dedicated database view for Government subsidies.
8. **`WhatsAppPage.jsx`**: A marketing/informational page showing how the Twilio/Meta webhooks work, presenting the QR code and chat previews.

## 3. Styling & Theming (`src/index.css` & `tailwind.config.js`)

KrishiAI relies almost entirely on Tailwind utility classes inline with elements (ex: `className="bg-emerald-900/30 backdrop-blur-xl border border-emerald-500/20"`). 

However, `index.css` contains highly specific CSS variables and custom animations:
- Custom `@keyframes` for the shimmer effects across text (`.shimmer-text`).
- Infinite marquee scrolling classes for the feature tickers.
- A customized `.no-scrollbar` class to hide webkit-scrollbars while retaining scrollability on mobile.
- Radial gradient CSS definitions that provide the ambient "glow" blobs sitting behind the application's glass panels.

The result is an ultra-premium, dark-mode-first aesthetic with deep greens (`#050e07`, `#166534`), neon emerald highlight accents (`#4ade80`), and extensive use of component translucency to create an illusion of depth.
