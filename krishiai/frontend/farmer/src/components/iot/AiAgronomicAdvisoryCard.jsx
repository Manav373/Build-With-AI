import React, { useState } from 'react';
import { 
  Sprout, 
  CloudRain, 
  Zap, 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar, 
  Edit3, 
  Clock, 
  Layers, 
  ChevronRight,
  TrendingDown,
  TrendingUp,
  Sparkles,
  Droplet
} from 'lucide-react';
import { getDailyHistory } from '../../services/iotHistoryService';

export default function AiAgronomicAdvisoryCard({ 
  decision, 
  telemetry, 
  cropProfile, 
  onEditCrop,
  onStartPump
}) {
  const history = getDailyHistory();
  const [showFullHistory, setShowFullHistory] = useState(false);

  const crop = decision?.crop || {
    name: 'Wheat (HD-2967)',
    icon: '🌾',
    stage: 'Crown Root Initiation (CRI)',
    stageAdvice: 'Water critical period for ear-bearing tillers.',
    criticalMoisture: 28,
    targetMoisture: 65
  };

  const rainHistory = decision?.rainHistory || { hadRain: false, yesterdayRained: false, totalRainMm: 0 };
  const yesterdayRained = rainHistory.yesterdayRained;
  const isPumpActive = Boolean(telemetry?.pump);
  const isRaining = Boolean(telemetry?.rain);

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 p-6 md:p-7 shadow-xl backdrop-blur-sm relative overflow-hidden space-y-6">
      {/* Glow background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Crop Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800/60 flex items-center justify-center text-3xl shadow-sm">
            {crop.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {crop.name}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                {crop.stage}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Soil: <strong className="text-slate-700 dark:text-slate-300">{cropProfile?.soilType || 'Loamy Alluvial'}</strong> • Field: <strong className="text-slate-700 dark:text-slate-300">{cropProfile?.fieldAreaAcres || 2.5} Acres</strong>
            </p>
          </div>
        </div>

        <button
          onClick={onEditCrop}
          className="py-2 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Edit3 size={14} />
          <span>Edit Crop & Stage</span>
        </button>
      </div>

      {/* AI Intelligence Cards Grid (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Multi-Day Rain Analysis */}
        <div className={`p-4 rounded-2xl border transition-all ${
          yesterdayRained || isRaining
            ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-500/40 shadow-sm'
            : 'bg-slate-50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800/80'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <CloudRain size={15} />
              Recent Rain Analysis
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              yesterdayRained 
                ? 'bg-blue-500 text-white border-blue-400' 
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}>
              {yesterdayRained ? '🌧️ RAIN YESTERDAY' : 'CLEAR (NO RECENT RAIN)'}
            </span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {yesterdayRained ? (
              <>
                <strong>{rainHistory.totalRainMm} mm</strong> of precipitation was recorded yesterday. Surface capillary moisture is actively replenishing root depth. 
                <span className="block mt-1 text-blue-700 dark:text-blue-300 font-semibold">
                  ✓ Action: Artificial pump activation suspended to prevent root rot & chlorosis.
                </span>
              </>
            ) : isRaining ? (
              <span className="text-blue-700 dark:text-blue-300 font-bold">
                Active precipitation in progress. Pump locked out by safety interlock.
              </span>
            ) : (
              <>
                No precipitation recorded in the last 48 hours. Transpiration is relying entirely on stored soil water and irrigation.
              </>
            )}
          </p>
        </div>

        {/* Card 2: AI Pump Timing & Scheduling */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <Zap size={15} />
                Smart Pump Scheduling
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                {isPumpActive ? 'RUNNING' : 'SCHEDULE READY'}
              </span>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mb-2">
              {decision?.reason || 'Soil moisture is optimal for current stage.'}
            </p>

            {decision?.recommendedPumpWindow && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-900 dark:text-emerald-200 font-medium">
                <strong className="block text-[10px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Recommended Pump Window:
                </strong>
                {decision.recommendedPumpWindow}
              </div>
            )}
          </div>

          {!isPumpActive && !isRaining && (
            <div className="pt-3">
              <button
                onClick={() => onStartPump && onStartPump()}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
              >
                <Droplet size={13} />
                <span>Turn Pump ON Now</span>
              </button>
            </div>
          )}
        </div>

        {/* Card 3: Stage-Specific Fertilizer Advisory */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
              <FlaskConical size={15} />
              Fertilizer & NPK Advisory
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
              {crop.stage.split(' ')[0]} Stage
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200/70 dark:border-purple-800/50 mb-2">
            <span className="text-[10px] font-bold text-purple-800 dark:text-purple-300 uppercase tracking-wider block mb-0.5">
              Recommended Action:
            </span>
            <p className="text-xs text-purple-950 dark:text-purple-100 leading-snug font-medium">
              {decision?.fertilizerAdvice || 'Apply balanced NPK at active irrigation window.'}
            </p>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            {yesterdayRained 
              ? '⚠️ Post-Rain Warning: Saturated soil reduces root respiration. Delay granular urea top-dress by 24 hours.' 
              : 'Fertigate alongside early morning irrigation for 40% higher nutrient uptake.'}
          </p>
        </div>
      </div>

      {/* Disease Risk Alert Banner if active */}
      {decision?.isFungalRisk && (
        <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 flex items-start gap-3 text-amber-800 dark:text-amber-200 text-xs">
          <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">Agronomic Warning: Elevated Fungal / Microclimate Risk</strong>
            <span>{decision.diseaseWarning}</span>
          </div>
        </div>
      )}

      {/* Day-by-Day Historical Telemetry Timeline */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-emerald-600 dark:text-emerald-400" />
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              7-Day Historical Agronomic Log
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Automatically captured from daily live packets
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {history.map((day, idx) => (
            <div 
              key={day.date}
              className={`p-3 rounded-2xl border transition-all ${
                day.daysAgo === 0 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/60 ring-2 ring-emerald-500/30' 
                  : day.hadRain 
                    ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700/50' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {day.label}
                </span>
                {day.hadRain ? (
                  <span className="text-xs" title={`${day.rainfallMm}mm rain`}>🌧️</span>
                ) : (
                  <span className="text-[10px] text-slate-400 font-mono">{day.temperature}°</span>
                )}
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between items-baseline font-mono">
                  <span className="text-slate-500 text-[10px]">Moisture:</span>
                  <strong className={day.moisture < crop.criticalMoisture ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>
                    {day.moisture}%
                  </strong>
                </div>

                <div className="flex justify-between items-baseline font-mono text-[10px] text-slate-500">
                  <span>Rain:</span>
                  <span>{day.hadRain ? `${day.rainfallMm}mm` : 'None'}</span>
                </div>

                <div className="flex justify-between items-baseline font-mono text-[10px] text-slate-500">
                  <span>Pump:</span>
                  <span>{day.pumpMinutes > 0 ? `${day.pumpMinutes}m` : '0m'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
