/**
 * api/healthChecker.js
 * -------------------------------------------------------------
 * Continuous real-time health verification engine.
 * Probes all 4 platform services (Backend: 8000, Farmer: 5173,
 * Vendor: 5174, Admin: 5175), checks latency, and fires dynamic
 * change notifications whenever service status changes.
 */

import { KRISHI_DOMAINS } from '../cross-domain/portRegistry.js';
import { domainBridge } from '../cross-domain/domainBridge.js';

export class ServiceHealthChecker {
  constructor(options = {}) {
    this.intervalMs = options.intervalMs || 5000;
    this.timer = null;
    this.lastStatus = {};
    this.history = [];
    this.maxHistory = 50;
  }

  /**
   * Ping a single service and return status + latency.
   */
  async pingService(domainKey) {
    const domain = KRISHI_DOMAINS[domainKey.toUpperCase()];
    if (!domain) throw new Error(`Unknown domain: ${domainKey}`);

    const startTime = Date.now();
    try {
      // In browser, using no-cors or standard fetch
      const res = await fetch(domain.healthEndpoint, {
        method: 'GET',
        mode: 'no-cors',
        cache: 'no-store'
      });
      const latencyMs = Date.now() - startTime;

      const result = {
        id: domain.id,
        name: domain.name,
        port: domain.port,
        online: true,
        statusCode: 200,
        latencyMs,
        checkedAt: new Date().toISOString()
      };

      this._checkTransition(domain.id, result);
      return result;
    } catch (err) {
      const latencyMs = Date.now() - startTime;
      const result = {
        id: domain.id,
        name: domain.name,
        port: domain.port,
        online: false,
        statusCode: 0,
        error: err.message,
        latencyMs,
        checkedAt: new Date().toISOString()
      };

      this._checkTransition(domain.id, result);
      return result;
    }
  }

  /**
   * Ping all 4 services concurrently.
   */
  async pingAll() {
    const keys = Object.keys(KRISHI_DOMAINS);
    const results = await Promise.all(keys.map(k => this.pingService(k)));

    const summary = {
      timestamp: new Date().toISOString(),
      services: results.reduce((acc, curr) => {
        acc[curr.id] = curr;
        return acc;
      }, {}),
      allHealthy: results.every(r => r.online)
    };

    this.history.unshift(summary);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    domainBridge.broadcast('HEALTH_HEARTBEAT', summary, 'health-checker');
    return summary;
  }

  _checkTransition(serviceId, current) {
    const previous = this.lastStatus[serviceId];
    if (!previous || previous.online !== current.online) {
      domainBridge.broadcast('SERVICE_STATUS_CHANGED', {
        serviceId,
        previousState: previous ? previous.online : 'UNKNOWN',
        currentState: current.online,
        latencyMs: current.latencyMs,
        timestamp: current.checkedAt
      }, serviceId);
    }
    this.lastStatus[serviceId] = current;
  }

  startAutoPing() {
    if (this.timer) return;
    this.pingAll(); // Immediate run
    this.timer = setInterval(() => this.pingAll(), this.intervalMs);
  }

  stopAutoPing() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const healthChecker = new ServiceHealthChecker();
export default healthChecker;
