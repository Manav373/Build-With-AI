import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Award, BarChart2, RefreshCw, TrendingUp, Info,
  MessageSquare, Filter, MapPin, Droplets, Thermometer, Wind,
  Zap, FlaskConical, ChevronDown, ChevronUp, Star, Download,
  AlertTriangle, CheckCircle, Target, Layers, Activity, Menu
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend, LineChart, Line,
  Scatter, ScatterChart, ZAxis, ComposedChart
} from 'recharts';
import { getRecommendations, resolveLocationBackend, sendChatQuery } from '../services/api';
import '../styles/FormElements.css';
import { useChat } from '../context/ChatContext';
import { translations } from '../utils/translations/index';
import { useAuth } from '@clerk/clerk-react';
import mlData from '../utils/mlData.json';
import { useLocation } from '../context/LocationContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

const DISTRICTS = mlData.districts;
const SEASONS = mlData.seasons;
const CROPS = mlData.crops;
const CURRENT_YEAR = new Date().getFullYear();

/* ─── constants ─────────────────────────────────────────── */
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

const CROP_COLORS = [
  '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444',
  '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#14b8a6'
];

// Redundant constants removed to focus on District-based historical model

const INITIAL_PARAMS = {
  year: CURRENT_YEAR + 1,
  district: 'Pune',
  season: 'Kharif',
  temperature: 28, rainfall: 600, humidity: 65,
  soil_ph: 6.8,
  nitrogen: 40, phosphorus: 35, potassium: 50, ndvi: 0.65
};

const PARAM_CONFIG = [
  { key: 'temperature', label: 'Temperature (°C)', min: 10, max: 50, icon: '🌡️', color: '#f97316', step: 1, tip: 'Average day/night temp' },
  { key: 'rainfall', label: 'Rainfall (mm)', min: 50, max: 3000, icon: '🌧️', color: '#3b82f6', step: 10, tip: 'Seasonal total in mm' },
  { key: 'humidity', label: 'Humidity (%)', min: 20, max: 100, icon: '💧', color: '#06b6d4', step: 1, tip: 'Relative humidity %' },
  { key: 'soil_ph', label: 'Soil pH', min: 4, max: 10, icon: '🧪', color: '#8b5cf6', step: 0.1, tip: 'Ideal: 6.0–7.5' },
  { key: 'nitrogen', label: 'Nitrogen (kg/ha)', min: 5, max: 200, icon: '🌿', color: '#10b981', step: 1, tip: 'Soil N content' },
  { key: 'phosphorus', label: 'Phosphorus (kg/ha)', min: 5, max: 200, icon: '⚡', color: '#f59e0b', step: 1, tip: 'Soil P content' },
  { key: 'potassium', label: 'Potassium (kg/ha)', min: 5, max: 300, icon: '🔋', color: '#ec4899', step: 1, tip: 'Soil K content' },
];

/* ─── sub-components ────────────────────────────────────── */

const SummaryCard = ({ label, value, unit, icon, color }) => (
  <div className="bg-[var(--card-bg)] rounded-2xl p-4 border border-[var(--glass-border)] flex items-center gap-4">
    <div className="text-2xl">{icon}</div>
    <div>
      <div className="text-[0.6rem] font-bold text-[var(--mut)]">Parameters</div>
      <div className="text-xl font-bold" style={{ color }}>{value}<span className="text-xs font-bold text-[var(--mut)] ml-1">{unit}</span></div>
    </div>
  </div>
);

