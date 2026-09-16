import { storage } from './storage.js';

export class SafetyEngine {
  constructor(broadcastCallback) {
    this.broadcast = broadcastCallback || (() => {});
    this.watchdogInterval = null;
    this.initWatchdog();
  }

  initWatchdog() {
    // Check every 5 seconds for runtime limits and communication timeouts
    this.watchdogInterval = setInterval(() => {
      this.checkAllNodes();
    }, 5000);
  }

  checkAllNodes() {
    const devices = storage.getAllDevices();
    const now = Date.now();

    for (const dev of devices) {
      const telemetry = storage.getLatestTelemetry(dev.id);
      if (!telemetry) continue;

      // 1. Device Offline Watchdog (If no telemetry for > 30 seconds)
      const lastSeenMs = new Date(dev.lastSeen).getTime();
      const isStale = (now - lastSeenMs) > 30000;

      if (isStale && dev.status === 'online') {
        dev.status = 'offline';
        storage.logAlert(dev.id, 'offline', 'critical', 'Device Offline', `${dev.name} has not reported sensor data for > 30 seconds. Automatic safeguards engaged.`);
        
        // Failsafe: Turn OFF pump if device drops offline
        if (telemetry.pump) {
          storage.setPumpState(dev.id, false, {
            user: 'Safety Engine Watchdog',
            reason: 'Communication lost: Failsafe pump shutoff initiated',
            emergency: true
          });
        }
        this.broadcast({ type: 'DEVICE_UPDATE', device: dev, telemetry: storage.getLatestTelemetry(dev.id) });
      }

      // 2. Active Pump Safety Runtime Cutoff
      if (telemetry.pump && telemetry.pumpStartedAt) {
        const startTime = new Date(telemetry.pumpStartedAt).getTime();
        const elapsedMinutes = (now - startTime) / 60000;
        const maxDuration = dev.mode === 'AUTO' 
          ? (dev.settings.autoMaxDurationMinutes || 15) 
          : (telemetry.pumpDurationMinutes || dev.settings.manualMaxDurationMinutes || 30);

        if (elapsedMinutes >= maxDuration) {
          storage.setPumpState(dev.id, false, {
            user: 'Safety Engine',
            reason: `Safety limit reached (${Math.round(elapsedMinutes)} min elapsed / max ${maxDuration} min allowed)`
          });
          storage.logAlert(dev.id, 'pump_active', 'warning', 'Pump Auto-Cutoff', `Irrigation pump automatically stopped after reaching maximum allowed runtime of ${maxDuration} minutes.`);
          this.broadcast({ type: 'TELEMETRY_UPDATE', telemetry: storage.getLatestTelemetry(dev.id) });
        }
      }

      // 3. Rain Interlock: If pump is ON and Rain becomes true, immediately cut off pump
      if (telemetry.pump && telemetry.rain) {
        storage.setPumpState(dev.id, false, {
          user: 'Safety Engine Interlock',
          reason: 'Rain detected during active irrigation: Pump immediately shut down',
          abortedByRain: true
        });
        storage.logAlert(dev.id, 'rain', 'warning', 'Rain Interlock Triggered', 'Rain detected on FC-37 sensor. Active irrigation cycle aborted to prevent over-saturation.');
        this.broadcast({ type: 'TELEMETRY_UPDATE', telemetry: storage.getLatestTelemetry(dev.id) });
      }
    }
  }

  // Validates manual pump activation request
  validatePumpActivation(deviceId, options = {}) {
    const dev = storage.getDevice(deviceId);
    const telemetry = storage.getLatestTelemetry(deviceId);

    if (!dev) {
      return { allowed: false, error: 'Device not found' };
    }

    if (dev.status === 'offline') {
      return { allowed: false, error: 'Cannot activate pump: Device is currently OFFLINE' };
    }

    if (telemetry.rain && !options.overrideRain) {
      return { allowed: false, error: 'Rain interlock active: Precipitation detected. Pump activation blocked.' };
    }

    // Safety checks passed
    return { allowed: true };
  }
}
