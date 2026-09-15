import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { BarChart2, Droplet, Thermometer, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export default function AnalyticsCharts({ telemetry }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [metric, setMetric] = useState('moisture'); // 'moisture' | 'temp' | 'humidity'
  const [range, setRange] = useState('24h');

  const baseMoisture = telemetry?.soilMoisture ?? 40;
  const baseTemp = telemetry?.temperature ?? 28;
  const baseHumidity = telemetry?.humidity ?? 62;

  // Generate 12 historical data points
  const data = [
    { time: '00:00', moisture: Math.max(15, baseMoisture - 6), temp: baseTemp - 2.5, humidity: baseHumidity + 6 },
    { time: '02:00', moisture: Math.max(15, baseMoisture - 7), temp: baseTemp - 3.2, humidity: baseHumidity + 8 },
    { time: '04:00', moisture: Math.max(15, baseMoisture - 8), temp: baseTemp - 3.8, humidity: baseHumidity + 10 },
    { time: '06:00', moisture: Math.max(15, baseMoisture - 9), temp: baseTemp - 2.0, humidity: baseHumidity + 4 },
    { time: '08:00', moisture: Math.max(15, baseMoisture + 18), temp: baseTemp - 0.5, humidity: baseHumidity - 2 },
    { time: '10:00', moisture: Math.max(15, baseMoisture + 14), temp: baseTemp + 1.8, humidity: baseHumidity - 6 },
    { time: '12:00', moisture: Math.max(15, baseMoisture + 8), temp: baseTemp + 3.5, humidity: baseHumidity - 10 },
    { time: '14:00', moisture: Math.max(15, baseMoisture + 4), temp: baseTemp + 4.2, humidity: baseHumidity - 12 },
    { time: '16:00', moisture: Math.max(15, baseMoisture + 2), temp: baseTemp + 2.8, humidity: baseHumidity - 8 },
    { time: '18:00', moisture: Math.max(15, baseMoisture), temp: baseTemp + 0.5, humidity: baseHumidity - 2 },
    { time: '20:00', moisture: Math.max(15, baseMoisture - 2), temp: baseTemp - 1.0, humidity: baseHumidity + 2 },
    { time: 'Now', moisture: baseMoisture, temp: baseTemp, humidity: baseHumidity },
  ];

  const getMetricConfig = () => {
    switch (metric) {
      case 'temp':
        return {
          label: 'Field Temperature (°C)',
          color: '#f59e0b',
          gradient: 'colorTemp',
          unit: '°C',
          domain: [15, 45]
        };
      case 'humidity':
        return {
          label: 'Relative Humidity (%)',
          color: '#06b6d4',
          gradient: 'colorHum',
          unit: '%',
          domain: [20, 100]
        };
      default:
        return {
          label: 'Soil Moisture (%)',
          color: '#10b981',
          gradient: 'colorMoist',
          unit: '%',
          domain: [0, 100]
        };
    }
  };

  const current = getMetricConfig();

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart2 size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Historical Telemetry Trends</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Time-series sensor telemetry & diurnal curves</p>
          </div>
        </div>

        {/* Metric Selector & Range */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setMetric('moisture')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                metric === 'moisture' 
                  ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Droplet size={12} /> Soil
            </button>
            <button
              onClick={() => setMetric('temp')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                metric === 'temp' 
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Thermometer size={12} /> Temp
            </button>
            <button
              onClick={() => setMetric('humidity')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                metric === 'humidity' 
                  ? 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Activity size={12} /> Hum
            </button>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            {['1h', '6h', '24h', '7d'].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition ${
                  range === r 
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id={current.gradient} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={current.color} stopOpacity={0.4} />
                <stop offset="95%" stopColor={current.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#e2e8f0'} />
            <XAxis dataKey="time" stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
            <YAxis domain={current.domain} stroke={isDark ? '#64748b' : '#94a3b8'} fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#0f172a' : '#ffffff',
                borderColor: isDark ? '#334155' : '#cbd5e1',
                borderRadius: '12px',
                fontSize: '12px',
                color: isDark ? '#fff' : '#0f172a',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(val) => [`${val}${current.unit}`, current.label]}
            />
            <Area
              type="monotone"
              dataKey={metric}
              stroke={current.color}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${current.gradient})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
