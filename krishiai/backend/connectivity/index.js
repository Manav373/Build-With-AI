/**
 * Connectivity-Fuctionalitites/index.js
 * -------------------------------------------------------------
 * Master entry point for all KrishiAI Connectivity Functionalities.
 * Exports:
 * - Cross-Domain Bridge & SSO (domainBridge, crossDomainAuth, KRISHI_DOMAINS)
 * - Universal HTTP Client & Health Checks (universalClient, healthChecker, executeWithRetry)
 * - Dynamic Change Tracking & Metrics (changeTracker, metricsCollector, servicePinger)
 * - Offline Sync Queue & Network Tracker (networkTracker, offlineQueue, syncWorker)
 * - Real-Time Streaming (WebSocketConnector, SSEConnector, liveEventBus)
 * - External Service Connectors (vapiConnector, twilioWhatsAppConnector, satelliteConnector, weatherMandiConnector)
 */

// 1. Cross-Domain
export { KRISHI_DOMAINS, getDomainByPort, getDomainById } from './cross-domain/portRegistry.js';
export { domainBridge } from './cross-domain/domainBridge.js';
export { crossDomainAuth } from './cross-domain/crossDomainAuth.js';

// 2. API & Client
export { universalClient, UniversalHttpClient } from './api/universalClient.js';
export { healthChecker, ServiceHealthChecker } from './api/healthChecker.js';
export { executeWithRetry } from './api/retryManager.js';
export { ENDPOINT_CATALOG } from './api/endpointCatalog.js';

// 3. Dynamic Monitoring
export { changeTracker, ChangeTracker } from './dynamic-monitor/changeTracker.js';
export { metricsCollector, MetricsCollector } from './dynamic-monitor/metricsCollector.js';
export { servicePinger } from './dynamic-monitor/servicePinger.js';

// 4. Offline & Network
export { networkTracker } from './offline-sync/networkStatusTracker.js';
export { offlineQueue, OfflineActionQueue } from './offline-sync/offlineActionQueue.js';
export { syncWorker, SyncWorker } from './offline-sync/syncWorker.js';

// 5. Real-Time Streaming
export { WebSocketConnector } from './realtime/websocketConnector.js';
export { SSEConnector } from './realtime/sseConnector.js';
export { liveEventBus, LiveEventBus } from './realtime/liveEventBus.js';

// 6. External Connectors
export { vapiConnector, VapiVoiceConnector } from './external-connectors/vapiVoiceConnector.js';
export { twilioWhatsAppConnector, TwilioWhatsAppConnector } from './external-connectors/twilioWhatsAppConnector.js';
export { satelliteConnector, SatelliteGeeConnector } from './external-connectors/satelliteGeeConnector.js';
export { weatherMandiConnector, WeatherMandiConnector } from './external-connectors/weatherMandiConnector.js';

// Default bundle
export default {
  version: '1.0.0',
  description: 'KrishiAI Unified Connectivity & Dynamic Change Engine'
};
