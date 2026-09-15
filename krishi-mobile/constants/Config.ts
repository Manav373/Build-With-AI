/**
 * KrishiAI App Configuration
 */

import { Platform } from 'react-native';

// Point this to your KrishiAI backend.
// Override per-environment with EXPO_PUBLIC_API_URL in .env
// (Android emulators can't reach "localhost" — 10.0.2.2 maps to the host machine.)
const getApiBaseUrl = () => {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location) {
    const host = window.location.hostname || 'localhost';
    return `http://${host}:8000`;
  }
  return process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000');
};
export const API_BASE_URL = getApiBaseUrl();

export const APP_CONFIG = {
  name: 'KrishiAI',
  version: '1.0.0',
  tagline: 'Intelligence for the Next Billion Farmers',
  supportEmail: 'support@krishiai.in',
};

export const QUICK_ACTIONS = [
  { id: 'weather', emoji: '🌤️', label: 'Weather', query: "What's the weather forecast?", color: '#3b82f6' },
  { id: 'msp', emoji: '💰', label: 'MSP Prices', query: 'What is the current MSP for wheat?', color: '#f59e0b' },
  { id: 'pest', emoji: '🐛', label: 'Pest Alert', query: 'What pests should I watch for my crop?', color: '#ef4444' },
  { id: 'soil', emoji: '🌱', label: 'Soil Health', query: 'Analyze my soil health for cotton crop', color: '#10b981' },
  { id: 'yield', emoji: '📊', label: 'Yield Est.', query: 'Estimate yield for 5 acres of wheat', color: '#8b5cf6' },
  { id: 'irrigation', emoji: '💧', label: 'Irrigation', query: 'How much water does my crop need?', color: '#06b6d4' },
  { id: 'schemes', emoji: '📜', label: 'Schemes', query: 'What government schemes am I eligible for?', color: '#ec4899' },
  { id: 'disease', emoji: '🔬', label: 'Disease ID', query: 'Help me identify a crop disease', color: '#14b8a6' },
] as const;

export const CROP_LIST = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean',
  'Groundnut', 'Mustard', 'Jowar', 'Bajra', 'Tur', 'Gram',
  'Onion', 'Potato', 'Tomato', 'Chilli', 'Turmeric', 'Garlic',
] as const;

export const STATES = [
  'Andhra Pradesh', 'Bihar', 'Chhattisgarh', 'Gujarat', 'Haryana',
  'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Odisha', 'Punjab', 'Rajasthan', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
] as const;
