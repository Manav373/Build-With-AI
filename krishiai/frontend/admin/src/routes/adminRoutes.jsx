import React, { lazy } from 'react';
import { Route, Navigate } from 'react-router-dom';

const AdminLayout = lazy(() => import('../layouts/AdminLayout.jsx'));
const AdminDashboard = lazy(() => import('../pages/AdminDashboard.jsx'));
const AdminUsersPage = lazy(() => import('../pages/AdminUsersPage.jsx'));
const AdminVendorVerificationPage = lazy(() => import('../pages/AdminVendorVerificationPage.jsx'));
const AdminProductModerationPage = lazy(() => import('../pages/AdminProductModerationPage.jsx'));
const AdminOrdersPage = lazy(() => import('../pages/AdminOrdersPage.jsx'));
const AdminComplaintsPage = lazy(() => import('../pages/AdminComplaintsPage.jsx'));
const AdminSchemesPage = lazy(() => import('../pages/AdminSchemesPage.jsx'));
const AdminAuditLogsPage = lazy(() => import('../pages/AdminAuditLogsPage.jsx'));

export function AdminAppRoutes() {
  return (
    <Route key="admin-root" path="/admin" element={<AdminLayout />}>
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsersPage />} />
      <Route path="vendor-verification" element={<AdminVendorVerificationPage />} />
      <Route path="product-moderation" element={<AdminProductModerationPage />} />
      <Route path="orders" element={<AdminOrdersPage />} />
      <Route path="complaints" element={<AdminComplaintsPage />} />
      <Route path="schemes" element={<AdminSchemesPage />} />
      <Route path="audit-logs" element={<AdminAuditLogsPage />} />
    </Route>
  );
}

export default AdminAppRoutes;
