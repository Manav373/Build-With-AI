/**
 * KrishiAI IoT & Smart Irrigation Service
 * Supports:
 * 1. Firebase Realtime Database (RTDB) - Native SSE stream & REST updates
 * 2. KrishiAI FastAPI Backend (/api/iot)
 * 3. Local Interactive Hardware Simulator
 */

const STORAGE_KEY_FIREBASE = 'krishiai_iot_firebase_config';

export const DEFAULT_FIREBASE_CONFIG = {
  enabled: false,
  databaseUrl: 'https://krishiai-iot-default-rtdb.firebaseio.com',
  devicePath: '/devices/krishiai-node-01',
};

// Initial state baseline
export const INITIAL_TELEMETRY = {
  deviceId: 'krishiai-node-01',
  soilMoisture: 38,
  soilRaw: 2450,
  temperature: 28.5,
  humidity: 62.0,
  rain: false,
  light: true,
  pump: false,
  pumpStartedAt: null,
  pumpDurationMinutes: 0,
  pumpStartedBy: null,
  timestamp: Date.now()
};

export const INITIAL_DEVICE = {
  id: 'krishiai-node-01',
  name: 'Field Node 01 (ESP32 DevKit)',
  zone: 'Zone A — Wheat Block 1',
  crop: 'Wheat (HD-2967)',
  status: 'online',
  mode: 'AUTO', // AUTO | MANUAL
  rssi: -64,
  uptimeMinutes: 412,
  ip: '192.168.1.107',
  settings: {
    criticalMoisture: 25,
    targetMoisture: 65,
    autoMaxDurationMinutes: 15,
    manualMaxDurationMinutes: 30,
    rainInterlock: true,
    soilDryAdc: 3200,
    soilWetAdc: 1400
  }
};

/**
 * 5-Step Agricultural AI Decision Engine
 */
export function evaluateDecision(telemetry, device = INITIAL_DEVICE) {
  const moisture = telemetry?.soilMoisture ?? 35;
  const rain = Boolean(telemetry?.rain);
  const light = Boolean(telemetry?.light);
  const temp = telemetry?.temperature ?? 28;
  const humidity = telemetry?.humidity ?? 60;
  const pump = Boolean(telemetry?.pump);
  const critical = device?.settings?.criticalMoisture ?? 25;
  const target = device?.settings?.targetMoisture ?? 65;

  // 1. SENSE
  const sense = `Soil Moisture: ${moisture}%, Precipitation: ${rain ? 'ACTIVE RAIN' : 'None'}, Sky: ${light ? 'Daylight' : 'Night'}`;

  // 2. UNDERSTAND
  const deficit = Math.max(0, target - moisture);
  let understand = '';
  if (rain) {
    understand = 'FC-37 detected natural precipitation. Surface capillary soil water replenishing naturally.';
  } else if (moisture < critical) {
    understand = `Severe root-zone moisture deficit (${deficit}% below optimal). Crops are approaching permanent wilting point.`;
  } else if (moisture < 40) {
    understand = `Mild water deficit (${deficit}%). Transpiration rates indicate irrigation window is active.`;
  } else {
    understand = 'Soil moisture is in the optimal agronomic range (40–69%). Root oxygenation and water balance are ideal.';
  }

  // 3. DECIDE
  let action = 'STANDBY';
  let reason = '';
  let shouldAutoIrrigate = false;

  if (rain) {
    action = 'HOLD_RAIN';
    reason = 'FC-37 rain sensor detects active precipitation. Pump locked out by safety interlock to avoid waterlogging.';
    shouldAutoIrrigate = false;
  } else if (moisture < critical) {
    action = 'IRRIGATE_NOW';
    reason = `Soil moisture (${moisture}%) dropped below critical threshold (${critical}%). Automatic irrigation triggered.`;
    shouldAutoIrrigate = true;
  } else if (moisture < 40 && !pump) {
    action = 'RECOMMEND_IRRIGATION';
    reason = `Moisture at ${moisture}%. Scheduled irrigation cycle recommended during low-evaporation hours.`;
    shouldAutoIrrigate = false;
  } else if (pump && moisture >= target) {
    action = 'STOP_OPTIMAL';
    reason = `Target soil hydration (${target}%) reached. De-energizing relay to conserve water.`;
    shouldAutoIrrigate = false;
  } else {
    action = 'STANDBY';
    reason = `Soil moisture stable at ${moisture}%. Continuous sensor monitoring active.`;
    shouldAutoIrrigate = false;
  }

  // 4. ACT
  const act = pump 
    ? 'Relay GPIO 26 ENERGIZED (Active LOW) — Water pump dispensing irrigation' 
    : 'Relay GPIO 26 DE-ENERGIZED (High-Z) — Pump in safe standby state';

  // 5. LEARN
  const dryingRate = Number(Math.max(0.6, Math.min(4.5, 1.8 + (temp - 25) * 0.12 - (humidity - 50) * 0.02)).toFixed(1));
  const hoursUntilDry = moisture > critical ? Number(((moisture - critical) / dryingRate).toFixed(1)) : 0;
  const learn = `Estimated evapotranspiration rate: ~${dryingRate}%/hr. Approx ${hoursUntilDry} hours until critical threshold under current heat and humidity.`;

  return {
    action,
    shouldAutoIrrigate,
    reason,
    pipeline: { sense, understand, decide: reason, act, learn },
    dryingRatePerHour: dryingRate,
    hoursUntilCritical: hoursUntilDry,
    evaluatedAt: Date.now()
  };
}

