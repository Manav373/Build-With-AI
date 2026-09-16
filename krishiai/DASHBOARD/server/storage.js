import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data_store.json');

// Initialize in-memory state
class Storage {
  constructor() {
    this.devices = {
      'krishiai-node-01': {
        id: 'krishiai-node-01',
        name: 'KrishiAI Node 01',
        farm: 'Demo Farm',
        zone: 'Zone A',
        crop: 'Wheat / Paddy',
        status: 'online',
        lastSeen: new Date().toISOString(),
        ipAddress: '192.168.1.104',
        rssi: -62, // dBm
        wifiSSID: 'KrishiAI-Mesh-01',
        firmwareVersion: 'v1.0.4',
        uptimeSeconds: 84210,
        mode: 'AUTO', // 'AUTO' | 'MANUAL'
        pinConfig: [
          { component: 'ESP32', purpose: 'Main IoT controller', pin: '—', status: 'OK' },
          { component: 'Capacitive Soil Moisture V1.2', purpose: 'Soil moisture', pin: 'GPIO 5 (ADC)', status: 'OK' },
          { component: 'DHT11', purpose: 'Temperature + humidity', pin: 'GPIO 25', status: 'OK' },
          { component: 'FC-37 Rain Sensor', purpose: 'Rain detection', pin: 'GPIO 27 (Digital)', status: 'OK' },
          { component: 'HW-072 / 3362', purpose: 'Light/dark detection', pin: 'GPIO 34 (Digital)', status: 'OK' },
          { component: 'LCD I²C', purpose: 'Local display', pin: 'SDA 21 / SCL 22', status: 'OK' },
          { component: 'Relay Module', purpose: 'Pump control', pin: 'GPIO 26', status: 'OK' },
          { component: 'Water Pump / Motor', purpose: 'Irrigation', pin: 'Relay NO/COM', status: 'OK' }
        ],
        settings: {
          veryDryThreshold: 24,
          dryThreshold: 39,
          goodThreshold: 69,
          autoMaxDurationMinutes: 15,
          manualMaxDurationMinutes: 30,
          soilCalibrationDryRaw: 3200,
          soilCalibrationWetRaw: 1200,
          alertDrySoil: true,
          alertRain: true,
          alertPumpState: true
        }
      }
    };

    // Current live sensor telemetry matching PRD Data Model (Section 24)
    this.currentTelemetry = {
      'krishiai-node-01': {
        deviceId: 'krishiai-node-01',
        timestamp: new Date().toISOString(),
        soilMoisture: 34, // %
        soilRaw: 2450, // ADC value (0-4095)
        temperature: 29.8, // °C
        tempPrev: 28.6, // for trend calculation (+1.2°C)
        humidity: 61, // % RH
        rain: false, // false = NO RAIN, true = RAIN DETECTED
        light: true, // true = DAY/LIGHT, false = DARK (digital HW-072)
        pump: false, // false = OFF, true = ON
        pumpStartedAt: null,
        pumpStartedBy: null,
        pumpDurationMinutes: 0,
        pumpReason: null
      }
    };

    this.decisionState = {
      'krishiai-node-01': {
        status: 'MONITOR', // 'IRRIGATION_RECOMMENDED' | 'NO_WATER_REQUIRED' | 'WAIT_RAIN' | 'MONITOR'
        title: 'NO IRRIGATION REQUIRED',
        recommendation: 'Monitor field conditions',
        badgeColor: 'emerald',
        reason: 'Soil moisture is currently adequate (34%).',
        sense: {
          soilText: 'Soil moisture 34% (Adequate)',
          rainText: 'Rain not detected',
          envText: 'Temp: 29.8°C | Humidity: 61% | Light: DAY'
        },
        understand: 'Crop water tension is optimal. No drought stress detected.',
        decide: 'Maintain current state. Automatic pump trigger threshold is <= 25%.',
        act: 'Keep pump Relay GPIO 26 in OFF state.',
        learn: 'Drying rate is normal at ~1.8% per hour.'
      }
    };

    // Irrigation Sessions History matching PRD Section 20
    this.irrigationHistory = [
      {
        id: 'irr-001',
        deviceId: 'krishiai-node-01',
        date: new Date(Date.now() - 3600000 * 5).toLocaleDateString('en-GB'),
        startTime: '10:15',
        endTime: '10:20',
        duration: '5 min',
        durationMinutes: 5,
        mode: 'Auto',
        reason: 'Dry soil (21%)',
        user: 'KrishiAI Decision Engine',
        status: 'Completed'
      },
      {
        id: 'irr-002',
        deviceId: 'krishiai-node-01',
        date: new Date(Date.now() - 3600000 * 2).toLocaleDateString('en-GB'),
        startTime: '14:10',
        endTime: '14:15',
        duration: '5 min',
        durationMinutes: 5,
        mode: 'Manual',
        reason: 'Farmer routine check',
        user: 'Admin (Piyush)',
        status: 'Completed'
      }
    ];

    // Alerts matching PRD Section 17
    this.alerts = [
      {
        id: 'alt-001',
        deviceId: 'krishiai-node-01',
        type: 'dry_soil',
        severity: 'warning',
        title: 'Soil moisture low',
        message: 'Soil moisture dropped to 22%. Irrigation was initiated automatically.',
        timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
        acknowledged: true
      },
      {
        id: 'alt-002',
        deviceId: 'krishiai-node-01',
        type: 'pump_active',
        severity: 'info',
        title: 'Irrigation session completed',
        message: 'Pump ran for 5 minutes and reached target moisture.',
        timestamp: new Date(Date.now() - 3600000 * 4.9).toISOString(),
        acknowledged: true
      }
    ];

    // Audit logs for pump and settings
    this.auditLogs = [
      {
        id: 'aud-001',
        deviceId: 'krishiai-node-01',
        user: 'Admin (Piyush)',
        action: 'System Initialized',
        details: 'Initial boot: Pump verified OFF in safe state',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
      },
      {
        id: 'aud-002',
        deviceId: 'krishiai-node-01',
        user: 'Admin (Piyush)',
        action: 'Pump Manual ON',
        details: 'Manual pump trigger for 5 min duration test',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString()
      },
      {
        id: 'aud-003',
        deviceId: 'krishiai-node-01',
        user: 'Admin (Piyush)',
        action: 'Pump Manual OFF',
        details: 'Manual pump stop after completed cycle',
        timestamp: new Date(Date.now() - 3600000 * 1.9).toISOString()
      }
    ];

    // Historical readings for multi-range charts
    this.historyReadings = this.generateInitialHistory();
  }

