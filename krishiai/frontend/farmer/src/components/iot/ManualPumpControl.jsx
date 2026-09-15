import React, { useState } from 'react';
import { 
  Zap, 
  Power, 
  AlertTriangle, 
  Clock, 
  ShieldCheck, 
  Settings2, 
  ToggleLeft, 
  ToggleRight,
  Droplets,
  RotateCcw
} from 'lucide-react';

export default function ManualPumpControl({ 
  telemetry, 
  device, 
  onToggleMode, 
  onStartPump, 
  onStopPump, 
  onEmergencyStop,
  onOpenModal
}) {
  const isPumpActive = Boolean(telemetry?.pump);
  const isRaining = Boolean(telemetry?.rain);
  const mode = device?.mode || 'AUTO';
  const autoDuration = device?.settings?.autoMaxDurationMinutes || 15;
  const manualDuration = device?.settings?.manualMaxDurationMinutes || 30;

  const quickDurations = [5, 10, 15, 20, 30];

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
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30' 
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
              }`}>
                {isPumpActive ? '● PUMP ENERGIZED' : '○ PUMP STANDBY'}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct GPIO 26 Relay actuation with hardcoded safety timers and rain cutoff
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
        {/* Pump Status & Timers */}
        <div className="lg:col-span-2 space-y-4">
          {/* Active Rain Warning Banner if raining */}
          {isRaining && (
            <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 flex items-center gap-3 text-blue-700 dark:text-blue-300 text-xs">
              <AlertTriangle size={18} className="text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span>
                <strong>Rain Safety Interlock Engaged:</strong> Natural precipitation is active. Manual and automated pump activation is suspended to avoid crop waterlogging.
              </span>
            </div>
          )}

          {/* Quick manual activation buttons */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
              Quick Timed Activation (Auto-shutoff after duration)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {quickDurations.map((mins) => (
                <button
                  key={mins}
                  disabled={isPumpActive || isRaining}
                  onClick={() => onStartPump(mins)}
                  className="py-2 px-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-emerald-50 dark:hover:bg-emerald-600/30 hover:border-emerald-300 dark:hover:border-emerald-500/40 border border-slate-200 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-40 disabled:pointer-events-none text-xs font-bold transition flex flex-col items-center gap-1 shadow-sm dark:shadow-none"
                >
                  <Clock size={13} className="text-slate-400" />
                  <span>{mins} min</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap gap-3 pt-2">
            {!isPumpActive ? (
              <button
                onClick={onOpenModal}
                disabled={isRaining}
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <Zap size={16} /> Start Custom Irrigation Cycle
              </button>
            ) : (
              <button
                onClick={onStopPump}
                className="flex-1 py-3 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <Power size={16} className="text-amber-500 dark:text-amber-400" /> Normal Stop Cycle
              </button>
            )}

            <button
              onClick={onEmergencyStop}
              className="py-3 px-6 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 uppercase tracking-wider"
            >
              <AlertTriangle size={16} /> EMERGENCY STOP
            </button>
          </div>
        </div>

        {/* Safety Guardrails Panel */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
          <span className="font-bold text-slate-800 dark:text-slate-200 block uppercase tracking-wider text-[11px] border-b border-slate-200 dark:border-slate-800 pb-2">
            Automated Safety Cutoffs
          </span>

          <div className="space-y-2 text-slate-600 dark:text-slate-400">
            <div className="flex justify-between items-center">
              <span>Auto Cutoff:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{autoDuration} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Manual Cutoff:</span>
              <span className="font-mono text-slate-900 dark:text-slate-200 font-bold">{manualDuration} mins</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Rain Interlock:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Enabled</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Relay Safe-Boot:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">High-Z (OFF)</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Telemetry Watchdog:</span>
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
