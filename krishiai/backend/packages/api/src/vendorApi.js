import client from './client.js';

export const vendorApi = {
  // Onboarding & Profile
  register: (payload) =>
    client.post('/api/vendor/register', payload),

  getProfile: (vendorId) =>
    client.get(`/api/vendor/${vendorId}`),

  updateProfile: (vendorId, payload) =>
    client.put(`/api/vendor/${vendorId}`, payload),

  // Buying Requirements (Procurement)
  getRequirements: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/vendor/requirements?${query}`);
  },

  createRequirement: (payload) =>
    client.post('/api/vendor/requirements', payload),

  // Products (Input Supplier Catalog)
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/vendor/products?${query}`);
  },

  createProduct: (payload) =>
    client.post('/api/vendor/products', payload),

  updateProduct: (productId, payload) =>
    client.put(`/api/vendor/products/${productId}`, payload),

  deleteProduct: (productId) =>
    client.delete(`/api/vendor/products/${productId}`),

  // Tenders & Contract Farming
  getTenders: () =>
    client.get('/api/vendor/tenders'),

  createTender: (payload) =>
    client.post('/api/vendor/tenders', payload),

  // Applications & Negotiations
  getApplications: () =>
    client.get('/api/vendor/applications'),

  updateApplicationStatus: (applicationId, status) =>
    client.post(`/api/vendor/applications/${applicationId}/status`, { status }),

  // Warehouse & AI Quality Inspection
  getWarehouseInventory: () =>
    client.get('/api/vendor/warehouse/inventory'),

  inspectQualitySample: (formData) =>
    client.post('/api/vendor/quality-inspection', formData, { isFormData: true }),

  // Logistics & Shipments
  getShipments: () =>
    client.get('/api/vendor/logistics/shipments'),

  assignDriver: (shipmentId, payload) =>
    client.post(`/api/vendor/logistics/shipments/${shipmentId}/assign`, payload),

  // Payouts & Financial Ledger
  getPayouts: () =>
    client.get('/api/vendor/payouts'),

  requestPayout: (amount) =>
    client.post('/api/vendor/payouts/request', { amount }),
};

export default vendorApi;