  generateInitialHistory() {
    const readings = [];
    const now = Date.now();
    // 30 days of data, with higher density in the last 24h
    // Last 24 hours: 1 reading every 15 mins (96 points)
    for (let i = 96; i >= 0; i--) {
      const time = new Date(now - i * 15 * 60 * 1000);
      const hour = time.getHours();
      
      // Simulate diurnal cycle: temp peaks at 2 PM, humidity inverse
      const baseTemp = 26 + Math.sin(((hour - 8) / 24) * 2 * Math.PI) * 6;
      const temp = parseFloat((baseTemp + (Math.random() * 1.2 - 0.6)).toFixed(1));
      const humidity = Math.round(75 - (temp - 24) * 2.5 + (Math.random() * 4 - 2));
      
      // Soil moisture slowly drying, with bump at 10:15 and 14:10
      let soil = 34 + Math.sin(i / 10) * 8;
      if (i > 70 && i < 80) soil = 22 + (80 - i); // drying down to irrigation
      if (i <= 70 && i > 40) soil = 48 - (70 - i) * 0.4;
      if (i <= 40 && i > 15) soil = 52 - (40 - i) * 0.5;
      soil = Math.min(100, Math.max(15, Math.round(soil)));
      
      const soilRaw = Math.round(3200 - (soil / 100) * 2000);
      const isDay = hour >= 6 && hour < 19;
      const isRain = i >= 35 && i <= 38; // simulated brief rain shower

      readings.push({
        deviceId: 'krishiai-node-01',
        timestamp: time.toISOString(),
        soilMoisture: soil,
        soilRaw: soilRaw,
        temperature: temp,
        humidity: Math.min(95, Math.max(30, humidity)),
        rain: isRain,
        light: isDay,
        pump: (i >= 78 && i <= 80) || (i >= 18 && i <= 19)
      });
    }
    return readings;
  }

  getDevice(deviceId = 'krishiai-node-01') {
    return this.devices[deviceId] || null;
  }

  getAllDevices() {
    return Object.values(this.devices);
  }

  getLatestTelemetry(deviceId = 'krishiai-node-01') {
    return this.currentTelemetry[deviceId] || null;
  }

  getDecision(deviceId = 'krishiai-node-01') {
    return this.decisionState[deviceId] || null;
  }

