import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAppRoutes } from './routes/adminRoutes.jsx';

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
          {/* Root redirect to dashboard */}
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

          {/* Dedicated Admin App Routes */}
          {AdminAppRoutes}

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
