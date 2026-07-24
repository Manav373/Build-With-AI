import React, { useState, useEffect, lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

// Context & Utils
import { LanguageProvider } from './context/LanguageContext'
import { ChatProvider } from './context/ChatContext'
import { LocationProvider } from './context/LocationContext'
import { MobileMenuProvider } from './context/MobileMenuContext'
import { VoiceAssistantProvider } from './context/VoiceAssistantContext'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'
import 'maplibre-gl/dist/maplibre-gl.css'


// Shared Components
import CustomCursor from './components/common/CustomCursor.jsx'
import ScrollToTop from './components/common/ScrollToTop.jsx'
import Preloader from './components/common/Preloader.jsx'
import MainLayout from './components/layout/MainLayout.jsx'
import LandingPage from './pages/LandingPage.jsx'

// Lazy Load Pages (except LandingPage to prevent double loader on start)
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'))
const SignInPage = lazy(() => import('./pages/SignInPage.jsx'))
const SignUpPage = lazy(() => import('./pages/SignUpPage.jsx'))
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'))
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'))
const FarmerAnalytics = lazy(() => import('./pages/FarmerAnalytics.jsx'))
const FarmerHeatmap = lazy(() => import('./pages/FarmerHeatmap.jsx'))
const MarketPricePage = lazy(() => import('./pages/MarketPricePage.jsx'))
const PredictPage = lazy(() => import('./pages/PredictPage.jsx'))
const RecommendPage = lazy(() => import('./pages/RecommendPage.jsx'))
const SatellitePage = lazy(() => import('./pages/SatellitePage.jsx'))
const MandiMapPage = lazy(() => import('./pages/MandiMapPage.jsx'))
const SchemesPage = lazy(() => import('./pages/SchemesPage.jsx'))
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const WhatsAppPage = lazy(() => import('./pages/WhatsAppPage.jsx'))
const CallHistoryPage = lazy(() => import('./pages/CallHistoryPage.jsx'))
const VoiceAssistantPage = lazy(() => import('./pages/VoiceAssistantPage.jsx'))
const CommunityPage = lazy(() => import('./pages/CommunityPage.jsx'))
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage.jsx'))
const VendorMarketplacePage = lazy(() => import('./pages/VendorMarketplacePage.jsx'))
const VendorSignUpPage = lazy(() => import('./pages/VendorSignUpPage.jsx'))
const VendorTypeSelectionPage = lazy(() => import('./pages/VendorTypeSelectionPage.jsx'))
const VendorOnboardingPage = lazy(() => import('./pages/VendorOnboardingPage.jsx'))
const VendorDashboardLayout = lazy(() => import('./pages/VendorDashboardLayout.jsx'))
const VendorDashboardHome = lazy(() => import('./pages/VendorDashboardHome.jsx'))
const VendorDashboardPlaceholder = lazy(() => import('./pages/VendorDashboardPlaceholder.jsx'))
const VendorProductsPage = lazy(() => import('./pages/VendorProductsPage.jsx'))
const VendorRequirementsPage = lazy(() => import('./pages/VendorRequirementsPage.jsx'))
const VendorApplicationsPage = lazy(() => import('./pages/VendorApplicationsPage.jsx'))
const FarmerBrowseRequirementsPage = lazy(() => import('./pages/FarmerBrowseRequirementsPage.jsx'))

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50" style={{ background: 'var(--bg)' }}>
    <div className="relative w-24 h-24 flex items-center justify-center mb-4">
      {/* Outer Ring */}
      <div className="absolute inset-0 border-2 border-transparent border-t-[#4ade80] rounded-full animate-spin"></div>
      {/* Inner Ring */}
      <div className="absolute inset-2 border-2 border-transparent border-b-[#facc15] rounded-full animate-spin-slow"></div>
      <span className="text-3xl">🌾</span>
    </div>
    <div className="font-['Outfit'] text-2xl font-black tracking-tight">
      <span className="text-[#e2f0e4]">Krishi</span>
      <span className="bg-gradient-to-r from-[#4ade80] to-[#86efac] bg-clip-text text-transparent">AI</span>
    </div>
  </div>
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Wrap dashboard routes with auth guard
function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>
        {children}
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn signInUrl="/sign-in" />
      </SignedOut>
    </>
  )
}

