/**
 * packages/auth/src/authStorage.js — LocalStorage wrapper for KrishiAI credentials
 */

const KEYS = {
  ACCESS_TOKEN: 'krishi_access_token',
  REFRESH_TOKEN: 'krishi_refresh_token',
  USER_PROFILE: 'krishi_user_profile',
  ACTIVE_DOMAIN: 'krishi_active_domain',
};

export const authStorage = {
  getAccessToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEYS.ACCESS_TOKEN) : null),
  getRefreshToken: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEYS.REFRESH_TOKEN) : null),
  getUserProfile: () => {
    if (typeof localStorage === 'undefined') return null;
    try {
      const data = localStorage.getItem(KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  getActiveDomain: () => (typeof localStorage !== 'undefined' ? localStorage.getItem(KEYS.ACTIVE_DOMAIN) : null),

  setTokens: (accessToken, refreshToken) => {
    if (typeof localStorage === 'undefined') return;
    if (accessToken) localStorage.setItem(KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) localStorage.setItem(KEYS.REFRESH_TOKEN, refreshToken);
  },

  setUserProfile: (profile) => {
    if (typeof localStorage === 'undefined') return;
    if (profile) localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
  },

  setActiveDomain: (domain) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEYS.ACTIVE_DOMAIN, domain);
  },

  clearAll: () => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(KEYS.ACCESS_TOKEN);
    localStorage.removeItem(KEYS.REFRESH_TOKEN);
    localStorage.removeItem(KEYS.USER_PROFILE);
  },
};

export default authStorage;
