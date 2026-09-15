/**
 * realtime/liveEventBus.js
 * -------------------------------------------------------------
 * High-speed in-process event bus for local decoupled reactivity.
 * Features:
 * - Wildcard topic matching ('market.*', 'vendor.order.*')
 * - Event replay buffer for newly mounted components
 * - Dynamic subscriber introspection
 */

export class LiveEventBus {
  constructor(options = {}) {
    this.subscribers = new Map();
    this.history = [];
    this.maxHistory = options.maxHistory || 100;
  }

  emit(topic, payload = {}) {
    const event = {
      topic,
      payload,
      timestamp: Date.now(),
      isoTime: new Date().toISOString()
    };

    // Store in ring buffer
    this.history.unshift(event);
    if (this.history.length > this.maxHistory) {
      this.history.pop();
    }

    // Direct match
    if (this.subscribers.has(topic)) {
      this.subscribers.get(topic).forEach(cb => this._invoke(cb, event));
    }

    // Wildcard match (e.g. 'farmer.*' matching 'farmer.crop_scanned')
    this.subscribers.forEach((callbacks, pattern) => {
      if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        if (topic.startsWith(prefix) && topic !== pattern) {
          callbacks.forEach(cb => this._invoke(cb, event));
        }
      } else if (pattern === '*') {
        callbacks.forEach(cb => this._invoke(cb, event));
      }
    });

    return event;
  }

  on(pattern, callback) {
    if (!this.subscribers.has(pattern)) {
      this.subscribers.set(pattern, new Set());
    }
    this.subscribers.get(pattern).add(callback);

    return () => {
      const set = this.subscribers.get(pattern);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.subscribers.delete(pattern);
      }
    };
  }

  once(pattern, callback) {
    const unsubscribe = this.on(pattern, (event) => {
      unsubscribe();
      callback(event);
    });
    return unsubscribe;
  }

  getRecentEvents(limit = 20) {
    return this.history.slice(0, limit);
  }

  _invoke(cb, event) {
    try { cb(event); } catch (e) { console.error('[LiveEventBus] Callback error:', e); }
  }

  clear() {
    this.subscribers.clear();
    this.history = [];
  }
}

export const liveEventBus = new LiveEventBus();
export default liveEventBus;
