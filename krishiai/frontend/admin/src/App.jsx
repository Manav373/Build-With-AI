import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@krishiai/auth';
import { AdminAppRoutes } from './routes/adminRoutes.jsx';

const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage.jsx'));

function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated && !sessionStorage.getItem('admin_authenticated')) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#050e07]">
    <div className="relative w-16 h-16 flex items-center justify-center mb-3">
      <div className="absolute inset-0 border-2 border-transparent border-t-emerald-500 rounded-full animate-spin"></div>
      <span className="text-xl">🛡️</span>
    </div>
    <div className="font-['Outfit'] text-lg font-bold text-white tracking-tight">
      <span>KrishiAI </span>
      <span className="text-emerald-400">Master Console</span>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Admin Login Routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/login" element={<AdminLoginPage />} />

          {/* Root redirect to login first */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* Protected Dedicated Admin App Routes */}
          <Route element={<ProtectedAdminRoute><Outlet /></ProtectedAdminRoute>}>
            {AdminAppRoutes}
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
