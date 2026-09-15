import client from './client.js';

export const adminApi = {
  // Telemetry & Stats
  getDashboardStats: () =>
    client.get('/api/v1/admin/dashboard/stats'),

  // Users Management
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/v1/admin/users?${query}`);
  },

  updateUserStatus: (userId, status, reason = '') =>
    client.post(`/api/v1/admin/users/${userId}/status`, { status, reason }),

  // Vendor KYC & Verification
  getPendingVendors: () =>
    client.get('/api/v1/admin/vendors/pending'),

  verifyVendor: (vendorId, action, adminNotes = '', rejectionReason = '') =>
    client.post(`/api/v1/admin/vendors/${vendorId}/verify`, {
      action,
      admin_notes: adminNotes,
      rejection_reason: rejectionReason,
    }),

  // Product Moderation
  getPendingProducts: () =>
    client.get('/api/v1/admin/products/pending'),

  moderateProduct: (productId, action, rejectionReason = '') =>
    client.post(`/api/v1/admin/products/${productId}/moderate`, {
      action,
      rejection_reason: rejectionReason,
    }),

  // Orders Stream
  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/v1/admin/orders?${query}`);
  },

  // Complaints & Grievances
  getComplaints: (statusFilter = '') =>
    client.get(`/api/v1/admin/complaints${statusFilter ? `?status_filter=${statusFilter}` : ''}`),

  resolveComplaint: (complaintId, resolution, actionTaken, adminNotes = '') =>
    client.post(`/api/v1/admin/complaints/${complaintId}/resolve`, {
      resolution,
      action_taken: actionTaken,
      admin_notes: adminNotes,
    }),

  // Government Schemes
  getSchemes: () =>
    client.get('/api/v1/admin/schemes'),

  createScheme: (payload) =>
    client.post('/api/v1/admin/schemes', payload),

  // Security Audit Trail
  getAuditLogs: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/v1/admin/audit-logs?${query}`);
  },
};

export default adminApi;
