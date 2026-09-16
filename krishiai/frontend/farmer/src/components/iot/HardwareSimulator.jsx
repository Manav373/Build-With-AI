import React from 'react';
import { 
  X, 
  Sliders, 
  Droplet, 
  Thermometer, 
  Activity, 
  CloudRain, 
  Sun, 
  Moon, 
  Wifi, 
  WifiOff, 
  Sparkles,
  RotateCcw
} from 'lucide-react';

export default function HardwareSimulator({ 
  isOpen, 
  onClose, 
  telemetry, 
  onUpdateTelemetry,
  device
}) {
  if (!isOpen) return null;

  const moisture = telemetry?.soilMoisture ?? 35;
  const temp = telemetry?.temperature ?? 28;
  const humidity = telemetry?.humidity ?? 60;
  const rain = Boolean(telemetry?.rain);
  const light = Boolean(telemetry?.light);
  const isOnline = device?.status === 'online';

  // Calculate simulated raw ADC from percent
  const dryAdc = device?.settings?.soilDryAdc || 2300;
  const wetAdc = device?.settings?.soilWetAdc || 1200;
  const calculatedAdc = Math.round(dryAdc - ((dryAdc - wetAdc) * (moisture / 100)));

  // Presets
  const applyPreset = (preset) => {
    switch (preset) {
      case 'DRY':
        onUpdateTelemetry({
          ...telemetry,
          soilMoisture: 10,
          soilRaw: 2200,
          rain: false,
          temperature: 32.5,
          humidity: 42
        });
        break;
      case 'RAIN':
        onUpdateTelemetry({
          ...telemetry,
          rain: true,
          humidity: 88,
          temperature: 24.0
        });
        break;
      case 'OPTIMAL':
        onUpdateTelemetry({
          ...telemetry,
          soilMoisture: 55,
          soilRaw: 1695,
          rain: false,
          temperature: 27.5,
          humidity: 62
        });
        break;
      case 'SATURATED':
        onUpdateTelemetry({
          ...telemetry,
          soilMoisture: 85,
          soilRaw: 1365,
          rain: false,
          humidity: 78
        });
        break;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 shadow-2xl overflow-y-auto text-slate-900 dark:text-white flex flex-col justify-between transition-colors">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold">Hardware Signal Simulator</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Emulate real ESP32 analog & digital inputs</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Test Presets */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">
            1-Click Agricultural Scenarios
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyPreset('DRY')}
              className="py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-700 dark:text-red-300 text-xs font-bold transition text-left"
            >
              🚨 Critical Dry (18%)
              <span className="block text-[10px] text-red-600/80 dark:text-red-400/80 font-normal">Triggers Auto Irrigation</span>
            </button>
            <button
              onClick={() => applyPreset('RAIN')}
              className="py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-300 text-xs font-bold transition text-left"
            >
              🌧️ Rain Active (FC-37)
              <span className="block text-[10px] text-blue-600/80 dark:text-blue-400/80 font-normal">Engages Safety Interlock</span>
            </button>
            <button
              onClick={() => applyPreset('OPTIMAL')}
              className="py-2 px-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition text-left"
            >
              🌾 Optimal Field (55%)
              <span className="block text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-normal">Stable Standby State</span>
            </button>
            <button
              onClick={() => applyPreset('SATURATED')}
              className="py-2 px-3 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-bold transition text-left"
            >
              💧 Saturated (85%)
              <span className="block text-[10px] text-cyan-600/80 dark:text-cyan-400/80 font-normal">Max Soil Hydration</span>
            </button>
          </div>
        </div>

        {/* Sliders & Toggles */}
        <div className="space-y-5">
          {/* 1. Soil Moisture */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Droplet size={14} className="text-emerald-600 dark:text-emerald-400" />
                Soil Moisture (GPIO 5)
              </span>
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {moisture}% ({calculatedAdc} ADC)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={moisture}
              onChange={(e) => {
                const val = Number(e.target.value);
                const adc = Math.round(dryAdc - ((dryAdc - wetAdc) * (val / 100)));
                onUpdateTelemetry({ ...telemetry, soilMoisture: val, soilRaw: adc });
              }}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>0% (Bone Dry)</span>
              <span>25% (Wilting)</span>
              <span>100% (Wet)</span>
            </div>
          </div>

          {/* 2. Temperature */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Thermometer size={14} className="text-amber-600 dark:text-amber-400" />
                Ambient Temp (DHT11 GPIO 25)
              </span>
              <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">{temp}°C</span>
            </div>
            <input
              type="range"
              min="10"
              max="48"
              step="0.5"
              value={temp}
              onChange={(e) => onUpdateTelemetry({ ...telemetry, temperature: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
              <span>10°C (Cold)</span>
              <span>28°C (Ideal)</span>
              <span>48°C (Extreme)</span>
            </div>
          </div>

          {/* 3. Humidity */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Activity size={14} className="text-cyan-600 dark:text-cyan-400" />
                Relative Humidity (DHT11)
              </span>
              <span className="text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400">{humidity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="100"
              value={humidity}
              onChange={(e) => onUpdateTelemetry({ ...telemetry, humidity: Number(e.target.value) })}
              className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
          </div>

          {/* 4. Rain & Daylight Toggles */}
          <div className="grid grid-cols-2 gap-3">
            {/* Rain Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                <CloudRain size={14} className="text-blue-500 dark:text-blue-400" />
                Rain Sensor
              </span>
              <button
                onClick={() => onUpdateTelemetry({ ...telemetry, rain: !rain })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  rain 
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm' 
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {rain ? '🌧️ RAIN (LOW)' : '☀️ NO RAIN'}
              </button>
            </div>

            {/* Daylight Toggle */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                {light ? <Sun size={14} className="text-amber-500 dark:text-amber-400" /> : <Moon size={15} className="text-indigo-500 dark:text-indigo-400" />}
                Day/Night (HW-072)
              </span>
              <button
                onClick={() => onUpdateTelemetry({ ...telemetry, light: !light })}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                  light 
                    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-500/50' 
                    : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-500/50'
                }`}
              >
                {light ? '☀️ DAYLIGHT' : '🌙 NIGHT'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
        <button
          onClick={() => applyPreset('OPTIMAL')}
          className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700"
        >
          <RotateCcw size={14} /> Reset to Default Field Baseline
        </button>
      </div>
    </div>
  );
}
