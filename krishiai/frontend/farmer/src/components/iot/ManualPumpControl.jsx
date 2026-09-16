import React from 'react';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  ShieldCheck, 
  Settings2, 
  Droplets,
  Activity,
  CheckCircle2
} from 'lucide-react';

export default function ManualPumpControl({ 
  telemetry, 
  device, 
  onToggleMode, 
  onStartPump, 
  onStopPump, 
  onEmergencyStop
}) {
  const isPumpActive = Boolean(telemetry?.pump);
  const isRaining = Boolean(telemetry?.rain);
  const mode = device?.mode || 'AUTO';
  const soilMoisture = telemetry?.soilMoisture ?? 0;
  const targetMoisture = device?.settings?.targetMoisture || 65;

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition ${
            isPumpActive 
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 animate-pulse' 
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
          }`}>
            <Droplets size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Pump Actuation & Safety Station
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                isPumpActive 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 animate-pulse' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {isPumpActive ? '● PUMP ENERGIZED (ON)' : '○ PUMP STANDBY (OFF)'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct GPIO 26 Relay actuation with real-time precipitation lockout & fail-safe cutoff
            </p>
          </div>
        </div>

        {/* Mode Switcher: AUTO vs MANUAL */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => onToggleMode('AUTO')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mode === 'AUTO' 
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck size={14} /> AUTO (AI)
          </button>
          <button
            onClick={() => onToggleMode('MANUAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              mode === 'MANUAL' 
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Settings2 size={14} /> MANUAL
          </button>
        </div>
      </div>

      {/* Main Control Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Direct Actuation Controls */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Rain Warning Banner if raining */}
          {isRaining && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs">
              <AlertTriangle size={18} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span>
                <strong>Rain Safety Interlock Engaged:</strong> Natural precipitation is active. Pump actuation is locked out to prevent waterlogging.
              </span>
            </div>
          )}

          {/* Operational Status Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Actuator Circuit Status
              </span>
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isPumpActive ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}`} />
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                  {isPumpActive ? 'RELAY GPIO 26 ENERGIZED (Active LOW)' : 'RELAY GPIO 26 DE-ENERGIZED (High-Z Standby)'}
                </span>
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600 dark:text-slate-400">
              <div>Soil Moisture: <strong className="text-emerald-600 dark:text-emerald-400">{soilMoisture}%</strong> / Target {targetMoisture}%</div>
              <div>Interlock: <strong className={isRaining ? 'text-blue-500' : 'text-emerald-500'}>{isRaining ? 'LOCKED' : 'READY'}</strong></div>
            </div>
          </div>

          {/* Direct ON / OFF Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-1">
            {!isPumpActive ? (
              <button
                onClick={() => onStartPump()}
                disabled={isRaining}
                className="flex-1 min-h-[52px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-extrabold text-sm transition flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/30 active:scale-[0.99] cursor-pointer"
              >
                <Zap size={18} className="animate-pulse" />
                <span>TURN PUMP ON (ACTUATE)</span>
              </button>
            ) : (
              <button
                onClick={onStopPump}
                className="flex-1 min-h-[52px] py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-extrabold text-sm transition flex items-center justify-center gap-2.5 shadow-lg shadow-amber-600/30 active:scale-[0.99] cursor-pointer"
              >
                <Power size={18} />
                <span>TURN PUMP OFF (DE-ACTUATE)</span>
              </button>
            )}

            <button
              onClick={onEmergencyStop}
              className="py-3.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 uppercase tracking-wider active:scale-[0.99] cursor-pointer"
            >
              <AlertTriangle size={16} /> EMERGENCY STOP
            </button>
          </div>
        </div>

        {/* Safety Guardrails Panel */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2 flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" />
            Automated Safety Cutoffs
          </span>

          <div className="space-y-2.5 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span>Target Soil Hydration:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{targetMoisture}% (Auto Stop)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Failsafe Max Runtime:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">30 mins (Continuous)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rain Interlock:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} /> Active (FC-37)
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>Relay Safe-Boot:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">High-Z (OFF)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Hardware Watchdog:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">30s Auto-Cutoff</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
            Compliant with PRD Section 30 Fail-Safe Guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}
