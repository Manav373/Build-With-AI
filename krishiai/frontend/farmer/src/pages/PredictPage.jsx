import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp, Leaf, Thermometer, Droplets, Wind,
  FlaskConical, Zap, AlertCircle, CheckCircle,
  Mic, MicOff, Info, MessageSquare, Download,
  BarChart2, Activity, Target, RefreshCw, ChevronDown, MapPin, Menu
} from 'lucide-react';
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine
} from 'recharts';
import { predictYield, resolveLocationBackend } from '../services/api';
import '../styles/FormElements.css';
import { useChat } from '../context/ChatContext';
import { translations } from '../utils/translations/index';
import { useAuth } from '@clerk/clerk-react';
import mlData from '../utils/mlData.json';
import { useLocation } from '../context/LocationContext';
import { useMobileMenu } from '../context/MobileMenuContext';

const DISTRICTS = mlData.districts;
const SEASONS = mlData.seasons;
const CROPS = mlData.crops;
const CURRENT_YEAR = new Date().getFullYear();

/* ─── constants ─────────────────────────────────────────── */
// CROPS defined from mlData.json above

const CROP_EMOJIS = {
  // Fruits
  Apple: '🍎', Banana: '🍌', Mango: '🥭', Grapes: '🍇', Watermelon: '🍉', 'Water Melon': '🍉',
  Muskmelon: '🍈', Orange: '🍊', Papaya: '🍈', Coconut: '🥥', Pomegranate: '🍎',
  'Pome Granet': '🍎', 'Pome Fruit': '🍎', Guava: '🍐', Peach: '🍑', Pear: '🍐',
  Pineapple: '🍍', Plums: '🍑', Ber: '🍒', Litchi: '🍒', Sapota: '🥔',
  'Other Fresh Fruits': '🍎', 'Other Dry Fruit': '🥜', 'Other Citrus Fruit': '🍊', 'Citrus Fruit': '🍊',

  // Staples
  Wheat: '🌿', Rice: '🌾', Paddy: '🌾', Maize: '🌽', Bajra: '🌾', Barley: '🌾',
  Jowar: '🌾', Ragi: '🌾', Korra: '🌾', Samai: '🌾', Varagu: '🌾',
  'Small Millets': '🌾', 'Other Cereals & Millets': '🌾', 'Total Foodgrain': '🌾',

  // Pulses
  Gram: '🧆', Chickpea: '🧆', 'Arhar/Tur': '🥘', Masoor: '🥘', Lentil: '🥘',
  Urad: '🫘', Moong: '🫘', 'Moong(Green Gram)': '🫘', Blackgram: '🫘',
  'Horse-Gram': '🫘', 'Cowpea(Lobia)': '🫘', Kidneybeans: '🫘', Pigeonpeas: '🌱',
  Mothbeans: '🌱', Moth: '🫘', Khesari: '🧆', 'Lab-Lab': '🫘',
  'Ricebean (Nagadal)': '🫘', 'Rajmash Kholar': '🫘', 'Peas & Beans (Pulses)': '🫘',
  'Other Rabi Pulses': '🧆', 'Other  Rabi Pulses': '🧆', 'Other Kharif Pulses': '🧆',
  'Other Misc. Pulses': '🧆', 'Pulses Total': '🥘',

  // Vegetables
  Potato: '🥔', Tomato: '🍅', Onion: '🧅', Garlic: '🧄', Brinjal: '🍆',
  Chilli: '🌶️', 'Dry Chillies': '🌶️', Bhindi: '🥒', Cabbage: '🥬', Cauliflower: '🥦',
  Carrot: '🥕', Redish: '🥕', Turnip: '🥕', 'Sweet Potato': '🍠', Tapioca: '🍠',
  Yam: '🍠', Colocosia: '🍠', 'Ash Gourd': '🍈', 'Bottle Gourd': '🥒', 'Bitter Gourd': '🥒',
  Cucumber: '🥒', 'Pump Kin': '🎃', 'Snak Guard': '🥒', 'Ribed Guard': '🥒',
  'Drum Stick': '🌿', 'Peas  (Vegetable)': '🫛', 'Beans & Mutter(Vegetable)': '🫛',
  'Other Vegetables': '🥬', 'Beet Root': '🍠',

  // Cash & Industrial
  Sugarcane: '🎋', Cotton: '🌸', 'Cotton(Lint)': '🌸', Kapas: '🌸',
  Jute: '🌾', 'Jute & Mesta': '🌾', Mesta: '🌾', Rubber: '🌳', Tobacco: '🍂',
  Coffee: '☕', Tea: '🍵', 'Other Fibres': '🌾',

  // Spices & Oilseeds
  Turmeric: '🧂', Ginger: '🫚', 'Dry Ginger': '🫚', 'Black Pepper': '🌶️',
  Cardamom: '🌿', Coriander: '🌿', 'Cond-Spcs Other': '🌶️', Soyabean: '🫘',
  Groundnut: '🥜', Sunflower: '🌻', Safflower: '🌻', Linseed: '🌿',
  'Castor Seed': '🫘', 'Niger Seed': '🌿', Sesamum: '🌿', 'Rapeseed &Mustard': '🌼',
  'Oilseeds Total': '🌻', 'Other Oilseeds': '🌻', 'Guar Seed': '🫘',

  // Others
  Arecanut: '🥥', 'Arcanut (Processed)': '🥥', 'Atcanut (Raw)': '🥥',
  Cashewnut: '🥜', 'Cashewnut Raw': '🥜', 'Cashewnut Processed': '🥜',
  'Jobster': '🌾', 'Perilla': '🌿', 'Sannhamp': '🌿'
};

