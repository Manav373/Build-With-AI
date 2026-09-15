import React from 'react';
import { 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Sun, 
  Moon, 
  Zap, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export default function SensorCards({ telemetry, device, onOpenPumpModal, onEmergencyStop }) {
  const moisture = telemetry?.soilMoisture ?? 0;
  const rawAdc = telemetry?.soilRaw ?? 2450;
  const tempC = telemetry?.temperature ?? 28;
  const tempF = Number(((tempC * 9) / 5 + 32).toFixed(1));
  const humidity = telemetry?.humidity ?? 60;
  const isRaining = Boolean(telemetry?.rain);
  const isDaylight = Boolean(telemetry?.light);
  const isPumpActive = Boolean(telemetry?.pump);

  // Soil status badge logic
  const getSoilBadge = (val) => {
    if (val < 25) return { label: 'CRITICAL DRY (<25%)', bg: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30' };
    if (val < 40) return { label: 'DEFICIT (25–39%)', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' };
    if (val < 70) return { label: 'OPTIMAL (40–69%)', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' };
    return { label: 'SATURATED (70–100%)', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' };
  };

  const soilBadge = getSoilBadge(moisture);

  // Dew point calculation
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * tempC) / (b + tempC)) + Math.log(humidity / 100.0);
  const dewPoint = ((b * alpha) / (a - alpha)).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* 1. SOIL MOISTURE */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-lg hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Droplet size={15} className="text-emerald-500 dark:text-emerald-400" />
            Capacitive Soil Moisture
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${soilBadge.bg}`}>
            {soilBadge.label}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{moisture}%</span>
          <span className="text-xs text-slate-500 font-mono">({rawAdc} ADC)</span>
        </div>

        {/* Moisture progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-200 dark:border-slate-700/50">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              moisture < 25 ? 'bg-gradient-to-r from-red-500 to-amber-500' :
              moisture < 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              moisture < 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              'bg-gradient-to-r from-teal-400 to-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(5, moisture))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Dry Limit: 3200</span>
          <span>Target: 65%</span>
          <span>Wet Limit: 1400</span>
        </div>
      </div>

      {/* 2. AMBIENT TEMPERATURE */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-lg hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Thermometer size={15} className="text-amber-500 dark:text-amber-400" />
            Field Temperature (DHT11)
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {tempF}°F
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{tempC}°C</span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center font-medium">
            <ArrowUpRight size={14} /> Normal
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-3">
          {tempC > 35 ? '⚠️ High heat stress on crops' : tempC < 15 ? '❄️ Low temperature alert' : 'Optimal diurnal vegetative range'}
        </p>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Heat Index: {tempC}°C</span>
          <span>Sensor: GPIO 25</span>
        </div>
      </div>

      {/* 3. RELATIVE HUMIDITY */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-lg hover:border-cyan-500/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Activity size={15} className="text-cyan-500 dark:text-cyan-400" />
            Air Humidity & Dew
          </span>
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
            Dew: {dewPoint}°C
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-4xl font-extrabold text-slate-900 dark:text-white font-mono">{humidity}%</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">RH</span>
        </div>

        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3 p-0.5 border border-slate-200 dark:border-slate-700/50">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(5, humidity))}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>VPD: Good</span>
          <span>Fungal Risk: {humidity > 80 ? 'High' : 'Low'}</span>
        </div>
      </div>

      {/* 4. RAIN SENSOR (FC-37) */}
      <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm dark:shadow-lg transition-all border ${
        isRaining 
          ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-400 dark:border-blue-500/60 ring-2 ring-blue-500/30' 
          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-blue-500/40'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CloudRain size={15} className="text-blue-500 dark:text-blue-400" />
            Rain Detector (FC-37)
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isRaining ? 'bg-blue-500 text-white animate-pulse border-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}>
            {isRaining ? '🌧️ RAIN DETECTED' : 'CLEAR / NO RAIN'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-2xl font-bold font-mono ${isRaining ? 'text-blue-600 dark:text-blue-300' : 'text-slate-900 dark:text-slate-200'}`}>
            {isRaining ? 'Precipitation Active' : 'No Rain'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          {isRaining 
            ? 'Safety Interlock Engaged: Pump strictly locked to protect crops.' 
            : 'Natural evaporation ongoing. Normal irrigation permitted.'}
        </p>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Pin: GPIO 27</span>
          <span>Interlock: Active</span>
        </div>
      </div>

      {/* 5. LIGHT / DARK DETECTION (HW-072) */}
      <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 shadow-sm dark:shadow-lg hover:border-amber-400/40 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            {isDaylight ? <Sun size={15} className="text-amber-500 dark:text-amber-400" /> : <Moon size={15} className="text-indigo-500 dark:text-indigo-400" />}
            Daylight Sensor (HW-072)
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isDaylight ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30' : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/30'
          }`}>
            {isDaylight ? '☀️ DAYLIGHT' : '🌙 NIGHT / DARK'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {isDaylight ? 'Daytime Cycle' : 'Night Cycle'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
          {isDaylight 
            ? 'Higher solar radiation & transpiration. Evening irrigation yields best water retention.' 
            : 'Minimal solar evaporation. High absorption efficiency.'}
        </p>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Pin: GPIO 34</span>
          <span>Mode: Photodiode Digital</span>
        </div>
      </div>

      {/* 6. IRRIGATION PUMP MODULE */}
      <div className={`relative overflow-hidden rounded-2xl p-5 shadow-sm dark:shadow-lg transition-all border ${
        isPumpActive 
          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-500/60 ring-2 ring-emerald-500/30' 
          : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80 hover:border-emerald-500/40'
      }`}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap size={15} className={isPumpActive ? 'text-emerald-500 dark:text-emerald-400 animate-bounce' : 'text-slate-400'} />
            Relay Pump Actuator
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            isPumpActive ? 'bg-emerald-500 text-white animate-pulse border-emerald-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
          }`}>
            {isPumpActive ? '● PUMP ON' : '○ PUMP OFF'}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className={`text-2xl font-bold font-mono ${isPumpActive ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-900 dark:text-slate-200'}`}>
            {isPumpActive ? 'Dispensing Water' : 'Standby Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          {isPumpActive ? (
            <button
              onClick={onEmergencyStop}
              className="flex-1 py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-lg shadow-red-600/30"
            >
              <AlertCircle size={14} /> EMERGENCY STOP
            </button>
          ) : (
            <button
              onClick={onOpenPumpModal}
              disabled={isRaining}
              className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white text-xs font-bold transition flex items-center justify-center gap-1 shadow-md shadow-emerald-600/20"
            >
              <Droplet size={14} /> START IRRIGATION
            </button>
          )}
        </div>

        <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>Relay: GPIO 26</span>
          <span>Cutoff: {device?.settings?.autoMaxDurationMinutes || 15}m max</span>
        </div>
      </div>
    </div>
  );
}
