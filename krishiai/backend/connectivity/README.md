# 🌐 Connectivity-Fuctionalitites

> **Unified Cross-Domain Connectivity & Real-Time Dynamic Synchronization Engine for KrishiAI**

This folder houses **all connectivity functionalities** across the KrishiAI platform. It connects the 4 primary services (**FastAPI Backend**, **Farmer Portal**, **Vendor Portal**, and **Admin Portal**), manages external AI & satellite integrations, synchronizes multi-domain sessions, handles offline queues, and **streams all dynamic changes in real time**.

---

## 🚀 Live Dynamic Monitoring

Every single event across the platform—such as service heartbeats, latency fluctuations, network connectivity flips, API requests, and cross-domain hops—is recorded and streamed live.

### How to View Real-Time Dynamic Changes:

1. **Standalone Visual Dashboard:**
   - Double-click or open `standalone-monitor.html` in your browser.
   - It automatically probes all 4 ports (`8000`, `5173`, `5174`, `5175`), updates latency metrics in real-time, and streams dynamic events as they occur.

2. **Terminal Live Daemon:**
   ```bash
   node cli/live-connectivity-daemon.js
   # OR
   npm run monitor
   ```

3. **One-Shot Connectivity Audit:**
   ```bash
   node cli/audit-connectivity.js
   # OR
   npm run audit
   ```

4. **Embedded React Component:**
   ```jsx
   import DynamicConnectivityMonitor from './dynamic-monitor/DynamicConnectivityMonitor.jsx';

   export default function App() {
     return <DynamicConnectivityMonitor />;
   }
   ```

---

## 📂 Architecture & Directory Layout

```
Connectivity-Fuctionalitites/
├── index.js                               # Master module export (Unified API)
├── package.json                           # Standalone scripts (audit, monitor)
├── standalone-monitor.html                # Live visual glassmorphic dashboard
├── README.md                              # Complete architecture documentation
│
├── dynamic-monitor/                       # 🔴 Real-Time Dynamic Change Tracking
│   ├── DynamicConnectivityMonitor.jsx     # Embeddable dark-mode UI with live stream
│   ├── changeTracker.js                   # Chronological event audit log & change recorder
│   ├── metricsCollector.js                # Latency, uptime %, and request telemetry
│   └── servicePinger.js                   # Auto-ping background scheduler
│
├── cross-domain/                          # 🔗 Multi-Port Service Discovery & SSO
│   ├── portRegistry.js                    # Port catalog (8000, 5173, 5174, 5175)
│   ├── domainBridge.js                    # Cross-tab & cross-port BroadcastChannel
│   └── crossDomainAuth.js                 # Unified SSO token & session synchronizer
│
├── api/                                   # ⚡ Universal Resilient HTTP Gateway
│   ├── universalClient.js                 # Axios/Fetch client with auto-refresh & domain headers
│   ├── healthChecker.js                   # Real-time multi-service health prober
│   ├── retryManager.js                    # Exponential backoff + jitter for rural networks
│   └── endpointCatalog.js                 # Complete REST endpoint route dictionary
│
├── offline-sync/                          # 📶 Offline-First & Network State
│   ├── networkStatusTracker.js            # Detects online/offline, RTT, connection speed
│   ├── offlineActionQueue.js              # Persistent mutation buffer for offline operations
│   └── syncWorker.js                      # Auto-replays buffered mutations upon reconnect
│
├── realtime/                              # 📡 Live Streaming & Event Buses
│   ├── websocketConnector.js              # Resilient WebSocket client with heartbeat
│   ├── sseConnector.js                    # Server-Sent Events client for live mandi tickers
│   └── liveEventBus.js                    # High-speed in-process pub/sub event bus
│
├── external-connectors/                   # ☁️ Third-Party Cloud & Hardware Connectors
│   ├── vapiVoiceConnector.js              # Vapi Multilingual Voice AI assistant
│   ├── twilioWhatsAppConnector.js         # Twilio WhatsApp alerts & webhook handler
│   ├── satelliteGeeConnector.js           # Google Earth Engine & Sentinel-2 NDVI
│   └── weatherMandiConnector.js           # OpenWeatherMap & Agmarknet Mandi rates
│
└── cli/                                   # 💻 Terminal Automation & Diagnostics
    ├── audit-connectivity.js              # One-shot multi-port auditor
    └── live-connectivity-daemon.js        # Continuous terminal dynamic status monitor
```

---

## ⚡ Core Domain Port Mapping

| Service | Port | Endpoint | Role |
|---|---|---|---|
| **FastAPI Backend** | `8000` | `http://localhost:8000` | Gemini ML, GEE Satellite, Database ORM |
| **Farmer Portal** | `5173` | `http://localhost:5173` | Advisory, Crop Disease Diagnosis, Mandi Rates |
| **Vendor Portal** | `5174` | `http://localhost:5174` | B2B Procurement, Tenders, AI Quality Grading |
| **Admin Portal** | `5175` | `http://localhost:5175` | User Moderation, Escrow, Verification |

---

## 💻 Code Examples

### 1. Broadcasting a Dynamic Event Across Portals
```javascript
import { domainBridge } from './cross-domain/domainBridge.js';

// Broadcast from Farmer portal (5173) -> received instantly by Vendor (5174) & Admin (5175)
domainBridge.broadcast('NEW_HARVEST_LISTED', {
  crop: 'Basmati Rice',
  quantityQuintals: 500,
  expectedPrice: 3850
}, 'farmer');
```

### 2. Subscribing to Live Dynamic Changes
```javascript
import { changeTracker } from './dynamic-monitor/changeTracker.js';

changeTracker.subscribe((entry, snapshot) => {
  console.log(`[Dynamic Change] ${entry.type} recorded from ${entry.source}:`, entry.details);
});
```

### 3. Making Resilient Offline-Aware API Requests
```javascript
import { universalClient } from './api/universalClient.js';
import { executeWithRetry } from './api/retryManager.js';

const mandiPrices = await executeWithRetry(() => 
  universalClient.get('/api/v1/farmer/market/prices?state=Punjab')
);
```

### 4. Queueing an Offline Mutation
```javascript
import { offlineQueue } from './offline-sync/offlineActionQueue.js';

// If farmer loses connectivity in field, buffer the action:
offlineQueue.enqueue({
  endpoint: '/api/v1/farmer/crop-scans',
  method: 'POST',
  body: JSON.stringify({ crop: 'Cotton', leafSymptom: 'Yellow Spots' }),
  domain: 'farmer',
  description: 'Crop Leaf Diagnosis Scan'
});
```
