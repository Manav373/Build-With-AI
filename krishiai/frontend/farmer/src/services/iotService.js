/**
 * KrishiAI IoT & Smart Irrigation Service
 * Supports:
 * 1. Firebase Realtime Database (RTDB) - Native SSE stream & REST updates
 * 2. KrishiAI FastAPI Backend (/api/iot)
 * 3. Local Interactive Hardware Simulator
 */

const STORAGE_KEY_FIREBASE = 'krishiai_iot_firebase_config';

export const DEFAULT_FIREBASE_CONFIG = {
  enabled: true,
  databaseUrl: 'https://krishiai-iot-default-rtdb.firebaseio.com',
  devicePath: '/krishiAI',
};

// Initial state baseline (0s when hardware not connected)
export const INITIAL_TELEMETRY = {
  deviceId: 'krishiai-node-01',
  soilMoisture: 0,
  soilRaw: 0,
  temperature: 0,
  humidity: 0,
  rain: false,
  light: false,
  pump: false,
  pumpStartedAt: null,
  pumpDurationMinutes: 0,
  pumpStartedBy: null,
  timestamp: 0
};

export const INITIAL_DEVICE = {
  id: 'krishiai-node-01',
  name: 'Field Node 01 (ESP32 DevKit)',
  zone: 'Zone A — Wheat Block 1',
  crop: 'Wheat (HD-2967)',
  status: 'offline', // Default to offline until hardware connects
  mode: 'AUTO', // AUTO | MANUAL
  rssi: 0,
  uptimeMinutes: 0,
  ip: '—',
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

import { CROP_PROFILES, getSavedCropProfile } from './cropProfiles.js';
import { checkRecentRain, getYesterdayTelemetry } from './iotHistoryService.js';

/**
 * 5-Step Explainable Agricultural AI Decision Engine
 * Integrated with:
 * - Crop-Specific Physiological Thresholds
 * - Multi-Day Rainfall & Leaching History
 * - Stage-Specific Fertilizer & Fertigation Advisory
 * - Diurnal FAO-56 Evapotranspiration Model
 */
export function evaluateDecision(telemetry, device = INITIAL_DEVICE, cropConfig = null) {
  const activeCropConfig = cropConfig || getSavedCropProfile();
  const cropId = activeCropConfig.cropId || 'wheat';
  const cropDef = CROP_PROFILES[cropId] || CROP_PROFILES.wheat;
  const currentStage = cropDef.stages.find(s => s.id === activeCropConfig.stageId) || cropDef.stages[0];

  const isOffline = device?.status === 'offline' || (!telemetry?.timestamp && telemetry?.soilMoisture === 0 && telemetry?.temperature === 0);
  if (isOffline) {
    return {
      action: 'STANDBY',
      shouldAutoIrrigate: false,
      reason: 'IoT Field Node is offline. Waiting for ESP32 hardware connection.',
      pipeline: {
        sense: `Field Node Offline — Awaiting telemetry packet from ESP32 for ${cropDef.name}`,
        understand: 'Hardware is disconnected. Automated irrigation held in safe standby state.',
        decide: 'System in safe standby mode.',
        act: 'Relay GPIO 26 DE-ENERGIZED (Safe Standby)',
        learn: 'Evapotranspiration model paused until hardware transmits.'
      },
      dryingRatePerHour: 0,
      hoursUntilCritical: 0,
      vpd: 0,
      crop: {
        id: cropId,
        name: cropDef.name,
        variety: cropDef.variety,
        icon: cropDef.icon,
        stage: currentStage.name,
        stageAdvice: currentStage.advice,
        criticalMoisture: critical,
        targetMoisture: target
      },
      rainHistory,
      recommendedPumpWindow: 'Awaiting node connection',
      fertilizerAdvice: currentStage.fertilizerAction,
      diseaseWarning: 'Node offline — microclimate monitoring standby.',
      isFungalRisk: false,
      evaluatedAt: Date.now()
    };
  }

  const moisture = telemetry?.soilMoisture ?? 0;
  const rain = Boolean(telemetry?.rain);
  const light = Boolean(telemetry?.light);
  const temp = telemetry?.temperature ?? 0;
  const humidity = telemetry?.humidity ?? 0;
  const pump = Boolean(telemetry?.pump);

  // Dynamic Crop Thresholds
  const critical = cropDef.criticalMoisture;
  const target = cropDef.targetMoisture;

  // Multi-day rain history check
  const rainHistory = checkRecentRain(2);
  const yesterdayRained = rainHistory.yesterdayRained;

  // 1. SENSE
  const sense = `Crop: ${cropDef.name} (${currentStage.name}) | Moisture: ${moisture}%, Rain: ${rain ? 'ACTIVE PRECIPITATION' : yesterdayRained ? 'Rain Recorded Yesterday (' + rainHistory.totalRainMm + 'mm)' : 'Dry'} | Sky: ${light ? 'Daylight' : 'Night'}`;

  // 2. UNDERSTAND
  const deficit = Math.max(0, target - moisture);
  let understand = '';
  if (rain) {
    understand = `FC-37 active precipitation detected. Rain interlock engaged to protect ${cropDef.name} root zone from asphyxiation.`;
  } else if (yesterdayRained && moisture >= critical) {
    understand = `Yesterday's rainfall (${rainHistory.totalRainMm}mm) replenished root-zone moisture. Capillary moisture holding at ${moisture}%. Avoid artificial irrigation.`;
  } else if (moisture < critical) {
    understand = `Critical root-zone deficit for ${cropDef.name} (${deficit}% below optimal). Crop is at risk of permanent wilting point during ${currentStage.name}.`;
  } else if (moisture < target - 10) {
    understand = `Mild water deficit (${deficit}%). Crop transpiration active. Irrigation recommended during cool low-evaporation hours.`;
  } else {
    understand = `Soil moisture is within optimal agronomic range (${critical}%–${target}%) for ${cropDef.name} ${currentStage.name}.`;
  }

  // 3. DECIDE (Pump Scheduling & Fertilizer)
  let action = 'STANDBY';
  let reason = '';
  let shouldAutoIrrigate = false;
  let recommendedPumpWindow = '';
  let fertilizerAdvice = currentStage.fertilizerAction;

  if (rain) {
    action = 'HOLD_RAIN';
    reason = `Rain sensor detects natural precipitation. Irrigation pump locked out to protect ${cropDef.name} from waterlogging.`;
    fertilizerAdvice = '⚠️ HOLD FERTILIZER: Do not apply top-dressing (Urea/NPK) during active rain to prevent surface runoff and nutrient leaching.';
    shouldAutoIrrigate = false;
  } else if (yesterdayRained && moisture >= critical + 5) {
    action = 'HOLD_RECENT_RAIN';
    reason = `Recent rainfall (${rainHistory.totalRainMm}mm) provides adequate moisture buffer. Pump operation held offline to prevent root rot.`;
    fertilizerAdvice = 'Delay nitrogen top-dressing by 24h until saturated surface water drains.';
    shouldAutoIrrigate = false;
  } else if (moisture < critical) {
    action = 'IRRIGATE_NOW';
    reason = `Moisture (${moisture}%) dropped below critical threshold (${critical}%) for ${cropDef.name} ${currentStage.name}. Immediate irrigation recommended.`;
    shouldAutoIrrigate = true;
    recommendedPumpWindow = light ? 'Immediate Cycle: Low solar noon or late afternoon' : 'Immediate Night Cycle: Optimal deep root absorption';
  } else if (moisture < target - 12 && !pump) {
    action = 'RECOMMEND_IRRIGATION';
    reason = `Moisture at ${moisture}%. Scheduled irrigation window recommended for ${currentStage.name} before moisture stress occurs.`;
    recommendedPumpWindow = 'Tomorrow 06:00 AM – 07:30 AM (Minimal evaporation window)';
    shouldAutoIrrigate = false;
  } else if (pump && moisture >= target) {
    action = 'STOP_OPTIMAL';
    reason = `Target soil hydration (${target}%) achieved for ${cropDef.name}. De-energize pump to conserve water and power.`;
    shouldAutoIrrigate = false;
  } else {
    action = 'STANDBY';
    reason = `Soil moisture stable at ${moisture}%. Sensor telemetry monitoring active for ${cropDef.name}.`;
    shouldAutoIrrigate = false;
  }

  // 4. ACT
  const act = pump 
    ? `Relay GPIO 26 ENERGIZED — Water pump dispensing irrigation to ${cropDef.name} field` 
    : 'Relay GPIO 26 DE-ENERGIZED (High-Z) — Pump in safe standby state';

  // 5. LEARN & Evapotranspiration
  const vpSat = 0.61078 * Math.exp((17.27 * temp) / (temp + 237.3));
  const vpAct = vpSat * (humidity / 100);
  const vpd = Number((vpSat - vpAct).toFixed(2));

  const baseRate = light ? 1.5 : 0.35;
  const tempFactor = (temp - 25) * (light ? 0.08 : 0.02);
  const vpdFactor = (vpd - 0.8) * (light ? 0.4 : 0.1);
  const dryingRate = Number(Math.max(0.1, Math.min(4.5, baseRate + tempFactor + vpdFactor)).toFixed(2));
  const hoursUntilDry = moisture > critical ? Number(((moisture - critical) / dryingRate).toFixed(1)) : 0;
  
  const learn = light
    ? `Daylight cycle: Solar radiation & ${vpd} kPa VPD driving active transpiration (~${dryingRate}%/hr). Approx ${hoursUntilDry}h until critical threshold.`
    : `Night cycle: Stomata closed, minimal evapotranspiration (~${dryingRate}%/hr). Soil capillary retention is high.`;

  // Fungal disease risk based on climate + rain history
  const isFungalRisk = (humidity > 78 && temp >= 22 && temp <= 32) || (yesterdayRained && humidity > 75);
  const diseaseWarning = isFungalRisk 
    ? `High fungal disease risk (Blight / Rust / Mildew) due to prolonged leaf moisture and ${humidity}% RH. Avoid sprinkler wetting on canopy.`
    : 'Disease risk index: Low. Canopy microclimate is aerated.';

  return {
    action,
    shouldAutoIrrigate,
    reason,
    pipeline: { sense, understand, decide: reason, act, learn },
    dryingRatePerHour: dryingRate,
    hoursUntilCritical: hoursUntilDry,
    vpd,
    crop: {
      id: cropId,
      name: cropDef.name,
      variety: cropDef.variety,
      icon: cropDef.icon,
      stage: currentStage.name,
      stageAdvice: currentStage.advice,
      criticalMoisture: critical,
      targetMoisture: target
    },
    rainHistory,
    recommendedPumpWindow,
    fertilizerAdvice,
    diseaseWarning,
    isFungalRisk,
    evaluatedAt: Date.now()
  };
}

/**
 * Load / Save Firebase Settings in LocalStorage
 */
export function parseFirebasePayload(incoming) {
  if (!incoming || typeof incoming !== 'object') return null;
  const sensors = incoming.sensors || {};
  const status = incoming.status || {};
  const control = incoming.control || {};

  const soilRaw = sensors.soilRaw !== undefined 
    ? Number(sensors.soilRaw) 
    : (incoming.soilRaw !== undefined ? Number(incoming.soilRaw) : undefined);

  let soilMoisture = sensors.moisture !== undefined 
    ? Number(sensors.moisture) 
    : (incoming.soilMoisture !== undefined 
        ? Number(incoming.soilMoisture) 
        : (incoming.moisture !== undefined ? Number(incoming.moisture) : undefined));

  // If moisture is not provided in payload, derive from raw ADC:
  if (soilMoisture === undefined && soilRaw !== undefined && soilRaw > 0) {
    const dryLimit = 3200;
    const wetLimit = 1500;
    const calibrated = Math.round(((dryLimit - soilRaw) / (dryLimit - wetLimit)) * 100);
    soilMoisture = Math.max(0, Math.min(100, calibrated));
  }

  const result = {};
  if (soilMoisture !== undefined) result.soilMoisture = soilMoisture;
  if (soilRaw !== undefined) result.soilRaw = soilRaw;

  if (sensors.temperature !== undefined || incoming.temperature !== undefined || incoming.temp !== undefined) {
    result.temperature = Number(sensors.temperature ?? incoming.temperature ?? incoming.temp);
  }
  if (sensors.humidity !== undefined || incoming.humidity !== undefined || incoming.hum !== undefined) {
    result.humidity = Number(sensors.humidity ?? incoming.humidity ?? incoming.hum);
  }
  if (sensors.rain !== undefined || incoming.rain !== undefined) {
    result.rain = Boolean(sensors.rain ?? incoming.rain);
  }
  if (sensors.light !== undefined || incoming.light !== undefined) {
    result.light = Boolean(sensors.light ?? incoming.light);
  }
  if (status.motor !== undefined || control.motorCommand !== undefined || incoming.pump !== undefined || incoming.pumpCommand !== undefined) {
    result.pump = Boolean(status.motor ?? control.motorCommand ?? incoming.pump ?? incoming.pumpCommand);
  }
  if (control.mode !== undefined || incoming.mode !== undefined) {
    result.mode = control.mode || incoming.mode;
  }
  if (control.motorCommand !== undefined || incoming.pumpCommand !== undefined) {
    result.motorCommand = Boolean(control.motorCommand ?? incoming.pumpCommand);
  }
  if (status.online !== undefined || incoming.online !== undefined) {
    result.online = Boolean(status.online ?? incoming.online);
  }
  if (status.lastSeen !== undefined || incoming.lastSeen !== undefined) {
    result.lastSeen = Number(status.lastSeen ?? incoming.lastSeen);
  }
  if (incoming.timestamp !== undefined || sensors.timestamp !== undefined) {
    result.timestamp = Number(incoming.timestamp ?? sensors.timestamp);
  }
  result.raw = incoming;
  return result;
}

export function getSavedFirebaseConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FIREBASE);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!parsed.devicePath || parsed.devicePath === '/devices/krishiai-node-01') {
        parsed.devicePath = '/krishiAI';
      }
      return { ...DEFAULT_FIREBASE_CONFIG, ...parsed, enabled: true };
    }
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
 * Firebase Realtime Database Client with State-Tree Merging
 */
