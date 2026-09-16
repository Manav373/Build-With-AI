import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const VendorDashboardLayout = lazy(() => import('../pages/VendorDashboardLayout.jsx'));
const VendorDashboardHome = lazy(() => import('../pages/VendorDashboardHome.jsx'));
const VendorCompanyProfilePage = lazy(() => import('../pages/VendorCompanyProfilePage.jsx'));
const VendorRequirementsPage = lazy(() => import('../pages/VendorRequirementsPage.jsx'));
const VendorTendersPage = lazy(() => import('../pages/VendorTendersPage.jsx'));
const VendorApplicationsPage = lazy(() => import('../pages/VendorApplicationsPage.jsx'));
const VendorNegotiationPage = lazy(() => import('../pages/VendorNegotiationPage.jsx'));
const VendorProcurementOrdersPage = lazy(() => import('../pages/VendorProcurementOrdersPage.jsx'));
const VendorAIQualityPage = lazy(() => import('../pages/VendorAIQualityPage.jsx'));
const VendorWarehousePage = lazy(() => import('../pages/VendorWarehousePage.jsx'));
const VendorPickupPage = lazy(() => import('../pages/VendorPickupPage.jsx'));
const VendorLogisticsPage = lazy(() => import('../pages/VendorLogisticsPage.jsx'));
const VendorProductsPage = lazy(() => import('../pages/VendorProductsPage.jsx'));
const VendorInventoryPage = lazy(() => import('../pages/VendorInventoryPage.jsx'));
const VendorCustomerOrdersPage = lazy(() => import('../pages/VendorCustomerOrdersPage.jsx'));
const VendorPromotionsPage = lazy(() => import('../pages/VendorPromotionsPage.jsx'));
const VendorReviewsPage = lazy(() => import('../pages/VendorReviewsPage.jsx'));
const VendorPaymentsPage = lazy(() => import('../pages/VendorPaymentsPage.jsx'));
const VendorAnalyticsPage = lazy(() => import('../pages/VendorAnalyticsPage.jsx'));
const VendorAdminPage = lazy(() => import('../pages/VendorAdminPage.jsx'));
const VendorNotificationsPage = lazy(() => import('../pages/VendorNotificationsPage.jsx'));
const VendorDocumentsPage = lazy(() => import('../pages/VendorDocumentsPage.jsx'));
const VendorSettingsPage = lazy(() => import('../pages/VendorSettingsPage.jsx'));
const VendorStockReturnsPage = lazy(() => import('../pages/VendorStockReturnsPage.jsx'));

export function VendorAppRoutes() {
  return (
    <Route key="vendor-dashboard" path="/vendor-dashboard" element={<VendorDashboardLayout />}>
      <Route index element={<VendorDashboardHome />} />
      <Route path="company-profile" element={<VendorCompanyProfilePage />} />
      <Route path="store-profile" element={<VendorCompanyProfilePage />} />
      <Route path="requirements" element={<VendorRequirementsPage />} />
      <Route path="tenders" element={<VendorTendersPage />} />
      <Route path="applications" element={<VendorApplicationsPage />} />
      <Route path="negotiation" element={<VendorNegotiationPage />} />
      <Route path="procurement-orders" element={<VendorProcurementOrdersPage />} />
      <Route path="ai-quality" element={<VendorAIQualityPage />} />
      <Route path="warehouse" element={<VendorWarehousePage />} />
      <Route path="pickup" element={<VendorPickupPage />} />
      <Route path="logistics" element={<VendorLogisticsPage />} />
      <Route path="products" element={<VendorProductsPage />} />
      <Route path="inventory" element={<VendorInventoryPage />} />
      <Route path="stock-returns" element={<VendorStockReturnsPage />} />
      <Route path="orders" element={<VendorCustomerOrdersPage />} />
      <Route path="customers" element={<VendorCustomerOrdersPage />} />
      <Route path="promotions" element={<VendorPromotionsPage />} />
      <Route path="reviews" element={<VendorReviewsPage />} />
      <Route path="payments" element={<VendorPaymentsPage />} />
      <Route path="analytics" element={<VendorAnalyticsPage />} />
      <Route path="admin" element={<VendorAdminPage />} />
      <Route path="notifications" element={<VendorNotificationsPage />} />
      <Route path="documents" element={<VendorDocumentsPage />} />
      <Route path="settings" element={<VendorSettingsPage />} />
    </Route>
  );
}

export default VendorAppRoutes;
