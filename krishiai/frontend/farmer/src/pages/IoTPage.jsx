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
  Settings2,
  Sprout
} from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { 
  INITIAL_TELEMETRY, 
  INITIAL_DEVICE, 
  evaluateDecision, 
  getSavedFirebaseConfig, 
  parseFirebasePayload,
  FirebaseIoTClient 
} from '../services/iotService';
import { 
  getSavedCropProfile, 
  CROP_PROFILES 
} from '../services/cropProfiles';
import { recordLiveTelemetry } from '../services/iotHistoryService';

import SensorCards from '../components/iot/SensorCards';
import DecisionEngineCard from '../components/iot/DecisionEngineCard';
import ManualPumpControl from '../components/iot/ManualPumpControl';
import PumpControlModal from '../components/iot/PumpControlModal';
import HardwareSimulator from '../components/iot/HardwareSimulator';
import FirebaseConnectModal from '../components/iot/FirebaseConnectModal';
import AnalyticsCharts from '../components/iot/AnalyticsCharts';
import IrrigationHistoryTable from '../components/iot/IrrigationHistoryTable';
import DeviceHealthView from '../components/iot/DeviceHealthView';
import CropSetupModal from '../components/iot/CropSetupModal';
import AiAgronomicAdvisoryCard from '../components/iot/AiAgronomicAdvisoryCard';

