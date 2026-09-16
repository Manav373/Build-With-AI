import React, { useState } from 'react';
import { X, Droplets, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PumpControlModal({ isOpen, onClose, onConfirm, device }) {
  const [duration, setDuration] = useState(10);
  const [reason, setReason] = useState('Manual morning irrigation');

  if (!isOpen) return null;

  const maxMins = device?.settings?.manualMaxDurationMinutes || 30;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(Number(duration), reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl text-slate-900 dark:text-white transition-colors">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
        >
          <X size={18} />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Droplets size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold">Start Irrigation Cycle</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Node: {device?.name || 'ESP32 Node 01'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Actuation Mode Confirmation */}
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Actuator Command</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">GPIO 26 RELAY [ON]</span>
          </div>

          {/* Operator Reason */}
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Audit Reason / Activity
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Immediate root zone hydration"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-xs focus:outline-none focus:border-emerald-500 transition"
              required
            />
          </div>

          {/* Safety Notice */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
            <ShieldCheck size={16} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              If precipitation or communication loss is detected, safety cutoffs will immediately de-energize the pump.
            </span>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition border border-slate-200 dark:border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30"
            >
              Confirm & Start
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
