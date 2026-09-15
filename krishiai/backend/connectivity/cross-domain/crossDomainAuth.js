/**
 * cross-domain/crossDomainAuth.js
 * -------------------------------------------------------------
 * Manages Cross-Domain Single Sign-On (SSO) and session synchronization
 * between Farmer (5173), Vendor (5174), and Admin (5175).
 */

import { domainBridge } from './domainBridge.js';
import { KRISHI_DOMAINS } from './portRegistry.js';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'krishi_access_token',
  REFRESH_TOKEN: 'krishi_refresh_token',
  USER_PROFILE: 'krishi_user_profile',
  ACTIVE_DOMAIN: 'krishi_active_domain'
};

export class CrossDomainAuth {
  constructor() {
    this._initBridgeSync();
  }

  _initBridgeSync() {
    domainBridge.subscribe('AUTH_STATE_CHANGED', (event) => {
      const { user, accessToken, activeDomain } = event.payload || {};
      if (typeof window === 'undefined') return;

      if (user && accessToken) {
        localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
        localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
        if (activeDomain) localStorage.setItem(STORAGE_KEYS.ACTIVE_DOMAIN, activeDomain);
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
      }
    });
  }

  /**
   * Log in user and broadcast dynamic auth event to all domains.
   */
  login(user, accessToken, refreshToken = null, activeDomain = 'farmer') {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
      if (refreshToken) localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
      localStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DOMAIN, activeDomain);
    }

    domainBridge.broadcast('AUTH_STATE_CHANGED', {
      user,
      accessToken,
      activeDomain,
      action: 'LOGIN'
    }, activeDomain);
  }

  /**
   * Log out user across all domains.
   */
  logout(currentDomain = 'farmer') {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER_PROFILE);
    }

    domainBridge.broadcast('AUTH_STATE_CHANGED', {
      user: null,
      accessToken: null,
      action: 'LOGOUT'
    }, currentDomain);
  }

  /**
   * Switch the user's active domain and optionally redirect them to that domain's port.
   */
  switchDomain(targetDomainKey, autoRedirect = true) {
    const domain = KRISHI_DOMAINS[targetDomainKey.toUpperCase()];
    if (!domain) {
      console.warn(`[CrossDomainAuth] Unknown domain: ${targetDomainKey}`);
      return;
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DOMAIN, domain.id);
    }

    domainBridge.broadcast('DOMAIN_SWITCHED', {
      targetDomain: domain.id,
      port: domain.port,
      url: domain.baseUrl
    });

    if (autoRedirect && typeof window !== 'undefined') {
      window.location.href = domain.baseUrl;
    }
  }

  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(STORAGE_KEYS.USER_PROFILE);
    try {
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getAccessToken() {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }
}

export const crossDomainAuth = new CrossDomainAuth();
export default crossDomainAuth;
