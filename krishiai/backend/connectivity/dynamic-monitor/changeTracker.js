/**
 * dynamic-monitor/changeTracker.js
 * -------------------------------------------------------------
 * Real-time dynamic change tracker.
 * Listens to all broadcasted events across domains, services, and network,
 * maintains an in-memory chronological audit journal, and provides
 * real-time change notifications to UI components.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export class ChangeTracker {
  constructor(options = {}) {
    this.maxLogSize = options.maxLogSize || 200;
    this.changeLog = [];
    this.subscribers = new Set();
    this.changeCounts = {
      TOTAL: 0,
      NETWORK: 0,
      HEALTH: 0,
      AUTH: 0,
      HTTP: 0,
      OFFLINE: 0,
      VOICE: 0,
      REALTIME: 0
    };

    this._initBridgeListener();
  }

  _initBridgeListener() {
    domainBridge.subscribeAll((event) => {
      this.recordChange(event.type, event.payload, event.sourceDomain);
    });
  }

  /**
   * Record a new dynamic change into the live log.
   */
  recordChange(changeType, details = {}, source = 'system') {
    const changeEntry = {
      id: `chg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: changeType,
      source,
      details,
      timestamp: new Date().toLocaleTimeString(),
      isoTimestamp: new Date().toISOString()
    };

    this.changeLog.unshift(changeEntry);
    if (this.changeLog.length > this.maxLogSize) {
      this.changeLog.pop();
    }

    // Categorize count
    this.changeCounts.TOTAL++;
    if (changeType.includes('NETWORK')) this.changeCounts.NETWORK++;
    else if (changeType.includes('HEALTH') || changeType.includes('SERVICE')) this.changeCounts.HEALTH++;
    else if (changeType.includes('AUTH') || changeType.includes('DOMAIN')) this.changeCounts.AUTH++;
    else if (changeType.includes('HTTP')) this.changeCounts.HTTP++;
    else if (changeType.includes('OFFLINE') || changeType.includes('SYNC')) this.changeCounts.OFFLINE++;
    else if (changeType.includes('VAPI') || changeType.includes('VOICE')) this.changeCounts.VOICE++;
    else this.changeCounts.REALTIME++;

    this._notifySubscribers(changeEntry);
    return changeEntry;
  }

  _notifySubscribers(changeEntry) {
    this.subscribers.forEach(cb => {
      try { cb(changeEntry, this.getSnapshot()); } catch (err) { console.error('[ChangeTracker] Error:', err); }
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  getSnapshot() {
    return {
      changes: [...this.changeLog],
      counts: { ...this.changeCounts },
      lastUpdated: new Date().toISOString()
    };
  }

  clear() {
    this.changeLog = [];
    Object.keys(this.changeCounts).forEach(k => { this.changeCounts[k] = 0; });
    this._notifySubscribers(null);
  }
}

export const changeTracker = new ChangeTracker();
export default changeTracker;