  getHistory(deviceId = 'krishiai-node-01', range = '24h') {
    const now = Date.now();
    let cutoff = now - 24 * 3600 * 1000;
    if (range === '1h') cutoff = now - 3600 * 1000;
    else if (range === '6h') cutoff = now - 6 * 3600 * 1000;
    else if (range === '24h') cutoff = now - 24 * 3600 * 1000;
    else if (range === '7d') cutoff = now - 7 * 24 * 3600 * 1000;
    else if (range === '30d') cutoff = now - 30 * 24 * 3600 * 1000;

    return this.historyReadings.filter(r => new Date(r.timestamp).getTime() >= cutoff);
  }

  getAlerts(deviceId = 'krishiai-node-01') {
    return this.alerts.filter(a => !deviceId || a.deviceId === deviceId);
  }

  getIrrigationHistory(deviceId = 'krishiai-node-01') {
    return this.irrigationHistory.filter(h => !deviceId || h.deviceId === deviceId);
  }

  getAuditLogs(deviceId = 'krishiai-node-01') {
    return this.auditLogs.filter(a => !deviceId || a.deviceId === deviceId);
  }

  addTelemetry(deviceId = 'krishiai-node-01', data = {}) {
    const prev = this.currentTelemetry[deviceId] || {};
    const timestamp = data.timestamp || new Date().toISOString();
    
    // Normalization helper
    const parseNum = (val) => (val !== undefined && val !== null && val !== '' && !isNaN(Number(val))) ? Number(val) : undefined;
    const parseBool = (val) => {
      if (val === undefined || val === null || val === '') return undefined;
      if (typeof val === 'boolean') return val;
      if (typeof val === 'number') return val > 0;
      if (typeof val === 'string') {
        const lower = val.trim().toLowerCase();
        if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'high') return true;
        if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'low') return false;
      }
      return Boolean(val);
    };

    // Flexible extraction from any payload format
    let rawSoil = parseNum(data.soilRaw ?? data.rawSoil ?? data.soil_raw ?? data.analog ?? data.analogSoil);
    let soilMoisture = parseNum(data.soilMoisture ?? data.soil ?? data.moisture ?? data.soil_moisture ?? data.sm);
    let temperature = parseNum(data.temperature ?? data.temp ?? data.t ?? data.temp_c ?? data.temperature_c);
    let humidity = parseNum(data.humidity ?? data.hum ?? data.h ?? data.humidity_pct);
    let rain = parseBool(data.rain ?? data.rainfall ?? data.isRain ?? data.rain_detected ?? data.rainDrop ?? data.r);
    let light = parseBool(data.light ?? data.isDay ?? data.day ?? data.ldr ?? data.sunlight ?? data.l);
    let pump = parseBool(data.pump ?? data.relay ?? data.motor ?? data.pumpState ?? data.p);

    const settings = this.devices[deviceId]?.settings || {
      soilCalibrationDryRaw: 3200,
      soilCalibrationWetRaw: 1200
    };

    // Auto-calculate percentage if only raw ADC was sent, or vice versa
    if (soilMoisture !== undefined && rawSoil === undefined) {
      rawSoil = Math.round(settings.soilCalibrationDryRaw - (soilMoisture / 100) * (settings.soilCalibrationDryRaw - settings.soilCalibrationWetRaw));
    } else if (rawSoil !== undefined && soilMoisture === undefined) {
      const span = settings.soilCalibrationDryRaw - settings.soilCalibrationWetRaw;
      soilMoisture = Math.max(0, Math.min(100, Math.round(((settings.soilCalibrationDryRaw - rawSoil) / span) * 100)));
    }

    const updated = {
      deviceId,
      timestamp,
      soilMoisture: soilMoisture !== undefined ? soilMoisture : (prev.soilMoisture ?? 34),
      soilRaw: rawSoil !== undefined ? rawSoil : (prev.soilRaw ?? 2450),
      temperature: temperature !== undefined ? temperature : (prev.temperature ?? 29.8),
      tempPrev: prev.temperature !== undefined ? prev.temperature : 29.8,
      humidity: humidity !== undefined ? humidity : (prev.humidity ?? 61),
      rain: rain !== undefined ? rain : (prev.rain ?? false),
      light: light !== undefined ? light : (prev.light ?? true),
      pump: pump !== undefined ? pump : (prev.pump ?? false),
      pumpStartedAt: prev.pumpStartedAt,
      pumpStartedBy: prev.pumpStartedBy,
      pumpDurationMinutes: prev.pumpDurationMinutes,
      pumpReason: prev.pumpReason
    };

    this.currentTelemetry[deviceId] = updated;
    
    if (this.devices[deviceId]) {
      this.devices[deviceId].lastSeen = timestamp;
      this.devices[deviceId].status = 'online';
    }

    // Append to historical points
    this.historyReadings.push({ ...updated });
    if (this.historyReadings.length > 2000) {
      this.historyReadings.shift();
    }

    return updated;
  }

  setPumpState(deviceId, state, meta = {}) {
    const current = this.currentTelemetry[deviceId];
    if (!current) return null;

    const previousState = current.pump;
    const now = new Date();

    if (state === true && !previousState) {
      // Pump turning ON
      current.pump = true;
      current.pumpStartedAt = now.toISOString();
      current.pumpStartedBy = meta.user || 'Admin';
      current.pumpReason = meta.reason || 'Manual activation';
      current.pumpDurationMinutes = meta.durationMinutes || 5;

      this.logAudit(deviceId, meta.user || 'Admin', 'Pump ON', `Started: ${current.pumpReason} (${current.pumpDurationMinutes} min scheduled)`);
      this.logAlert(deviceId, 'pump_active', 'info', 'Pump Activated', `Irrigation pump started by ${current.pumpStartedBy}. Reason: ${current.pumpReason}`);
    } else if (state === false && previousState) {
      // Pump turning OFF
      const startTime = current.pumpStartedAt ? new Date(current.pumpStartedAt) : new Date(now.getTime() - 5 * 60000);
      const runtimeMs = now.getTime() - startTime.getTime();
      const runtimeMinutes = Math.max(1, Math.round(runtimeMs / 60000));

      const durationStr = `${runtimeMinutes} min`;

      // Record to Irrigation History
      const newSession = {
        id: `irr-${Date.now().toString().slice(-4)}`,
        deviceId,
        date: now.toLocaleDateString('en-GB'),
        startTime: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        duration: durationStr,
        durationMinutes: runtimeMinutes,
        mode: this.devices[deviceId]?.mode === 'AUTO' ? 'Auto' : 'Manual',
        reason: meta.reason || current.pumpReason || 'Irrigation completed',
        user: meta.user || current.pumpStartedBy || 'Admin',
        status: meta.emergency ? 'Emergency Stopped' : (meta.abortedByRain ? 'Paused by Rain' : 'Completed')
      };

      this.irrigationHistory.unshift(newSession);

      current.pump = false;
      current.pumpStartedAt = null;
      current.pumpStartedBy = null;
      current.pumpReason = null;
      current.pumpDurationMinutes = 0;

      this.logAudit(deviceId, meta.user || 'Admin', meta.emergency ? 'EMERGENCY PUMP STOP' : 'Pump OFF', `Ran for ${durationStr}. Reason: ${meta.reason || 'Completed cycle'}`);
      this.logAlert(deviceId, 'pump_active', meta.emergency ? 'critical' : 'info', 'Pump Deactivated', `Irrigation stopped after ${durationStr}. ${meta.reason || ''}`);
    }

    return current;
  }

  setDeviceMode(deviceId, mode, user = 'Admin') {
    if (this.devices[deviceId]) {
      this.devices[deviceId].mode = mode;
      this.logAudit(deviceId, user, 'Mode Changed', `Switched irrigation mode to ${mode}`);
      this.logAlert(deviceId, 'system', 'info', 'Mode Switch', `Irrigation control switched to ${mode} mode by ${user}`);
      return this.devices[deviceId];
    }
    return null;
  }

  updateSettings(deviceId, newSettings, user = 'Admin') {
    if (this.devices[deviceId]) {
      this.devices[deviceId].settings = { ...this.devices[deviceId].settings, ...newSettings };
      this.logAudit(deviceId, user, 'Settings Updated', `Updated threshold & timing parameters`);
      return this.devices[deviceId].settings;
    }
    return null;
  }

  logAlert(deviceId, type, severity, title, message) {
    const alert = {
      id: `alt-${Date.now().toString().slice(-5)}`,
      deviceId,
      type, // 'dry_soil' | 'rain' | 'pump_active' | 'offline' | 'sensor_error' | 'system'
      severity, // 'critical' | 'warning' | 'info'
      title,
      message,
      timestamp: new Date().toISOString(),
      acknowledged: false
    };
    this.alerts.unshift(alert);
    if (this.alerts.length > 50) this.alerts.pop();
    return alert;
  }

  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) alert.acknowledged = true;
    return alert;
  }

  clearAlerts(deviceId) {
    this.alerts = this.alerts.filter(a => a.deviceId !== deviceId);
    return true;
  }

  logAudit(deviceId, user, action, details) {
    const entry = {
      id: `aud-${Date.now().toString().slice(-5)}`,
      deviceId,
      user,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 100) this.auditLogs.pop();
    return entry;
  }
}

export const storage = new Storage();