export class FirebaseIoTClient {
  constructor(config = DEFAULT_FIREBASE_CONFIG, onUpdate = () => {}) {
    this.config = config;
    this.onUpdate = onUpdate;
    this.eventSource = null;
    this.pollTimer = null;
    this.isConnected = false;
    this.stateTree = {};
  }

  applyPathUpdate(pathStr, data) {
    if (data === undefined) return;
    if (!pathStr || pathStr === '/') {
      if (typeof data === 'object' && data !== null) {
        this.stateTree = { ...this.stateTree, ...data };
      } else {
        this.stateTree = data;
      }
    } else {
      const parts = pathStr.replace(/^\//, '').split('/').filter(Boolean);
      if (parts.length === 0) {
        if (typeof data === 'object' && data !== null) {
          this.stateTree = { ...this.stateTree, ...data };
        }
      } else {
        let curr = this.stateTree;
        for (let i = 0; i < parts.length - 1; i++) {
          const p = parts[i];
          if (!curr[p] || typeof curr[p] !== 'object') {
            curr[p] = {};
          }
          curr = curr[p];
        }
        const lastPart = parts[parts.length - 1];
        if (typeof data === 'object' && data !== null && !Array.isArray(data)) {
          curr[lastPart] = { ...(curr[lastPart] || {}), ...data };
        } else {
          curr[lastPart] = data;
        }
      }
    }
    this.isConnected = true;
    this.onUpdate(this.stateTree);
  }

  getCleanUrl() {
    let url = (this.config.databaseUrl || '').trim();
    if (!url) return '';
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    url = url.replace(/\/+$/, '');
    let path = (this.config.devicePath || '/krishiAI').trim();
    if (!path.startsWith('/')) path = `/${path}`;
    return `${url}${path}.json`;
  }

  startListening() {
    this.stopListening();
    if (!this.config.enabled) return;

    const dbUrl = (this.config.databaseUrl || '').trim();
    if (!dbUrl) {
      return;
    }

    const fullUrl = this.getCleanUrl();
    if (!fullUrl) return;

    // Use native EventSource for SSE real-time streaming from Firebase RTDB
    try {
      if (typeof window !== 'undefined' && window.EventSource) {
        this.eventSource = new EventSource(fullUrl);

        this.eventSource.addEventListener('put', (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && payload.path !== undefined) {
              this.applyPathUpdate(payload.path, payload.data);
            }
          } catch (e) {
            console.warn('SSE Parse error:', e);
          }
        });

        this.eventSource.addEventListener('patch', (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload && payload.path !== undefined) {
              this.applyPathUpdate(payload.path, payload.data);
            }
          } catch (e) {
            console.warn('SSE Parse error:', e);
          }
        });