// Typical yield benchmarks from Indian agriculture stats
const CROP_BENCHMARKS = {
  Wheat: 3.5, Rice: 4.0, Maize: 3.0, Cotton: 1.8, Groundnut: 1.5, Bajra: 1.2,
  Banana: 35, Papaya: 40, Coconut: 10, Mango: 8, Grapes: 25, Watermelon: 25,
  Chickpea: 1.0, Lentil: 1.0, Coffee: 1.0, Jute: 2.5, Apple: 10, Orange: 15,
};

const INITIAL_FORM = {
  crop_name: 'Wheat',
  year: CURRENT_YEAR + 1,
  district: 'Pune',
  village: '',
  taluka: '',
  season: 'Kharif',
  temperature: 28, rainfall: 600, humidity: 65,
  soil_ph: 6.8, nitrogen: 40, phosphorus: 35, potassium: 50, ndvi: 0.65
};

const FIELD_CONFIG = [
  { key: 'temperature', label: 'Temperature (°C)', min: 0, max: 50, step: 0.1, icon: Thermometer, group: 'WEATHER', color: '#f97316' },
  { key: 'rainfall', label: 'Rainfall (mm)', min: 0, max: 3000, step: 10, icon: Droplets, group: 'WEATHER', color: '#3b82f6' },
  { key: 'humidity', label: 'Humidity (%)', min: 0, max: 100, step: 1, icon: Wind, group: 'WEATHER', color: '#06b6d4' },
  { key: 'soil_ph', label: 'Soil pH', min: 0, max: 14, step: 0.1, icon: FlaskConical, group: 'SOIL', color: '#8b5cf6' },
  { key: 'nitrogen', label: 'Nitrogen (kg/ha)', min: 0, max: 200, step: 1, icon: Zap, group: 'SOIL', color: '#10b981' },
  { key: 'phosphorus', label: 'Phosphorus (kg/ha)', min: 0, max: 200, step: 1, icon: Zap, group: 'SOIL', color: '#f59e0b' },
  { key: 'potassium', label: 'Potassium (kg/ha)', min: 0, max: 200, step: 1, icon: Zap, group: 'SOIL', color: '#ec4899' },
  { key: 'ndvi', label: 'NDVI Index', min: 0, max: 1, step: 0.01, icon: TrendingUp, group: 'VEGETATION', color: '#84cc16' },
];

