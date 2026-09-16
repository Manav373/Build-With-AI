import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/iot/Header';
import Navigation from '../components/iot/Navigation';
import SensorCards from '../components/iot/SensorCards';
import DecisionEngineCard from '../components/iot/DecisionEngineCard';
import ManualPumpControl from '../components/iot/ManualPumpControl';
import PumpControlModal from '../components/iot/PumpControlModal';
import AnalyticsCharts from '../components/iot/AnalyticsCharts';
import IrrigationHistoryTable from '../components/iot/IrrigationHistoryTable';
import FarmZonesView from '../components/iot/FarmZonesView';
import DeviceHealthView from '../components/iot/DeviceHealthView';
import DetailedSensorsView from '../components/iot/DetailedSensorsView';
import AlertsCenter from '../components/iot/AlertsCenter';
import Esp32FirmwareView from '../components/iot/Esp32FirmwareView';
import SettingsView from '../components/iot/SettingsView';
import HardwareSimulator from '../components/iot/HardwareSimulator';
import HardwareConnectModal from '../components/iot/HardwareConnectModal';
import { Sliders, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';

// Import SCADA Styling
import '../styles/iot.css';

// Firebase Services & Realtime Database client
import { isFirebaseConfigured } from '../services/iot/firebase';
import { 
  subscribeToSensors, 
  subscribeToStatus, 
  subscribeToControl,
  setControlMode, 
  setMotorCommand, 
  setEmergencyStop,
  writeTelemetrySimulation,
  writeStatusSimulation
} from '../services/iot/firebaseService';
import { DecisionEngine } from '../services/iot/decisionEngine';

const DEFAULT_DEVICE = {
  id: 'krishiai-node-01',
  name: 'Krishi Node 01',
  farm: 'Block A - Main',
  mode: 'AUTO',
  status: 'online',
  settings: {
    veryDryThreshold: 24,
    dryThreshold: 39,
    goodThreshold: 69,
    autoMaxDurationMinutes: 15,
    manualMaxDurationMinutes: 30
  }
};

const DEFAULT_TELEMETRY = {
  soilRaw: 2450,
  soilMoisture: 54.0,
  moisture: 54.0,
  temperature: 28.4,
  humidity: 65.0,
  rain: false,
  light: true,
  pump: false
};

const INITIAL_HISTORY = [
  { id: 'log-1', timestamp: new Date(Date.now() - 3600000).toISOString(), durationMinutes: 15, triggeredBy: 'Auto Rule (Dry Soil)', status: 'COMPLETED' },
  { id: 'log-2', timestamp: new Date(Date.now() - 14400000).toISOString(), durationMinutes: 10, triggeredBy: 'Manual (Farmer)', status: 'COMPLETED' },
  { id: 'log-3', timestamp: new Date(Date.now() - 86400000).toISOString(), durationMinutes: 20, triggeredBy: 'Auto Rule (Threshold)', status: 'COMPLETED' }
];

const INITIAL_ALERTS = [
  { id: 'alt-1', severity: 'info', message: 'ESP32 Node 01 synced via Firebase RTDB', timestamp: new Date().toISOString(), acknowledged: false }
];

export default function IoTPage() {
  const { setMobileMenuOpen } = useMobileMenu();
  const [device, setDevice] = useState(DEFAULT_DEVICE);
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [controlState, setControlState] = useState({ mode: 'AUTO', motorCommand: false });
  const [firebaseStatus, setFirebaseStatus] = useState(isFirebaseConfigured() ? 'connected' : 'standby');
  const [decision, setDecision] = useState(() => DecisionEngine.evaluate(DEFAULT_TELEMETRY, DEFAULT_DEVICE));
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [irrigationHistory, setIrrigationHistory] = useState(INITIAL_HISTORY);
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

  // Theme attribute toggle on page wrapper
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initial HTTP Fetch for historical records and alerts if auxiliary local backend exists
  const fetchAuxiliaryData = async () => {
    try {
      const [histRes, alertsRes, auditRes] = await Promise.all([
        fetch('/api/devices/krishiai-node-01/irrigation/history').catch(() => null),
        fetch('/api/devices/krishiai-node-01/alerts').catch(() => null),
        fetch('/api/devices/krishiai-node-01/audit').catch(() => null)
      ]);

      if (histRes && histRes.ok) {
        const histData = await histRes.json();
        if (histData.success && histData.history?.length) setIrrigationHistory(histData.history);
      }
      if (alertsRes && alertsRes.ok) {
        const alertsData = await alertsRes.json();
        if (alertsData.success && alertsData.alerts?.length) setAlerts(alertsData.alerts);
      }
      if (auditRes && auditRes.ok) {
        const auditData = await auditRes.json();
        if (auditData.success && auditData.auditLogs?.length) setAuditLogs(auditData.auditLogs);
      }
    } catch (err) {
      // Optional background fetch
    }
  };

  // Setup Firebase Realtime Database Subscriptions
  useEffect(() => {
    fetchAuxiliaryData();

    // 1. Subscribe in realtime to krishiAI/sensors
    const unsubscribeSensors = subscribeToSensors(
      (sensorData) => {
        if (!sensorData) return;
        setTelemetry(prev => {
          const current = prev || DEFAULT_TELEMETRY;
          const updated = {
            ...current,
            soilRaw: sensorData.soilRaw,
            soilMoisture: sensorData.moisture,
            moisture: sensorData.moisture,
            temperature: sensorData.temperature,
            humidity: sensorData.humidity,
            rain: sensorData.rain,
            light: sensorData.light,
            updatedAt: sensorData.updatedAt
          };
          setDecision(DecisionEngine.evaluate(updated, device || DEFAULT_DEVICE));
          return updated;
        });
        setFirebaseStatus('connected');
        lastSyncRef.current = Date.now();
      },
      (err) => {
        console.warn('Firebase sensors subscription status:', err.message);
        setFirebaseStatus('standby');
      }
    );

    // 2. Subscribe in realtime to krishiAI/status (actual motor relay state and online status)
    const unsubscribeStatus = subscribeToStatus(
      (statusData) => {
        if (!statusData) return;
        setTelemetry(prev => {
          const current = prev || DEFAULT_TELEMETRY;
          const isMotorActive = Boolean(statusData.motor);
          return {
            ...current,
            pump: isMotorActive,
            pumpStartedAt: isMotorActive ? (current.pumpStartedAt || new Date().toISOString()) : null
          };
        });
        setDevice(prev => ({
          ...(prev || DEFAULT_DEVICE),
          status: statusData.online ? 'online' : 'offline'
        }));
        setFirebaseStatus('connected');
      },
      (err) => {
        console.warn('Firebase status subscription status:', err.message);
      }
    );

    // 3. Subscribe in realtime to krishiAI/control (mode and motorCommand)
    const unsubscribeControl = subscribeToControl(
      (ctrlData) => {
        if (!ctrlData) return;
        setControlState(ctrlData);
        setDevice(prev => ({
          ...(prev || DEFAULT_DEVICE),
          mode: ctrlData.mode
        }));
        setFirebaseStatus('connected');
      },
      (err) => {
        console.warn('Firebase control subscription status:', err.message);
      }
    );

    return () => {
      unsubscribeSensors();
      unsubscribeStatus();
      unsubscribeControl();
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  // Handlers for User Interactions
  const handleModeChange = async (mode) => {
    setDevice(prev => prev ? { ...prev, mode } : prev);
    setControlState(prev => ({ ...prev, mode }));
    try {
      await setControlMode(mode);
      showToast(`Mode switched to ${mode} in Firebase (krishiAI/control/mode)`, 'success');
    } catch (err) {
      showToast(`Irrigation mode switched to ${mode}`, 'info');
    }
  };

  const handleStartPump = async ({ durationMinutes = 15, reason = 'Manual pump start', user = 'Admin' }) => {
    if (device?.mode === 'AUTO') {
      showToast('⚠️ Cannot start pump in AUTO mode. Switch to MANUAL override first.', 'error');
      return;
    }

    try {
      await setMotorCommand(true, device?.mode);
      setControlState(prev => ({ ...prev, motorCommand: true }));
      setTelemetry(prev => ({ ...prev, pump: true, pumpStartedAt: new Date().toISOString() }));
      setIrrigationHistory(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString(),
          durationMinutes,
          triggeredBy: `Manual (${user})`,
          status: 'RUNNING'
        },
        ...prev
      ]);
      showToast(`⚡ Pump ON command sent (krishiAI/control/motorCommand=true)`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to send motor command', 'error');
    }
  };

  const handleStopPump = async (reason = 'Manual stop') => {
    try {
      await setMotorCommand(false, device?.mode);
      setControlState(prev => ({ ...prev, motorCommand: false }));
      setTelemetry(prev => ({ ...prev, pump: false }));
      setIrrigationHistory(prev => prev.map((h, i) => i === 0 && h.status === 'RUNNING' ? { ...h, status: 'COMPLETED' } : h));
      showToast('⏹️ Pump OFF command sent (krishiAI/control/motorCommand=false)', 'info');
    } catch (err) {
      showToast('Failed to stop pump: ' + err.message, 'error');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await setEmergencyStop();
      setControlState(prev => ({ ...prev, motorCommand: false, mode: 'MANUAL' }));
      setDevice(prev => prev ? { ...prev, mode: 'MANUAL' } : prev);
      setTelemetry(prev => ({ ...prev, pump: false }));
      showToast('🚨 EMERGENCY STOP DISPATCHED: Pump cutoff commanded immediately!', 'error');
    } catch (err) {
      showToast('Emergency Stop Signal Failed: ' + err.message, 'error');
    }
  };

  const handleSendTelemetry = async (payload) => {
    try {
      await writeTelemetrySimulation(payload);
      showToast('📡 Injected telemetry to Firebase RTDB (krishiAI/sensors)', 'success');
    } catch (err) {
      setTelemetry(prev => {
        const updated = { ...(prev || DEFAULT_TELEMETRY), ...payload };
        setDecision(DecisionEngine.evaluate(updated, device || DEFAULT_DEVICE));
        return updated;
      });
      showToast('Simulated sensor telemetry injected locally', 'info');
    }
  };

  const handleToggleOnline = async () => {
    const nextState = device?.status !== 'online';
    try {
      await writeStatusSimulation({ online: nextState });
      showToast(`ESP32 status/online set to ${nextState ? 'TRUE' : 'FALSE'} in Firebase`, nextState ? 'success' : 'error');
    } catch (err) {
      setDevice(prev => ({ ...(prev || DEFAULT_DEVICE), status: nextState ? 'online' : 'offline' }));
      showToast(`ESP32 Node set to ${nextState ? 'ONLINE' : 'OFFLINE'} locally`, nextState ? 'success' : 'error');
    }
  };

  const handleUpdateSettings = async (settings) => {
    setDevice(prev => prev ? { ...prev, settings: { ...prev.settings, ...settings } } : prev);
    showToast('Settings saved successfully', 'success');
  };

  const handleAcknowledgeAlert = async (alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a));
    try {
      await fetch(`/api/devices/krishiai-node-01/alerts/${alertId}/ack`, { method: 'POST' });
    } catch (err) {}
  };

  const handleClearAllAlerts = async () => {
    setAlerts([]);
    showToast('All alerts cleared', 'info');
    try {
      await fetch('/api/devices/krishiai-node-01/alerts', { method: 'DELETE' });
    } catch (err) {}
  };

  const unreadAlertsCount = alerts.filter(a => !a.acknowledged).length;

  return (
    <div className="w-full h-full overflow-y-auto bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
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
        firebaseStatus={firebaseStatus}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
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

        {/* 1. DASHBOARD OVERVIEW VIEW */}
        {activeTab === 'dashboard' && (
          <div>
            {/* Real-time Sensor Cards Grid */}
            <SensorCards
              telemetry={telemetry}
              device={device}
              onOpenPumpModal={() => setIsPumpModalOpen(true)}
              onStopPump={handleStopPump}
            />

            {/* Decision Engine Card */}
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
                controlState={controlState}
                onModeChange={handleModeChange}
                onOpenPumpModal={() => setIsPumpModalOpen(true)}
                onStopPump={handleStopPump}
                onEmergencyStop={handleEmergencyStop}
                userRole={userRole}
              />

              <div className="glass-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>📈 Quick 24h Soil Telemetry Curve</h3>
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
              controlState={controlState}
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

      {/* Modal Confirmation for Pump Activation */}
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
