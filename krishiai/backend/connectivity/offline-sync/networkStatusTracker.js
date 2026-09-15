/**
 * offline-sync/networkStatusTracker.js
 * -------------------------------------------------------------
 * Dynamic real-time network status tracker.
 * Detects online/offline transitions, roundtrip time (RTT), downlink speed,
 * and effective connection type (4g, 3g, 2g, slow-2g).
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

class NetworkStatusTracker {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.connectionInfo = this._readConnectionInfo();
    this.subscribers = new Set();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this._handleStatusChange(true));
      window.addEventListener('offline', () => this._handleStatusChange(false));

      if ('connection' in navigator) {
        navigator.connection.addEventListener('change', () => {
          this.connectionInfo = this._readConnectionInfo();
          this._notifySubscribers();
          domainBridge.broadcast('NETWORK_QUALITY_CHANGED', this.connectionInfo, 'network-tracker');
        });
      }
    }
  }

  _readConnectionInfo() {
    if (typeof navigator !== 'undefined' && 'connection' in navigator) {
      const conn = navigator.connection;
      return {
        effectiveType: conn.effectiveType || '4g',
        downlink: conn.downlink || 10,
        rtt: conn.rtt || 50,
        saveData: conn.saveData || false
      };
    }
    return {
      effectiveType: 'unknown',
      downlink: 10,
      rtt: 50,
      saveData: false
    };
  }

  _handleStatusChange(isOnline) {
    this.isOnline = isOnline;
    this.connectionInfo = this._readConnectionInfo();
    this._notifySubscribers();

    domainBridge.broadcast('NETWORK_STATUS_CHANGED', {
      isOnline,
      connectionInfo: this.connectionInfo,
      timestamp: new Date().toISOString()
    }, 'network-tracker');
  }

  _notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb({ isOnline: this.isOnline, connection: this.connectionInfo });
      } catch (err) {
        console.error('[NetworkStatusTracker] Subscriber error:', err);
      }
    });
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    callback({ isOnline: this.isOnline, connection: this.connectionInfo });
    return () => this.subscribers.delete(callback);
  }

  getStatus() {
    return {
      isOnline: this.isOnline,
      connection: this.connectionInfo
    };
  }
}

export const networkTracker = new NetworkStatusTracker();
export default networkTracker;
