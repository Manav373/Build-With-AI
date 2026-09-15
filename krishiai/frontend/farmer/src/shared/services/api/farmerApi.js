import client from './client';

export const farmerApi = {
  // 1. Web Chat (Gemini text & query)
  sendChat: ({ phoneId, message, lat, lon, city, state, village, taluka, history = [] }) => {
    const payload = {
      phone_id: phoneId,
      message,
      lat,
      lon,
      city,
      state,
      village,
      taluka,
      history: history.slice(-10).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text || '',
      })),
    };
    return client.post('/api/web/chat', payload);
  },

  // 2. Gemini Vision Image Analysis
  analyzeImage: (file, language = 'en', phoneId = 'web_farmer') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);
    formData.append('phone_id', phoneId);
    return client.post('/api/web/vision', formData, { isFormData: true });
  },

  // 3. Audio / Speech Query
  sendAudio: (file, { lat, lon, city, state, village, taluka, history = [], phoneId = 'web_farmer' }) => {
    const formData = new FormData();
    formData.append('file', file, 'audio.webm');
    formData.append('phone_id', phoneId);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);
    if (city) formData.append('city', city);
    if (state) formData.append('state', state);
    if (village) formData.append('village', village);
    if (taluka) formData.append('taluka', taluka);
    formData.append(
      'history',
      JSON.stringify(
        history.slice(-10).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text || '',
        }))
      )
    );
    return client.post('/api/web/audio', formData, { isFormData: true });
  },

  // 4. Location Analytics
  saveLocation: (latitude, longitude, source = 'web') =>
    client.post('/api/location', { latitude, longitude, source, timestamp: new Date().toISOString() }),

  getFarmerLocations: () =>
    client.get('/api/farmer-locations'),

  // 5. Market Prices & Trends
  getAllMarketPrices: (params) => {
    const query = new URLSearchParams(params).toString();
    return client.get(`/api/web/all-market-prices?${query}`);
  },

  getCommodityTrends: (commodity, state) =>
    client.get(`/api/web/commodity-trends?commodity=${encodeURIComponent(commodity)}&state=${encodeURIComponent(state)}`),

  getLiveMandis: (lat, lon, allIndia = false) =>
    client.get(`/api/web/live-mandis?lat=${lat}&lon=${lon}&all_india=${allIndia}`),

  getNearbyMarkets: (lat, lon, radius = 50000) =>
    client.get(`/api/web/nearby-markets?lat=${lat}&lon=${lon}&radius=${radius}`),

  getMarketTrends: () =>
    client.get('/api/web/market-trends'),

  // 6. Schemes & Voice
  getSchemes: () =>
    client.get('/api/schemes/all'),

  getAISchemeSummary: (schemeId, lang) =>
    client.get(`/api/schemes/ai-summary?scheme_id=${schemeId}&lang=${lang}`),

  getCallHistory: () =>
    client.get('/api/vapi/history'),
};

export default farmerApi;