const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key'
const AppContent = () => (
  <MobileMenuProvider>
    <LanguageProvider>
      <LocationProvider>
        <ChatProvider>
          <VoiceAssistantProvider>
            <ThemeProvider>
              <BrowserRouter>
                <ScrollToTop />
                <CustomCursor />
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/terms" element={<TermsPage />} />
                    <Route path="/vendors" element={<VendorMarketplacePage />} />
                    <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
                    <Route path="/vendor/sample" element={<VendorProfilePage />} />
                    <Route path="/vendor-type-select" element={<VendorTypeSelectionPage />} />
                    <Route path="/vendor-onboarding" element={<VendorOnboardingPage />} />
                    <Route path="/sell-crops" element={<FarmerBrowseRequirementsPage />} />

                    {/* Vendor Dashboard (Nested Layout) */}
                    <Route path="/vendor-dashboard" element={<VendorDashboardLayout />}>
                      <Route index element={<VendorDashboardHome />} />
                      <Route path="company-profile" element={<VendorDashboardPlaceholder />} />
                      <Route path="store-profile" element={<VendorDashboardPlaceholder />} />
                      <Route path="requirements" element={<VendorRequirementsPage />} />
                      <Route path="applications" element={<VendorApplicationsPage />} />
                      <Route path="negotiation" element={<VendorDashboardPlaceholder />} />
                      <Route path="procurement-orders" element={<VendorDashboardPlaceholder />} />
                      <Route path="warehouse" element={<VendorDashboardPlaceholder />} />
                      <Route path="pickup" element={<VendorDashboardPlaceholder />} />
                      <Route path="logistics" element={<VendorDashboardPlaceholder />} />
                      <Route path="products" element={<VendorProductsPage />} />
                      <Route path="inventory" element={<VendorDashboardPlaceholder />} />
                      <Route path="orders" element={<VendorDashboardPlaceholder />} />
                      <Route path="customers" element={<VendorDashboardPlaceholder />} />
                      <Route path="promotions" element={<VendorDashboardPlaceholder />} />
                      <Route path="reviews" element={<VendorDashboardPlaceholder />} />
                      <Route path="payments" element={<VendorDashboardPlaceholder />} />
                      <Route path="analytics" element={<VendorDashboardPlaceholder />} />
                      <Route path="notifications" element={<VendorDashboardPlaceholder />} />
                      <Route path="documents" element={<VendorDashboardPlaceholder />} />
                      <Route path="settings" element={<VendorDashboardPlaceholder />} />
                    </Route>

                    {/* Auth Routes */}
                    <Route path="/sign-in/*" element={isClerkEnabled ? <SignInPage /> : <Navigate to="/" />} />
                    <Route path="/sign-up/*" element={isClerkEnabled ? <SignUpPage /> : <Navigate to="/" />} />
                    <Route path="/vendor-sign-up/*" element={isClerkEnabled ? <VendorSignUpPage /> : <Navigate to="/" />} />

                    {/* Dashboard Module (Shared Layout) */}
                    <Route element={isClerkEnabled ? <ProtectedRoute><MainLayout /></ProtectedRoute> : <MainLayout />}>
                      <Route path="/chat" element={<ChatPage />} />
                      <Route path="/analytics" element={<FarmerAnalytics />} />
                      <Route path="/heatmap" element={<FarmerHeatmap />} />
                      <Route path="/market-prices" element={<MarketPricePage />} />
                      <Route path="/predict" element={<PredictPage />} />
                      <Route path="/recommend" element={<RecommendPage />} />
                      <Route path="/satellite" element={<SatellitePage />} />
                      <Route path="/mandi-map" element={<MandiMapPage />} />
                      <Route path="/schemes" element={<SchemesPage />} />
                      <Route path="/help" element={<HelpPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                      <Route path="/whatsapp" element={<WhatsAppPage />} />
                      <Route path="/community" element={<CommunityPage />} />
                      <Route path="/call-history" element={<CallHistoryPage />} />
                      <Route path="/voice-assistant" element={<VoiceAssistantPage />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </ThemeProvider>
          </VoiceAssistantProvider>
        </ChatProvider>
      </LocationProvider>
    </LanguageProvider>
  </MobileMenuProvider>
)

function Root() {
  const [loading, setLoading] = useState(true);
  const [appMounted, setAppMounted] = useState(false);

  useEffect(() => {
    // Start mounting the heavy app after 1.2s (once preloader is stable)
    const timer = setTimeout(() => setAppMounted(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-full">
      {/* The AppContent is always mounting in the background for zero-gap reveal */}
      {appMounted && (
        <div 
          className={`transition-opacity duration-700 ease-in-out ${loading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          {PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key' ? (
            <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
              <AppContent />
            </ClerkProvider>
          ) : (
            <AppContent />
          )}
        </div>
      )}

      {/* Preloader sits on top and only unmounts when done */}
      {loading && <Preloader onDone={() => setLoading(false)} />}
    </div>
  );
}

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>,
  )
}

