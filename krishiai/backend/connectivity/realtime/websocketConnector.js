/**
 * realtime/websocketConnector.js
 * -------------------------------------------------------------
 * Resilient WebSocket client for live real-time bidirectional streaming.
 * Includes:
 * - Automatic reconnection with exponential backoff
 * - Heartbeat ping-pong monitoring
 * - Typed message multiplexing
 * - Dynamic broadcast of connection state changes
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export class WebSocketConnector {
  constructor(url, options = {}) {
    this.url = url;
    this.autoReconnect = options.autoReconnect !== false;
    this.reconnectIntervalMs = options.reconnectIntervalMs || 2000;
    this.maxReconnectAttempts = options.maxReconnectAttempts || 10;
    this.heartbeatIntervalMs = options.heartbeatIntervalMs || 15000;

    this.ws = null;
    this.reconnectAttempts = 0;
    this.heartbeatTimer = null;
    this.messageHandlers = new Map();
    this.isConnected = false;
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this._startHeartbeat();

        domainBridge.broadcast('WEBSOCKET_CONNECTED', {
          url: this.url,
          timestamp: new Date().toISOString()
        }, 'websocket');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this._handleMessage(data);
        } catch {
          this._handleMessage({ type: 'RAW_MESSAGE', payload: event.data });
        }
      };

      this.ws.onclose = (event) => {
        this.isConnected = false;
        this._stopHeartbeat();

        domainBridge.broadcast('WEBSOCKET_DISCONNECTED', {
          code: event.code,
          reason: event.reason,
          timestamp: new Date().toISOString()
        }, 'websocket');

        if (this.autoReconnect) {
          this._scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        domainBridge.broadcast('WEBSOCKET_ERROR', {
          error: err.message || 'Connection error',
          timestamp: new Date().toISOString()
        }, 'websocket');
      };
    } catch (err) {
      this._scheduleReconnect();
    }
  }

  _scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      domainBridge.broadcast('WEBSOCKET_RECONNECT_FAILED', {
        attempts: this.reconnectAttempts
      }, 'websocket');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectIntervalMs * Math.min(this.reconnectAttempts, 5);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  _startHeartbeat() {
    this._stopHeartbeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'PING', timestamp: Date.now() }));
      }
    }, this.heartbeatIntervalMs);
  }

  _stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  send(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload, timestamp: Date.now() }));
      return true;
    }
    return false;
  }

  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type).add(handler);
    return () => this.messageHandlers.get(type).delete(handler);
  }

  _handleMessage(data) {
    const handlers = this.messageHandlers.get(data.type);
    if (handlers) {
      handlers.forEach(fn => fn(data.payload || data));
    }

    // Also forward to domain bridge for live dynamic monitors
    domainBridge.broadcast('REALTIME_DATA_RECEIVED', data, 'websocket');
  }

  disconnect() {
    this.autoReconnect = false;
    this._stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }
}

export default WebSocketConnector;
