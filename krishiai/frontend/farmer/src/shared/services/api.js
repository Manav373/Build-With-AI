import axios from 'axios';

let BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';

if (BASE_URL && !BASE_URL.startsWith('http') && BASE_URL.includes('.')) {
  BASE_URL = `https://${BASE_URL}`;
}

if (BASE_URL.endsWith('/')) {
  BASE_URL = BASE_URL.slice(0, -1);
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, 
  headers: {
    'ngrok-skip-browser-warning': 'true'
  }
});

// 1. Chat Text & GPS Weather Endpoint
export const sendChatQuery = async (phoneId, message, lat = null, lon = null, history = [], city = null, state = null, token = null, village = null, taluka = null, district = null, channel = null, language = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const payload = { 
      phone_id: phoneId, 
      message: message,
      channel: channel || (phoneId === 'voice_user' ? 'voice' : 'web'),
      language: language || undefined,
      history: history.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || ''
      }))
    };
    if (lat && lon) {
      payload.lat = lat;
      payload.lon = lon;
    }
    if (city) payload.city = city;
    if (state) payload.state = state;
    if (district) payload.district = district;
    if (village) payload.village = village;
    if (taluka) payload.taluka = taluka;
    const response = await apiClient.post('/api/web/chat', payload, { headers });
    return response.data;
  } catch (error) {
    console.error('API Chat Error:', error);
    throw error;
  }
};

// 2. Vision API Image Upload Endpoint
export const sendImageQuery = async (phoneId, file, language = 'en', token = null) => {
  try {
    const headers = { 
      'Content-Type': 'multipart/form-data',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('phone_id', phoneId);
    formData.append('file', file);
    formData.append('language', language);

    const response = await apiClient.post('/api/web/vision', formData, { headers });
    return response.data;
  } catch (error) {
    console.error('API Vision Error:', error);
    throw error;
  }
};

// 3. Voice API Audio Upload Endpoint
export const sendVoiceQuery = async (phoneId, file, lat = null, lon = null, history = [], city = null, state = null, token = null, village = null, taluka = null) => {
  try {
    const headers = { 
      'Content-Type': 'multipart/form-data',
      'ngrok-skip-browser-warning': 'true'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const formData = new FormData();
    formData.append('phone_id', phoneId);
    formData.append('file', file, 'audio.webm');
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);
    if (city) formData.append('city', city);
    if (state) formData.append('state', state);
    if (village) formData.append('village', village);
    if (taluka) formData.append('taluka', taluka);
    
    const processedHistory = history.slice(-10).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text || ''
    }));
    formData.append('history', JSON.stringify(processedHistory));

    const response = await apiClient.post('/api/web/audio', formData, { headers });
    return response.data;
  } catch (error) {
    console.error('API Voice Error:', error);
    throw error;
  }
};

// 4. Send Farmer Location
export const sendLocation = async (latitude, longitude, source = 'web', token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.post('/api/location', {
      latitude,
      longitude,
      source,
      timestamp: new Date().toISOString(),
    }, { headers });
    return response.data;
  } catch (error) {
    console.error('API Location Error:', error);
  }
};

// 5. Get all farmer locations
export const getFarmerLocations = async (token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/farmer-locations', { headers });
    return response.data?.locations || response.data || [];
  } catch (error) {
    console.error('API FarmerLocations Error:', error);
    return [];
  }
};

// 6. Get analytics dashboard data
export const getAnalytics = async (token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/analytics', { headers });
    return response.data;
  } catch (error) {
    console.error('API Analytics Error:', error);
    return null;
  }
};

// 7. ML Yield Prediction
export const predictYield = async (data, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.post('/api/ml/predict', data, { headers });
    return response.data;
  } catch (error) {
    console.error('API Predict Error:', error);
    throw error;
  }
};

// 8. ML Crop Recommendation
export const getRecommendations = async (data, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.post('/api/ml/recommend', data, { headers });
    return response.data;
  } catch (error) {
    console.error('API Recommend Error:', error);
    throw error;
  }
};

// 9. Resolve Location
export const resolveLocationBackend = async (lat = null, lon = null, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.post('/api/ml/resolve-location', { lat, lon }, { headers });
    return response.data;
  } catch (error) {
    console.error('API ResolveLocation Error:', error);
    return { error: error.message };
  }
};

// 10. Market Prices
export const getAllMarketPrices = async (params, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/web/all-market-prices', { 
      params,
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('API Market Prices Error:', error);
    throw error;
  }
};

// 11. Commodity Trends
export const getCommodityTrends = async (commodity, state, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/web/commodity-trends', { 
      params: { commodity, state },
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('API commodity Trends Error:', error);
    throw error;
  }
};

// 12. Live Mandis
export const getLiveMandis = async (lat, lon, token = null, allIndia = false) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/web/live-mandis', { 
      params: { lat, lon, all_india: allIndia },
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('API Live Mandis Error:', error);
    throw error;
  }
};

// 13. Nearby Market Discovery
export const getNearbyMarkets = async (lat, lon, radius = 50000, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/web/nearby-markets', { 
      params: { lat, lon, radius },
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('API Nearby Markets Error:', error);
    throw error;
  }
};

// 14. Government Schemes
export const getAllSchemes = async (token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/schemes/all', { headers });
    return response.data;
  } catch (error) {
    console.error('API Schemes Error:', error);
    throw error;
  }
};

// 15. AI Scheme Summary
export const getAISchemeSummary = async (scheme_id, lang, token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/schemes/ai-summary', { 
      params: { scheme_id, lang },
      headers 
    });
    return response.data;
  } catch (error) {
    console.error('API Scheme Summary Error:', error);
    throw error;
  }
};

// 16. Market Trends
export const getMarketTrends = async (token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/web/market-trends', { headers });
    return response.data;
  } catch (error) {
    console.error('API Market Trends Error:', error);
    throw error;
  }
};

// 17. Voice Call History
export const getCallHistory = async (token = null) => {
  try {
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await apiClient.get('/api/vapi/history', { headers });
    return response.data || [];
  } catch (error) {
    console.error('API Call History Error:', error);
    return [];
  }
};

export default apiClient;
