import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors';
import { storage } from './storage.js';
import { DecisionEngine } from './decisionEngine.js';
import { SafetyEngine } from './safetyEngine.js';
import { generateEsp32Firmware } from './firmwareGenerator.js';
import { listSerialPorts, connectSerialPort, disconnectSerialPort, getSerialStatus } from './serialBridge.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

app.use(cors());
app.use(express.json());

// Serve static assets from Vite build
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));


// Broadcaster to all connected WebSocket clients
function broadcast(payload) {
  const data = JSON.stringify(payload);
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

// Instantiate Safety Engine with broadcast hook
const safetyEngine = new SafetyEngine(broadcast);

// WebSocket connection handler
wss.on('connection', (ws) => {
  const deviceId = 'krishiai-node-01';
  const device = storage.getDevice(deviceId);
  const telemetry = storage.getLatestTelemetry(deviceId);
  const decision = telemetry ? DecisionEngine.evaluate(telemetry, device) : null;

  // Send initial full payload
  ws.send(JSON.stringify({
    type: 'INIT',
    device,
    telemetry,
    decision,
    alerts: storage.getAlerts(deviceId),
    irrigationHistory: storage.getIrrigationHistory(deviceId),
    auditLogs: storage.getAuditLogs(deviceId)
  }));

  ws.on('message', (msg) => {
    try {
      const parsed = JSON.parse(msg.toString());
      if (parsed.type === 'PING') {
        ws.send(JSON.stringify({ type: 'PONG', timestamp: Date.now() }));
      }
    } catch (e) {
      // ignore
    }
  });
});

// Periodic automated rule evaluation loop (every 3s)
setInterval(() => {
  const devices = storage.getAllDevices();
  for (const dev of devices) {
    const telemetry = storage.getLatestTelemetry(dev.id);
    if (!telemetry || dev.status === 'offline') continue;

    const decision = DecisionEngine.evaluate(telemetry, dev);
    storage.decisionState[dev.id] = decision;

    // Automatic Irrigation Trigger in AUTO mode
    if (dev.mode === 'AUTO') {
      if (decision.shouldAutoIrrigate && !telemetry.pump && !telemetry.rain) {
        const autoDuration = dev.settings.autoMaxDurationMinutes || 15;
        storage.setPumpState(dev.id, true, {
          user: 'KrishiAI Decision Engine (Auto)',
          reason: `Auto trigger: ${decision.reason}`,
          durationMinutes: autoDuration
        });
        broadcast({
          type: 'PUMP_CHANGE',
          deviceId: dev.id,
          telemetry: storage.getLatestTelemetry(dev.id),
          decision: DecisionEngine.evaluate(storage.getLatestTelemetry(dev.id), dev)
        });
      } else if (!decision.shouldAutoIrrigate && telemetry.pump && telemetry.pumpStartedBy?.includes('Auto')) {
        // Soil reached adequate level during auto cycle
        storage.setPumpState(dev.id, false, {
          user: 'KrishiAI Decision Engine',
          reason: 'Target soil moisture restored to optimal range.'
        });
        broadcast({
          type: 'PUMP_CHANGE',
          deviceId: dev.id,
          telemetry: storage.getLatestTelemetry(dev.id),
          decision: DecisionEngine.evaluate(storage.getLatestTelemetry(dev.id), dev)
        });
      }
    }
  }
}, 3000);

// ==================== REST API ENDPOINTS (PRD Section 25) ====================

// 1. GET /api/devices - List all registered farm nodes
app.get('/api/devices', (req, res) => {
  res.json({
    success: true,
    devices: storage.getAllDevices()
  });
});

// 2. GET /api/devices/:deviceId - Specific device details
app.get('/api/devices/:deviceId', (req, res) => {
  const dev = storage.getDevice(req.params.deviceId);
  if (!dev) return res.status(404).json({ success: false, error: 'Device not found' });
  res.json({ success: true, device: dev });
});

// 3. GET /api/devices/:deviceId/latest - Latest sensor telemetry + decision
app.get('/api/devices/:deviceId/latest', (req, res) => {
  const deviceId = req.params.deviceId;
  const dev = storage.getDevice(deviceId);
  if (!dev) return res.status(404).json({ success: false, error: 'Device not found' });

  const telemetry = storage.getLatestTelemetry(deviceId);
  const decision = telemetry ? DecisionEngine.evaluate(telemetry, dev) : null;

  res.json({
    success: true,
    deviceId,
    telemetry,
    decision,
    pumpCommand: telemetry ? telemetry.pump : false
  });
});

// 4. GET /api/devices/:deviceId/history - Historical data points (1h, 6h, 24h, 7d, 30d)
app.get('/api/devices/:deviceId/history', (req, res) => {
  const range = req.query.range || '24h';
  const history = storage.getHistory(req.params.deviceId, range);
  res.json({ success: true, range, count: history.length, data: history });
});

// 5. GET /api/devices/:deviceId/alerts - System alerts
app.get('/api/devices/:deviceId/alerts', (req, res) => {
  res.json({ success: true, alerts: storage.getAlerts(req.params.deviceId) });
});

// Acknowledge alert
app.post('/api/devices/:deviceId/alerts/:alertId/ack', (req, res) => {
  const updated = storage.acknowledgeAlert(req.params.alertId);
  broadcast({ type: 'ALERTS_UPDATED', alerts: storage.getAlerts(req.params.deviceId) });
  res.json({ success: true, alert: updated });
});

// Clear alerts
app.delete('/api/devices/:deviceId/alerts', (req, res) => {
  storage.clearAlerts(req.params.deviceId);
  broadcast({ type: 'ALERTS_UPDATED', alerts: storage.getAlerts(req.params.deviceId) });
  res.json({ success: true });
});

// 6. GET /api/devices/:deviceId/irrigation/history - Dedicated irrigation history table
app.get('/api/devices/:deviceId/irrigation/history', (req, res) => {
  res.json({
    success: true,
    history: storage.getIrrigationHistory(req.params.deviceId)
  });
});

// 7. GET /api/devices/:deviceId/audit - Audit log of manual pump and setting changes
app.get('/api/devices/:deviceId/audit', (req, res) => {
  res.json({
    success: true,
    auditLogs: storage.getAuditLogs(req.params.deviceId)
  });
});

// 8. POST /api/devices/:deviceId/relay/on - Manual pump activation
app.post('/api/devices/:deviceId/relay/on', (req, res) => {
  const deviceId = req.params.deviceId;
  const { user = 'Admin', durationMinutes = 5, reason = 'Manual activation' } = req.body;

  const check = safetyEngine.validatePumpActivation(deviceId);
  if (!check.allowed) {
    return res.status(400).json({ success: false, error: check.error });
  }

  const updated = storage.setPumpState(deviceId, true, {
    user,
    durationMinutes: Number(durationMinutes),
    reason
  });

  const dev = storage.getDevice(deviceId);
  const decision = DecisionEngine.evaluate(updated, dev);

  broadcast({
    type: 'PUMP_CHANGE',
    deviceId,
    telemetry: updated,
    decision,
    auditLogs: storage.getAuditLogs(deviceId)
  });

  res.json({
    success: true,
    message: 'Pump turned ON successfully',
    telemetry: updated,
    decision
  });
});

// 9. POST /api/devices/:deviceId/relay/off - Manual pump shutoff / Emergency Stop
app.post('/api/devices/:deviceId/relay/off', (req, res) => {
  const deviceId = req.params.deviceId;
  const { user = 'Admin', reason = 'Manual stop', emergency = false } = req.body;

  const updated = storage.setPumpState(deviceId, false, {
    user,
    reason: emergency ? 'EMERGENCY STOP pressed by user' : reason,
    emergency: Boolean(emergency)
  });

  const dev = storage.getDevice(deviceId);
  const decision = updated ? DecisionEngine.evaluate(updated, dev) : null;

  broadcast({
    type: 'PUMP_CHANGE',
    deviceId,
    telemetry: updated,
    decision,
    irrigationHistory: storage.getIrrigationHistory(deviceId),
    auditLogs: storage.getAuditLogs(deviceId)
  });

  res.json({
    success: true,
    message: emergency ? 'EMERGENCY STOP EXECUTED: Pump immediately shut down' : 'Pump turned OFF successfully',
    telemetry: updated
  });
});

// 10. POST /api/devices/:deviceId/mode - Switch AUTO / MANUAL
app.post('/api/devices/:deviceId/mode', (req, res) => {
  const deviceId = req.params.deviceId;
  const { mode, user = 'Admin' } = req.body;

  if (mode !== 'AUTO' && mode !== 'MANUAL') {
    return res.status(400).json({ success: false, error: "Mode must be 'AUTO' or 'MANUAL'" });
  }

  const dev = storage.setDeviceMode(deviceId, mode, user);
  broadcast({
    type: 'MODE_CHANGE',
    deviceId,
    mode,
    device: dev,
    auditLogs: storage.getAuditLogs(deviceId)
  });

  res.json({ success: true, mode, device: dev });
});

// 11. POST /api/devices/:deviceId/settings - Update threshold calibrations
app.post('/api/devices/:deviceId/settings', (req, res) => {
  const deviceId = req.params.deviceId;
  const { settings, user = 'Admin' } = req.body;

  const updated = storage.updateSettings(deviceId, settings, user);
  broadcast({
    type: 'SETTINGS_UPDATE',
    deviceId,
    settings: updated,
    device: storage.getDevice(deviceId)
  });

  res.json({ success: true, settings: updated });
});

// 12. Universal Telemetry Ingestion (Accepts JSON body or URL query parameters via GET/POST)
const handleIncomingTelemetry = (req, res) => {
  const deviceId = req.params.deviceId || req.query.deviceId || req.body?.deviceId || 'krishiai-node-01';
  // Combine query params and body so either GET or POST works seamlessly
  const payload = { ...req.query, ...req.body };

  const telemetry = storage.addTelemetry(deviceId, payload);
  const dev = storage.getDevice(deviceId) || storage.getDevice('krishiai-node-01');
  const decision = DecisionEngine.evaluate(telemetry, dev);
  storage.decisionState[deviceId] = decision;

  // Check safety conditions on new telemetry
  if (telemetry.rain && telemetry.pump) {
    storage.setPumpState(deviceId, false, {
      user: 'Rain Interlock Safety',
      reason: 'Rain detected during telemetry ingestion',
      abortedByRain: true
    });
  }

  const responsePayload = {
    type: 'TELEMETRY_UPDATE',
    deviceId,
    telemetry: storage.getLatestTelemetry(deviceId),
    decision,
    device: dev
  };

  broadcast(responsePayload);

  res.json({
    success: true,
    status: 'ACK',
    pumpCommand: storage.getLatestTelemetry(deviceId)?.pump || false,
    decision: decision.status,
    received: {
      soilMoisture: telemetry.soilMoisture,
      temperature: telemetry.temperature,
      humidity: telemetry.humidity,
      rain: telemetry.rain,
      light: telemetry.light
    }
  });
};

app.post('/api/devices/:deviceId/telemetry', handleIncomingTelemetry);
app.get('/api/devices/:deviceId/telemetry', handleIncomingTelemetry);
app.post('/api/telemetry', handleIncomingTelemetry);
app.get('/api/telemetry', handleIncomingTelemetry);
app.get('/update', handleIncomingTelemetry);

// 13. POST /api/devices/:deviceId/simulate-toggle-online - Toggle node connection for testing
app.post('/api/devices/:deviceId/simulate-toggle-online', (req, res) => {
  const deviceId = req.params.deviceId;
  const dev = storage.getDevice(deviceId);
  if (!dev) return res.status(404).json({ success: false });

  dev.status = dev.status === 'online' ? 'offline' : 'online';
  if (dev.status === 'online') {
    dev.lastSeen = new Date().toISOString();
  } else {
    // If going offline, failsafe pump off
    const tel = storage.getLatestTelemetry(deviceId);
    if (tel && tel.pump) {
      storage.setPumpState(deviceId, false, {
        user: 'Watchdog Failsafe',
        reason: 'Device simulated offline disconnect',
        emergency: true
      });
    }
  }

  broadcast({
    type: 'DEVICE_UPDATE',
    device: dev,
    telemetry: storage.getLatestTelemetry(deviceId)
  });

  res.json({ success: true, status: dev.status });
});

// 14. GET /api/firmware/esp32 - Download ready-to-flash .ino code
app.get('/api/firmware/esp32', (req, res) => {
  const code = generateEsp32Firmware({
    wifiSSID: req.query.ssid || 'KrishiAI-WiFi',
    wifiPass: req.query.pass || '',
    serverIp: req.query.ip || '192.168.1.100',
    serverPort: req.query.port || 5000,
    deviceId: req.query.deviceId || 'krishiai-node-01'
  });

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Disposition', 'attachment; filename="KrishiAI_ESP32_Firmware.ino"');
  res.send(code);
});

// 15. Serial Port Hardware Bridge Endpoints
app.get('/api/serial/ports', async (req, res) => {
  const ports = await listSerialPorts();
  res.json({ success: true, ports });
});

app.post('/api/serial/connect', async (req, res) => {
  const { path: portPath, baudRate = 115200 } = req.body;
  if (!portPath) return res.status(400).json({ success: false, error: 'COM port path is required' });

  try {
    const result = await connectSerialPort(portPath, baudRate, broadcast);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/serial/disconnect', (req, res) => {
  const closed = disconnectSerialPort();
  res.json({ success: true, disconnected: closed });
});

app.get('/api/serial/status', (req, res) => {
  res.json({ success: true, ...getSerialStatus() });
});

// Catch-all route to serve index.html for SPA client-side routing
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api') && !req.path.startsWith('/ws')) {
    res.sendFile(path.join(distPath, 'index.html'));
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`  🌾 KrishiAI IoT Dashboard Server running on http://localhost:${PORT}`);
  console.log(`  ⚡ WebSocket Live Stream available at ws://localhost:${PORT}/ws`);
  console.log(`  📡 ESP32 Telemetry Endpoint: POST http://localhost:${PORT}/api/devices/krishiai-node-01/telemetry`);
  console.log(`=================================================`);
});
