/**
 * packages/api/src/client.js — Universal KrishiAI HTTP Client
 * ---------------------------------------------------------------
 * Base client handling:
 * - JWT Authorization header injection
 * - Domain awareness (X-Krishi-Domain)
 * - Automatic token refresh on 401
 * - Timeout handling & normalized error format
 */

const getApiBase = () => {
  if (typeof window !== 'undefined' && window.__KRISHI_API_BASE__) {
    return window.__KRISHI_API_BASE__;
  }
  return (
    (typeof import.meta !== 'undefined' &&
      (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL)) ||
    'http://localhost:8000'
  );
};

export class UniversalApiClient {
  constructor(customBaseUrl) {
    this._customBaseUrl = customBaseUrl;
  }

  get baseUrl() {
    const base = this._customBaseUrl || getApiBase();
    return base.endsWith('/') ? base.slice(0, -1) : base;
  }

  getTokens() {
    if (typeof localStorage === 'undefined') return { accessToken: null, refreshToken: null };
    return {
      accessToken: localStorage.getItem('krishi_access_token'),
      refreshToken: localStorage.getItem('krishi_refresh_token'),
    };
  }

  setTokens(accessToken, refreshToken) {
    if (typeof localStorage === 'undefined') return;
    if (accessToken) localStorage.setItem('krishi_access_token', accessToken);
    if (refreshToken) localStorage.setItem('krishi_refresh_token', refreshToken);
  }

  clearTokens() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem('krishi_access_token');
    localStorage.removeItem('krishi_refresh_token');
    localStorage.removeItem('krishi_user_profile');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const { accessToken } = this.getTokens();

    const headers = {
      'ngrok-skip-browser-warning': 'true',
      ...(options.isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    };

    if (accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const domain = (typeof localStorage !== 'undefined' && localStorage.getItem('krishi_active_domain')) || 'farmer';
    headers['X-Krishi-Domain'] = domain;

    let response;
    try {
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      console.error('[UniversalApiClient Network Error]', err);
      throw new Error('Unable to connect to KrishiAI backend. Ensure server is running.');
    }

    // Auto-refresh token on 401
    if (response.status === 401 && !options._isRetry) {
      const { refreshToken } = this.getTokens();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${this.baseUrl}/api/v1/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            this.setTokens(data.access_token, data.refresh_token);
            return this.request(endpoint, { ...options, _isRetry: true });
          } else {
            this.clearTokens();
          }
        } catch {
          this.clearTokens();
        }
      }
    }

    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.detail || data?.message || response.statusText || 'An error occurred';
      const error = new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: options.isFormData ? body : JSON.stringify(body),
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: options.isFormData ? body : JSON.stringify(body),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const client = new UniversalApiClient();
export default client;
