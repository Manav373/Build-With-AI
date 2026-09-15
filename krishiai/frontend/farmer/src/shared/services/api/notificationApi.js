import client from './client';

export const notificationApi = {
  getNotifications: () =>
    client.get('/api/v1/notifications'),
};

export default notificationApi;
