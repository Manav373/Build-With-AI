import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { VendorAppRoutes } from './routes/vendorRoutes.jsx';

const VendorMarketplacePage = lazy(() => import('./pages/VendorMarketplacePage.jsx'));
const VendorProfilePage = lazy(() => import('./pages/VendorProfilePage.jsx'));
const VendorTypeSelectionPage = lazy(() => import('./pages/VendorTypeSelectionPage.jsx'));
const VendorOnboardingPage = lazy(() => import('./pages/VendorOnboardingPage.jsx'));
const VendorSignUpPage = lazy(() => import('./pages/VendorSignUpPage.jsx'));
const VendorSignInPage = lazy(() => import('./pages/VendorSignInPage.jsx'));

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key';

function ProtectedVendorRoute({ children }) {
  const isVendorAuth = localStorage.getItem('vendor_authenticated') === 'true' || sessionStorage.getItem('vendor_authenticated') === 'true';

  if (!isClerkEnabled) {
    if (!isVendorAuth) {
      return <Navigate to="/vendor-sign-in" replace />;
    }
    return children;
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        {isVendorAuth ? children : <Navigate to="/vendor-sign-in" replace />}
      </SignedOut>
    </>
  );
}

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
          {/* Default Root: Always direct to vendor sign in */}
          <Route path="/" element={<Navigate to="/vendor-sign-in" replace />} />

          {/* Public Vendor Marketplace & Onboarding */}
          <Route path="/vendors" element={<VendorMarketplacePage />} />
          <Route path="/vendor/:vendorId" element={<VendorProfilePage />} />
          <Route path="/vendor-type-select" element={<VendorTypeSelectionPage />} />
          <Route path="/vendor-onboarding" element={<VendorOnboardingPage />} />
          <Route path="/vendor-sign-up" element={<VendorSignUpPage />} />
          <Route path="/vendor-sign-in" element={<VendorSignInPage />} />
          <Route path="/sign-in" element={<VendorSignInPage />} />
          <Route path="/login" element={<VendorSignInPage />} />
          <Route path="/sign-up" element={<VendorSignUpPage />} />

          {/* Protected Vendor Dashboard Routes */}
          <Route element={<ProtectedVendorRoute><Outlet /></ProtectedVendorRoute>}>
            {VendorAppRoutes()}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/vendor-sign-in" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
