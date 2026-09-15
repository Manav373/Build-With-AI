import axios from 'axios';
import { API_BASE_URL } from '@/constants/Config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Chat ───
export const sendChatMessage = async (
  phoneId: string,
  message: string,
  lat?: number | null,
  lon?: number | null,
  history: { role: string; content: string }[] = [],
  city?: string | null,
  state?: string | null,
) => {
  const payload: Record<string, unknown> = {
    phone_id: phoneId,
    message,
    history: history.slice(-10),
  };
  if (lat && lon) { payload.lat = lat; payload.lon = lon; }
  if (city) payload.city = city;
  if (state) payload.state = state;
  const { data } = await api.post('/api/web/chat', payload);
  return data;
};

// ─── Vision (Image scan) ───
export const sendImageForScan = async (phoneId: string, imageUri: string, language = 'en') => {
  const formData = new FormData();
  formData.append('phone_id', phoneId);
  formData.append('language', language);
  formData.append('file', {
    uri: imageUri,
    name: 'crop_scan.jpg',
    type: 'image/jpeg',
  } as unknown as Blob);
  const { data } = await api.post('/api/web/vision', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Voice ───
export const sendVoiceMessage = async (
  phoneId: string,
  audioUri: string,
  lat?: number | null,
  lon?: number | null,
  history: { role: string; content: string }[] = [],
) => {
  const formData = new FormData();
  formData.append('phone_id', phoneId);
  formData.append('file', {
    uri: audioUri,
    name: 'audio.webm',
    type: 'audio/webm',
  } as unknown as Blob);
  if (lat) formData.append('lat', String(lat));
  if (lon) formData.append('lon', String(lon));
  formData.append('history', JSON.stringify(history.slice(-10)));
  const { data } = await api.post('/api/web/audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

// ─── Market Prices ───
export const getMarketPrices = async (params: Record<string, string | number>) => {
  const { data } = await api.get('/api/web/all-market-prices', { params });
  return data;
};

export const getCommodityTrends = async (commodity: string, state: string) => {
  const { data } = await api.get('/api/web/commodity-trends', { params: { commodity, state } });
  return data;
};

export const getLiveWeather = async (params: { lat?: number; lon?: number; city?: string }) => {
  const { data } = await api.get('/api/web/weather', { params });
  return data;
};

export const getLiveMandis = async (lat: number, lon: number) => {
  const { data } = await api.get('/api/web/live-mandis', { params: { lat, lon } });
  return data;
};

export const getMarketTrends = async () => {
  const { data } = await api.get('/api/web/market-trends');
  return data;
};

// ─── ML / Prediction ───
export const predictYield = async (params: Record<string, unknown>) => {
  const { data } = await api.post('/api/ml/predict', params);
  return data;
};

export const getRecommendations = async (params: Record<string, unknown>) => {
  const { data } = await api.post('/api/ml/recommend', params);
  return data;
};

export const resolveLocation = async (lat: number, lon: number) => {
  const { data } = await api.post('/api/ml/resolve-location', { lat, lon });
  return data;
};

// ─── Schemes ───
export const getAllSchemes = async () => {
  const { data } = await api.get('/api/schemes/all');
  return data;
};

export const getAISchemeSummary = async (schemeId: string, lang: string) => {
  const { data } = await api.get('/api/schemes/ai-summary', { params: { scheme_id: schemeId, lang } });
  return data;
};

// ─── Analytics ───
export const sendLocation = async (latitude: number, longitude: number) => {
  try {
    const { data } = await api.post('/api/location', {
      latitude, longitude,
      source: 'mobile',
      timestamp: new Date().toISOString(),
    });
    return data;
  } catch { /* silent fail — location is optional */ }
};

export default api;
