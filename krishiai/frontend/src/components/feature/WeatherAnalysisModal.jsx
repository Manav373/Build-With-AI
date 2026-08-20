import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CloudLightning, Thermometer, Droplets, Wind, 
  Calendar, TrendingUp, AlertCircle, Zap, ArrowRight,
  Sun, CloudRain, BarChart3, Info
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const WeatherAnalysisModal = ({ isOpen, onClose, data, locationName }) => {
  const { theme } = useTheme();

  const [selectedPoint, setSelectedPoint] = React.useState(null);

  if (!isOpen) return null;

  // Generate realistic 14-day data (7 past, 1 current, 7 future)
  const baseTemp = data?.temperature || 32;
  const insights = [
    "Stable thermal conditions expected.",
    "Potential heatwave build-up detected.",
    "Unusual humidity spike—check for fungal risk.",
    "Optimal conditions for pesticide application.",
    "Peak temperature reach—critical irrigation required.",
    "Cooling trend starts—slight relief for crops.",
    "Sudden wind velocity increase—monitor tall crops."
  ];

  const trendData = Array.from({ length: 15 }, (_, i) => {
    const day = i - 7; // -7 to +7
    const variance = Math.sin(day * 0.5) * 3 + (Math.random() * 2);
    return {
      day: day === 0 ? 'Today' : (day > 0 ? `+${day}d` : `${day}d`),
      temp: parseFloat((baseTemp + variance).toFixed(1)),
      humidity: Math.round(data?.humidity + (Math.sin(day * 0.8) * 10)),
      isFuture: day > 0,
      isToday: day === 0,
      aiInsight: insights[Math.abs(day) % insights.length]
    };
  });

  const maxTemp = Math.max(...trendData.map(d => d.temp));
  const minTemp = Math.min(...trendData.map(d => d.temp));
  const range = maxTemp - minTemp;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020617]/95 backdrop-blur-2xl"
        />

        {/* Modal Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 50 }}
          className={`relative w-full max-w-5xl h-[85vh] overflow-hidden rounded-[2.5rem] border shadow-[0_0_100px_rgba(59,130,246,0.15)] flex flex-col ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#0a0f18] border-white/10'
          }`}
        >
          {/* Header */}
          <div className="p-6 sm:p-10 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-blue-600/10 to-transparent">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/30 text-white">
                <CloudLightning size={28} className="animate-pulse" />
              </div>
              <div>
                <h2 className={`text-2xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Climate Intelligence <span className="text-blue-500">Suite</span>
                </h2>
                <p className={`text-[0.7rem] font-bold tracking-widest uppercase opacity-40 ${theme === 'light' ? 'text-slate-500' : 'text-white'}`}>
                  {locationName} • Tactical Orbital Analysis • v2.4-PRO
                </p>
              </div>
            </div>
            <button onClick={onClose} className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${theme === 'light' ? 'bg-slate-100 hover:bg-slate-200 text-slate-600' : 'bg-white/5 hover:bg-white/10 text-white/40'}`}>
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-10 no-scrollbar">
            
            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
               {[
                 { icon: <Thermometer size={20}/>, label: 'Avg Temp', value: `${baseTemp}°C`, sub: 'Peak Summer', color: 'text-orange-400', bg: 'bg-orange-500/5' },
                 { icon: <Droplets size={20}/>, label: 'Humidity', value: `${data?.humidity}%`, sub: 'Dry Heat', color: 'text-blue-400', bg: 'bg-blue-500/5' },
                 { icon: <Wind size={20}/>, label: 'Wind Velocity', value: '14km/h', sub: 'North-East', color: 'text-cyan-400', bg: 'bg-cyan-500/5' },
                 { icon: <Calendar size={20}/>, label: 'Heat Duration', value: '18 Days', sub: 'Above 40°C', color: 'text-amber-400', bg: 'bg-amber-500/5' },
               ].map((stat, i) => (
                 <div key={i} className={`p-6 rounded-[2rem] border transition-all hover:scale-[1.02] ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/5 border-white/5'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                    <p className={`text-[0.65rem] font-bold uppercase opacity-40 mb-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{stat.label}</p>
                    <p className={`text-xl font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{stat.value}</p>
                    <p className="text-[0.6rem] font-black text-emerald-500 mt-1">{stat.sub}</p>
                 </div>
               ))}
            </div>

            {/* Prediction Graph Section */}
            <div className={`p-8 sm:p-10 rounded-[2.5rem] border relative overflow-hidden ${theme === 'light' ? 'bg-slate-50 border-slate-100' : 'bg-white/[0.02] border-white/5'}`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-10">
                <div>
                  <h3 className={`text-lg font-black flex items-center gap-3 ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500"><TrendingUp size={20} /></div>
                    14-Day Thermal Progression
                  </h3>
                  <p className={`text-[0.7rem] font-bold uppercase mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Click any data point for Deep AI Analysis</p>
                </div>
                <div className="flex gap-6">
                  <div className={`flex items-center gap-2 text-[0.65rem] font-black ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>
                    <div className={`w-3 h-3 rounded-full ${theme === 'light' ? 'bg-slate-300' : 'bg-blue-500/20'}`} /> HISTORY
                  </div>
                  <div className={`flex items-center gap-2 text-[0.65rem] font-black ${theme === 'light' ? 'text-blue-500' : 'text-white/50'}`}>
                    <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" /> FORECAST
                  </div>
                </div>
              </div>

              {/* Custom SVG Graph */}
              <div className="relative h-64 w-full group select-none">
                <svg viewBox="0 0 1400 250" className="w-full h-full preserve-3d overflow-visible">
                   {/* Grid Lines */}
                   {[0, 1, 2, 3].map(i => (
                     <line key={i} x1="0" y1={i * 80} x2="1400" y2={i * 80} stroke={theme === 'light' ? '#cbd5e1' : 'currentColor'} strokeWidth="1" strokeOpacity={theme === 'light' ? '0.5' : '0.05'} />
                   ))}

                   {/* Today Line */}
                   <line x1="700" y1="0" x2="700" y2="250" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 6" strokeOpacity="0.5" />
                   
                   {/* Area Fill */}
                   <path 
                     d={`M 0 250 ${trendData.map((d, i) => `L ${i * 100} ${250 - ((d.temp - minTemp) / range) * 200}`).join(' ')} L 1400 250 Z`}
                     fill="url(#graphGradient)"
                     className="transition-all duration-1000 ease-in-out"
                   />

                   {/* Main Line */}
                   <path 
                     d={trendData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 100} ${250 - ((d.temp - minTemp) / range) * 200}`).join(' ')}
                     fill="none"
                     stroke="#3b82f6"
                     strokeWidth="5"
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     className="drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]"
                   />

                   {/* Data Points */}
                   {trendData.map((d, i) => (
                     <g key={i} onClick={() => setSelectedPoint(d)} className="cursor-pointer group/point">
                       <circle 
                         cx={i * 100} 
                         cy={250 - ((d.temp - minTemp) / range) * 200} 
                         r={d.isToday ? 8 : 6} 
                         fill={d.isToday ? "#3b82f6" : (selectedPoint?.day === d.day ? "#3b82f6" : (theme === 'light' ? "#fff" : "#0a0f18"))}
                         stroke="#3b82f6"
                         strokeWidth={d.isToday || selectedPoint?.day === d.day ? 4 : 2}
                         className="transition-all hover:r-10"
                       />
                       <text 
                         x={i * 100} 
                         y={280} 
                         textAnchor="middle" 
                         className={`text-[26px] font-black tracking-tighter ${d.isToday ? 'fill-blue-500' : (theme === 'light' ? 'fill-slate-400' : 'fill-white/20')}`}
                       >
                         {d.day}
                       </text>
                     </g>
                   ))}

                   <defs>
                     <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
                       <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                     </linearGradient>
                   </defs>
                </svg>

                {/* Day Insight Overlay */}
                <AnimatePresence>
                  {selectedPoint && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-0 right-0 max-w-[280px] p-5 rounded-2xl bg-blue-600 shadow-2xl text-white z-50"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[0.6rem] font-black uppercase tracking-widest opacity-60">{selectedPoint.day} Analysis</span>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedPoint(null); }} className="p-1 hover:bg-white/20 rounded-lg">
                          <X size={12} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-2xl font-black">{selectedPoint.temp}°C</span>
                          <div className="px-2 py-1 rounded-md bg-white/10 text-[0.6rem] font-bold uppercase">Predicted</div>
                        </div>
                        <p className="text-[0.7rem] leading-relaxed font-bold opacity-90 italic">
                          "{selectedPoint.aiInsight}"
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* AI Analysis Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Zap size={18} />
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      KrishiAI <span className="text-amber-500">Advisory</span>
                    </h3>
                 </div>
                 
                 <div className={`p-6 rounded-[2rem] border relative overflow-hidden ${theme === 'light' ? 'bg-amber-50/50 border-amber-100' : 'bg-amber-500/5 border-amber-500/10'}`}>
                    <div className="relative z-10 space-y-4">
                       <div className="flex items-start gap-3">
                          <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                          <p className={`text-xs font-bold leading-relaxed ${theme === 'light' ? 'text-amber-900/80' : 'text-white/70'}`}>
                            Thermal intensity is expected to peak in the next 72 hours. We detect a high probability of soil moisture depletion below critical levels.
                          </p>
                       </div>
                       <ul className="space-y-3 pl-7">
                          {[
                            'Increase irrigation frequency to twice daily (pre-dawn and sunset).',
                            'Apply organic mulch to maintain root zone temperature.',
                            'Monitor for heat-stress induced pest migration.'
                          ].map((tip, i) => (
                            <li key={i} className={`flex items-center gap-2 text-[0.65rem] font-medium italic ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>
                               <ArrowRight size={10} className="text-amber-500" /> {tip}
                            </li>
                          ))}
                       </ul>
                    </div>
                 </div>
               </div>

               <div className="space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <BarChart3 size={18} />
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                      Environmental <span className="text-indigo-500">Summary</span>
                    </h3>
                 </div>
                 
                 <div className={`p-6 rounded-[2rem] border ${theme === 'light' ? 'bg-slate-50 border-slate-100 shadow-sm' : 'premium-glass'}`}>
                    <div className="space-y-4">
                       {[
                         { icon: <Sun size={14}/>, label: 'UV Index', value: '9.2', status: 'Very High', color: 'text-orange-400' },
                         { icon: <CloudRain size={14}/>, label: 'Evaporation', value: '8.4mm/d', status: 'Accelerated', color: 'text-indigo-400' },
                         { icon: <Info size={14}/>, label: 'Soil Health', value: 'Grade B+', status: 'Balanced', color: 'text-emerald-400' }
                       ].map((item, i) => (
                         <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                            <div className="flex items-center gap-3">
                               <div className={item.color}>{item.icon}</div>
                               <span className={`text-[0.65rem] font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/40'}`}>{item.label}</span>
                            </div>
                            <div className="text-right">
                               <p className={`text-xs font-black ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.value}</p>
                               <p className={`text-[0.55rem] font-bold ${item.color} uppercase`}>{item.status}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               </div>
            </div>

            {/* Footer Insight */}
            <div className={`p-4 rounded-2xl border text-center ${theme === 'light' ? 'bg-slate-50 border-slate-100 text-slate-400' : 'bg-white/5 border-white/5 text-white/20'}`}>
               <p className="text-[0.55rem] font-bold tracking-widest uppercase italic">
                 Powered by KrishiAI Deep-Climate Analysis Engine • Last Orbital Pass: 14m ago
               </p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WeatherAnalysisModal;
