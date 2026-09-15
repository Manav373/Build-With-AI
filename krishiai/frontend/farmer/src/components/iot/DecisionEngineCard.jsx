import React from 'react';
import { 
  Cpu, 
  BrainCircuit, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DecisionEngineCard({ decision, telemetry, device }) {
  const pipeline = decision?.pipeline || {
    sense: 'Reading soil capacitance, raindrop conductivity & microclimate...',
    understand: 'Evaluating root zone moisture tension and evapotranspiration...',
    decide: 'Standing by for moisture threshold trigger...',
    act: 'Relay in safe de-energized standby (GPIO 26 HIGH)',
    learn: 'Calculating field drying rate...'
  };

  const action = decision?.action || 'STANDBY';

  const getActionBadge = (act) => {
    switch (act) {
      case 'IRRIGATE_NOW':
        return { label: '🚨 IRRIGATION TRIGGERED', bg: 'bg-red-500/20 text-red-600 dark:text-red-300 border-red-500/40' };
      case 'HOLD_RAIN':
        return { label: '🌧️ HOLD (RAIN LOCKOUT)', bg: 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/40' };
      case 'STOP_OPTIMAL':
        return { label: '✅ TARGET MOISTURE RESTORED', bg: 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40' };
      case 'RECOMMEND_IRRIGATION':
        return { label: '💧 RECOMMEND IRRIGATION', bg: 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40' };
      default:
        return { label: '● MONITORING & STANDBY', bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700' };
    }
  };

  const badge = getActionBadge(action);

  const steps = [
    { num: 1, title: 'SENSE', desc: pipeline.sense, color: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-300 dark:border-cyan-500/30' },
    { num: 2, title: 'UNDERSTAND', desc: pipeline.understand, color: 'text-indigo-600 dark:text-indigo-400', border: 'border-indigo-300 dark:border-indigo-500/30' },
    { num: 3, title: 'DECIDE', desc: pipeline.decide, color: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300 dark:border-amber-500/30' },
    { num: 4, title: 'ACT', desc: pipeline.act, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-500/30' },
    { num: 5, title: 'LEARN', desc: pipeline.learn, color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300 dark:border-purple-500/30' },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl relative overflow-hidden backdrop-blur-sm">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              Explainable Agricultural Decision Engine
              <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Track 4 Kisan Alert
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Autonomous agronomic reasoning pipeline evaluated every telemetry packet
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-3 py-1 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Mode: {device?.mode || 'AUTO'}
          </span>
        </div>
      </div>

      {/* 5-Step Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {steps.map((step) => (
          <div 
            key={step.num}
            className={`rounded-xl bg-slate-50 dark:bg-slate-950/40 p-4 border ${step.border} flex flex-col justify-between hover:bg-slate-100 dark:hover:bg-slate-950/70 transition shadow-sm dark:shadow-none`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-black tracking-widest uppercase ${step.color}`}>
                  {step.num}. {step.title}
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {step.desc}
              </p>
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Stage {step.num} of 5</span>
              <CheckCircle2 size={12} className="text-emerald-500 dark:text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Rationale Footer */}
      <div className="mt-4 pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs text-slate-700 dark:text-slate-400 gap-2 bg-slate-50 dark:bg-slate-950/30 p-3 rounded-xl border border-slate-200 dark:border-slate-800/50">
        <div className="flex items-center gap-2">
          <Sparkles size={15} className="text-amber-500 dark:text-amber-400 flex-shrink-0" />
          <span>
            <strong className="text-slate-900 dark:text-slate-200">Current AI Recommendation: </strong>
            {decision?.reason || 'Soil moisture is optimal. Standby.'}
          </span>
        </div>
        <span className="text-slate-500 text-[11px] font-mono whitespace-nowrap">
          Drying Velocity: ~{decision?.dryingRatePerHour || 1.8}%/hr
        </span>
      </div>
    </div>
  );
}
