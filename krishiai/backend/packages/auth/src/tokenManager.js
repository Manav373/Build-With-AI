/**
 * packages/auth/src/tokenManager.js — JWT token utilities
 */
import authStorage from './authStorage.js';

export const tokenManager = {
  getAccessToken: () => authStorage.getAccessToken(),
  getRefreshToken: () => authStorage.getRefreshToken(),
  setTokens: (access, refresh) => authStorage.setTokens(access, refresh),
  clearTokens: () => authStorage.clearAll(),

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64);
      const decoded = JSON.parse(decodedJson);
      if (!decoded.exp) return false;
      return Date.now() >= decoded.exp * 1000;
    } catch {
      return false;
    }
  },
};

export default tokenManager;
