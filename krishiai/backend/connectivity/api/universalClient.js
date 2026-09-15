/**
 * api/universalClient.js
 * -------------------------------------------------------------
 * Universal resilient HTTP client for KrishiAI.
 * Features:
 * - Environment base URL auto-detection
 * - Automatic Bearer token header injection
 * - Domain awareness via X-Krishi-Domain header
 * - Automatic 401 token refresh & replay
 * - Built-in timeout and graceful degradation
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

const getDefaultApiBase = () => {
  if (typeof window !== 'undefined' && window.__KRISHI_API_BASE__) {
    return window.__KRISHI_API_BASE__;
  }
  if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
    return process.env.VITE_API_BASE_URL;
  }
  return 'http://localhost:8000';
};

export class UniversalHttpClient {
  constructor(customBaseUrl) {
    this._customBaseUrl = customBaseUrl;
    this.timeout = 15000; // 15 seconds
  }

  get baseUrl() {
    const base = this._customBaseUrl || getDefaultApiBase();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }

  _getAuthData() {
    if (typeof window === 'undefined' || !window.localStorage) {
      return { accessToken: null, refreshToken: null, activeDomain: 'farmer' };
    }
    return {
      accessToken: localStorage.getItem('krishi_access_token'),
      refreshToken: localStorage.getItem('krishi_refresh_token'),
      activeDomain: localStorage.getItem('krishi_active_domain') || 'farmer'
    };
  }

  /**
   * Execute an HTTP request with built-in telemetry and dynamic change broadcasting.
   */
  async request(endpoint, options = {}) {
    const startTime = Date.now();
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const { accessToken, activeDomain } = this._getAuthData();

    const headers = {
      'ngrok-skip-browser-warning': 'true',
      'X-Krishi-Domain': activeDomain,
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    };

    if (accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), this.timeout) : null;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller ? controller.signal : undefined
      });

      if (timeoutId) clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;

      // Broadcast dynamic HTTP event for live monitors
      domainBridge.broadcast('HTTP_REQUEST_COMPLETED', {
        endpoint,
        method: options.method || 'GET',
        status: response.status,
        ok: response.ok,
        latencyMs,
        domain: activeDomain
      }, activeDomain);

      // Handle 401 Unauthorized token refresh
      if (response.status === 401 && !options._isRetry) {
        const refreshed = await this._tryRefreshToken();
        if (refreshed) {
          return this.request(endpoint, { ...options, _isRetry: true });
        }
      }

      if (!response.ok) {
        const errorBody = await response.text();
        let parsed = errorBody;
        try { parsed = JSON.parse(errorBody); } catch {}
        const error = new Error(`Request failed with status ${response.status}: ${parsed.detail || response.statusText}`);
        error.status = response.status;
        error.data = parsed;
        throw error;
      }

      const contentType = response.headers.get('content-type') || '';
      return contentType.includes('application/json') ? await response.json() : await response.text();
    } catch (err) {
      if (timeoutId) clearTimeout(timeoutId);

      const latencyMs = Date.now() - startTime;
      domainBridge.broadcast('HTTP_REQUEST_FAILED', {
        endpoint,
        method: options.method || 'GET',
        error: err.message,
        latencyMs,
        domain: activeDomain
      }, activeDomain);

      throw err;
    }
  }

  async _tryRefreshToken() {
    const { refreshToken } = this._getAuthData();
    if (!refreshToken) return false;

    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken })
      });

      if (res.ok) {
        const data = await res.json();
        if (typeof window !== 'undefined' && window.localStorage) {
          localStorage.setItem('krishi_access_token', data.access_token);
          if (data.refresh_token) localStorage.setItem('krishi_refresh_token', data.refresh_token);
        }
        return true;
      }
    } catch {
      // Refresh failed
    }
    return false;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: options.isFormData ? body : JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: options.isFormData ? body : JSON.stringify(body)
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const universalClient = new UniversalHttpClient();
export default universalClient;
