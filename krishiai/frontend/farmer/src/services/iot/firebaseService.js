import { ref, onValue, set, update, get } from 'firebase/database';
import { database, isFirebaseConfigured } from './firebase';

const ROOT_PATH = 'krishiAI';

/**
 * Validates and sanitizes incoming sensor payload
 */
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

/**
 * Validates and sanitizes incoming status payload
 */
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

/**
 * Validates and sanitizes incoming control payload
 */
function sanitizeControl(data) {
  if (!data || typeof data !== 'object') {
    return { mode: 'AUTO', motorCommand: false };
  }
  return {
    mode: data.mode === 'MANUAL' ? 'MANUAL' : 'AUTO',
    motorCommand: Boolean(data.motorCommand)
  };
}

/**
 * Subscribes in realtime to krishiAI/sensors
 * @param {Function} callback Called with sanitized sensor data
 * @param {Function} onError Optional error callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToSensors(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase Realtime Database is not configured.'));
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
        console.error('Error processing sensor telemetry from Firebase:', err);
        if (onError) onError(err);
      }
    },
    (err) => {
      console.warn('Firebase sensors subscription error:', err.message);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes in realtime to krishiAI/status
 * @param {Function} callback Called with sanitized status ({ motor, online })
 * @param {Function} onError Optional error callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToStatus(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase Realtime Database is not configured.'));
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
        console.error('Error processing status from Firebase:', err);
        if (onError) onError(err);
      }
    },
    (err) => {
      console.warn('Firebase status subscription error:', err.message);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes in realtime to krishiAI/status/motor (actual motor relay status)
 * @param {Function} callback Called with boolean actual motor state
 * @param {Function} onError Optional error callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToMotorStatus(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase Realtime Database is not configured.'));
    return () => {};
  }

  const motorRef = ref(database, `${ROOT_PATH}/status/motor`);

  const unsubscribe = onValue(
    motorRef,
    (snapshot) => {
      const val = snapshot.val();
      callback(Boolean(val));
    },
    (err) => {
      console.warn('Firebase motor status subscription error:', err.message);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Subscribes in realtime to krishiAI/control
 * @param {Function} callback Called with sanitized control ({ mode, motorCommand })
 * @param {Function} onError Optional error callback
 * @returns {Function} Unsubscribe function
 */
export function subscribeToControl(callback, onError) {
  if (!database || !isFirebaseConfigured()) {
    if (onError) onError(new Error('Firebase Realtime Database is not configured.'));
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
        console.error('Error processing control from Firebase:', err);
        if (onError) onError(err);
      }
    },
    (err) => {
      console.warn('Firebase control subscription error:', err.message);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}

/**
 * Sets control mode: 'AUTO' or 'MANUAL'
 * @param {'AUTO' | 'MANUAL'} mode 
 */
export async function setControlMode(mode) {
  if (!database || !isFirebaseConfigured()) {
    throw new Error('Firebase Realtime Database is not configured.');
  }

  const targetMode = mode === 'MANUAL' ? 'MANUAL' : 'AUTO';
  const modeRef = ref(database, `${ROOT_PATH}/control/mode`);
  await set(modeRef, targetMode);

  // If switching back to AUTO, ensure motorCommand is disarmed to prevent inadvertent pump running
  if (targetMode === 'AUTO') {
    const motorCommandRef = ref(database, `${ROOT_PATH}/control/motorCommand`);
    await set(motorCommandRef, false);
  }

  return targetMode;
}

/**
 * Sets manual motor command: true (ON) or false (OFF)
 * Only permitted when mode is MANUAL.
 * @param {boolean} command 
 * @param {string} currentMode 
 */
export async function setMotorCommand(command, currentMode = 'MANUAL') {
  if (!database || !isFirebaseConfigured()) {
    throw new Error('Firebase Realtime Database is not configured.');
  }

  const booleanCmd = Boolean(command);

  // Guard: In AUTO mode, manual commands cannot override automatic controller
  if (booleanCmd && currentMode === 'AUTO') {
    throw new Error('Cannot send manual motor ON command while in AUTO mode. Switch to MANUAL mode first.');
  }

  const motorCommandRef = ref(database, `${ROOT_PATH}/control/motorCommand`);
  await set(motorCommandRef, booleanCmd);
  return booleanCmd;
}

/**
 * Instant Emergency Stop Cutoff
 * Immediately writes motorCommand: false
 */
export async function setEmergencyStop() {
  if (!database || !isFirebaseConfigured()) {
    throw new Error('Firebase Realtime Database is not configured.');
  }

  const controlRef = ref(database, `${ROOT_PATH}/control`);
  await update(controlRef, {
    motorCommand: false
  });
  return false;
}

/**
 * Injects simulated sensor telemetry into Firebase (used by Hardware Simulator)
 * @param {Object} telemetry 
 */
export async function writeTelemetrySimulation(telemetry) {
  if (!database || !isFirebaseConfigured()) {
    throw new Error('Firebase Realtime Database is not configured.');
  }

  const sensorsRef = ref(database, `${ROOT_PATH}/sensors`);
  const payload = {
    soilRaw: Number(telemetry.soilRaw ?? (4095 - Math.round((telemetry.soilMoisture ?? 50) * 25))),
    moisture: Number(telemetry.soilMoisture ?? telemetry.moisture ?? 50),
    temperature: Number(telemetry.temperature ?? 28),
    humidity: Number(telemetry.humidity ?? 60),
    rain: Boolean(telemetry.rain),
    light: Boolean(telemetry.light)
  };

  await set(sensorsRef, payload);
  return payload;
}

/**
 * Updates status simulation (motor / online state)
 * @param {Object} status 
 */
export async function writeStatusSimulation(status) {
  if (!database || !isFirebaseConfigured()) {
    throw new Error('Firebase Realtime Database is not configured.');
  }

  const statusRef = ref(database, `${ROOT_PATH}/status`);
  const payload = {};
  if (status.motor !== undefined) payload.motor = Boolean(status.motor);
  if (status.online !== undefined) payload.online = Boolean(status.online);

  await update(statusRef, payload);
  return payload;
}
