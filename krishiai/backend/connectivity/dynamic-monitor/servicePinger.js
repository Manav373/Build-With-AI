/**
 * dynamic-monitor/servicePinger.js
 * -------------------------------------------------------------
 * Dynamic service ping scheduler.
 * Runs in the background of web applications to provide real-time
 * telemetry on all 4 platform domains.
 */

import { healthChecker } from '../api/healthChecker.js';

class ServicePinger {
  constructor() {
    this.isRunning = false;
  }

  start(intervalMs = 4000) {
    if (this.isRunning) return;
    this.isRunning = true;
    healthChecker.intervalMs = intervalMs;
    healthChecker.startAutoPing();
  }

  stop() {
    healthChecker.stopAutoPing();
    this.isRunning = false;
  }

  async pingOnce() {
    return await healthChecker.pingAll();
  }
}

export const servicePinger = new ServicePinger();
export default servicePinger;
