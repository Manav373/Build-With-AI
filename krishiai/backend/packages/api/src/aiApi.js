import client from './client.js';

export const aiApi = {
  predictYield: (payload) =>
    client.post('/api/ml/predict', payload),

  getRecommendations: (payload) =>
    client.post('/api/ml/recommend', payload),

  analyzeSatelliteHealth: (lat, lon) =>
    client.post('/api/ml/satellite-health', { lat, lon }),

  analyzePixel: (lat, lon) =>
    client.post('/api/ml/pixel-analysis', { lat, lon }),

  resolveLocation: (lat, lon) =>
    client.post('/api/ml/resolve-location', { lat, lon }),
};

export default aiApi;
