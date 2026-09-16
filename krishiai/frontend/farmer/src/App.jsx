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

// Cross-Domain Configuration
const VENDOR_APP_URL = import.meta.env.VITE_VENDOR_URL || 'http://localhost:5174';
const ADMIN_APP_URL = import.meta.env.VITE_ADMIN_URL || 'http://localhost:5175';

// Cross-Domain Redirector Component
function DomainRedirect({ to, domainName }) {
  React.useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[#0a0f0d] text-white p-6 text-center z-50">
      <div className="relative w-16 h-16 flex items-center justify-center mb-4">
        <div className="absolute inset-0 border-2 border-transparent border-t-[#4ade80] rounded-full animate-spin"></div>
        <span className="text-2xl">{domainName === 'Vendor' ? '🏪' : '🛡️'}</span>
      </div>
      <h2 className="text-lg font-bold text-slate-100 mb-2">Redirecting to {domainName} Domain...</h2>
      <p className="text-slate-400 text-sm max-w-md">
        This feature belongs to the dedicated {domainName} Portal. Redirecting to{' '}
        <a href={to} className="text-emerald-400 underline font-medium break-all">{to}</a>
      </p>
    </div>
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

          {/* Cross-Domain Redirects: Vendor Domain (Port 5174) */}
          <Route path="/vendor-dashboard/*" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-dashboard`} domainName="Vendor" />} />
          <Route path="/vendor-dashboard" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-dashboard`} domainName="Vendor" />} />
          <Route path="/vendor-onboarding" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-onboarding`} domainName="Vendor" />} />
          <Route path="/vendor-type-select" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-type-select`} domainName="Vendor" />} />
          <Route path="/vendor-sign-up/*" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-sign-up`} domainName="Vendor" />} />
          <Route path="/vendor-sign-in/*" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-sign-in`} domainName="Vendor" />} />
          <Route path="/vendor-sign-in" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendor-sign-in`} domainName="Vendor" />} />
          <Route path="/vendors" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendors`} domainName="Vendor" />} />
          <Route path="/vendor/:vendorId" element={<DomainRedirect to={`${VENDOR_APP_URL}/vendors`} domainName="Vendor" />} />
          <Route path="/vendor/*" element={<DomainRedirect to={`${VENDOR_APP_URL}`} domainName="Vendor" />} />
          <Route path="/vendor" element={<DomainRedirect to={`${VENDOR_APP_URL}`} domainName="Vendor" />} />

          {/* Cross-Domain Redirects: Admin Domain (Port 5175) */}
          <Route path="/admin/*" element={<DomainRedirect to={`${ADMIN_APP_URL}/admin/dashboard`} domainName="Admin" />} />
          <Route path="/admin" element={<DomainRedirect to={`${ADMIN_APP_URL}/admin/dashboard`} domainName="Admin" />} />

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
