import client from './client.js';

export const authApi = {
  login: (identifier, password, targetDomain) =>
    client.post('/api/v1/auth/login', {
      identifier,
      password,
      target_domain: targetDomain,
    }),

  register: (payload) =>
    client.post('/api/v1/auth/register', payload),

  getMe: () =>
    client.get('/api/v1/auth/me'),

  refreshToken: (refreshToken) =>
    client.post('/api/v1/auth/refresh', { refresh_token: refreshToken }),

  logout: () =>
    client.post('/api/v1/auth/logout', {}),

  // Legacy OTP APIs for backward compatibility
  sendOtp: (phone) =>
    client.post('/api/auth/send-otp', { phone }),

  verifyOtp: (phone, code) =>
    client.post('/api/auth/verify-otp', { phone, code }),
};

export default authApi;
