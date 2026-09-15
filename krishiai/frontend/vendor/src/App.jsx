import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { VendorAppRoutes } from './routes/vendorRoutes.jsx';

const VendorMarketplacePage = lazy(() => import('./pages/VendorMarketplacePage.jsx'));
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage.jsx'));
const VendorTypeSelectionPage = lazy(() => import('./pages/VendorTypeSelectionPage.jsx'));
const VendorOnboardingPage = lazy(() => import('./pages/VendorOnboardingPage.jsx'));
const VendorSignUpPage = lazy(() => import('./pages/VendorSignUpPage.jsx'));

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#0b0f19]">
    <div className="relative w-16 h-16 flex items-center justify-center mb-3">
      <div className="absolute inset-0 border-2 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
      <span className="text-xl">🏪</span>
    </div>
    <div className="font-['Outfit'] text-lg font-bold text-white tracking-tight">
      <span>KrishiAI </span>
      <span className="text-blue-400">Vendor Portal</span>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Default Root redirects to Dashboard */}
          <Route path="/" element={<Navigate to="/vendor-dashboard" replace />} />

          {/* Public Vendor Marketplace & Onboarding */}
          <Route path="/vendors" element={<VendorMarketplacePage />} />
          <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
          <Route path="/vendor-type-select" element={<VendorTypeSelectionPage />} />
          <Route path="/vendor-onboarding" element={<VendorOnboardingPage />} />
          <Route path="/vendor-sign-up" element={<VendorSignUpPage />} />

          {/* Full Vendor Application Routes */}
          {VendorAppRoutes}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/vendor-dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