export default function IoTPage() {
  const { setMobileMenuOpen } = useMobileMenu();

  const [device, setDevice] = useState(INITIAL_DEVICE);
  const [telemetry, setTelemetry] = useState(INITIAL_TELEMETRY);
  const [decision, setDecision] = useState(() => evaluateDecision(INITIAL_TELEMETRY, INITIAL_DEVICE));
  const [irrigationHistory, setIrrigationHistory] = useState([]);

  const [cropProfile, setCropProfile] = useState(() => getSavedCropProfile());
  const [isCropModalOpen, setIsCropModalOpen] = useState(() => !getSavedCropProfile().isConfigured);
  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'trends' | 'audit' | 'hardware'
  const [firebaseConfig, setFirebaseConfig] = useState(() => getSavedFirebaseConfig());
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [isPumpModalOpen, setIsPumpModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const API_BASE = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/+$/, '');
  const fbClientRef = useRef(null);
  const isPumpActionInProgress = useRef(false);
  const lastAutoActionTime = useRef(0);

  const showToast = (msg, type = 'info') => {
    setToastMessage({ msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Synchronize device limits with selected crop
  useEffect(() => {
    if (cropProfile?.cropId) {
      const cropDef = CROP_PROFILES[cropProfile.cropId] || CROP_PROFILES.wheat;
      setDevice(prev => ({
        ...prev,
        crop: `${cropDef.name} (${cropDef.variety})`,
        settings: {
          ...prev.settings,
          criticalMoisture: cropDef.criticalMoisture,
          targetMoisture: cropDef.targetMoisture,
        }
      }));
    }
  }, [cropProfile?.cropId, cropProfile?.stageId]);

  // Re-evaluate decision whenever telemetry, device settings, or crop change
  useEffect(() => {
    const newDecision = evaluateDecision(telemetry, device, cropProfile);
    setDecision(newDecision);

    // Auto-irrigation handling in AUTO mode with loop prevention & debounce
    if (device.mode === 'AUTO' && !isPumpActionInProgress.current) {
      const now = Date.now();
      if (now - lastAutoActionTime.current > 6000) {
        if (newDecision.shouldAutoIrrigate && !telemetry.pump && !telemetry.rain) {
          lastAutoActionTime.current = now;
          startPump(device.settings.autoMaxDurationMinutes || 30, 'KrishiAI Decision Engine (Auto)');
        } else if (!newDecision.shouldAutoIrrigate && telemetry.pump && telemetry.pumpStartedBy?.includes('Auto')) {
          lastAutoActionTime.current = now;
          stopPump('Target moisture reached');
        }
      }
    }
  }, [telemetry.soilMoisture, telemetry.rain, telemetry.temperature, telemetry.humidity, telemetry.pump, device.mode, cropProfile?.cropId, cropProfile?.stageId]);

  // Setup Firebase Realtime Database Listener
  useEffect(() => {
    if (fbClientRef.current) {
      fbClientRef.current.stopListening();
    }

    if (firebaseConfig.enabled) {
      const client = new FirebaseIoTClient(firebaseConfig, (incoming) => {
        if (incoming) {
          const parsed = parseFirebasePayload(incoming);
          if (!parsed) return;
          recordLiveTelemetry(parsed);
          setIsFirebaseConnected(true);

          const isNodeOnline = parsed.online === true;
          setDevice((prev) => ({
            ...prev,
            status: isNodeOnline ? 'online' : 'offline',
            ...(parsed.mode ? { mode: parsed.mode } : {})
          }));

          setTelemetry((prev) => {
            const updated = { ...prev };
            if (parsed.soilMoisture !== undefined) updated.soilMoisture = parsed.soilMoisture;
            if (parsed.soilRaw !== undefined) updated.soilRaw = parsed.soilRaw;
            if (parsed.temperature !== undefined) updated.temperature = parsed.temperature;
            if (parsed.humidity !== undefined) updated.humidity = parsed.humidity;
            if (parsed.rain !== undefined) updated.rain = parsed.rain;
            if (parsed.light !== undefined) updated.light = parsed.light;
            if (parsed.pump !== undefined) updated.pump = parsed.pump;
            updated.online = isNodeOnline;
            updated.timestamp = isNodeOnline ? Date.now() : 0;
            return updated;
          });
        }
      });
      fbClientRef.current = client;
      client.startListening();
    } else {
      setIsFirebaseConnected(false);
      setDevice((prev) => ({ ...prev, status: 'offline' }));
    }

    return () => {
      if (fbClientRef.current) {
        fbClientRef.current.stopListening();
      }
    };
  }, [firebaseConfig.enabled, firebaseConfig.databaseUrl, firebaseConfig.devicePath]);

  // Sync live telemetry from FastAPI backend ONLY if Firebase RTDB is disabled
  useEffect(() => {
    if (firebaseConfig.enabled) {
      // Firebase RTDB SSE is actively listening. Backend polling disabled to prevent data oscillation/fluctuation.
      return;
    }

    let isMounted = true;
    const fetchBackend = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/iot/latest`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success && data.telemetry) {
            setTelemetry(prev => ({
              ...prev,
              ...data.telemetry
            }));
            if (data.device) {
              setDevice(prev => ({
                ...prev,
                ...data.device
              }));
            }
          }
        }
      } catch (e) {
        // Local fallback in effect
      }
    };

    fetchBackend();
    const pollTimer = setInterval(fetchBackend, 5000);
    return () => {
      isMounted = false;
      clearInterval(pollTimer);
    };
  }, [firebaseConfig.enabled]);

  // Pump control actions
  const startPump = async (durationMinutes = 30, reason = 'Farmer Web Portal') => {
    if (telemetry.pump) return; // Already running
    if (isPumpActionInProgress.current) return;

    // Rain safety check
    if (telemetry.rain) {
      showToast('Cannot start pump while rain sensor detects precipitation (Safety Interlock)', 'error');
      return;
    }

    isPumpActionInProgress.current = true;

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
    showToast('💧 Submersible Pump ENERGIZED (Running)', 'success');

    try {
      // Push to Firebase if enabled
      if (fbClientRef.current && firebaseConfig.enabled) {
        await fbClientRef.current.sendPumpCommand(true, durationMinutes, reason);
      }

      // Push to backend
      try {
        await fetch(`${API_BASE}/api/iot/pump`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: true, durationMinutes, reason })
        });
      } catch (e) {}
    } finally {
      setTimeout(() => {
        isPumpActionInProgress.current = false;
      }, 1000);
    }
  };

  const stopPump = async (reason = 'Manual stop') => {
    if (!telemetry.pump && !telemetry.pumpStartedAt) return; // Already stopped
    if (isPumpActionInProgress.current) return;

    isPumpActionInProgress.current = true;

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

    try {
      if (fbClientRef.current && firebaseConfig.enabled) {
        await fbClientRef.current.sendPumpCommand(false, 0, reason);
      }

      try {
        await fetch(`${API_BASE}/api/iot/pump`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ state: false, reason })
        });
      } catch (e) {}
    } finally {
      setTimeout(() => {
        isPumpActionInProgress.current = false;
      }, 1000);
    }
  };

  const handleEmergencyStop = () => {
    stopPump('EMERGENCY STOP PRESSED');
    showToast('🚨 EMERGENCY CUTOFF: Pump shut down immediately', 'error');
  };

  const toggleMode = (newMode) => {
    setDevice(prev => ({ ...prev, mode: newMode }));
    showToast(`Switched to ${newMode} Mode`, 'info');

    if (fbClientRef.current && firebaseConfig.enabled) {
      fbClientRef.current.sendModeCommand(newMode);
    }

    try {
      fetch(`${API_BASE}/api/iot/mode`, {
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
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all ${
                  device.status === 'online'
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${device.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
                  {device.status === 'online' ? 'NODE ONLINE' : 'NODE OFFLINE'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                ESP32 Field Node Telemetry • Explainable Agronomic AI • Automated Irrigation Control
              </p>
            </div>
          </div>

          {/* Quick Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Crop Calibration Trigger Button */}
            <button
              onClick={() => setIsCropModalOpen(true)}
              className="py-2 px-3.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              title="Configure crop profile, growth stage, and soil parameters"
            >
              <Sprout size={15} className="text-emerald-500" />
              <span>
                {cropProfile ? (() => {
                  const def = CROP_PROFILES[cropProfile.cropId] || CROP_PROFILES.wheat;
                  const st = def?.stages?.find(s => s.id === cropProfile.stageId) || def?.stages?.[0];
                  const cropName = def?.name?.split(' ')?.[0] || 'Wheat';
                  const stageName = st ? st.name.split('(')[0].trim() : 'Active';
                  return `${cropName} (${stageName})`;
                })() : 'Calibrate Crop'}
              </span>
            </button>

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
              <span>{isFirebaseConnected ? (device.status === 'online' ? 'Firebase RTDB (Live)' : 'Firebase RTDB (Standby)') : 'Connect Firebase'}</span>
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
            {/* Multi-Day AI Agronomic Analysis & Crop-Stage Advisory Card */}
            <AiAgronomicAdvisoryCard
              decision={decision}
              telemetry={telemetry}
              cropProfile={cropProfile}
              onEditCrop={() => setIsCropModalOpen(true)}
              onStartPump={() => startPump(30, 'AI Advisory Actuation')}
            />

            {/* 6 Real-time Sensor Cards */}
            <SensorCards 
              telemetry={telemetry} 
              device={device} 
              onStartPump={() => startPump(30, 'Sensor Actuator Action')}
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
              onStartPump={() => startPump(30, 'Manual Actuator Button')}
              onStopPump={() => stopPump('Farmer manual stop')}
              onEmergencyStop={handleEmergencyStop}
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
        <CropSetupModal
          isOpen={isCropModalOpen}
          onClose={() => setIsCropModalOpen(false)}
          currentProfile={cropProfile}
          onSaveSuccess={(updated) => {
            setCropProfile(updated);
            showToast(`🌾 ${updated.cropId.toUpperCase()} profile calibrated. Control mode active!`, 'success');
          }}
        />

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
