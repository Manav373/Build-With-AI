import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, 
  Menu, 
  Flame, 
  Sliders, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Droplet, 
  Clock, 
  Zap,
  Layers,
  Radio,
  History,
  Settings2
} from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { 
  INITIAL_TELEMETRY, 
  INITIAL_DEVICE, 
  evaluateDecision, 
  getSavedFirebaseConfig, 
  FirebaseIoTClient 
} from '../services/iotService';

import SensorCards from '../components/iot/SensorCards';
import DecisionEngineCard from '../components/iot/DecisionEngineCard';
import ManualPumpControl from '../components/iot/ManualPumpControl';
import PumpControlModal from '../components/iot/PumpControlModal';
import HardwareSimulator from '../components/iot/HardwareSimulator';
import FirebaseConnectModal from '../components/iot/FirebaseConnectModal';
import AnalyticsCharts from '../components/iot/AnalyticsCharts';
import IrrigationHistoryTable from '../components/iot/IrrigationHistoryTable';
import DeviceHealthView from '../components/iot/DeviceHealthView';

export default function IoTPage() {
  const { setMobileMenuOpen } = useMobileMenu();

  const [device, setDevice] = useState(INITIAL_DEVICE);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [decision, setDecision] = useState(() => evaluateDecision(INITIAL_TELEMETRY, INITIAL_DEVICE));
  const [irrigationHistory, setIrrigationHistory] = useState([
    {
      id: 'IRR-0102',
      startTime: 'Today, 06:15 AM',
      durationMinutes: 15,
      mode: 'AUTO',
      triggeredBy: 'AI Decision Engine (Critical Dry)',
      startMoisture: 21,
      endMoisture: 65,
      status: 'COMPLETED'
    },
    {
      id: 'IRR-0101',
      startTime: 'Yesterday, 07:00 PM',
      durationMinutes: 10,
      mode: 'MANUAL',
      triggeredBy: 'Farmer App (Evening Top-up)',
      startMoisture: 32,
      endMoisture: 58,
      status: 'COMPLETED'
    }
  ]);

  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'trends' | 'audit' | 'hardware'
  const [firebaseConfig, setFirebaseConfig] = useState(() => getSavedFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fbClientRef = useRef(null);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Re-evaluate decision whenever telemetry or device settings change
  useEffect(() => {
    const newDecision = evaluateDecision(telemetry, device);
    setDecision(newDecision);

    // Auto-irrigation handling in AUTO mode
    if (device.mode === 'AUTO') {
      if (newDecision.shouldAutoIrrigate && !telemetry.pump && !telemetry.rain) {
        startPump(device.settings.autoMaxDurationMinutes || 15, 'KrishiAI Decision Engine (Auto)');
      } else if (!newDecision.shouldAutoIrrigate && telemetry.pump && telemetry.pumpStartedBy?.includes('Auto')) {
        stopPump('Target moisture reached');
      }
    }
  }, [telemetry.soilMoisture, telemetry.rain, telemetry.temperature, telemetry.humidity, device.mode]);

  // Setup Firebase Realtime Database Listener
  useEffect(() => {
    if (fbClientRef.current) {
      fbClientRef.current.stopListening();
    }

    if (firebaseConfig.enabled) {
      const client = new FirebaseIoTClient(firebaseConfig, (incoming) => {
        if (incoming) {
          setIsFirebaseConnected(true);
          setTelemetry((prev) => ({
            ...prev,
            soilMoisture: incoming.soilMoisture ?? incoming.moisture ?? prev.soilMoisture,
            soilRaw: incoming.soilRaw ?? prev.soilRaw,
            temperature: incoming.temperature ?? incoming.temp ?? prev.temperature,
            humidity: incoming.humidity ?? incoming.hum ?? prev.humidity,
            rain: incoming.rain !== undefined ? incoming.rain : prev.rain,
            light: incoming.light !== undefined ? incoming.light : prev.light,
            pump: incoming.pump !== undefined ? incoming.pump : prev.pump,
            timestamp: Date.now()
          }));
        }
      });
      fbClientRef.current = client;
      client.startListening();
    } else {
      setIsFirebaseConnected(false);
    }

    return () => {
      if (fbClientRef.current) {
        fbClientRef.current.stopListening();
      }
    };
  }, [firebaseConfig.enabled, firebaseConfig.databaseUrl, firebaseConfig.devicePath]);

  // Try fetching baseline from FastAPI backend if available
  useEffect(() => {
    const fetchBackend = async () => {
      try {
        const res = await fetch('/api/iot/latest');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.telemetry) {
            setTelemetry(data.telemetry);
            if (data.device) setDevice(data.device);
          }
        }
      } catch (e) {
        // Local fallback in effect
      }
    };
    fetchBackend();
  }, []);

  // Pump control actions
  const startPump = async (durationMinutes = 10, reason = 'Farmer Web Portal') => {
    // Rain safety check
    if (telemetry.rain) {
      showToast('Cannot start pump while rain sensor detects precipitation (Safety Interlock)', 'error');
      return;
    }

    const updated = {
      ...telemetry,
      pump: true,
      pumpStartedAt: Date.now(),
      pumpDurationMinutes: durationMinutes,
      pumpStartedBy: reason
    };
    setTelemetry(updated);

    // Add session to history
    const newSession = {
      id: `IRR-${Date.now().toString().slice(-4)}`,
      startTime: 'Just now',
      durationMinutes,
      mode: device.mode,
      triggeredBy: reason,
      startMoisture: telemetry.soilMoisture,
      endMoisture: null,
      status: 'ACTIVE'
    };
    setIrrigationHistory(prev => [newSession, ...prev]);
    showToast(`💧 Pump STARTED for ${durationMinutes} minutes`, 'success');

    // Push to Firebase if enabled
    if (fbClientRef.current && firebaseConfig.enabled) {
      fbClientRef.current.sendPumpCommand(true, durationMinutes, reason);
    }

    // Push to backend
    try {
      fetch('/api/iot/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: true, durationMinutes, reason })
      });
    } catch (e) {}
  };

  const stopPump = async (reason = 'Manual stop') => {
    setTelemetry(prev => ({
      ...prev,
      pump: false,
      pumpStartedAt: null
    }));

    setIrrigationHistory(prev => 
      prev.map(item => item.status === 'ACTIVE' 
        ? { ...item, status: 'COMPLETED', endMoisture: telemetry.soilMoisture } 
        : item
      )
    );
    showToast('🛑 Pump STOPPED', 'info');

    if (fbClientRef.current && firebaseConfig.enabled) {
      fbClientRef.current.sendPumpCommand(false, 0, reason);
    }

    try {
      fetch('/api/iot/pump', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: false, reason })
      });
    } catch (e) {}
  };

  const handleEmergencyStop = () => {
    stopPump('EMERGENCY STOP PRESSED');
    showToast('🚨 EMERGENCY CUTOFF: Pump shut down immediately', 'error');
  };

  const toggleMode = (newMode) => {
    setDevice(prev => ({ ...prev, mode: newMode }));
    showToast(`Switched to ${newMode} Mode`, 'info');
    try {
      fetch('/api/iot/mode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: newMode })
      });
    } catch (e) {}
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 text-slate-900 dark:bg-[#060d09] dark:text-slate-100 p-4 md:p-8 selection:bg-emerald-500/30 transition-colors">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Toast alert */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 animate-bounce">
            <div className={`px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border ${
              toastMessage.type === 'error' ? 'bg-red-600 border-red-400 text-white' :
              toastMessage.type === 'success' ? 'bg-emerald-600 border-emerald-400 text-white' :
              'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'
            }`}>
              {toastMessage.type === 'error' ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
              <span>{toastMessage.msg}</span>
            </div>
          </div>
        )}

        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm"
            >
              <Menu size={20} />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
              <Cpu size={26} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  IoT Smart Farm & Kisan Alert
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ESP32 Field Node Telemetry • Explainable Agronomic AI • Automated Irrigation Control
              </p>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Firebase Connect Button */}
            <button
              onClick={() => setIsFirebaseModalOpen(true)}
              className={`py-2 px-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border shadow-sm ${
                isFirebaseConnected 
                  ? 'bg-orange-500/10 text-orange-600 dark:text-orange-300 border-orange-500/30 hover:bg-orange-500/20' 
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-orange-500/40 hover:text-orange-600 dark:hover:text-orange-300'
              }`}
            >
              <Flame size={15} className={isFirebaseConnected ? 'text-orange-500' : 'text-slate-400'} />
              <span>{isFirebaseConnected ? 'Firebase Connected' : 'Connect Firebase'}</span>
            </button>

            {/* Hardware Simulator Drawer Button */}
            <button
              onClick={() => setIsSimulatorOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <Sliders size={15} className="text-emerald-500" />
              <span>Simulator</span>
            </button>

            {/* Emergency Stop Button */}
            <button
              onClick={handleEmergencyStop}
              className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black transition flex items-center gap-1.5 shadow-lg shadow-red-600/20"
            >
              <AlertCircle size={15} />
              <span>EMERGENCY STOP</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 p-1.5 bg-slate-200/80 dark:bg-slate-950/80 rounded-2xl border border-slate-300/80 dark:border-slate-800/80 overflow-x-auto transition-colors">
          {[
            { id: 'telemetry', label: 'Telemetry & Actuation', icon: <Activity size={14} /> },
            { id: 'trends', label: 'Historical Trends', icon: <Droplet size={14} /> },
            { id: 'audit', label: 'Irrigation Audit Trail', icon: <History size={14} /> },
            { id: 'hardware', label: 'ESP32 Specs & Pinouts', icon: <Cpu size={14} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tab View Rendering */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            {/* 6 Real-time Sensor Cards */}
            <SensorCards 
              telemetry={telemetry} 
              device={device} 
              onOpenPumpModal={() => setIsPumpModalOpen(true)}
              onEmergencyStop={handleEmergencyStop}
            />

            {/* 5-Step Explainable Decision Engine */}
            <DecisionEngineCard 
              decision={decision} 
              telemetry={telemetry} 
              device={device} 
            />

            {/* Manual Pump Control & Safety Station */}
            <ManualPumpControl
              telemetry={telemetry}
              device={device}
              onToggleMode={toggleMode}
              onStartPump={(mins) => startPump(mins, 'Farmer Quick Action')}
              onStopPump={() => stopPump('Farmer manual stop')}
              onEmergencyStop={handleEmergencyStop}
              onOpenModal={() => setIsPumpModalOpen(true)}
            />
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <AnalyticsCharts telemetry={telemetry} />
          </div>
        )}

        {activeTab === 'audit' && (
          <div className="space-y-6">
            <IrrigationHistoryTable history={irrigationHistory} />
          </div>
        )}

        {activeTab === 'hardware' && (
          <div className="space-y-6">
            <DeviceHealthView 
              device={device} 
              telemetry={telemetry} 
              isFirebaseConnected={isFirebaseConnected} 
            />
          </div>
        )}

        {/* Modals & Drawers */}
        <PumpControlModal
          isOpen={isPumpModalOpen}
          onClose={() => setIsPumpModalOpen(false)}
          onConfirm={(duration, reason) => startPump(duration, reason)}
          device={device}
        />

        <HardwareSimulator
          isOpen={isSimulatorOpen}
          onClose={() => setIsSimulatorOpen(false)}
          telemetry={telemetry}
          onUpdateTelemetry={setTelemetry}
          device={device}
        />

        <FirebaseConnectModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
          firebaseConfig={firebaseConfig}
          onSaveConfig={setFirebaseConfig}
          isFirebaseConnected={isFirebaseConnected}
        />
      </div>
    </div>
  );
}