/**
 * Load / Save Firebase Settings in LocalStorage
 */
export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (raw) return { ...DEFAULT_FIREBASE_CONFIG, ...JSON.parse(raw) };
  } catch (e) {
    console.warn('Failed to load firebase config from storage:', e);
  }
  return DEFAULT_FIREBASE_CONFIG;
}

export function saveFirebaseConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save firebase config:', e);
  }
}

/**
 * Firebase Realtime Database Client
 */
export class FirebaseIoTClient {
  constructor(config = DEFAULT_FIREBASE_CONFIG, onUpdate = () => {}) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.eventSource = null;
    this.pollTimer = null;
    this.isConnected = false;
  }

  getCleanUrl() {
    let url = (this.config.databaseUrl || '').trim();
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    url = url.replace(/\/+$/, '');
    let path = (this.config.devicePath || '/devices/krishiai-node-01').trim();
    if (!path.startsWith('/')) path = `/${path}`;
    return `${url}${path}.json`;
  }

  startListening() {
    this.stopListening();
    if (!this.config.enabled) return;

    const fullUrl = this.getCleanUrl();
    if (!fullUrl) return;

    // Use native EventSource for SSE real-time streaming from Firebase RTDB
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        this.eventSource = new EventSource(fullUrl);

        this.eventSource.addEventListener('put', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.data) {
              this.isConnected = true;
              this.onUpdate(data.data);
            }
          } catch (e) {
            console.warn('SSE Parse error:', e);
          }
        });

        this.eventSource.addEventListener('patch', (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.data) {
              this.isConnected = true;
              this.onUpdate(data.data);
            }
          } catch (e) {
            console.warn('SSE Parse error:', e);
          }
        });

        this.eventSource.onerror = () => {
          this.isConnected = false;
          // Fallback to polling every 4 seconds
          if (!this.pollTimer) {
            this.startPolling();
          }
        };
      } else {
        this.startPolling();
      }
    } catch (e) {
      console.warn('SSE connection failed, falling back to polling:', e);
      this.startPolling();
    }
  }

  startPolling() {
    this.fetchOnce();
    this.pollTimer = setInterval(() => {
      this.fetchOnce();
    }, 4000);
  }

  async fetchOnce() {
    const fullUrl = this.getCleanUrl();
    if (!fullUrl) return null;
    try {
      const res = await fetch(fullUrl);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          this.isConnected = true;
          this.onUpdate(data);
          return data;
        }
      }
    } catch (e) {
      this.isConnected = false;
    }
    return null;
  }

  async sendPumpCommand(pumpState, durationMinutes = 10, reason = 'Web Portal') {
    const fullUrl = this.getCleanUrl();
    if (!fullUrl) return false;
    try {
      const payload = {
        pump: pumpState,
        pumpCommand: pumpState,
        pumpStartedAt: pumpState ? Date.now() : null,
        pumpDurationMinutes: durationMinutes,
        pumpStartedBy: reason,
        lastCommandTime: Date.now()
      };
      const res = await fetch(fullUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to send pump command to Firebase:', e);
      return false;
    }
  }

  stopListening() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
    this.isConnected = false;
  }
}
