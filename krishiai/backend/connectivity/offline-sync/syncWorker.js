/**
 * offline-sync/syncWorker.js
 * -------------------------------------------------------------
 * Dynamic synchronization coordinator.
 * Listens for network restoration, automatically drains the
 * offline action queue, replays requests, and publishes real-time sync results.
 */

import { offlineQueue } from './offlineActionQueue.js';
import { networkTracker } from './networkStatusTracker.js';
import { universalClient } from '../api/universalClient.js';
import { domainBridge } from '../cross-domain/domainBridge.js';

export class SyncWorker {
  constructor() {
    this.isSyncing = false;
    this._initAutoSync();
  }

  _initAutoSync() {
    networkTracker.subscribe(({ isOnline }) => {
      if (isOnline && offlineQueue.size() > 0 && !this.isSyncing) {
        this.processQueue();
      }
    });
  }

  /**
   * Process all queued offline mutations one-by-one.
   */
  async processQueue() {
    if (this.isSyncing || offlineQueue.size() === 0) return;
    this.isSyncing = true;

    domainBridge.broadcast('SYNC_STARTED', {
      queueSize: offlineQueue.size(),
      startedAt: new Date().toISOString()
    }, 'sync-worker');

    let processedCount = 0;
    let failedCount = 0;

    while (offlineQueue.size() > 0) {
      const item = offlineQueue.peek();
      if (!item) break;

      try {
        await universalClient.request(item.endpoint, {
          method: item.method,
          body: item.body ? JSON.parse(item.body) : undefined,
          headers: { 'X-Krishi-Domain': item.domain }
        });

        offlineQueue.dequeue();
        processedCount++;

        domainBridge.broadcast('OFFLINE_ACTION_SYNCED', {
          id: item.id,
          description: item.description,
          syncedAt: new Date().toISOString()
        }, item.domain);
      } catch (err) {
        console.error(`[SyncWorker] Failed syncing item ${item.id}:`, err);
        item.retryCount = (item.retryCount || 0) + 1;

        if (item.retryCount >= 3) {
          // Discard after 3 failed attempts to avoid blocking the queue
          offlineQueue.dequeue();
          failedCount++;
          domainBridge.broadcast('OFFLINE_ACTION_DISCARDED', {
            id: item.id,
            reason: 'Max retries exceeded'
          }, item.domain);
        } else {
          // Pause queue processing on server/network failure
          break;
        }
      }
    }

    this.isSyncing = false;

    domainBridge.broadcast('SYNC_COMPLETED', {
      processedCount,
      failedCount,
      remainingQueue: offlineQueue.size(),
      completedAt: new Date().toISOString()
    }, 'sync-worker');
  }
}

export const syncWorker = new SyncWorker();
export default syncWorker;
