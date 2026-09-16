import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

import ScrollToTop from './components/ScrollToTop.jsx';
import CustomCursor from './components/CustomCursor.jsx';
import MainLayout from './layouts/MainLayout.jsx';

// Farmer Public Pages
const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage.jsx'));
const TermsPage = lazy(() => import('./pages/TermsPage.jsx'));
const SignInPage = lazy(() => import('./pages/SignInPage.jsx'));
const SignUpPage = lazy(() => import('./pages/SignUpPage.jsx'));
const DomainRestrictedPage = lazy(() => import('./pages/DomainRestrictedPage.jsx'));

// Farmer Dashboard Pages
const ChatPage = lazy(() => import('./pages/ChatPage.jsx'));
const MarketPricePage = lazy(() => import('./pages/MarketPricePage.jsx'));
const PredictPage = lazy(() => import('./pages/PredictPage.jsx'));
const RecommendPage = lazy(() => import('./pages/RecommendPage.jsx'));
const SatellitePage = lazy(() => import('./pages/SatellitePage.jsx'));
const MandiMapPage = lazy(() => import('./pages/MandiMapPage.jsx'));
const SchemesPage = lazy(() => import('./pages/SchemesPage.jsx'));
const FarmerAnalytics = lazy(() => import('./pages/FarmerAnalytics.jsx'));
const FarmerHeatmap = lazy(() => import('./pages/FarmerHeatmap.jsx'));
const FarmerBrowseRequirementsPage = lazy(() => import('./pages/FarmerBrowseRequirementsPage.jsx'));
const VoiceAssistantPage = lazy(() => import('./pages/VoiceAssistantPage.jsx'));
const CallHistoryPage = lazy(() => import('./pages/CallHistoryPage.jsx'));
const CommunityPage = lazy(() => import('./pages/CommunityPage.jsx'));
const WhatsAppPage = lazy(() => import('./pages/WhatsAppPage.jsx'));
const IoTPage = lazy(() => import('./pages/IoTPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'));

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#0a0f0d]">
    <div className="relative w-20 h-20 flex items-center justify-center mb-4">
      <div className="absolute inset-0 border-2 border-transparent border-t-[#4ade80] rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-2 border-transparent border-b-[#facc15] rounded-full animate-spin-slow"></div>
      <span className="text-2xl">🌾</span>
    </div>
    <div className="font-['Outfit'] text-xl font-black tracking-tight text-white">
      <span>Krishi</span>
      <span className="bg-gradient-to-r from-[#4ade80] to-[#86efac] bg-clip-text text-transparent">AI</span>
      <span className="text-xs text-emerald-400 block text-center font-normal tracking-wider">Farmer Portal</span>
    </div>
  </div>
);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key';

function ProtectedRoute({ children }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn signInUrl="/sign-in" /></SignedOut>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CustomCursor />

      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />

          {/* Domain Isolation: Restrict Vendor Domain access from Farmer Portal */}
          <Route path="/vendor-dashboard/*" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-dashboard" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-onboarding" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-type-select" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-sign-up/*" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-sign-in/*" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor-sign-in" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendors" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor/:vendorId" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor/*" element={<DomainRestrictedPage targetDomain="Vendor" />} />
          <Route path="/vendor" element={<DomainRestrictedPage targetDomain="Vendor" />} />

          {/* Domain Isolation: Restrict Admin Domain access from Farmer Portal */}
          <Route path="/admin/*" element={<DomainRestrictedPage targetDomain="Admin" />} />
          <Route path="/admin" element={<DomainRestrictedPage targetDomain="Admin" />} />

          {/* Auth Routes */}
          <Route path="/sign-in/*" element={isClerkEnabled ? <SignInPage /> : <Navigate to="/" />} />
          <Route path="/sign-up/*" element={isClerkEnabled ? <SignUpPage /> : <Navigate to="/" />} />

          {/* Farmer Portal Protected Dashboard Routes */}
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
            <Route path="/sell-crops" element={<FarmerBrowseRequirementsPage />} />
            <Route path="/whatsapp" element={<WhatsAppPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/call-history" element={<CallHistoryPage />} />
            <Route path="/voice-assistant" element={<VoiceAssistantPage />} />
            <Route path="/iot" element={<IoTPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/help" element={<HelpPage />} />
          </Route>

          {/* Root fallbacks */}
          <Route path="/farmer/*" element={<Navigate to="/chat" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
