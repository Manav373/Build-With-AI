import { useSafeAuth } from './useSafeAuth';
import axios from 'axios';

// Get the base URL with multiple fallback options (same as api.js)
let BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (BASE_URL && !BASE_URL.startsWith('http') && BASE_URL.includes('.')) {
  BASE_URL = `https://${BASE_URL}`;
}

if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

/**
 * Custom hook that provides an authenticated Axios instance
 * and authenticated versions of the API functions.
 */
export const useAuthenticatedApi = () => {
  const { getToken } = useSafeAuth();

  const getAuthenticatedClient = async () => {
    const token = await getToken();
    
    return axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
  };

  // Higher-order function to wrap API calls with authentication
  const authenticatedRequest = async (requestFn) => {
    const token = await getToken();
    const client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Authorization': `Bearer ${token}`,
        'ngrok-skip-browser-warning': 'true'
      }
    });
    return requestFn(client);
  };

  return { authenticatedRequest, getAuthenticatedClient, getToken };
};
