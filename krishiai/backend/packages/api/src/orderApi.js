import client from './client.js';

export const orderApi = {
  getMyOrders: () =>
    client.get('/api/v1/orders/my-orders'),

  updateOrderStatus: (orderId, payload) =>
    client.post(`/api/v1/orders/${orderId}/status`, payload),
};

export default orderApi;
