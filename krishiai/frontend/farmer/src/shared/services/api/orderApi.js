import client from './client';

export const orderApi = {
  // Get orders for current user (Farmer or Vendor)
  getMyOrders: () =>
    client.get('/api/v1/orders/my-orders'),

  // Transition order lifecycle status
  updateOrderStatus: (orderId, payload) =>
    client.post(`/api/v1/orders/${orderId}/status`, payload),
};

export default orderApi;
