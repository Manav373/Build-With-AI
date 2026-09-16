/**
 * Universal API Base URL Resolver for Vendor Portal.
 * Prevents ERR_NAME_NOT_RESOLVED by ensuring production environments (e.g. Vercel)
 * never fall back to local 127.0.0.1 or localhost.
 */

export function getApiBaseUrl() {
  const envUrl = (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || '').trim();

  // If in browser and on a real domain (not localhost)
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    const isLocal = host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0';
    if (!isLocal) {
      if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        let clean = envUrl;
        if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
          clean = `https://${clean}`;
        }
        return clean.replace(/\/+$/, '');
      }
      return 'https://krishiai-backend-21jz.onrender.com';
    }
  }

  // Local development
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000';
}

export const API_BASE_URL = getApiBaseUrl();
export const API_BASE = `${getApiBaseUrl()}/`;

export function apiUrl(endpoint) {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
