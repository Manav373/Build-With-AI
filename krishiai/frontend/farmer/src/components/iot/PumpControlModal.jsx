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
          {/* Duration slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Clock size={14} className="text-emerald-600 dark:text-emerald-400" />
                Run Duration (Minutes)
              </label>
              <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{duration} mins</span>
            </div>
            <input
              type="range"
              min="1"
              max={maxMins}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>1 min</span>
              <span>15 min</span>
              <span>Max: {maxMins} min</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex gap-2">
            {[5, 10, 15, 20].map((mins) => (
              <button
                type="button"
                key={mins}
                onClick={() => setDuration(mins)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition ${
                  duration === mins
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-700 dark:text-emerald-300'
                    : 'bg-slate-100 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {mins}m
              </button>
            ))}
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
              placeholder="e.g., Pre-sowing root hydration"
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
