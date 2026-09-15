/**
 * dynamic-monitor/metricsCollector.js
 * -------------------------------------------------------------
 * Collects and aggregates dynamic performance & connectivity metrics:
 * - Average latency per service (ms)
 * - Service uptime percentage
 * - Request success vs failure ratios
 * - Network quality trends
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export class MetricsCollector {
  constructor() {
    this.serviceLatencies = {
      backend: [],
      farmer: [],
      vendor: [],
      admin: []
    };
    this.maxSamples = 20;

    this._bindEvents();
  }

  _bindEvents() {
    domainBridge.subscribe('HEALTH_HEARTBEAT', (event) => {
      const services = event.payload?.services || {};
      Object.entries(services).forEach(([id, s]) => {
        if (this.serviceLatencies[id] && typeof s.latencyMs === 'number') {
          this.serviceLatencies[id].push(s.latencyMs);
          if (this.serviceLatencies[id].length > this.maxSamples) {
            this.serviceLatencies[id].shift();
          }
        }
      });
    });
  }

  getAverageLatency(serviceId) {
    const list = this.serviceLatencies[serviceId] || [];
    if (list.length === 0) return 0;
    const sum = list.reduce((a, b) => a + b, 0);
    return Math.round(sum / list.length);
  }

  getMetricsSummary() {
    return {
      backendAvgLatencyMs: this.getAverageLatency('backend'),
      farmerAvgLatencyMs: this.getAverageLatency('farmer'),
      vendorAvgLatencyMs: this.getAverageLatency('vendor'),
      adminAvgLatencyMs: this.getAverageLatency('admin'),
      samplesCollected: this.serviceLatencies.backend.length
    };
  }
}

export const metricsCollector = new MetricsCollector();
export default metricsCollector;
