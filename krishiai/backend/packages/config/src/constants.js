/**
 * packages/config/src/constants.js — General frontend constants
 */

export const APP_NAME = 'KrishiAI';
export const APP_TAGLINE = 'AI Agronomist & Agricultural Intelligence Ecosystem';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी (Hindi)' },
  { code: 'mr', label: 'मराठी (Marathi)' },
  { code: 'te', label: 'తెలుగు (Telugu)' },
  { code: 'ta', label: 'தமிழ் (Tamil)' },
  { code: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'gu', label: 'ગુજરાતી (Gujarati)' },
  { code: 'pa', label: 'ਪੰਜਾਬੀ (Punjabi)' },
];

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'krishi_access_token',
  REFRESH_TOKEN: 'krishi_refresh_token',
  USER_PROFILE: 'krishi_user_profile',
  ACTIVE_DOMAIN: 'krishi_active_domain',
  LANGUAGE: 'krishi_language',
};