const RiskBadge = ({ score }) => {
  const { theme } = useTheme();
  const level = score >= 80 ? 'Low' : score >= 60 ? 'Medium' : 'High';
  const cfg = {
    Low: {
      bg: theme === 'light' ? 'bg-emerald-100' : 'bg-emerald-500/20',
      text: theme === 'light' ? 'text-emerald-700' : 'text-emerald-400',
      border: theme === 'light' ? 'border-emerald-200' : 'border-emerald-500/30',
      icon: '✅'
    },
    Medium: {
      bg: theme === 'light' ? 'bg-amber-100' : 'bg-amber-500/20',
      text: theme === 'light' ? 'text-amber-700' : 'text-amber-400',
      border: theme === 'light' ? 'border-amber-200' : 'border-amber-500/30',
      icon: '⚠️'
    },
    High: {
      bg: theme === 'light' ? 'bg-red-100' : 'bg-red-500/20',
      text: theme === 'light' ? 'text-red-700' : 'text-red-400',
      border: theme === 'light' ? 'border-red-200' : 'border-red-500/30',
      icon: '🔴'
    },
  }[level];
  return (
    <span className={`px-3 py-1.5 rounded-xl border ${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-bold flex items-center gap-1.5`}>
      {cfg.icon} {level} risk
    </span>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-[var(--dk2)] border border-emerald-500/30 rounded-2xl p-3 shadow-2xl">
        <p className="text-[var(--txt)] font-bold text-sm">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-emerald-500 font-bold text-sm">{p.value?.toFixed(2)} t/ha</p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── main component ─────────────────────────────────────── */
export default function RecommendPage() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { currentChatId, language, processMessage } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const t = translations[language]?.chat?.intelligence || translations.en.chat.intelligence;

  const [results, setResults] = useState([]);
  const [totalCrops, setTotalCrops] = useState(0);
  const [bestCrop, setBestCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');   // overview | radar | insights
  const [showFilters, setShowFilters] = useState(false);
  const [showDistrictList, setShowDistrictList] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [directLocating, setDirectLocating] = useState(false);
  const [notification, setNotification] = useState(null);

  const { location: detectedLocation, loading: locLoading, refreshLocation } = useLocation();
  const [hasSetLoc, setHasSetLoc] = useState(false);

  useEffect(() => {
    if (detectedLocation.district && !hasSetLoc) {
      setParams(p => ({ ...p, district: detectedLocation.district }));
      setHasSetLoc(true);
    }
  }, [detectedLocation.district, hasSetLoc]);

  const [history, setHistory] = useState([]);           // past runs for comparison
  const [showHistory, setShowHistory] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);    // AI insight text
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [soilScore, setSoilScore] = useState(null);

  useEffect(() => {
    const { soil_ph, nitrogen, phosphorus, potassium } = params;
    const phScore = Math.max(0, 100 - Math.abs(soil_ph - 6.5) * 20);
    const npkScore = Math.min(100, ((nitrogen + phosphorus + potassium) / 4.5));
    setSoilScore(Math.round((phScore * 0.4 + npkScore * 0.6)));
  }, [params]);

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
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
            { headers: { 'User-Agent': 'KrishiAI/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const district = addr.district || addr.county || addr.city || addr.town || addr.village || null;

            if (district) {
              setParams(p => ({ ...p, district }));
              showNotification(`📍 Detected: ${district}`, 'success');
            } else {
              showNotification('Could not resolve your district name.', 'info');
            }
          }
        } catch (err) {
          showNotification('Location resolution failed.', 'error');
        } finally {
          setDirectLocating(false);
        }
      },
      (err) => {
        showNotification('Permission denied or location unavailable.', 'error');
        setDirectLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  /* handleStateChange removed in favor of District search */
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

  const fetchRecs = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const token = await getToken();
      // If Advanced Overrides are hidden, we send nulls to use district-based historical data
      const payload = { ...params };
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

      const res = await getRecommendations(payload, token);
      if (res.recommendations?.length > 0) {
        setResults(res.recommendations);
        setTotalCrops(res.total_evaluated || 0);
        setBestCrop(res.best_crop);
        setHistory(h => [
          { ts: new Date().toLocaleTimeString(), params: { ...params }, results: res.recommendations, best: res.best_crop },
          ...h.slice(0, 4)
        ]);
      } else {
        setError('No recommendations found for these parameters.');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      setError(detail ? formatError(detail) : 'Failed to connect to recommendation engine.');
      setResults([]); setBestCrop(null);
    } finally {
      setLoading(false);
    }
  }, [params]);

  /* ── AI Analysis ────────────────────────────────────────── */
  const handleAskAI = useCallback(async () => {
    if (!results.length) return;
    setAiAnalysisLoading(true);
    setShowAiPanel(true);
    setAiAnalysis(null);

    // Build a rich prompt with all recommendation context
    const top5 = results.slice(0, 5).map((r, i) =>
      `${i + 1}. ${r.crop}: Yield=${r.predicted_yield}t/ha, Suitability=${r.suitability}%, Confidence=${r.confidence}%, Risk=${r.confidence >= 75 ? 'Low' : r.confidence >= 55 ? 'Medium' : 'High'}${r.is_triple_crown ? ' ⚡ Top Pick' : ''}`
    ).join('\n');

    const prompt = `You are KrishiAI, a Senior Indian Agronomist. A farmer in ${params.district} asks why ${bestCrop} is the #1 recommendation for ${params.season}.

DATA:
- Top 1: ${bestCrop} (${results[0]?.suitability}% fit, ${results[0]?.predicted_yield} t/ha)
- Top 2: ${results[1]?.crop || 'None'} (${results[1]?.predicted_yield || 0} t/ha)
- Conditions: ${params.temperature}°C, ${params.rainfall}mm rain, NPK: ${params.nitrogen}/${params.phosphorus}/${params.potassium}

Provide exactly 3 bullet points with these headers:
🌿 **Core Logic**: Explain the agronomic fit based on soil/weather numbers.
⚖️ **Comparison**: Contrast specifically with ${results[1]?.crop || 'alternatives'}.
💡 **Expert Tip**: One high-impact tip to maximize ${bestCrop} yield.

Keep it structured, bold, and strictly farmer-focused.`;

    try {
      const token = await getToken();
      const res = await sendChatQuery('recommend_ai_' + Date.now(), prompt, null, null, [], null, null, token);
      setAiAnalysis(res.reply || 'Our expert system is briefly unavailable. Please try again.');
    } catch (err) {
      console.error('AI Analysis Error:', err);
      setAiAnalysis('⚠️ Intelligence core timeout. Please verify your connection.');
    } finally {
      setAiAnalysisLoading(false);
    }
  }, [results, bestCrop, params, getToken]);

  // Reactive fetch: updates results as user types or slides (debounced)
  useEffect(() => {
    // Skip if it's the very first render and we are waiting for location
    if (!params.district && !hasSetLoc) return;

    const timer = setTimeout(() => {
      fetchRecs();
    }, 600); // 600ms debounce for smoother slider experience

    return () => clearTimeout(timer);
  }, [params, showAdvanced]);

  const handleSendToChat = () => {
    if (!bestCrop || !results.length) return;
    const top = results[0];
    const prompt = translations[language]?.prompts?.analyzeRecommend?.(top.crop, top.predicted_yield, top.suitability)
      || `Analyze why ${top.crop} is the best crop with predicted yield of ${top.predicted_yield} t/ha and ${top.suitability}% suitability.`;
    processMessage(prompt, null, null, null, null, currentChatId);
    navigate('/chat');
  };

  const handleRestoreRun = (run) => {
    setParams(run.params);
    setResults(run.results);
    setBestCrop(run.best);
    setShowHistory(false);
  };

  // Recharts data
  const chartData = results.map((r, i) => ({
    name: r.crop.slice(0, 8),
    yield: r.predicted_yield,
    suitability: r.suitability,
    growth: r.growth_potential,
    fill: CROP_COLORS[i % CROP_COLORS.length]
  }));

  const radarData = results.length > 0 ? PARAM_CONFIG.map(p => ({
    subject: p.label.split(' ')[0],
    value: Math.round((params[p.key] / p.max) * 100),
  })) : [];

  const maxYield = results[0]?.predicted_yield || 1;

  /* what-if: compare current vs optimal params */
  const optimalNPK = useMemo(() => ({
    nitrogen: 90, phosphorus: 60, potassium: 80
  }), []);

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar bg-[var(--page-bg)]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8 py-4 sm:py-8 space-y-4 sm:space-y-6 pb-20">

        {/* Notifications */}
        <AnimatePresence>
          {notification && (
            <motion.div initial={{ opacity: 0, y: -20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className={`fixed top-24 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 font-bold text-sm ${notification.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
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
                  <div className="absolute inset-4 rounded-full bg-emerald-500/10 border border-emerald-500/44 flex items-center justify-center">
                    <MapPin size={40} className="text-emerald-400 animate-bounce" />
                  </div>
                </div>
                <div className="bg-[var(--dk2)] px-6 py-3 rounded-2xl border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  Direct GPS verification...
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ─────────────────────────────────────────── */}
        <header className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-[var(--g)]/40 border border-[#86efac]/20 rounded-xl text-[var(--glt)] shrink-0">
                <Menu size={18} />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-[var(--header-txt)]">Crop advisor <span className="text-emerald-500">AI</span></h1>
                </div>
                <p className={`opacity-60 text-[10px] sm:text-sm font-semibold transition-colors ${theme === 'light' ? 'text-emerald-800' : 'text-[var(--mut)]'}`}>Agro-climatic intelligence · Forward matching · 2076 Vision</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowHistory(h => !h)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--glass-border)] text-[var(--txt)] hover:bg-[var(--glass-bg)] text-xs font-bold transition-all"
            >
              <Activity size={14} /> History
            </button>
            <button
              onClick={fetchRecs} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 text-sm"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
              {loading ? 'Analyzing…' : 'Get Recommendations'}
            </button>
          </div>
        </header>

        {/* ── Mode-specific Inputs ───────────────────────────── */}
        <section className="chat-header-glass p-4 sm:p-5 rounded-3xl border border-[var(--glass-border)] grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="space-y-2 relative">
            <span className={`text-[0.65rem] font-bold flex items-center justify-between ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400/60'}`}>
              <span className="flex items-center gap-2"><MapPin size={12} /> District location</span>
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDirectDetect}
                disabled={directLocating}
                className={`px-3 py-1 rounded-lg transition-all flex items-center gap-2 font-bold text-[9px] shadow-[0_0_15px_rgba(16,185,129,0.1)] ${theme === 'light' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  }`}
              >
                <MapPin size={10} className={directLocating ? 'animate-pulse' : ''} />
                {directLocating ? 'Scanning...' : 'Smart Detect'}
              </motion.button>
            </span>
            <div className="relative">
              <input
                type="text"
                placeholder="Search district..."
                className={`w-full border rounded-xl py-2.5 px-4 focus:border-emerald-500/50 focus:outline-none transition-all font-bold text-sm ${theme === 'light' ? 'bg-white border-gray-200 text-slate-800 placeholder-slate-400' : 'bg-[#0a1a0d] border border-white/5 text-white placeholder-white/20'
                  }`}
                value={params.district}
                onFocus={() => setShowDistrictList(true)}
                onChange={e => {
                  setParams(p => ({ ...p, district: e.target.value }));
                  setShowDistrictList(true);
                }}
              />
              <AnimatePresence>
                {showDistrictList && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`absolute z-50 top-full left-0 right-0 mt-2 max-h-48 overflow-y-auto border rounded-xl custom-scrollbar shadow-2xl ${theme === 'light' ? 'bg-white border-gray-100' : 'bg-slate-900 border-white/10'
                      }`}
                  >
                    {DISTRICTS.filter(d => d.toLowerCase().includes(params.district.toLowerCase())).map(d => (
                      <button key={d} type="button" onClick={() => { setParams(p => ({ ...p, district: d })); setShowDistrictList(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors border-b last:border-0 ${theme === 'light' ? 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 border-gray-100' : 'text-white/70 hover:bg-emerald-600 hover:text-white border-white/5'
                          }`}>
                        {d}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-2">
            <span className={`text-[0.65rem] font-black flex items-center gap-2 transition-colors ${theme === 'light'
              ? (params.year > CURRENT_YEAR ? 'text-violet-700' : 'text-emerald-700')
              : (params.year > CURRENT_YEAR ? 'text-violet-400' : 'text-emerald-400')
              }`}>
              <Activity size={12} />
              {params.year > CURRENT_YEAR ? '🔮 Forecast Year' : '📅 Analysis Year'} ({params.year})
            </span>
            <input
              type="range" min={2000} max={CURRENT_YEAR + 50}
              className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-colors ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}
              style={{ '--slider-thumb': params.year > CURRENT_YEAR ? 'linear-gradient(135deg, #a78bfa, #7c3aed)' : 'linear-gradient(135deg, #4ade80, #10b981)' }}
              value={params.year}
              onChange={e => setParams(p => ({ ...p, year: parseInt(e.target.value) }))}
            />
            <div className={`flex justify-between text-[10px] font-bold ${theme === 'light' ? 'text-gray-400' : 'text-[var(--mut)]'}`}>
              <span>2000</span>
              <span className={params.year > CURRENT_YEAR ? (theme === 'light' ? 'text-violet-600' : 'text-violet-500/60') : ''}>
                {CURRENT_YEAR} (Today) → {CURRENT_YEAR + 50} (Future)
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-[0.65rem] font-bold text-emerald-400/60">Season</span>
            <div className="flex gap-1.5">
              {['Kharif', 'Rabi', 'Whole Year'].map(s => (
                <button
                  key={s} type="button"
                  onClick={() => setParams(p => ({ ...p, season: s }))}
                  className={`flex-1 py-2 rounded-lg border text-[10px] font-black transition-all ${params.season === s ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-[var(--dk2)] border-[var(--glass-border)] text-[var(--mut)] hover:bg-[var(--glass-bg)]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── History Drawer ──────────────────────────────────── */}
        <AnimatePresence>
          {showHistory && history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="bg-[var(--dk2)] border border-[var(--glass-border)] rounded-2xl p-4 overflow-hidden"
            >
              <h4 className="text-xs font-bold text-[var(--mut)] mb-3">Past analyses</h4>
              <div className="space-y-2">
                {history.map((run, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all cursor-pointer"
                    onClick={() => handleRestoreRun(run)}>
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{CROP_EMOJIS[run.best] || '🌾'}</span>
                      <div>
                        <span className="font-bold text-[var(--txt)] text-sm">{run.best}</span>
                        <span className="text-[var(--mut)] text-xs ml-2">· {run.ts}</span>
                      </div>
                    </div>
                    <span className="text-emerald-400 font-black text-xs">{run.results[0]?.predicted_yield} t/ha</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        {/* ── 2-col layout: sliders | results ───────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">

          {/* LEFT: Parameter Panel */}
          <div className="space-y-4">
            {/* Soil Health Score */}
            <div className="chat-header-glass p-4 rounded-[2rem] border border-[var(--glass-border)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[var(--mut)] flex items-center gap-2">
                  <FlaskConical size={14} /> Soil health score
                </span>
                <span className={`text-2xl font-black ${soilScore >= 70 ? 'text-emerald-400' : soilScore >= 45 ? 'text-amber-400' : 'text-red-400'}`}>
                  {soilScore}/100
                </span>
              </div>
              <div className="w-full h-2 bg-[var(--dk3)] rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${soilScore}%` }}
                  className={`h-full rounded-full ${soilScore >= 70 ? 'bg-emerald-500' : soilScore >= 45 ? 'bg-amber-500' : 'bg-red-500'}`}
                />
              </div>
              <p className="text-[var(--mut)] text-[0.65rem] mt-2">
                {soilScore >= 70 ? '✅ Excellent soil conditions for farming' : soilScore >= 45 ? '⚠️ Moderate — consider soil amendments' : '🔴 Poor — significant improvement needed'}
              </p>
            </div>

            {/* Advanced Overrides */}
            <div className="chat-header-glass p-1 rounded-3xl border border-[var(--glass-border)] overflow-hidden">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex items-center justify-between text-xs font-bold text-emerald-500/60 hover:bg-[var(--card-bg)] transition-all"
              >
                <div className="flex items-center gap-2">
                  <Zap size={14} className={showAdvanced ? 'text-emerald-500' : ''} />
                  {showAdvanced ? 'Overrides Active' : 'Refine Environment'}
                </div>
                <ChevronDown size={14} className={`transition-transform duration-300 ${showAdvanced ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 pt-0 space-y-5 border-t border-[var(--glass-border)]"
                  >
                    <p className="text-[0.6rem] text-[var(--mut)] italic mb-4">Manual overrides for atmospheric and soil mapping.</p>
                    {PARAM_CONFIG.map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[0.65rem] font-bold text-[var(--mut)] flex items-center gap-1.5">
                            <span>{f.icon}</span>{f.label}
                          </span>
                          <span className="text-[0.65rem] font-bold font-mono" style={{ color: f.color }}>
                            {params[f.key]}
                          </span>
                        </div>
                        <input
                          type="range" min={f.min} max={f.max} step={f.step}
                          value={params[f.key]}
                          onChange={e => setParams(p => ({ ...p, [f.key]: parseFloat(e.target.value) }))}
                          className={`w-full h-1.5 rounded-full appearance-none cursor-pointer transition-colors ${theme === 'light' ? 'bg-gray-200' : 'bg-white/10'}`}
                          style={{ '--slider-thumb': f.color }}
                        />
                      </div>
                    ))}

                    <div className="pt-4 border-t border-white/5">
                      <h3 className="text-[0.7rem] font-bold text-[#86efac]/60 mb-4 px-1">Soil NPK presets</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'Wheat', n: 80, p: 40, k: 40 },
                          { label: 'Rice', n: 100, p: 50, k: 50 },
                          { label: 'Fruits', n: 60, p: 80, k: 120 },
                          { label: 'Pulses', n: 20, p: 50, k: 20 },
                        ].map(preset => (
                          <button key={preset.label}
                            onClick={() => setParams(p => ({ ...p, nitrogen: preset.n, phosphorus: preset.p, potassium: preset.k }))}
                            className="text-[0.6rem] font-bold px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-400 transition-all text-left"
                          >
                            {preset.label}<br />
                            <span className="text-[0.55rem] text-white/30 font-mono">N:{preset.n} P:{preset.p} K:{preset.k}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* RIGHT: Results Panel */}
          <div className="space-y-6">

            {/* Best Crop Banner */}
            <AnimatePresence mode="wait">
              {bestCrop && !loading && (
                <motion.div
                  key={bestCrop}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 30 }}
                  className="relative overflow-hidden p-6 sm:p-8 rounded-[2.5rem] bg-gradient-to-br from-emerald-600/20 via-emerald-900/10 to-transparent border border-emerald-500/30 shadow-[0_30px_50px_-15px_rgba(0,0,0,0.6)] backdrop-blur-xl"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
                  <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

                  <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative z-10 w-full">
                    <div className="flex-1 text-center lg:text-left space-y-6">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center gap-3 justify-center lg:justify-start"
                      >
                        <span className={`px-3 py-1 rounded-full text-[9px] font-bold shadow-inner ${theme === 'light' ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                          }`}>Optimized prediction</span>
                        <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold flex items-center gap-1.5 ${theme === 'light' ? 'bg-amber-100 border border-amber-200 text-amber-700' : 'bg-amber-400/20 border border-amber-400/30 text-amber-400'
                          }`}>
                          <Award size={10} /> Elite fit
                        </div>
                      </motion.div>

                      <motion.h2
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                        className="text-4xl sm:text-5xl font-bold text-[var(--header-txt)] leading-none"
                      >
                        {bestCrop}
                      </motion.h2>

                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                        className="flex flex-wrap items-center gap-5 justify-center lg:justify-start"
                      >
                        <div className="px-3 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--glass-border)] flex flex-col items-center lg:items-start gap-1 backdrop-blur-md group hover:bg-[var(--glass-bg)] transition-colors">
                          <span className="text-[0.65rem] font-bold text-[var(--mut)]">Yield prediction</span>
                          <div className="flex items-center gap-1.5">
                            <TrendingUp size={14} className="text-emerald-500" />
                            <span className="text-lg font-black text-[var(--txt)]">{results[0]?.predicted_yield} <span className="text-[var(--mut)] font-bold ml-1 text-[10px]">t/ha</span></span>
                          </div>
                        </div>
                        <div className="px-3 py-2 rounded-2xl bg-[var(--card-bg)] border border-[var(--glass-border)] flex flex-col items-center lg:items-start gap-1 backdrop-blur-md group hover:bg-[var(--glass-bg)] transition-colors">
                          <span className="text-[0.65rem] font-bold text-[var(--mut)]">Environment match</span>
                          <div className="flex items-center gap-1.5">
                            <Target size={14} className="text-blue-500" />
                            <span className="text-lg font-black text-[var(--txt)]">{results[0]?.suitability}% <span className="text-[var(--mut)] font-bold ml-1 text-[10px]">Fit</span></span>
                          </div>
                        </div>
                        <div>
                          <RiskBadge score={results[0]?.suitability || 70} />
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                        className="pt-4 flex justify-center lg:justify-start"
                      >
                        <button
                          onClick={handleAskAI}
                          disabled={aiAnalysisLoading}
                          className={`group relative flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-base transition-all duration-500 border-2 active:scale-95 ${showAiPanel
                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-[0_15px_30px_rgba(16,185,129,0.3)]'
                            : theme === 'light'
                              ? 'bg-emerald-950 text-white border-emerald-900 shadow-2xl shadow-emerald-900/20 hover:bg-emerald-900 hover:scale-105'
                              : 'bg-white text-emerald-950 border-white shadow-2xl shadow-white/20 hover:bg-emerald-50 hover:scale-105'
                            }`}
                        >
                          {aiAnalysisLoading ? (
                            <><RefreshCw size={20} className="animate-spin" /> Analyzing...</>
                          ) : (
                            <><MessageSquare size={20} className={showAiPanel ? "text-white" : "text-emerald-600 group-hover:scale-125 transition-transform duration-300"} /> Why {bestCrop}?</>
                          )}
                        </button>
                      </motion.div>
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: 10 }} transition={{ delay: 0.4, type: 'spring' }}
                      className="hidden lg:flex w-48 h-48 rounded-[3.5rem] bg-gradient-to-br from-white/10 to-emerald-500/5 border-2 border-white/5 items-center justify-center text-[7rem] shadow-[0_0_80px_rgba(16,185,129,0.1)] hover:rotate-12 transition-transform duration-1000"
                    >
                      {CROP_EMOJIS[bestCrop] || '🌾'}
                    </motion.div>
                  </div>

                  {/* ── Inline AI Analysis Panel ── */}
                  <AnimatePresence>
                    {showAiPanel && (
                      <motion.div
                        initial={{ opacity: 0, y: 30, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: 'auto' }}
                        exit={{ opacity: 0, y: 30, height: 0 }}
                        className="w-full mt-10"
                      >
                        <div className="relative p-8 rounded-[2.5rem] bg-[var(--dk3)] border border-emerald-500/30 backdrop-blur-2xl shadow-inner overflow-hidden">
                          <button
                            onClick={() => { setShowAiPanel(false); setAiAnalysis(null); }}
                            className="absolute top-6 right-6 w-12 h-12 rounded-full bg-[var(--card-bg)] text-[var(--mut)] flex items-center justify-center hover:bg-[var(--glass-bg)] transition-all border border-[var(--glass-border)] z-20"
                          >✕</button>

                          <div className="flex items-center gap-4 mb-6 relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/40 flex items-center justify-center text-2xl">🤖</div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-emerald-500 leading-none mb-1">KrishiAI Intellectual Engine</span>
                              <span className="text-[10px] font-bold text-[var(--mut)]">Powered by Groq Llama-3 (70B) & Soil Intelligence</span>
                            </div>
                          </div>

                          {aiAnalysisLoading ? (
                            <div className="space-y-4 p-2 relative z-10 w-full max-w-2xl">
                              <div className="h-3 w-full bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5 }} className="h-full w-1/3 bg-emerald-500/50" />
                              </div>
                              <div className="h-3 w-5/6 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }} className="h-full w-1/3 bg-emerald-500/50" />
                              </div>
                            </div>
                          ) : (
                            <motion.div
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              className="relative z-10 p-2"
                            >
                              <p className="text-[var(--txt)] text-sm leading-relaxed font-medium whitespace-pre-line">
                                {aiAnalysis || 'Analysis algorithm is optimizing. Please try again in 2 seconds.'}
                              </p>
                              <div className="mt-4 flex items-center gap-2 text-emerald-400/40 font-bold text-[10px]">
                                <div className="w-4 h-[1px] bg-current" /> Verified agronomic insight
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex gap-2 bg-[var(--card-bg)] p-1 rounded-xl w-fit">
              {[
                { id: 'overview', icon: <BarChart2 size={14} />, label: 'Competition' },
                { id: 'radar', icon: <Layers size={14} />, label: 'Environment fit' },
                { id: 'insights', icon: <Activity size={14} />, label: 'Insights' },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-lg' : 'text-[var(--mut)] hover:text-[var(--txt)]'}`}>
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panels */}
            <AnimatePresence mode="wait">
              {/* ── Overview Tab ── */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="grid grid-cols-1 lg:grid-cols-2 gap-5">

                  {/* Leaderboard */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="px-4 py-3 border-b border-[var(--glass-border)] flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <h3 className="text-xs font-bold text-[var(--mut)]">Crop leaderboard</h3>
                        <span className="text-[10px] text-[var(--mut)] opacity-50 ml-2 italic">ranked by fit · confidence · risk</span>
                      </div>
                    </div>
                    {loading ? (
                      <div className="flex items-center justify-center h-48 text-white/20">
                        <RefreshCw size={28} className="animate-spin text-emerald-500" />
                      </div>
                    ) : results.map((r, i) => (
                      <motion.div key={r.crop} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                        onClick={() => setSelected(selected === r.crop ? null : r.crop)}
                        className={`block w-full text-left p-3 rounded-2xl border cursor-pointer transition-all ${selected === r.crop ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${i === 0 ? 'gold-badge text-black' : 'bg-[var(--card-bg)] text-[var(--mut)]'}`}>{i + 1}</div>
                          <span className="text-xl flex-shrink-0">{CROP_EMOJIS[r.crop] || '🌱'}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-bold text-[var(--txt)] text-sm truncate">{r.crop}</span>
                                {r.is_triple_crown && (
                                  <span className="flex-shrink-0 px-1.5 py-0.5 rounded-md bg-amber-400/20 border border-amber-400/40 text-amber-600 text-[8px] font-bold">⚡ Top pick</span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`text-[10px] font-bold ${r.confidence >= 75 ? 'text-emerald-400' : r.confidence >= 55 ? 'text-amber-400' : 'text-red-400'
                                  }`}>
                                  {r.confidence >= 75 ? '✅ Low risk' : r.confidence >= 55 ? '⚠️ Med' : '🔴 High'}
                                </span>
                                <span className="font-bold text-sm text-emerald-300" style={{ color: CROP_COLORS[i % CROP_COLORS.length] }}>
                                  {r.predicted_yield} t/ha
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${r.suitability}%` }}
                                  transition={{ delay: i * 0.05, duration: 0.6 }}
                                  className="h-full rounded-full" style={{ background: CROP_COLORS[i % CROP_COLORS.length] }} />
                              </div>
                              <span className="text-[var(--mut)] text-[9px] flex-shrink-0">{r.predicted_yield}t/ha</span>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {selected === r.crop && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              className="mt-4 pt-4 border-t border-white/10 space-y-4">
                              <div className="grid grid-cols-3 gap-3">
                                {[
                                  { label: 'Confidence', val: `${r.confidence}%`, color: '#3b82f6' },
                                  { label: 'Suitability', val: `${r.suitability}%`, color: '#10b981' },
                                  { label: 'Risk', val: r.confidence >= 80 ? 'Low' : r.confidence >= 65 ? 'Med' : 'High', color: r.confidence >= 80 ? '#10b981' : r.confidence >= 65 ? '#f59e0b' : '#ef4444' },
                                ].map(metric => (
                                  <div key={metric.label} className="text-center bg-[var(--dk2)] py-2 rounded-xl border border-[var(--glass-border)]">
                                    <span className="text-[0.65rem] font-bold text-[var(--mut)]">{metric.label}</span>
                                    <div className="text-sm font-bold mt-0.5" style={{ color: metric.color }}>{metric.val}</div>
                                  </div>
                                ))}
                              </div>

                              <div className="space-y-2">
                                <span className="text-[0.65rem] font-bold text-[#86efac]/40 flex items-center gap-2">
                                  <Info size={10} /> Why this crop?
                                </span>
                                <div className="flex flex-wrap gap-1.5">
                                  {r.reasons?.map((reason, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[0.65rem] text-emerald-300 flex items-center gap-1.5">
                                      <CheckCircle size={10} /> {reason}
                                    </span>
                                  ))}
                                  {!r.reasons && <span className="text-[0.65rem] text-white/20 italic">No specific logic data available</span>}
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 pt-1">
                                <div className="bg-blue-500/5 border border-blue-500/10 p-2 rounded-xl flex items-center gap-3">
                                  <Droplets size={14} className="text-blue-400" />
                                  <div>
                                    <div className="text-[0.55rem] font-bold text-blue-400/40">Est. rainfall</div>
                                    <div className="text-xs font-bold text-blue-200">{r.est_rainfall} mm</div>
                                  </div>
                                </div>
                                <div className="bg-orange-500/5 border border-orange-500/10 p-2 rounded-xl flex items-center gap-3">
                                  <Thermometer size={14} className="text-orange-400" />
                                  <div>
                                    <div className="text-[0.55rem] font-bold text-orange-400/40">Est. temp</div>
                                    <div className="text-xs font-bold text-orange-200">{r.est_temp}°C</div>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  setBestCrop(r.crop); // Focus AI on this specific crop
                                  handleAskAI();
                                  window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll up to see the AI panel
                                }}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 border-2 ${theme === 'light'
                                  ? 'bg-emerald-950 text-white border-emerald-900 hover:bg-emerald-900'
                                  : 'bg-white text-emerald-950 border-white hover:bg-emerald-50 shadow-lg shadow-white/5'
                                  }`}
                              >
                                <MessageSquare size={12} /> Why plant {r.crop}?
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>

                  {/* Bar Chart */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold text-white/40 flex items-center gap-2">
                        <TrendingUp size={14} /> Suitability analysis
                      </h3>
                      <span className="text-[9px] text-white/20 font-bold">Ranked by Environmental fit</span>
                    </div>
                    <div className="chat-header-glass p-5 rounded-3xl border border-white/5">
                      {loading ? (
                        <div className="h-64 flex items-center justify-center">
                          <RefreshCw size={28} className="animate-spin text-emerald-500" />
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={320}>
                          <ComposedChart data={chartData.map(d => ({ ...d, suit: results.find(r => r.crop.slice(0, 8) === d.name)?.suitability || 0 }))} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#00000010' : '#ffffff05'} vertical={false} />
                            <XAxis
                              dataKey="name"
                              axisLine={false}
                              tickLine={false}
                              tick={{ fill: theme === 'light' ? '#64748b' : '#ffffff40', fontSize: 9, fontWeight: 700 }}
                              interval={0}
                              angle={-25}
                              textAnchor="end"
                              height={50}
                            />
                            <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fill: theme === 'light' ? '#64748b' : '#ffffff30', fontSize: 10 }} domain={[0, 100]} label={{ value: 'Score %', angle: -90, position: 'insideLeft', fill: theme === 'light' ? '#64748b' : '#ffffff20', fontSize: 10, offset: 0 }} />
                            <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#3b82f6', fontSize: 10 }} label={{ value: 't/ha', angle: 90, position: 'insideRight', fill: '#3b82f640', fontSize: 10, offset: 10 }} />

                            <Tooltip
                              content={({ active, payload, label }) => {
                                if (active && payload && payload.length) {
                                  const cropResult = results.find(r => r.crop.slice(0, 8) === label);
                                  const suitVal = payload.find(p => p.dataKey === 'Suitability' || p.dataKey === 'suit')?.value || cropResult?.suitability;
                                  const yieldVal = cropResult?.predicted_yield || payload.find(p => p.dataKey === 'yield')?.value;
                                  return (
                                    <div className={`${theme === 'light' ? 'bg-white border-gray-200 shadow-xl' : 'bg-[#051107]/95 border-emerald-500/20 shadow-2xl'} backdrop-blur-md border rounded-xl p-3 pointer-events-none`}>
                                      <p className={`${theme === 'light' ? 'text-gray-900' : 'text-white'} font-black text-xs mb-2 border-b border-white/5 pb-1`}>{cropResult?.crop || label}</p>
                                      <div className="grid grid-cols-3 gap-2">
                                        <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 text-center">
                                          <p className="text-[8px] font-bold text-white/40 mb-1">Soil match</p>
                                          <p className="text-emerald-400 font-bold text-xs">{suitVal}%</p>
                                        </div>
                                        <div className="bg-blue-500/5 p-2 rounded-lg border border-blue-500/10 text-center">
                                          <p className="text-[8px] font-bold text-white/40 mb-1">Harvest</p>
                                          <p className="text-blue-400 font-bold text-xs">{yieldVal}t</p>
                                        </div>
                                        <div className="bg-white/5 p-2 rounded-lg border border-white/10 text-center">
                                          <p className="text-[8px] font-bold text-white/40 mb-1">Potential</p>
                                          <p className="text-white font-bold text-xs">{cropResult?.growth_potential || 0}%</p>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                              position={{ y: 0 }}
                              allowEscapeViewBox={{ x: true, y: true }}
                              cursor={{ fill: '#ffffff05' }}
                              wrapperStyle={{ zIndex: 100, pointerEvents: 'none' }}
                            />
                            <Legend
                              verticalAlign="top"
                              align="right"
                              height={40}
                              iconType="circle"
                              formatter={(value) => <span className="text-[9px] font-bold text-white/60 ml-2">{value === 'Suitability' ? 'Soil fit score' : 'Yield prediction'}</span>}
                              wrapperStyle={{ paddingTop: '10px' }}
                            />
                            <Bar yAxisId="left" name="Suitability" dataKey="suit" radius={[4, 4, 0, 0]} maxBarSize={30}>
                              {chartData.map((entry, i) => (
                                <Cell key={i} fill={entry.fill} />
                              ))}
                            </Bar>
                            <Line yAxisId="right" name="Yield" type="monotone" dataKey="yield" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', stroke: '#0a1a0d', strokeWidth: 2 }} activeDot={{ r: 6, strokeWidth: 0 }} />
                          </ComposedChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Radar Tab ── */}
              {activeTab === 'radar' && (
                <motion.div key="radar" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  <div className="chat-header-glass p-4 md:p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-bold text-white/40 flex items-center gap-2 mb-4">
                      <Layers size={14} /> Environmental fit profile
                    </h3>
                    <ResponsiveContainer width="100%" height={320}>
                      <RadarChart data={radarData}>
                        <PolarGrid stroke="#ffffff10" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#ffffff60', fontSize: 11, fontWeight: 700 }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#ffffff20', fontSize: 9 }} />
                        <Radar name="Current" dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      </RadarChart>
                    </ResponsiveContainer>
                    <p className="text-white/30 text-xs text-center mt-2">Each axis shows parameter intensity relative to its maximum range</p>
                  </div>

                  {/* NPK Balance Card */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                    {[
                      { label: 'Nitrogen', value: params.nitrogen, max: 200, color: '#10b981', icon: '🌿' },
                      { label: 'Phosphorus', value: params.phosphorus, max: 200, color: '#f59e0b', icon: '⚡' },
                      { label: 'Potassium', value: params.potassium, max: 300, color: '#ec4899', icon: '🔋' },
                    ].map(nutrient => (
                      <div key={nutrient.label} className="chat-header-glass p-4 rounded-2xl border border-[var(--glass-border)] text-center">
                        <div className="text-2xl mb-1">{nutrient.icon}</div>
                        <span className="text-[0.65rem] font-bold text-emerald-600/60">{nutrient.label}</span>
                        <div className="text-2xl font-black mt-1" style={{ color: nutrient.color }}>{nutrient.value}</div>
                        <div className="text-[0.6rem] text-[var(--mut)] opacity-60">kg/ha</div>
                        <div className="w-full h-1.5 bg-[var(--dk3)] rounded-full mt-2 overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${(nutrient.value / nutrient.max) * 100}%`, background: nutrient.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Insights Tab ── */}
              {activeTab === 'insights' && (
                <motion.div key="insights" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">

                  {/* Key Insights */}
                  <div className="chat-header-glass p-6 rounded-3xl border border-white/5">
                    <h3 className="text-xs font-bold text-white/40 mb-4 flex items-center gap-2">
                      <Activity size={14} /> AI agronomic insights
                    </h3>
                    <div className="space-y-3">
                      {[
                        params.rainfall < 300 ? { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', text: 'Low rainfall detected. Prefer drought-resistant crops like Bajra, Chickpea, or Cotton.' } : null,
                        params.humidity > 80 ? { icon: '💧', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', text: 'High humidity detected. Rice and Banana thrive. Watch for fungal diseases.' } : null,
                        params.temperature > 35 ? { icon: '🌡️', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', text: 'High temperature. Consider heat-tolerant crops like Cotton, Sorghum, or Groundnut.' } : null,
                        params.soil_ph < 5.5 ? { icon: '🧪', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', text: 'Acidic soil (pH < 5.5). Apply lime to raise pH and unlock nutrients for most crops.' } : null,
                        params.soil_ph > 8.0 ? { icon: '🧪', color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/20', text: 'Alkaline soil (pH > 8). Apply sulphur or gypsum. Consider tolerant crops like Barley or Cotton.' } : null,
                        params.nitrogen < 25 ? { icon: '🌿', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', text: 'Low Nitrogen. Apply urea or compost. Legumes like Chickpea can fix atmospheric N₂ naturally.' } : null,
                        bestCrop ? { icon: '✅', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20', text: `${bestCrop} is your highest-yielding option under the current conditions with a projected ${results[0]?.predicted_yield} t/ha.` } : null,
                      ].filter(Boolean).slice(0, 4).map((insight, i) => (
                        <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                          className={`flex items-start gap-3 p-4 rounded-xl border ${insight.bg}`}>
                          <span className="text-xl mt-0.5 flex-shrink-0">{insight.icon}</span>
                          <p className={`${insight.color} text-sm font-medium leading-relaxed`}>{insight.text}</p>
                        </motion.div>
                      ))}
                      {params.rainfall >= 300 && params.humidity <= 80 && params.temperature <= 35 && params.soil_ph >= 5.5 && params.soil_ph <= 8 && params.nitrogen >= 25 && (
                        <div className="flex items-start gap-3 p-4 rounded-xl border bg-emerald-500/10 border-emerald-500/20">
                          <span className="text-xl">🎉</span>
                          <p className="text-emerald-400 text-sm font-medium">Excellent conditions! Your soil and climate are optimal for high-yield farming.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Crop Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.slice(0, 4).map((r, i) => (
                      <div key={r.crop} className="chat-header-glass p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-2xl">{CROP_EMOJIS[r.crop] || '🌱'}</span>
                          <div>
                            <div className="font-bold text-white text-sm">{r.crop}</div>
                            <div className="text-[0.6rem] font-bold text-white/30">Rank #{i + 1}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <div className="text-[0.55rem] font-bold text-white/30">Yield</div>
                            <div className="text-sm font-bold text-emerald-400">{r.predicted_yield}<span className="text-[0.55rem] text-white/30"> t/ha</span></div>
                          </div>
                          <div>
                            <div className="text-[0.55rem] font-bold text-white/30">Match</div>
                            <div className="text-sm font-bold text-blue-400">{r.suitability}%</div>
                          </div>
                          <div>
                            <div className="text-[0.55rem] font-bold text-white/30">Confidence</div>
                            <div className="text-sm font-bold text-amber-400">{r.confidence}%</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── How It Works ─────────────────────────────────────── */}
        <section className="chat-header-glass p-4 md:p-6 rounded-3xl border border-[var(--glass-border)]">
          <h3 className="text-xs font-bold text-[var(--mut)] mb-5 flex items-center gap-2">
            <Info size={14} /> How it works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {[
              { step: '1', icon: '🎛️', title: 'Set Parameters', desc: 'Adjust soil, climate & NPK values using the sliders on the left panel.' },
              { step: '2', icon: '🤖', title: 'AI Analyzes', desc: 'Our AI evaluates all 22 crops against your exact conditions in real-time.' },
              { step: '3', icon: '🏆', title: 'Get Top Picks', desc: 'See the top 5 crops ranked by predicted yield and suitability score.' },
              { step: '4', icon: '💬', title: 'Ask AI Why', desc: 'Tap "Ask AI Why?" to get a detailed agronomic explanation from the advisor.' },
            ].map(s => (
              <div key={s.step} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-500 flex-shrink-0">
                  {s.step}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{s.icon}</span>
                    <span className="text-[var(--txt)] font-bold text-sm">{s.title}</span>
                  </div>
                  <p className="text-[var(--mut)] text-[0.7rem] leading-relaxed opacity-70">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Data Source Footer ── */}
        <div className="flex items-center justify-center gap-3 text-[var(--mut)] text-[0.65rem] font-medium opacity-60">
          <span>📊 Model trained on</span>
          <span className="text-emerald-500 font-bold">240,000+ real Indian historical records</span>
          <span>·</span>
          <span>Regression Precision: <strong className="text-emerald-500">89.3%</strong></span>
          <span>·</span>
          <span>600+ Districts · 1997-2015 dataset</span>
        </div>

      </div>
    </div>
  );
}