const RISK_CONFIG = {
  Low: { bg: 'bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-500/30', icon: '✅', glyph: CheckCircle },
  Medium: { bg: 'bg-amber-500/15', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-500/30', icon: '⚠️', glyph: AlertCircle },
  High: { bg: 'bg-red-500/15', text: 'text-red-700 dark:text-red-400', border: 'border-red-500/30', icon: '🔴', glyph: AlertCircle },
};

/* ─── sub-components ─────────────────────────────────────── */

const RiskBadge = ({ risk }) => {
  const cfg = RISK_CONFIG[risk] || RISK_CONFIG.Medium;
  return (
    <span className={`px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-bold flex items-center gap-1.5`}>
      {cfg.icon} {risk} risk
    </span>
  );
};

const MetricCard = ({ label, value, unit, icon, color, sub }) => (
  <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/5 space-y-2 transition-colors">
    <span className="text-[0.6rem] font-bold text-slate-500 dark:text-white/40 font-inter">{label}</span>
    <div className="flex items-end gap-1">
      <span className="text-2xl font-black" style={{ color }}>{value}</span>
      <span className="text-xs font-bold text-slate-500 dark:text-white/30 pb-0.5">{unit}</span>
    </div>
    {sub && <p className="text-[0.6rem] text-slate-500 dark:text-white/30">{sub}</p>}
  </div>
);

/* ── Future Trend Chart ──────────────────────────────────── */
const FutureTrendChart = ({ data, targetYear, currentYear, color = '#10b981' }) => {
  const chartData = data.map(d => ({
    year: d.year,
    yield: d.yield_value,
    lower: d.lower,
    upper: d.upper,
  }));
  
  const isHistory = targetYear <= currentYear;
  const mainColor = isHistory ? '#10b981' : '#8b5cf6'; // Emerald vs Violet
  const bandColor = isHistory ? '#10b981' : '#6366f1';

  return (
    <div className="w-full h-48 relative group">
      <ResponsiveContainer width="100%" height="100%" minHeight={200}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={mainColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={mainColor} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={bandColor} stopOpacity={0.18} />
              <stop offset="95%" stopColor={bandColor} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} vertical={false} />
          <XAxis 
            dataKey="year" 
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false}
          />
          <YAxis 
            tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} 
            axisLine={false} 
            tickLine={false} 
          />
          <Tooltip
            cursor={{ stroke: mainColor, strokeWidth: 1 }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-slate-900 p-2 px-3 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl transition-all duration-300">
                    <p className="text-[0.65rem] font-bold text-slate-500 dark:text-white/40 mb-1">{label}</p>
                    <p className="text-xs font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: mainColor }} />
                      {payload.find(p => p.dataKey === 'yield')?.value} <span className="opacity-50 font-medium">t/ha</span>
                    </p>
                  </div>
                );
              }
              return null;
            }}
            position={{ y: -40 }}
          />
          <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#bandGrad)" fillOpacity={1} />
          <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" fillOpacity={0} />
          <Area 
            type="monotone" 
            dataKey="yield" 
            stroke={mainColor} 
            strokeWidth={3} 
            fill="url(#yieldGrad)" 
            dot={{ fill: mainColor, r: 4, strokeWidth: 2, stroke: '#ffffff' }} 
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#ffffff' }}
          />
          <ReferenceLine x={currentYear} stroke="#d97706" strokeDasharray="4 4" strokeWidth={1.5} label={{ value: isHistory ? '' : 'Today', fill: '#d97706', fontSize: 10, fontWeight: 800 }} />
          <ReferenceLine x={targetYear} stroke={mainColor} strokeDasharray="4 4" strokeWidth={1.5} label={{ value: isHistory ? 'Analysis' : 'Target', fill: mainColor, fontSize: 10, fontWeight: 800 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default function PredictPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { currentChatId, language, processMessage } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const t = translations[language]?.chat?.intelligence || translations.en.chat.intelligence;

  const [form, setForm] = useState(INITIAL_FORM);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [voiceField, setVoiceField] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districtSearch, setDistrictSearch] = useState('');
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [directLocating, setDirectLocating] = useState(false);
  const [notification, setNotification] = useState(null);
  const resultRef = useRef(null);
  const setVal = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), []);

  const { location: detectedLocation, loading: locLoading, refreshLocation } = useLocation();
  const [hasSetLoc, setHasSetLoc] = useState(false);

  useEffect(() => {
    if (detectedLocation.district && !hasSetLoc) {
      setVal('district', detectedLocation.district);
      if (detectedLocation.village) setVal('village', detectedLocation.village);
      if (detectedLocation.taluka) setVal('taluka', detectedLocation.taluka);
      setHasSetLoc(true);
    }
  }, [detectedLocation, hasSetLoc, setVal]);

  const showNotification = (text, type = 'error') => {
    setNotification({ text, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDirectDetect = () => {
    if (!navigator.geolocation) {
      showNotification('Geolocation is not supported by your browser.', 'error');
      return;
    }

    setDirectLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const token = await getToken();
          const res = await resolveLocationBackend(pos.coords.latitude, pos.coords.longitude, token);
          if (res && !res.error && res.district) {
            setVal('district', res.district);
            if (res.village) setVal('village', res.village);
            if (res.taluka) setVal('taluka', res.taluka);
            showNotification(`📍 Detected: ${res.village || res.taluka || res.district}`, 'success');
          } else {
            showNotification('GPS verified, but could not resolve address.', 'info');
          }
        } catch (err) {
          showNotification('Location resolution failed.', 'error');
        } finally {
          setDirectLocating(false);
        }
      },
      async (err) => {
        // GPS failed (Permission Denied / Timeout) — FALLBACK TO BACKEND/IP
        console.warn('[Predict] GPS failed, falling back to IP-based resolution:', err.message);
        try {
          const token = await getToken();
          const res = await resolveLocationBackend(null, null, token); // Use IP
          if (res && !res.error && res.district) {
            setVal('district', res.district);
            if (res.village) setVal('village', res.village);
            if (res.taluka) setVal('taluka', res.taluka);
            showNotification(`📍 Detected: ${res.village || res.taluka || res.district} (via Network)`, 'success');
          } else {
            showNotification('Permission denied and network detection failed.', 'error');
          }
        } catch (err) {
          showNotification('Network location detection failed.', 'error');
        } finally {
          setDirectLocating(false);
        }
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const formatError = (detail) => {
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail)) {
      return detail.map(d => `${d.loc?.[1] || d.type}: ${d.msg}`).join(', ');
    }
    if (typeof detail === 'object' && detail !== null) {
      return JSON.stringify(detail);
    }
    return 'An unknown validation error occurred.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const token = await getToken();
      
      // If Advanced Overrides are hidden, we send nulls to use district-based historical data
      const payload = { ...form };
      if (!showAdvanced) {
        payload.temperature = null;
        payload.rainfall = null;
        payload.humidity = null;
        payload.soil_ph = null;
        payload.nitrogen = null;
        payload.phosphorus = null;
        payload.potassium = null;
        payload.ndvi = null;
      }

      const res = await predictYield(payload, token);
      setResult(res);
      setHistory(h => [{ crop: form.crop_name, params: { ...form }, result: res, ts: new Date().toLocaleTimeString() }, ...h.slice(0, 4)]);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail ? formatError(detail) : 'Failed to connect to ML engine. Check if backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToChat = () => {
    if (!result) return;
    const prompt = `Analyze this yield prediction for ${form.crop_name}:
• Predicted yield: ${result.predicted_yield} t/ha
• Confidence: ${result.confidence}%
• Risk level: ${result.risk_level}
• Conditions: Temp ${form.temperature}°C, Rainfall ${form.rainfall}mm, Humidity ${form.humidity}%, pH ${form.soil_ph}, N:${form.nitrogen} P:${form.phosphorus} K:${form.potassium}
What are key insights and recommendations?`;
    processMessage(prompt, null, null, null, null, currentChatId);
    navigate('/chat');
  };

  const handleVoice = (fieldKey) => {
    const SR = window.webkitSpeechRecognition || window.SpeechRecognition;
    if (!SR) return alert('Voice recognition not supported');
    const recognition = new SR();
    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    setVoiceActive(true); setVoiceField(fieldKey);
    recognition.onresult = (e) => {
      const val = e.results[0][0].transcript.replace(/[^\d.]/g, '');
      if (val) setVal(fieldKey, parseFloat(val));
    };
    recognition.onend = () => { setVoiceActive(false); setVoiceField(null); };
    recognition.start();
  };

  const fieldGroups = useMemo(() => {
    const groups = {};
    FIELD_CONFIG.forEach(f => {
      if (!groups[f.group]) groups[f.group] = [];
      groups[f.group].push(f);
    });
    return groups;
  }, []);

  // Benchmark comparison
  const benchmark = CROP_BENCHMARKS[form.crop_name];
  const vsNational = result && benchmark
    ? ((result.predicted_yield - benchmark) / benchmark * 100).toFixed(1)
    : null;

  // Gauge data for confidence radial chart
  const gaugeData = result ? [{
    name: 'Confidence', value: result.confidence, fill: result.confidence >= 80 ? '#10b981' : result.confidence >= 65 ? '#f59e0b' : '#ef4444'
  }] : [];

  // History comparison data for area chart
  const historyChartData = history.slice().reverse().map((h, i) => ({
    name: `Run ${i + 1}`, yield: parseFloat(h.result.predicted_yield), crop: h.crop
  }));

  return (
    <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-8 pt-4 md:pt-8 pb-4 custom-scrollbar bg-white text-slate-900 dark:bg-[#030905] dark:text-[#e2f0e4]">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8 pb-12">

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 font-bold text-sm ${
                notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 
                notification.type === 'info' ? 'bg-blue-500/20 border-blue-500/40 text-blue-400' :
                'bg-red-500/20 border-red-500/40 text-red-400'
              }`}>
              <div className={`w-2 h-2 rounded-full animate-pulse ${notification.type === 'success' ? 'bg-emerald-400' : notification.type === 'info' ? 'bg-blue-400' : 'bg-red-400'}`} />
              {notification.text}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Radar Animation when locating */}
        <AnimatePresence>
          {directLocating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="relative flex flex-col items-center gap-6">
                <div className="relative w-32 h-32">
                  <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-500/40" animate={{ scale: [1, 2.5], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
                  <motion.div className="absolute inset-0 rounded-full border-2 border-emerald-500/40" animate={{ scale: [1, 2.5], opacity: [1, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.8 }} />
                  <div className="absolute inset-4 rounded-full bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
                    <MapPin size={40} className="text-emerald-400 animate-bounce" />
                  </div>
                </div>
                <div className="bg-[#0d1f11] px-6 py-3 rounded-2xl border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  Direct GPS verification...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ── */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-emerald-100 dark:bg-[#166534]/40 border border-emerald-200 dark:border-[#86efac]/20 rounded-xl text-emerald-600 dark:text-[#4ade80] shrink-0 transition-colors">
                <Menu size={18} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TrendingUp size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight transition-colors">Yield Predictor <span className="text-emerald-500">AI</span></h1>
                </div>
                <p className="text-emerald-700 dark:text-emerald-200/60 text-sm font-medium transition-colors">Next-gen forecasting · Village-level precision · 2076 Horizon</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {history.length > 0 && (
              <button onClick={() => setShowHistory(h => !h)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10 text-xs font-bold transition-all">
                <Activity size={14} /> {showHistory ? 'Hide' : 'Show'} History ({history.length})
              </button>
            )}
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white/80 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors text-sm font-bold">
              <Download size={16} /> Export PDF
            </button>
          </div>
        </header>

        {/* ── History Overlay ── */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="premium-glass p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-500">
              <h4 className="text-xs font-bold text-slate-500 dark:text-white/40 mb-4 flex items-center gap-2">
                <Activity size={14} /> Prediction history
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* History list */}
                <div className="space-y-2">
                  {history.map((h, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer transition-all"
                      onClick={() => { setForm(h.params); setResult(h.result); }}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{CROP_EMOJIS[h.crop] || '🌾'}</span>
                        <div>
                          <span className="font-bold text-slate-800 dark:text-white text-sm transition-colors">{h.crop}</span>
                          <span className="text-slate-500 dark:text-white/40 text-xs ml-2">· {h.ts}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-emerald-600 dark:text-emerald-400 font-black text-sm transition-colors">{h.result.predicted_yield} t/ha</div>
                        <div className="text-slate-500 dark:text-white/40 text-xs">{h.result.confidence}% conf</div>
                      </div>
                    </div>
                  ))}
                </div>
                {/* History trend chart */}
                {historyChartData.length > 1 && (
                  <ResponsiveContainer width="100%" height={150}>
                    <AreaChart data={historyChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                      <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--surface)', border: '1px solid var(--primary)', borderRadius: '12px', fontSize: '12px', color: 'var(--text-main)' }} />
                      <Area type="monotone" dataKey="yield" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* ── Input Form ── */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-7 premium-glass p-3 sm:p-6 rounded-[2rem] border border-slate-200 dark:border-white/10 space-y-6 transition-all duration-500">

            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/5 pb-4">
              <div className="flex flex-col gap-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
                  <FlaskConical size={18} className="text-emerald-500" /> Field Parameters
                </h2>
              </div>
              <button onClick={() => setForm(INITIAL_FORM)} className="text-xs font-bold text-slate-500 dark:text-white/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                Reset All
              </button>
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 flex items-center gap-3 text-sm font-semibold">
                <AlertCircle size={18} /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Crop Selector — full-width visual picker */}
              <div className="space-y-2">
                <span className="text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-400 font-inter transition-colors">Select crop</span>
                <div className="relative">
                  <Leaf size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400/80 transition-colors" />
                  <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xl pointer-events-none">
                    {CROP_EMOJIS[form.crop_name] || '🌱'}
                  </span>
                  <select
                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-16 pr-10 text-slate-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-all appearance-none font-bold cursor-pointer"
                    value={form.crop_name} onChange={e => setVal('crop_name', e.target.value)}
                  >
                    {CROPS.map(c => <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">{c}</option>)}
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* District & Time (Historical Mode Core) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-white/5">
                <div className="space-y-2 relative flex flex-col justify-between">
                  <span className="text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-400 font-inter flex items-center justify-between">
                    <span className="flex items-center gap-2"><MapPin size={12}/> Select district</span>
                    <motion.button 
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDirectDetect}
                      disabled={directLocating}
                      className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 transition-all flex items-center gap-2 font-bold text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                    >
                      <MapPin size={10} className={directLocating ? 'animate-pulse' : ''} />
                      {directLocating ? 'Scanning...' : 'Smart detect'}
                    </motion.button>
                  </span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={locLoading ? "Detecting location..." : "Search district..."}
                      className={`w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-all font-bold ${locLoading ? 'animate-pulse' : ''}`}
                      value={form.district}
                      onFocus={() => setShowDistrictList(true)}
                      onChange={e => {
                        setVal('district', e.target.value);
                        setShowDistrictList(true);
                      }}
                    />
                    {locLoading && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin text-emerald-500" />
                      </div>
                    )}
                    <AnimatePresence>
                      {showDistrictList && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                          className="absolute z-50 top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl custom-scrollbar shadow-2xl transition-colors duration-300"
                        >
                          {DISTRICTS.filter(d => d.toLowerCase().includes(form.district.toLowerCase())).map(d => (
                            <button key={d} type="button" onClick={() => { setVal('district', d); setShowDistrictList(false); }} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-white/70 hover:bg-emerald-600 hover:text-white transition-colors border-b border-slate-100 dark:border-white/5 last:border-0">{d}</button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Village & Taluka Display (Read-only or small inputs) */}
                {(form.village || form.taluka) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="md:col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-[0.6rem] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Taluka</span>
                      <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {form.taluka || '---'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[0.6rem] font-bold text-slate-500 dark:text-white/40 uppercase tracking-wider">Village</span>
                      <div className="bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                        {form.village || '---'}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div className="space-y-2 flex flex-col justify-between">
                  <span className={`text-[0.65rem] font-bold font-inter flex items-center gap-2 transition-colors ${
                    form.year > CURRENT_YEAR ? 'text-violet-700 dark:text-violet-400' : 'text-emerald-700 dark:text-emerald-400'
                  }`}>
                    <Activity size={12}/>
                    {form.year > CURRENT_YEAR ? '🔮 Forecast Year' : '📅 Historical Year'} ({form.year})
                  </span>
                  <div className="py-1">
                    <input
                      type="range" min={2000} max={CURRENT_YEAR + 50}
                      className="w-full rounded-full cursor-pointer transition-colors"
                      style={{
                        '--slider-thumb': form.year > CURRENT_YEAR ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'linear-gradient(135deg, #4ade80, #10b981)',
                        '--slider-shadow': form.year > CURRENT_YEAR ? 'rgba(124, 58, 237, 0.4)' : 'rgba(74, 222, 128, 0.4)',
                        accentColor: form.year > CURRENT_YEAR ? '#7c3aed' : '#10b981',
                      }}
                      value={form.year}
                      onChange={e => setVal('year', parseInt(e.target.value))}
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 dark:text-white/40 font-bold px-1 transition-colors mt-1">
                      <span>2000</span>
                      <span className={form.year > CURRENT_YEAR ? 'text-violet-700 dark:text-violet-400' : 'text-slate-500 dark:text-white/40'}>
                        {CURRENT_YEAR} (Today) → {CURRENT_YEAR + 50} (Future)
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pb-2">
                <span className="text-[0.65rem] font-bold text-emerald-700 dark:text-emerald-400 font-inter">Growing season</span>
                <div className="flex gap-2">
                  {['Kharif', 'Rabi', 'Whole Year'].map(s => (
                    <button 
                      key={s} type="button" 
                      onClick={() => setVal('season', s)}
                      className={`flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${
                        form.season === s 
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/50 hover:bg-slate-200 dark:hover:bg-white/10'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Environment Overrides */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/5">
                <button 
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400 font-inter hover:text-emerald-800 dark:hover:text-emerald-300 transition-colors group"
                >
                  <span className="flex items-center gap-2">
                    <Zap size={12} className={showAdvanced ? 'text-emerald-600 dark:text-emerald-400' : ''} />
                    {showAdvanced ? 'Environment overrides active' : 'Configure environmental overrides'}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>
                
                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }} 
                      animate={{ height: 'auto', opacity: 1 }} 
                      exit={{ height: 0, opacity: 0 }} 
                      className="overflow-hidden space-y-6 pt-6"
                    >
                      <p className="text-[0.65rem] text-slate-500 dark:text-white/30 text-center italic transition-colors">Advanced: Adjust atmospheric and soil parameters to override historical district averages.</p>
                      {Object.entries(fieldGroups).map(([group, fields]) => (
                        <div key={group} className="space-y-3">
                          <span className="text-[0.65rem] font-bold text-slate-600 dark:text-white/40 font-inter pl-1 transition-colors">{group}</span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {fields.map(field => (
                              <div key={field.key} className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 dark:text-white/60 ml-1 transition-colors">{field.label}</label>
                                <div className="relative">
                                  <field.icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: field.color }} />
                                  <input
                                    type="number" step={field.step} min={field.min} max={field.max}
                                    className="w-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-10 text-slate-900 dark:text-white focus:border-emerald-500/50 focus:outline-none transition-all font-mono text-sm"
                                    value={form[field.key]}
                                    onChange={e => setVal(field.key, parseFloat(e.target.value))}
                                  />
                                  <button type="button" onClick={() => handleVoice(field.key)}
                                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${voiceActive && voiceField === field.key ? 'bg-red-500/20 text-red-500' : 'text-slate-500 dark:text-white/40 hover:text-slate-800 dark:hover:text-white/70'}`}>
                                    {voiceActive && voiceField === field.key
                                      ? <MicOff size={13} className="animate-pulse" />
                                      : <Mic size={13} />}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button type="submit" disabled={loading}
                className={`w-full py-4 font-black rounded-2xl shadow-xl transition-all transform active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 text-base
                  ${form.year > CURRENT_YEAR
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-900/40'
                    : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-900/40'
                  } text-white`}>
                {loading
                  ? <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {form.year > CURRENT_YEAR ? 'Forecasting…' : 'Analyzing…'}</>
                  : form.year > CURRENT_YEAR
                    ? <><TrendingUp size={20} /> Forecast {form.year}</>
                    : <><TrendingUp size={20} /> Predict Yield</>}
              </button>
            </form>
          </motion.div>

          {/* ── Results Column ── */}
          <div className="lg:col-span-5 space-y-5" ref={resultRef}>
            <AnimatePresence mode="wait">
              {result ? (
                <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="space-y-5">

                  {/* ── Unified Prediction Card ── */}
                  <div className={`relative premium-glass p-4 sm:p-5 rounded-3xl border overflow-hidden shadow-2xl transition-all duration-500 ${
                    result.is_future 
                      ? 'border-violet-500/30 bg-violet-50/60 dark:bg-violet-500/5' 
                      : 'border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/5'
                  }`}>
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none text-slate-900 dark:text-white">
                      <TrendingUp size={160} />
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 relative z-10">
                      <h3 className="font-black text-slate-900 dark:text-white flex items-center gap-2 text-base transition-colors">
                        {result.is_future ? '🔮 Forecast' : '📚 Historical Analysis'} {result.forecast_year}
                      </h3>
                      <div className="flex gap-2">
                        {result.trend_direction && (
                          <div className={`px-3 py-1 rounded-full text-xs font-black border ${
                            result.trend_direction === 'increasing' ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' :
                            result.trend_direction === 'decreasing' ? 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400' :
                            'bg-amber-500/15 border-amber-500/30 text-amber-700 dark:text-amber-400'
                          }`}>
                            {result.trend_direction === 'increasing' ? '📈 Improving' :
                             result.trend_direction === 'decreasing' ? '📉 Declining' : '➡️ Stable'}
                            {result.trend_pct != null ? ` ${result.trend_pct > 0 ? '+' : ''}${result.trend_pct}%` : ''}
                          </div>
                        )}
                        <button onClick={handleSendToChat}
                          className={`p-1.5 rounded-lg border transition-all ${
                            result.is_future 
                              ? 'bg-violet-500/10 border-violet-500/30 text-violet-700 dark:text-violet-400 hover:bg-violet-500 hover:text-white' 
                              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500 hover:text-white'
                          }`}
                          title="Ask AI Advisor">
                          <MessageSquare size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="text-center relative z-10 mb-6">
                      <div className="text-3xl mb-1">{CROP_EMOJIS[form.crop_name] || '🌾'}</div>
                      <span className={`text-[0.65rem] font-bold ${
                        result.is_future ? 'text-violet-700 dark:text-violet-300' : 'text-emerald-700 dark:text-emerald-300'
                      }`}>
                        {result.is_future ? 'Projected' : 'Historical'} Yield · {form.crop_name}
                      </span>
                      <div className="flex items-baseline justify-center gap-2 mt-2">
                        <span className="text-7xl font-black text-slate-900 dark:text-white transition-colors">{result.predicted_yield}</span>
                        <div className="text-left">
                          <div className={`font-bold text-sm ${result.is_future ? 'text-violet-700 dark:text-violet-400' : 'text-emerald-700 dark:text-emerald-400'} transition-colors`}>tons</div>
                          <div className="text-slate-500 dark:text-white/40 text-[0.6rem] font-bold transition-colors">per hectare</div>
                        </div>
                      </div>
                      
                      {vsNational !== null && !result.is_future && (
                        <div className={`inline-flex items-center gap-1.5 mt-3 px-3 py-1 rounded-full text-[0.65rem] font-black border ${
                          parseFloat(vsNational) >= 0 ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-700 dark:text-red-400'
                        }`}>
                          {parseFloat(vsNational) >= 0 ? '📈' : '📉'}
                          {parseFloat(vsNational) >= 0 ? '+' : ''}{vsNational}% vs national avg
                        </div>
                      )}

                      {/* Historical vs Current Comparison Section */}
                      {result.current_perspective && (
                        <div className="mt-4 mb-6 grid grid-cols-1 gap-2 relative z-10 px-4">
                          <div className={`p-3 rounded-2xl border flex items-center justify-between bg-emerald-500/10 border-emerald-500/20`}>
                            <div className="text-left">
                              <p className="text-[0.6rem] font-bold text-emerald-700 dark:text-emerald-400 transition-colors">Growth since {result.forecast_year}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`text-xl font-black ${result.current_perspective.delta >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'} transition-colors`}>
                                  {result.current_perspective.delta >= 0 ? '+' : ''}{result.current_perspective.delta} tons
                                </span>
                                <span className="text-[0.65rem] text-slate-500 dark:text-white/40 font-bold transition-colors">({result.current_perspective.delta_pct}%)</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[0.6rem] font-bold text-slate-500 dark:text-white/40 transition-colors">Current {CURRENT_YEAR}</p>
                              <p className="text-lg font-black text-slate-800 dark:text-white transition-colors">{result.current_perspective.yield} t/ha</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-center gap-3 mt-4">
                        <div className="flex flex-col items-center">
                          <span className="text-[0.6rem] text-slate-500 dark:text-white/40 font-bold transition-colors">Confidence</span>
                          <span className="text-xs font-black text-slate-700 dark:text-white/80 transition-colors">{result.confidence}%</span>
                        </div>
                        <div className="w-px h-6 bg-slate-300 dark:bg-white/10" />
                        <div className="flex flex-col items-center">
                          <span className="text-[0.6rem] text-slate-500 dark:text-white/40 font-bold transition-colors">Stability</span>
                          <RiskBadge risk={result.risk_level} />
                        </div>
                      </div>
                    </div>

                    {/* Yield Trajectory Component */}
                    {result.year_range_yields?.length > 0 && (
                      <div className="relative z-10 pt-4 border-t border-slate-200 dark:border-white/5">
                        <p className={`text-[0.65rem] font-black mb-3 flex items-center gap-2 ${
                          result.is_future ? 'text-violet-700 dark:text-violet-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}>
                          <BarChart2 size={11} /> 
                          {result.is_future 
                            ? `Future Forecast: ${CURRENT_YEAR} → ${result.forecast_year}` 
                            : `Historical Bridge: ${result.forecast_year} → ${CURRENT_YEAR}`}
                        </p>
                        <FutureTrendChart data={result.year_range_yields} targetYear={result.is_future ? result.forecast_year : CURRENT_YEAR} currentYear={CURRENT_YEAR} />
                        <div className="flex gap-4 mt-2 text-[0.6rem] text-slate-500 dark:text-white/40 justify-end font-bold transition-colors">
                          <span className="flex items-center gap-1">
                            <span className={`w-3 h-0.5 inline-block ${result.is_future ? 'bg-violet-500' : 'bg-emerald-500'}`}></span> 
                            {result.is_future ? 'Projection' : 'Observed Trend'}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className={`w-3 h-0.5 inline-block opacity-60 ${result.is_future ? 'bg-violet-400' : 'bg-emerald-400'}`}></span> 
                            Predictive Variance
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Year-by-Year Grid */}
                    {result.year_range_yields?.length > 0 && (
                      <div className="mt-6 relative z-10">
                        <p className={`text-[0.65rem] font-black mb-2 ${
                          result.is_future ? 'text-violet-700 dark:text-violet-400' : 'text-emerald-700 dark:text-emerald-400'
                        }`}>
                          Annual Performance Breakdown
                        </p>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-1.5">
                          {result.year_range_yields.map(d => (
                            <div key={d.year} className={`p-2 rounded-xl border text-center transition-all hover:bg-slate-200 dark:hover:bg-white/5 ${
                              d.year === result.forecast_year
                                ? (result.is_future ? 'bg-violet-100 dark:bg-violet-500/20 border-violet-400/50' : 'bg-emerald-100 dark:bg-emerald-500/20 border-emerald-400/50')
                                : d.year === CURRENT_YEAR
                                  ? 'bg-amber-100 dark:bg-amber-500/10 border-amber-400/50'
                                  : 'bg-slate-100 dark:bg-black/20 border-slate-200 dark:border-white/5'
                            }`}>
                              <div className="text-[0.55rem] text-slate-500 dark:text-white/40 font-black transition-colors">{d.year}</div>
                              <div className={`font-black text-sm transition-colors ${
                                d.year === result.forecast_year ? (result.is_future ? 'text-violet-700 dark:text-violet-300' : 'text-emerald-700 dark:text-emerald-300') :
                                d.year === CURRENT_YEAR ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-white'
                              }`}>{d.yield_value}</div>
                              <div className="text-[0.5rem] text-slate-500 dark:text-white/30 font-bold transition-colors">±{((d.upper - d.lower)/2).toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>


                  {/* Ask AI button */}
                  <button onClick={handleSendToChat}
                    className="w-full py-3.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all flex items-center justify-center gap-3 text-sm">
                    <MessageSquare size={16} className="text-emerald-600 dark:text-emerald-400 transition-colors" />
                    Talk to AI Advisor About This
                  </button>
                </motion.div>
              ) : (
                <div className="premium-glass p-6 sm:p-12 rounded-[2rem] border flex flex-col items-center justify-center text-center space-y-5 min-h-[300px] sm:min-h-[400px] transition-all duration-500">
                  <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-white/10 border border-slate-200 dark:border-white/10 transition-colors">
                    <Info size={40} />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-slate-800 dark:text-white font-bold text-lg transition-colors">Historical Analysis Ready</h4>
                    <p className="text-slate-500 dark:text-white/40 text-sm max-w-[240px] leading-relaxed transition-colors">
                      Select your <strong>District</strong> and <strong>Year</strong> to see how crops performed based on 20 years of authentic historical data.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {['📍 Pune', '📍 Ahmadabad', '📍 Nashik', '📍 Agra'].map(d => (
                      <span key={d} className="text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-white/40 border border-slate-200 dark:border-white/5 transition-colors font-semibold">{d}</span>
                    ))}
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Tips Section ── */}
        <section className="premium-glass p-4 md:p-6 rounded-3xl border border-slate-200 dark:border-white/10 transition-all duration-500">
          <h3 className="text-slate-800 dark:text-white font-bold flex items-center gap-2 mb-5 transition-colors">
            <Zap size={16} className="text-amber-500" /> Predicting via Historical Mapping
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🌍', title: 'District Focus', desc: 'Predicts based on unique regional soil and climate baseline of your specific district.' },
              { icon: '📅', title: 'Yearly Drift', desc: 'Accounts for annual climatic variations and historical temperature drifts since 2004.' },
              { icon: '🌦️', title: 'Seasonality', desc: 'Auto-maps monsoon (Kharif) vs winter (Rabi) environmental constraints.' },
              { icon: '🚀', title: 'ML Precision', desc: 'Trained on 240,000+ authentic Indian crop records for high-accuracy historical regression.' },
            ].map(tip => (
              <div key={tip.title} className="space-y-1.5">
                <div className="text-xl">{tip.icon}</div>
                <div className="text-slate-800 dark:text-white font-black text-xs transition-colors">{tip.title}</div>
                <div className="text-slate-600 dark:text-white/50 text-[0.7rem] font-medium leading-relaxed transition-colors">{tip.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
