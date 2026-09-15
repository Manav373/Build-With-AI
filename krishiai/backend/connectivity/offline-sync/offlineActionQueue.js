/**
 * offline-sync/offlineActionQueue.js
 * -------------------------------------------------------------
 * Persistent queue for recording offline mutation requests.
 * Buffers actions into LocalStorage when offline and notifies
 * dynamic monitors whenever items are queued, replayed, or discarded.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

const QUEUE_STORAGE_KEY = 'krishiai_offline_action_queue';

export class OfflineActionQueue {
  constructor() {
    this.queue = this._load();
  }

  _load() {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
      const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  _save() {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    }
    domainBridge.broadcast('OFFLINE_QUEUE_UPDATED', {
      count: this.queue.length,
      items: this.queue
    }, 'offline-queue');
  }

  /**
   * Enqueue a pending mutation.
   */
  enqueue(action) {
    const item = {
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      endpoint: action.endpoint,
      method: action.method || 'POST',
      body: action.body,
      domain: action.domain || 'farmer',
      description: action.description || 'Offline Mutation',
      queuedAt: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(item);
    this._save();

    domainBridge.broadcast('OFFLINE_ACTION_ENQUEUED', item, item.domain);
    return item;
  }

  peek() {
    return this.queue[0] || null;
  }

  dequeue() {
    const item = this.queue.shift();
    this._save();
    return item;
  }

  remove(id) {
    this.queue = this.queue.filter(i => i.id !== id);
    this._save();
  }

  clear() {
    this.queue = [];
    this._save();
  }

  getItems() {
    return [...this.queue];
  }

  size() {
    return this.queue.length;
  }
}

export const offlineQueue = new OfflineActionQueue();
export default offlineQueue;
