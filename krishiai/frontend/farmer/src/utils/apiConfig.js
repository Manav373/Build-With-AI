/**
 * Universal API Base URL Resolver for Farmer Portal.
 * Guarantees a valid, protocol-prefixed URL and prevents ERR_NAME_NOT_RESOLVED
 * caused by missing trailing slashes (e.g. 'onrender.comapi/...').
 */

export function getApiBaseUrl() {
  const envUrl = (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL || '').trim();

  let base = envUrl;
  if (!base) {
    base = 'http://127.0.0.1:8000';
  } else {
    if (!base.startsWith('http://') && !base.startsWith('https://')) {
      base = `https://${base}`;
    }
  }

  // Strip all trailing slashes to ensure standard format
  return base.replace(/\/+$/, '');
}

/**
 * API_BASE is guaranteed to end with exactly one trailing slash '/'.
 * Concatenating `${API_BASE}api/...` will ALWAYS produce `.../api/...`
 * and will NEVER produce `...comapi/...`.
 */
export const API_BASE = `${getApiBaseUrl()}/`;

export function apiUrl(endpoint) {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}

export default getApiBaseUrl;
