import client from './client';

export const aiApi = {
  // Crop Yield Prediction
  predictYield: (payload) =>
    client.post('/api/ml/predict', payload),

  // Multi-Crop Recommendation
  getRecommendations: (payload) =>
    client.post('/api/ml/recommend', payload),

  // Google Earth Engine Satellite NDVI Health
  analyzeSatelliteHealth: (lat, lon) =>
    client.post('/api/ml/satellite-health', { lat, lon }),

  // Pixel analysis
  analyzePixel: (lat, lon) =>
    client.post('/api/ml/pixel-analysis', { lat, lon }),

  // Reverse location resolution
  resolveLocation: (lat, lon) =>
    client.post('/api/ml/resolve-location', { lat, lon }),
};

export default aiApi;
