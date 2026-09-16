import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, update } from 'firebase/database';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBgLKAQSdNkjPXJOOBDcCH6Ane85PAlD64',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'krishiai-iot.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://krishiai-iot-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'krishiai-iot',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'krishiai-iot.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '47064751913',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:47064751913:web:df1e1f0f9d293c94336138'
};

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
  console.warn('⚠️ [IoT Firebase Init]: Firebase initialization deferred:', error.message);
}

const ROOT_PATH = 'krishiAI';

function sanitizeSensors(data) {
  if (!data || typeof data !== 'object') {
    return null;
  }
  return {
    soilRaw: data.soilRaw !== undefined && data.soilRaw !== null ? Number(data.soilRaw) : 0,
    moisture: data.moisture !== undefined && data.moisture !== null ? Number(data.moisture) : 0,
    soilMoisture: data.moisture !== undefined && data.moisture !== null ? Number(data.moisture) : 0,
    temperature: data.temperature !== undefined && data.temperature !== null ? Number(data.temperature) : 0,
    humidity: data.humidity !== undefined && data.humidity !== null ? Number(data.humidity) : 0,
    rain: Boolean(data.rain),
    light: Boolean(data.light),
    updatedAt: data.updatedAt || Date.now()
  };
}

function sanitizeStatus(data) {
  if (!data || typeof data !== 'object') {
    return { motor: false, online: false };
  }
  return {
    motor: Boolean(data.motor),
    online: Boolean(data.online),
    lastHeartbeat: data.lastHeartbeat || Date.now()
  };
}

function sanitizeControl(data) {
  if (!data || typeof data !== 'object') {
    return { mode: 'AUTO', motorCommand: false };
  }
  return {
    mode: data.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
    motorCommand: Boolean(data.motorCommand)
  };
}

export function subscribeToSensors(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase RTDB is not configured.'));
    return () => {};
  }
  const sensorsRef = ref(database, `${ROOT_PATH}/sensors`);
  const unsubscribe = onValue(
    sensorsRef,
    (snapshot) => {
      try {
        const val = snapshot.val();
        const sanitized = sanitizeSensors(val);
        callback(sanitized);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

export function subscribeToStatus(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase RTDB is not configured.'));
    return () => {};
  }
  const statusRef = ref(database, `${ROOT_PATH}/status`);
  const unsubscribe = onValue(
    statusRef,
    (snapshot) => {
      try {
        const val = snapshot.val();
        const sanitized = sanitizeStatus(val);
        callback(sanitized);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

export function subscribeToControl(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase RTDB is not configured.'));
    return () => {};
  }
  const controlRef = ref(database, `${ROOT_PATH}/control`);
  const unsubscribe = onValue(
    controlRef,
    (snapshot) => {
      try {
        const val = snapshot.val();
        const sanitized = sanitizeControl(val);
        callback(sanitized);
      } catch (err) {
        if (onError) onError(err);
      }
    },
    (err) => {
      if (onError) onError(err);
    }
  );
  return unsubscribe;
}

export async function setControlMode(mode) {
  if (!database || !isFirebaseConfigured()) return false;
  const targetMode = mode === 'MANUAL' ? 'MANUAL' : 'AUTO';
  const modeRef = ref(database, `${ROOT_PATH}/control/mode`);
  await set(modeRef, targetMode);
  return true;
}

export async function setMotorCommand(turnOn, currentMode = 'MANUAL') {
  if (!database || !isFirebaseConfigured()) return false;
  const motorRef = ref(database, `${ROOT_PATH}/control/motorCommand`);
  await set(motorRef, Boolean(turnOn));
  return true;
}

export async function setEmergencyStop() {
  if (!database || !isFirebaseConfigured()) return false;
  const controlRef = ref(database, `${ROOT_PATH}/control`);
  await update(controlRef, {
    mode: 'MANUAL',
    motorCommand: false
  });
  return true;
}

export async function writeTelemetrySimulation(telemetryPayload) {
  if (!database || !isFirebaseConfigured()) return false;
  const sensorsRef = ref(database, `${ROOT_PATH}/sensors`);
  await update(sensorsRef, {
    soilRaw: telemetryPayload.soilRaw !== undefined ? telemetryPayload.soilRaw : 2400,
    moisture: telemetryPayload.soilMoisture !== undefined ? telemetryPayload.soilMoisture : 50,
    temperature: telemetryPayload.temperature !== undefined ? telemetryPayload.temperature : 28,
    humidity: telemetryPayload.humidity !== undefined ? telemetryPayload.humidity : 60,
    rain: Boolean(telemetryPayload.rain),
    light: Boolean(telemetryPayload.light)
  });
  return true;
}

export async function writeStatusSimulation(statusPayload) {
  if (!database || !isFirebaseConfigured()) return false;
  const statusRef = ref(database, `${ROOT_PATH}/status`);
  await update(statusRef, statusPayload);
  return true;
}

export { app, database };
