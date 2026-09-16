import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Firebase Client Configuration loaded from Vite environment variables
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if minimum configuration (databaseURL or projectId/apiKey) is provided
export const isFirebaseConfigured = () => {
  return Boolean(
    firebaseConfig.databaseURL && 
    firebaseConfig.databaseURL.trim() !== '' &&
    !firebaseConfig.databaseURL.includes('your_project')
  );
};

let app = null;
let database = null;

try {
  if (isFirebaseConfigured() || firebaseConfig.apiKey) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
    if (firebaseConfig.databaseURL) {
      database = getDatabase(app, firebaseConfig.databaseURL);
    } else {
      database = getDatabase(app);
    }
  }
} catch (error) {
  console.warn('⚠️ [Firebase Init]: Firebase initialization deferred or misconfigured:', error.message);
}

export { app, database };
