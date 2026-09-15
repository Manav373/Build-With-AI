/**
 * api/retryManager.js
 * -------------------------------------------------------------
 * Dynamic retry manager with exponential backoff and jitter.
 * Designed specifically for rural 2G/3G network conditions where
 * intermittent disconnections happen frequently.
 */

import { domainBridge } from '../cross-domain/domainBridge.js';

export async function executeWithRetry(fn, options = {}) {
  const {
    retries = 3,
    initialDelayMs = 500,
    maxDelayMs = 5000,
    backoffFactor = 2,
    retryableStatusCodes = [408, 429, 500, 502, 503, 504],
    operationName = 'API_OPERATION'
  } = options;

  let attempt = 0;
  let delay = initialDelayMs;

  while (attempt <= retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      const isRetryableStatus = err.status && retryableStatusCodes.includes(err.status);
      const isNetworkError = err.message && (
        err.message.includes('Failed to fetch') ||
        err.message.includes('NetworkError') ||
        err.message.includes('Network Error') ||
        err.message.includes('abort')
      );

      if (attempt > retries || (!isRetryableStatus && !isNetworkError)) {
        domainBridge.broadcast('RETRY_EXHAUSTED', {
          operationName,
          totalAttempts: attempt,
          error: err.message
        });
        throw err;
      }

      // Exponential backoff with jitter (±20%)
      const jitter = delay * 0.2 * (Math.random() * 2 - 1);
      const sleepTime = Math.min(Math.round(delay + jitter), maxDelayMs);

      domainBridge.broadcast('RETRY_SCHEDULED', {
        operationName,
        attemptNumber: attempt,
        nextRetryInMs: sleepTime,
        reason: err.message
      });

      await new Promise(res => setTimeout(res, sleepTime));
      delay *= backoffFactor;
    }
  }
}

export default executeWithRetry;
