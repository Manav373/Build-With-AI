import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import SensorCards from './components/SensorCards';
import DecisionEngineCard from './components/DecisionEngineCard';
import ManualPumpControl from './components/ManualPumpControl';
import PumpControlModal from './components/PumpControlModal';
import AnalyticsCharts from './components/AnalyticsCharts';
import IrrigationHistoryTable from './components/IrrigationHistoryTable';
import FarmZonesView from './components/FarmZonesView';
import DeviceHealthView from './components/DeviceHealthView';
import DetailedSensorsView from './components/DetailedSensorsView';
import AlertsCenter from './components/AlertsCenter';
import Esp32FirmwareView from './components/Esp32FirmwareView';
import SettingsView from './components/SettingsView';
import HardwareSimulator from './components/HardwareSimulator';
import HardwareConnectModal from './components/HardwareConnectModal';
import { Sliders, ShieldAlert, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export default function App() {
  const [device, setDevice] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [decision, setDecision] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [irrigationHistory, setIrrigationHistory] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin');
  const [theme, setTheme] = useState('dark');
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeAgo, setTimeAgo] = useState('Just now');

  const wsRef = useRef(null);
  const lastSyncRef = useRef(Date.now());

  // Show Toast Message
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Sync Relative Time
  useEffect(() => {
    const timer = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastSyncRef.current) / 1000);
      if (diffSec < 5) setTimeAgo('Few seconds ago');
      else if (diffSec < 60) setTimeAgo(`${diffSec} seconds ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)} min ago`);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Theme attribute toggle
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial HTTP Fetch
  const fetchInitialData = async () => {
    try {
      const [devRes, histRes, alertsRes, auditRes] = await Promise.all([
        fetch('/api/devices/krishiai-node-01/latest'),
        fetch('/api/devices/krishiai-node-01/irrigation/history'),
        fetch('/api/devices/krishiai-node-01/alerts'),
        fetch('/api/devices/krishiai-node-01/audit')
      ]);

      const devData = await devRes.json();
      const histData = await histRes.json();
      const alertsData = await alertsRes.json();
      const auditData = await auditRes.json();

      if (devData.success) {
        setTelemetry(devData.telemetry);
        setDecision(devData.decision);
        lastSyncRef.current = Date.now();
      }

      // Fetch full device metadata
      const metaRes = await fetch('/api/devices/krishiai-node-01');
      const metaData = await metaRes.json();
      if (metaData.success) {
        setDevice(metaData.device);
      }

      if (histData.success) setIrrigationHistory(histData.history || []);
      if (alertsData.success) setAlerts(alertsData.alerts || []);
      if (auditData.success) setAuditLogs(auditData.auditLogs || []);
    } catch (err) {
      console.warn('Initial REST sync fallback:', err);
    }
  };

  // Setup WebSocket Connection
  useEffect(() => {
    fetchInitialData();

    const connectWebSocket = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ WebSocket Connected to KrishiAI Server');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          lastSyncRef.current = Date.now();

          if (msg.type === 'INIT') {
            setDevice(msg.device);
            setTelemetry(msg.telemetry);
            setDecision(msg.decision);
            setAlerts(msg.alerts || []);
            setIrrigationHistory(msg.irrigationHistory || []);
            setAuditLogs(msg.auditLogs || []);
          } else if (msg.type === 'TELEMETRY_UPDATE') {
            setTelemetry(msg.telemetry);
            if (msg.decision) setDecision(msg.decision);
            if (msg.device) setDevice(msg.device);
          } else if (msg.type === 'PUMP_CHANGE') {
            setTelemetry(msg.telemetry);
            if (msg.decision) setDecision(msg.decision);
            if (msg.irrigationHistory) setIrrigationHistory(msg.irrigationHistory);
            if (msg.auditLogs) setAuditLogs(msg.auditLogs);
            showToast(msg.telemetry.pump ? '💧 Irrigation Pump Started' : '🛑 Irrigation Pump Stopped', 'info');
          } else if (msg.type === 'MODE_CHANGE') {
            if (msg.device) setDevice(msg.device);
            if (msg.auditLogs) setAuditLogs(msg.auditLogs);
            showToast(`Switched to ${msg.mode} Mode`, 'info');
          } else if (msg.type === 'DEVICE_UPDATE') {
            setDevice(msg.device);
            if (msg.telemetry) setTelemetry(msg.telemetry);
          } else if (msg.type === 'ALERTS_UPDATED') {
            setAlerts(msg.alerts || []);
          }
        } catch (e) {
          console.error('Error parsing WS message:', e);
        }
      };

      ws.onclose = () => {
        console.warn('⚠️ WebSocket disconnected. Reconnecting in 3s...');
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    };

    connectWebSocket();

    // Fallback polling every 6 seconds to ensure data fresh even without WS
    const pollInterval = setInterval(() => {
      fetch('/api/devices/krishiai-node-01/latest')
        .then(r => r.json())
        .then(d => {
          if (d.success) {
            setTelemetry(d.telemetry);
            setDecision(d.decision);
            lastSyncRef.current = Date.now();
          }
        })
        .catch(() => {});
    }, 6000);

    return () => {
      clearInterval(pollInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handlers
  const handleModeChange = async (mode) => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, user: userRole })
      });
      const data = await res.json();
      if (data.success) {
        setDevice(data.device);
        showToast(`Irrigation mode updated to ${mode}`, 'success');
      }
    } catch (err) {
      showToast('Failed to change mode', 'error');
    }
  };

  const handleStartPump = async ({ durationMinutes, reason, user }) => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/relay/on', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes, reason, user })
      });
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.telemetry);
        setDecision(data.decision);
        showToast(`Pump activated for ${durationMinutes} minutes`, 'success');
      } else {
        showToast(data.error || 'Failed to start pump', 'error');
      }
    } catch (err) {
      showToast('Network error activating pump', 'error');
    }
  };

  const handleStopPump = async (reason = 'Manual stop') => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/relay/off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userRole, reason })
      });
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.telemetry);
        showToast('Pump turned OFF', 'info');
      }
    } catch (err) {
      showToast('Failed to turn OFF pump', 'error');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/relay/off', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: userRole, reason: 'Emergency Stop Pressed', emergency: true })
      });
      const data = await res.json();
      if (data.success) {
        setTelemetry(data.telemetry);
        showToast('🚨 EMERGENCY STOP EXECUTED: Relay cutoff immediate!', 'error');
      }
    } catch (err) {
      showToast('Emergency Stop Signal Failed!', 'error');
    }
  };

  const handleSendTelemetry = async (payload) => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        showToast('Simulated sensor telemetry injected', 'success');
      }
    } catch (err) {
      showToast('Failed to send simulated telemetry', 'error');
    }
  };

  const handleToggleOnline = async () => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/simulate-toggle-online', {
        method: 'POST'
      });
      const data = await res.json();
      if (data.success) {
        showToast(`ESP32 Node set to ${data.status.toUpperCase()}`, data.status === 'online' ? 'success' : 'error');
      }
    } catch (err) {
      showToast('Failed to toggle connection state', 'error');
    }
  };

  const handleUpdateSettings = async (settings) => {
    try {
      const res = await fetch('/api/devices/krishiai-node-01/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, user: userRole })
      });
      const data = await res.json();
      if (data.success) {
        showToast('Settings saved successfully', 'success');
      }
    } catch (err) {
      showToast('Failed to save settings', 'error');
    }
  };

  const handleAcknowledgeAlert = async (alertId) => {
    try {
      await fetch(`/api/devices/krishiai-node-01/alerts/${alertId}/ack`, { method: 'POST' });
    } catch (err) {}
  };

  const handleClearAllAlerts = async () => {
    try {
      await fetch('/api/devices/krishiai-node-01/alerts', { method: 'DELETE' });
      setAlerts([]);
      showToast('All alerts cleared', 'info');
    } catch (err) {}
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div>
      {/* Header */}
      <Header
        device={device}
        telemetry={telemetry}
        timeAgo={timeAgo}
        userRole={userRole}
        setUserRole={setUserRole}
        theme={theme}
        setTheme={setTheme}
        onEmergencyStop={handleEmergencyStop}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenConnectHardware={() => setIsConnectModalOpen(true)}
        activeAlertsCount={unreadAlertsCount}
      />

      {/* Navigation Tabs */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        unreadAlertsCount={unreadAlertsCount}
      />

      {/* Main Content Area */}
      <main className="app-container">
        {/* Toast Notification */}
        {toast && (
          <div style={{
            position: 'fixed',
            top: '85px',
            right: '1.5rem',
            zIndex: 90,
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.75rem 1.25rem',
            background: toast.type === 'error' ? '#991b1b' : toast.type === 'success' ? '#065f46' : '#0c4a6e',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-lg)',
            fontSize: '0.88rem',
            fontWeight: 600,
            animation: 'slideInRight 0.25s ease'
          }}>
            {toast.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
            <span>{toast.message}</span>
          </div>
        )}

        {/* 1. DASHBOARD VIEW (PRD Section 31 Desktop & Section 32 Mobile) */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Real-time Sensor Cards Grid */}
            <SensorCards
              telemetry={telemetry}
              device={device}
              onOpenPumpModal={() => setIsPumpModalOpen(true)}
              onStopPump={handleStopPump}
            />

            {/* Decision Engine Card (PRD Section 15 & 16) */}
            <DecisionEngineCard
              decision={decision}
              telemetry={telemetry}
              device={device}
            />

            {/* Two Column Section: Pump Hub + Historical Trend Mini Chart */}
            <div className="two-column-layout">
              <ManualPumpControl
                device={device}
                telemetry={telemetry}
                onModeChange={handleModeChange}
                onOpenPumpModal={() => setIsPumpModalOpen(true)}
                onStopPump={handleStopPump}
                onEmergencyStop={handleEmergencyStop}
                userRole={userRole}
              />

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.05rem' }}>📈 Quick 24h Soil Telemetry Curve</h3>
                  <button 
                    className="btn-secondary" 
                    onClick={() => setActiveTab('analytics')}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
                  >
                    Full Analytics →
                  </button>
                </div>
                <AnalyticsCharts deviceId="krishiai-node-01" />
              </div>
            </div>
          </div>
        )}

        {/* 2. FARM & ZONES TAB */}
        {activeTab === 'farm' && (
          <FarmZonesView
            telemetry={telemetry}
            device={device}
            decision={decision}
          />
        )}

        {/* 3. DETAILED SENSORS TAB */}
        {activeTab === 'sensors' && (
          <DetailedSensorsView
            telemetry={telemetry}
            device={device}
          />
        )}

        {/* 4. IRRIGATION HUB TAB */}
        {activeTab === 'irrigation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <ManualPumpControl
              device={device}
              telemetry={telemetry}
              onModeChange={handleModeChange}
              onOpenPumpModal={() => setIsPumpModalOpen(true)}
              onStopPump={handleStopPump}
              onEmergencyStop={handleEmergencyStop}
              userRole={userRole}
            />

            <DecisionEngineCard
              decision={decision}
              telemetry={telemetry}
              device={device}
            />

            <IrrigationHistoryTable history={irrigationHistory} />
          </div>
        )}

        {/* 5. ANALYTICS & CHARTS TAB */}
        {activeTab === 'analytics' && (
          <AnalyticsCharts deviceId="krishiai-node-01" />
        )}

        {/* 6. IRRIGATION LOGS TAB */}
        {activeTab === 'history' && (
          <IrrigationHistoryTable history={irrigationHistory} />
        )}

        {/* 7. ALERTS CENTER TAB */}
        {activeTab === 'alerts' && (
          <AlertsCenter
            alerts={alerts}
            onAcknowledge={handleAcknowledgeAlert}
            onClearAll={handleClearAllAlerts}
            deviceId="krishiai-node-01"
          />
        )}

        {/* 8. DEVICE HEALTH & PINS TAB */}
        {activeTab === 'hardware' && (
          <DeviceHealthView
            device={device}
            telemetry={telemetry}
          />
        )}

        {/* 9. ESP32 FIRMWARE TAB */}
        {activeTab === 'firmware' && (
          <Esp32FirmwareView device={device} />
        )}

        {/* 10. SETTINGS TAB */}
        {activeTab === 'settings' && (
          <SettingsView
            device={device}
            onUpdateSettings={handleUpdateSettings}
            auditLogs={auditLogs}
            userRole={userRole}
          />
        )}
      </main>

      {/* Floating Diagnostics Trigger Button */}
      <button 
        id="btn-floating-sim"
        className="sim-drawer-trigger"
        onClick={() => setIsSimulatorOpen(true)}
      >
        <Sliders size={14} />
        <span>Signal Diagnostics</span>
      </button>

      {/* Modal Confirmation for Pump Activation (PRD Section 13) */}
      <PumpControlModal
        isOpen={isPumpModalOpen}
        onClose={() => setIsPumpModalOpen(false)}
        onConfirm={handleStartPump}
        userRole={userRole}
      />

      {/* ESP32 Hardware Simulator Drawer */}
      <HardwareSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        telemetry={telemetry}
        device={device}
        onSendTelemetry={handleSendTelemetry}
        onToggleOnline={handleToggleOnline}
      />

      {/* Physical Hardware Connection Modal */}
      <HardwareConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        device={device}
        telemetry={telemetry}
        onSendTelemetry={handleSendTelemetry}
      />
    </div>
  );
}
