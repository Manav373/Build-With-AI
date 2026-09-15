/**
 * realtime/sseConnector.js
 * -------------------------------------------------------------
 * Server-Sent Events (EventSource) connector for unidirectional live feeds:
 * - Live mandi commodity rate changes
 * - Severe weather and flood warnings
 * - Farmer tender bid notifications
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export class SSEConnector {
  constructor(endpoint, options = {}) {
    this.endpoint = endpoint;
    this.eventSource = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    if (typeof window === 'undefined' || !('EventSource' in window)) {
      console.warn('[SSEConnector] EventSource not supported in this environment');
      return;
    }

    if (this.eventSource) return;

    this.eventSource = new EventSource(this.endpoint);

    this.eventSource.onopen = () => {
      this.isConnected = true;
      domainBridge.broadcast('SSE_CONNECTED', { endpoint: this.endpoint }, 'sse');
    };

    this.eventSource.onerror = (err) => {
      this.isConnected = false;
      domainBridge.broadcast('SSE_DISCONNECTED', { endpoint: this.endpoint, error: err }, 'sse');
    };

    this.eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        this._dispatch('message', data);
      } catch {
        this._dispatch('message', e.data);
      }
    };
  }

  addEventListener(eventName, handler) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);

    if (this.eventSource) {
      this.eventSource.addEventListener(eventName, (e) => {
        try {
          const parsed = JSON.parse(e.data);
          handler(parsed);
          domainBridge.broadcast(`SSE_${eventName.toUpperCase()}`, parsed, 'sse');
        } catch {
          handler(e.data);
        }
      });
    }

    return () => {
      const set = this.listeners.get(eventName);
      if (set) set.delete(handler);
    };
  }

  _dispatch(event, data) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      handlers.forEach(h => h(data));
    }
    domainBridge.broadcast('SSE_DATA_STREAMED', { event, data }, 'sse');
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      domainBridge.broadcast('SSE_CLOSED', { endpoint: this.endpoint }, 'sse');
    }
  }
}

export default SSEConnector;
