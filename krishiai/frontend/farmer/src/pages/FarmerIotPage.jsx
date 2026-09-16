import React, { useState, useEffect, useRef } from 'react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sliders, ShieldAlert, Sparkles, CheckCircle2, AlertCircle, 
  Menu, Cpu, Clock, Layers, Droplets, Gauge, LineChart, History, 
  Bell, Code2, SlidersHorizontal, LayoutDashboard, Radio, ChevronRight
} from 'lucide-react';

// IoT Components
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

// Services
import { 
  subscribeToSensors, 
  subscribeToStatus, 
  subscribeToControl,
  setControlMode, 
  setMotorCommand, 
  setEmergencyStop,
  writeTelemetrySimulation,
  writeStatusSimulation,
  isFirebaseConfigured
} from '../services/iotFirebaseService';
import { DecisionEngine } from '../services/iotDecisionEngine';

import '../styles/iot.css';

const DEFAULT_DEVICE = {
  id: 'krishiai-node-01',
  name: 'Krishi Node 01',
  farm: 'Field Sector 4 - Main Crop',
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

export default function FarmerIotPage() {
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme } = useTheme();

  const [device, setDevice] = useState(DEFAULT_DEVICE);
  const [telemetry, setTelemetry] = useState(DEFAULT_TELEMETRY);
  const [controlState, setControlState] = useState({ mode: 'AUTO', motorCommand: false });
  const [firebaseStatus, setFirebaseStatus] = useState(isFirebaseConfigured() ? 'connected' : 'standby');
  const [decision, setDecision] = useState(() => DecisionEngine.evaluate(DEFAULT_TELEMETRY, DEFAULT_DEVICE));
  const [alerts, setAlerts] = useState([]);
  const [irrigationHistory, setIrrigationHistory] = useState([]);
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [userRole, setUserRole] = useState('Admin');
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [timeAgo, setTimeAgo] = useState('Just now');

  const lastSyncRef = useRef(Date.now());

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const diffSec = Math.floor((Date.now() - lastSyncRef.current) / 1000);
      if (diffSec < 5) setTimeAgo('Few seconds ago');
      else if (diffSec < 60) setTimeAgo(`${diffSec}s ago`);
      else setTimeAgo(`${Math.floor(diffSec / 60)}m ago`);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Firebase Realtime Subscriptions
  useEffect(() => {
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
      () => setFirebaseStatus('standby')
    );

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
      }
    );

    const unsubscribeControl = subscribeToControl(
      (ctrlData) => {
        if (!ctrlData) return;
        setControlState(ctrlData);
        setDevice(prev => ({
          ...(prev || DEFAULT_DEVICE),
          mode: ctrlData.mode
        }));
        setFirebaseStatus('connected');
      }
    );

    return () => {
      unsubscribeSensors();
      unsubscribeStatus();
      unsubscribeControl();
    };
  }, []);

  const handleModeChange = async (newMode) => {
    setDevice(prev => prev ? { ...prev, mode: newMode } : prev);
    setControlState(prev => ({ ...prev, mode: newMode }));
    try {
      await setControlMode(newMode);
      showToast(`Mode set to ${newMode} on ESP32`, 'success');
    } catch {
      showToast(`Switched mode to ${newMode}`, 'info');
    }
  };

  const handleStartPump = async () => {
    if (device?.mode === 'AUTO') {
      showToast('⚠️ Switch to MANUAL mode before manually starting the pump.', 'error');
      return;
    }
    try {
      await setMotorCommand(true, device?.mode);
      setControlState(prev => ({ ...prev, motorCommand: true }));
      showToast('💧 Pump ON signal sent to ESP32 Relay', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to trigger pump', 'error');
    }
  };

  const handleStopPump = async () => {
    try {
      await setMotorCommand(false, device?.mode);
      setControlState(prev => ({ ...prev, motorCommand: false }));
      showToast('🛑 Pump OFF signal sent to ESP32 Relay', 'info');
    } catch (err) {
      showToast('Failed to stop pump', 'error');
    }
  };

  const handleEmergencyStop = async () => {
    try {
      await setEmergencyStop();
      setControlState(prev => ({ ...prev, motorCommand: false }));
      showToast('🚨 EMERGENCY STOP ACTIVATED: Pump de-energized!', 'error');
    } catch (err) {
      showToast('Emergency Stop Failed: ' + err.message, 'error');
    }
  };

  const handleSendTelemetry = async (payload) => {
    try {
      await writeTelemetrySimulation(payload);
      showToast('⚡ Telemetry injected to Firebase RTDB', 'success');
    } catch {
      setTelemetry(prev => {
        const updated = { ...(prev || DEFAULT_TELEMETRY), ...payload };
        setDecision(DecisionEngine.evaluate(updated, device || DEFAULT_DEVICE));
        return updated;
      });
      showToast('Simulation applied locally', 'info');
    }
  };

  const handleToggleOnline = async () => {
    const nextState = device?.status !== 'online';
    try {
      await writeStatusSimulation({ online: nextState });
      showToast(`ESP32 set to ${nextState ? 'ONLINE' : 'OFFLINE'}`, nextState ? 'success' : 'error');
    } catch {
      setDevice(prev => ({ ...(prev || DEFAULT_DEVICE), status: nextState ? 'online' : 'offline' }));
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'farm', label: 'Field Zones', icon: Layers },
    { id: 'sensors', label: 'Sensors', icon: Gauge },
    { id: 'irrigation', label: 'Irrigation', icon: Droplets },
    { id: 'analytics', label: 'Analytics', icon: LineChart },
    { id: 'history', label: 'Logs', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'hardware', label: 'Pinout', icon: Cpu },
    { id: 'firmware', label: 'Firmware', icon: Code2 },
    { id: 'settings', label: 'Thresholds', icon: SlidersHorizontal }
  ];

  const isOnline = device?.status === 'online';
  const isFirebaseLive = firebaseStatus === 'connected';

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#080d1a] text-slate-100 selection:bg-[#4ade80]/30 selection:text-[#4ade80]">
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          padding: '0.75rem 1.25rem',
          background: toast.type === 'error' ? '#991b1b' : toast.type === 'success' ? '#065f46' : '#0c4a6e',
          color: 'white',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
          fontSize: '0.88rem',
          fontWeight: 600
        }}>
          {toast.type === 'error' ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="border-b border-white/[0.08] bg-[#09101f]/95 backdrop-blur-md px-4 md:px-6 py-3 sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-xl bg-white/5 border border-white/10 transition-colors"
            aria-label="Open Menu"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white font-['Outfit']">IoT Smart Irrigation</h1>
                <span className="text-[0.68rem] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono font-bold tracking-wider">NODE-01</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">ESP32 Real-Time Soil & Environmental SCADA Telemetry</p>
            </div>
          </div>
        </div>

        {/* Live Status Pills & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isFirebaseLive ? 'bg-emerald-400 shadow-[0_0_8px_#34d399] animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300 font-medium">RTDB: <strong className="text-white">{isFirebaseLive ? 'Live' : 'Syncing'}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 shadow-sm">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-400'}`}></span>
            <strong className={isOnline ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>{isOnline ? 'ESP32 Online' : 'ESP32 Offline'}</strong>
          </div>

          <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 text-slate-400">
            <Clock size={13} className="text-emerald-400" />
            <span>Updated: <strong className="text-slate-200 font-medium">{timeAgo}</strong></span>
          </div>

          {/* Emergency Stop Button */}
          <button
            onClick={handleEmergencyStop}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs tracking-wider shadow-lg shadow-rose-900/40 border border-rose-400/40 transition-all active:scale-95 cursor-pointer"
          >
            <ShieldAlert size={15} />
            <span>EMERGENCY STOP</span>
          </button>

          {/* Simulator & Setup Triggers */}
          <button
            onClick={() => setIsSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/30 text-xs font-semibold transition-all hover:border-sky-400/50 cursor-pointer shadow-sm"
            title="Inject simulated sensor values"
          >
            <Sliders size={13} />
            <span className="hidden sm:inline">Simulator</span>
          </button>

          <button
            onClick={() => setIsConnectModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all hover:border-emerald-400/50 cursor-pointer shadow-sm"
          >
            <Cpu size={13} />
            <span className="hidden sm:inline">Hardware Setup</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="border-b border-white/[0.08] bg-[#0c1427]/95 px-4 md:px-6 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none sticky top-[57px] z-20 backdrop-blur-md">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/35 shadow-[0_0_15px_rgba(16,185,129,0.18)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-slate-400'} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] w-full mx-auto space-y-6 flex-1">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Real-time Sensor Cards */}
            <SensorCards
              telemetry={telemetry}
              device={device}
              onOpenPumpModal={() => setIsPumpModalOpen(true)}
              onStopPump={handleStopPump}
            />

            {/* Decision Engine Recommendation Card */}
            <DecisionEngineCard
              decision={decision}
              telemetry={telemetry}
              device={device}
            />

            {/* Two Column Layout: Manual Pump Control & 24h Trend */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-white">📈 Quick 24h Telemetry Curve</h3>
                  <button 
                    className="btn-secondary text-xs px-2.5 py-1"
                    onClick={() => setActiveTab('analytics')}
                  >
                    Full Analytics →
                  </button>
                </div>
                <AnalyticsCharts deviceId="krishiai-node-01" />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'farm' && (
          <FarmZonesView
            telemetry={telemetry}
            device={device}
            decision={decision}
          />
        )}

        {activeTab === 'sensors' && (
          <DetailedSensorsView
            telemetry={telemetry}
            device={device}
          />
        )}

        {activeTab === 'irrigation' && (
          <div className="space-y-6">
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

        {activeTab === 'analytics' && (
          <AnalyticsCharts deviceId="krishiai-node-01" />
        )}

        {activeTab === 'history' && (
          <IrrigationHistoryTable history={irrigationHistory} />
        )}

        {activeTab === 'alerts' && (
          <AlertsCenter
            alerts={alerts}
            onAcknowledge={(id) => setAlerts(prev => prev.filter(a => a.id !== id))}
            onClearAll={() => setAlerts([])}
            deviceId="krishiai-node-01"
          />
        )}

        {activeTab === 'hardware' && (
          <DeviceHealthView
            device={device}
            telemetry={telemetry}
          />
        )}

        {activeTab === 'firmware' && (
          <Esp32FirmwareView device={device} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            device={device}
            onUpdateSettings={(s) => {
              setDevice(prev => ({ ...prev, settings: { ...prev.settings, ...s } }));
              showToast('Thresholds updated successfully', 'success');
            }}
          />
        )}
      </div>

      {/* Modals & Drawers */}
      <PumpControlModal
        isOpen={isPumpModalOpen}
        onClose={() => setIsPumpModalOpen(false)}
        onConfirm={({ durationMinutes, reason }) => {
          handleStartPump();
          setIsPumpModalOpen(false);
        }}
        device={device}
        telemetry={telemetry}
        decision={decision}
      />

      <HardwareSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        telemetry={telemetry}
        device={device}
        onSendTelemetry={handleSendTelemetry}
        onToggleOnline={handleToggleOnline}
      />

      <HardwareConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        device={device}
        onDeviceConnected={(d) => showToast('ESP32 device profile mapped', 'success')}
      />
    </div>
  );
}
