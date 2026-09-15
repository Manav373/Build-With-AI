/**
 * cross-domain/domainBridge.js
 * -------------------------------------------------------------
 * Dynamic real-time bridge enabling instant communication
 * between Farmer (5173), Vendor (5174), and Admin (5175) portals.
 * Uses BroadcastChannel with automated localStorage event fallback.
 */

const CHANNEL_NAME = 'krishiai_domain_bridge';

class DomainBridge {
  constructor() {
    this.listeners = new Map();
    this.isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;

    if (this.isSupported) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = (event) => this._handleIncomingMessage(event.data);
    } else if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === CHANNEL_NAME && e.newValue) {
          try {
            const data = JSON.parse(e.newValue);
            this._handleIncomingMessage(data);
          } catch (err) {
            console.error('[DomainBridge] Parse Error:', err);
          }
        }
      });
    }
  }

  /**
   * Broadcast a dynamic event across all active browser tabs and domains.
   * @param {string} eventType - The action/event type (e.g. 'AUTH_STATE_CHANGED', 'NEW_TENDER', 'PRICE_ALERT')
   * @param {any} payload - The dynamic data payload
   * @param {string} sourceDomain - Optional originating domain ('farmer', 'vendor', 'admin')
   */
  broadcast(eventType, payload = {}, sourceDomain = 'unknown') {
    const message = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      type: eventType,
      payload,
      sourceDomain,
      timestamp: new Date().toISOString()
    };

    if (this.isSupported && this.channel) {
      this.channel.postMessage(message);
    } else if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CHANNEL_NAME, JSON.stringify(message));
    }

    // Also dispatch to local listeners on this tab
    this._handleIncomingMessage(message);
    return message;
  }

  /**
   * Register a listener for a specific dynamic event.
   * @param {string} eventType 
   * @param {Function} callback 
   * @returns {Function} Unsubscribe handler
   */
  subscribe(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType).add(callback);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(eventType);
      }
    };
  }

  /**
   * Subscribe to ALL dynamic changes broadcasted.
   */
  subscribeAll(callback) {
    return this.subscribe('*', callback);
  }

  _handleIncomingMessage(data) {
    if (!data || !data.type) return;

    // Dispatch to specific listeners
    const specificListeners = this.listeners.get(data.type);
    if (specificListeners) {
      specificListeners.forEach(cb => {
        try { cb(data); } catch (e) { console.error('[DomainBridge] Listener error:', e); }
      });
    }

    // Dispatch to wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(cb => {
        try { cb(data); } catch (e) { console.error('[DomainBridge] Wildcard error:', e); }
      });
    }
  }

  destroy() {
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.listeners.clear();
  }
}

export const domainBridge = new DomainBridge();
export default domainBridge;