        this.eventSource.onerror = () => {
          this.isConnected = false;
          // Fallback to polling every 8 seconds if SSE drops
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
    }, 8000);
  }

  async fetchOnce() {
    const fullUrl = this.getCleanUrl();
    if (!fullUrl) return null;
    try {
      const res = await fetch(fullUrl);
      if (res.ok) {
        const data = await res.json();
        if (data !== null && data !== undefined) {
          this.applyPathUpdate('/', data);
          return data;
        }
      }
    } catch (e) {
      this.isConnected = false;
    }
    return null;
  }

  async sendPumpCommand(pumpState, durationMinutes = 10, reason = 'Web Portal') {
    let url = (this.config.databaseUrl || '').trim().replace(/\/+$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    let path = (this.config.devicePath || '/krishiAI').trim();
    if (!path.startsWith('/')) path = `/${path}`;

    try {
      const isKrishiAISchema = path === '/krishiAI' || path.startsWith('/krishiAI');
      const targetUrl = isKrishiAISchema ? `${url}/krishiAI/control.json` : `${url}${path}.json`;
      const payload = isKrishiAISchema
        ? { motorCommand: Boolean(pumpState) }
        : {
            pump: pumpState,
            pumpCommand: pumpState,
            pumpStartedAt: pumpState ? Date.now() : null,
            pumpDurationMinutes: durationMinutes,
            pumpStartedBy: reason,
            lastCommandTime: Date.now()
          };

      const res = await fetch(targetUrl, {
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

  async sendModeCommand(mode = 'AUTO') {
    let url = (this.config.databaseUrl || '').trim().replace(/\/+$/, '');
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    let path = (this.config.devicePath || '/krishiAI').trim();
    if (!path.startsWith('/')) path = `/${path}`;

    try {
      const isKrishiAISchema = path === '/krishiAI' || path.startsWith('/krishiAI');
      const targetUrl = isKrishiAISchema ? `${url}/krishiAI/control.json` : `${url}${path}.json`;
      const payload = { mode: mode === 'AUTO' ? 'AUTO' : 'MANUAL' };

      const res = await fetch(targetUrl, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      return res.ok;
    } catch (e) {
      console.warn('Failed to send mode command to Firebase:', e);
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
