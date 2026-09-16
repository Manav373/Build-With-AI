import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, MapPin, TrendingUp, Filter, AlertCircle, RefreshCw, Smartphone, ChevronDown, Check, Download, Info, Menu, ArrowUpRight, ArrowDownRight, TrendingDown, Calendar, Loader2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

import { translations } from '../utils/translations/index';
import { useChat } from '../context/ChatContext';
import { useAuth } from '@clerk/clerk-react';
import { getAllMarketPrices, getCommodityTrends, getMarketTrends } from '../services/api';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

const DISTRICTS_BY_STATE = {
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Mansa", "Moga", "Muktsar", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "SAS Nagar", "SBS Nagar", "Tarn Taran"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurugram", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Allahabad", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kasganj", "Kaushambi", "Kheri", "Kushinagar", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Rae Bareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"]
};

export default function MarketPricePage() {
  const navigate = useNavigate();
  const {
    chatSessions,
    currentChatId,
    handleNewChat,
    handleSelectChat,
    handleDeleteChat,
    handleRenameChat,
  } = useChat();
  const { language } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme } = useTheme();

  const { getToken } = useAuth();

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ state: '', district: '', commodity: '' });
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isQuintal, setIsQuintal] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [trendData, setTrendData] = useState([]);
  const [loadingTrend, setLoadingTrend] = useState(false);
  const limit = 100;

  const t = translations[language].chat;

  // Extract unique districts from loaded records for the filter


  const filteredRecords = React.useMemo(() => {
    let result = records;
    if (search) {
      const term = search.toLowerCase();
      result = result.filter(r =>
        r.commodity.toLowerCase().includes(term) ||
        r.market.toLowerCase().includes(term) ||
        r.state.toLowerCase().includes(term)
      );
    }
    if (filters.district) {
      result = result.filter(r => r.district === filters.district);
    }
    return result;
  }, [search, records, filters.district]);

  const fetchPrices = async (force = false) => {
    if (force) setIsSyncing(true);
    else setLoading(true);

    try {
      const token = await getToken();
      const queryParams = {
        limit: "100", // Fetch more for better local filtering
        offset: (page * limit).toString(),
        commodity: search || filters.commodity,
        state: filters.state,
        district: filters.district,
        force_refresh: force ? 'true' : 'false'
      };

      const data = await getAllMarketPrices(queryParams, token);
      if (data) {
        setRecords(data.records || []);
        setTotal(data.total || 0);
        setIsOffline(data.note === 'cache_hit' || data.note === 'offline_data' || data.note === 'cache_fallback');
      }
    } catch (error) {
      console.error("Failed to fetch market prices:", error);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  const fetchTrends = async (commodity, state) => {
    setLoadingTrend(true);
    try {
      const token = await getToken();
      const data = await getCommodityTrends(commodity, state, token);
      if (data) {
        setTrendData(data.trends || []);
      }
    } catch (error) {
      console.error("Trend fetch failed:", error);
    } finally {
      setLoadingTrend(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPrices();
    }, 600);
    return () => clearTimeout(timer);
  }, [search, filters.state, filters.district, page]);

  const handleShare = (rec) => {
    const price = isQuintal ? rec.modal_price : (rec.modal_price / 5);
    const unit = isQuintal ? "Quintal" : "20kg";
    const text = `🌾 Market Intelligence: ${rec.commodity} in ${rec.market}, ${rec.district} is selling at ₹${price.toFixed(2)} per ${unit}. (via KrishiAI)`;
    navigator.clipboard.writeText(text);
    alert("Price details copied to clipboard!");
  };

  // Premium Styled Native Dropdown Component (Prevents overflow-x clipping bugs)
  const GlassDropdown = ({ label, value, options, onChange, icon: Icon, disabled, placeholder }) => {
    return (
      <div className={`relative flex-1 md:flex-none min-w-[110px] md:min-w-[160px] ${disabled ? 'opacity-20 pointer-events-none' : ''}`}>
        {Icon && <Icon className={`absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-5 md:h-5 pointer-events-none transition-colors ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-500/60'
          }`} />}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className={`w-full appearance-none border rounded-xl md:rounded-2xl py-2 md:py-3.5 pl-8 md:pl-11 pr-8 md:pr-10 text-[0.65rem] md:text-sm font-bold outline-none transition-all cursor-pointer ${theme === 'light'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700 hover:bg-emerald-100 focus:border-emerald-300'
              : 'bg-[#166534]/10 border border-[#86efac]/10 text-[#86efac] hover:bg-emerald-500/10 focus:border-emerald-500/30'
            }`}
        >
          <option value="" disabled hidden>{placeholder || label}</option>
          {options.map(opt => (
            <option key={opt.value} value={opt.value} className={`${theme === 'light' ? 'bg-white text-slate-900' : 'bg-[#08120b] text-[#86efac]'} font-sans font-bold`}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className={`absolute right-2.5 md:right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 md:w-5 md:h-5 transition-all duration-300 pointer-events-none ${theme === 'light' ? 'text-emerald-400' : 'text-[var(--mut)] opacity-30'
          }`} />
      </div>
    );
  };

  const stateOptions = [
    { label: "All States", value: "" },
    { label: "Gujarat", value: "Gujarat" },
    { label: "Punjab", value: "Punjab" },
    { label: "Haryana", value: "Haryana" },
    { label: "Uttar Pradesh", value: "Uttar Pradesh" },
    { label: "Madhya Pradesh", value: "Madhya Pradesh" },
    { label: "Maharashtra", value: "Maharashtra" },
    { label: "Rajasthan", value: "Rajasthan" },
  ];

  const districtOptions = React.useMemo(() => {
    const baseOptions = [{ label: filters.state ? `All in ${filters.state}` : "Select State First", value: "" }];

    // Get static districts for the selected state
    const staticDistricts = DISTRICTS_BY_STATE[filters.state] || [];

    // Merge with any districts found in current records (to handle cases outside static list)
    const dynamicDistricts = records
      .filter(r => r.state === filters.state)
      .map(r => r.district);

    const allUniqueDistricts = [...new Set([...staticDistricts, ...dynamicDistricts])]
      .filter(Boolean)
      .sort();

    return [...baseOptions, ...allUniqueDistricts.map(d => ({ label: d, value: d }))];
  }, [filters.state, records]);

  const CATEGORIES = [
    { label: 'Cereals', icon: '🌾' },
    { label: 'Vegetables', icon: '🥦' },
    { label: 'Fruits', icon: '🍎' },
    { label: 'Oilseeds', icon: '🌻' },
    { label: 'Spices', icon: '🌶️' }
  ];

  const SUGGESTIONS = ['Wheat', 'Rice', 'Potato', 'Tomato', 'Mustard', 'Onion', 'Cotton', 'Soybean'];

  const SkeletonCard = () => (
    <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-7 animate-pulse">
      <div className="flex justify-between mb-8">
        <div className="w-24 h-6 bg-[#86efac]/10 rounded-xl" />
        <div className="w-16 h-4 bg-[#86efac]/10 rounded-lg" />
      </div>
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="w-20 h-3 bg-[#86efac]/5 rounded" />
          <div className="w-40 h-10 bg-[#86efac]/10 rounded-2xl" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-[#86efac]/5 rounded-2xl" />
          <div className="h-16 bg-[#86efac]/5 rounded-2xl" />
        </div>
        <div className="pt-5 border-t border-[var(--glass-border)] flex gap-3">
          <div className="w-8 h-8 rounded-xl bg-[var(--mut)] opacity-10" />
          <div className="flex-1 space-y-2">
            <div className="w-full h-3 bg-[var(--mut)] opacity-10 rounded" />
            <div className="w-1/2 h-2 bg-[var(--mut)] opacity-5 rounded" />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden bg-[var(--page-bg)] transition-colors duration-300">
      {/* Advanced Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[80px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-900/5 blur-[100px] rounded-full" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[60px] rounded-full animate-bounce" style={{ animationDuration: '10s' }} />
      </div>

      {/* Compact Mobile-First Header */}
      <header className="px-3 md:px-8 py-2 md:py-5 border-b border-[var(--glass-border)] flex flex-col gap-2 md:gap-5 bg-[var(--dk2)]/90 backdrop-blur-xl sticky top-0 z-50 transform-gpu transition-colors duration-300">
        {/* Row 1: Header + Sync */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Hamburger — mobile only, inline */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden shrink-0 p-1.5 bg-[#166534]/40 border border-[#86efac]/20 rounded-lg text-[#4ade80] backdrop-blur-md"
          >
            <Menu className="w-4 h-4" />
          </button>

          <div className="hidden sm:flex p-1.5 md:p-3 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-lg border border-emerald-400/30 text-white shrink-0">
            <TrendingUp className="w-3.5 h-3.5 md:w-5 md:h-5" />
          </div>

          <h1 className="flex-1 text-xs md:text-xl xl:text-2xl font-bold text-[var(--txt)] font-outfit tracking-tight leading-none min-w-0 truncate">
            Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">rates</span>
          </h1>

          <button
            onClick={() => fetchPrices(true)}
            disabled={isSyncing}
            className={`shrink-0 flex items-center justify-center gap-1.5 p-1.5 px-3 md:px-5 md:py-2.5 rounded-lg md:rounded-xl border transition-all text-[0.6rem] md:text-sm font-black active:scale-95 ${isSyncing
                ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-emerald-500/20 border-emerald-400/20 text-emerald-400')
                : (theme === 'light' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700' : 'bg-emerald-500 border-none text-black hover:bg-emerald-400 shadow-[0_4px_20px_rgba(16,185,129,0.3)]')
              }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 md:w-5 md:h-5 ${isSyncing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isSyncing ? "Syncing..." : "Sync"}</span>
          </button>
        </div>

        {/* Row 2: Search + Unit Dropdown inline */}
        <div className="flex items-center gap-1.5 md:gap-4">
          <div className="flex-1 relative group min-w-0">
            <Search className={`absolute left-2.5 md:left-4 top-1/2 -translate-y-1/2 transition-colors w-3.5 h-3.5 md:w-5 md:h-5 ${theme === 'light' ? 'text-slate-500' : 'text-emerald-400'
              }`} />
            <input
              type="text"
              placeholder="Search crop or mandi..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              className={`w-full border rounded-lg md:rounded-xl py-1.5 md:py-3.5 pl-8 md:pl-12 pr-2 md:pr-4 text-[0.65rem] md:text-sm transition-all font-bold outline-none ${theme === 'light'
                  ? 'bg-white border-emerald-200 text-emerald-950 placeholder-slate-400 focus:border-emerald-500 shadow-sm'
                  : 'bg-white/10 border-white/10 text-white placeholder-white/30 focus:border-emerald-500/50'
                }`}
            />
          </div>

          {/* Unit dropdown */}
          <div className="shrink-0 relative">
            <select
              value={isQuintal ? 'quintal' : '20kg'}
              onChange={(e) => setIsQuintal(e.target.value === 'quintal')}
              className={`appearance-none border rounded-lg md:rounded-xl pl-2 md:pl-5 pr-7 md:pr-10 py-1.5 md:py-3.5 text-[0.6rem] md:text-sm font-bold outline-none cursor-pointer transition-all ${theme === 'light'
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-700 focus:border-emerald-300'
                  : 'bg-emerald-900/40 border-emerald-500/30 text-emerald-300 focus:border-emerald-400/50'
                }`}
            >
              <option value="20kg">20KG Base</option>
              <option value="quintal">100KG (Qtl)</option>
            </select>
            <ChevronDown className={`absolute right-2 md:right-4 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 md:w-4 md:h-4 ${theme === 'light' ? 'text-emerald-400' : 'text-emerald-400/60'
              }`} />
          </div>
        </div>

        {/* Row 3: Filters & Chips (scrollable) */}
        <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto no-scrollbar pb-0.5 md:pb-2">
          <GlassDropdown
            icon={Filter}
            options={stateOptions}
            value={filters.state}
            onChange={(val) => { setFilters({ ...filters, state: val, district: '' }); setPage(0); }}
            placeholder="State"
          />
          <GlassDropdown
            icon={MapPin}
            options={districtOptions}
            value={filters.district}
            onChange={(val) => { setFilters({ ...filters, district: val }); setPage(0); }}
            placeholder="Dist."
            disabled={!filters.state}
          />
          <div className="w-px h-3 md:h-6 bg-white/10 shrink-0 mx-0.5 md:mx-2" />
          {CATEGORIES.map(cat => (
            <button
              key={cat.label}
              onClick={() => { setSearch(cat.label); setPage(0); }}
              className={`flex flex-shrink-0 items-center gap-1 md:gap-2 py-1 md:py-2.5 px-2 md:px-4 rounded-md md:rounded-xl text-[0.55rem] md:text-sm font-bold transition-all ${search === cat.label
                ? (theme === 'light' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-500/20 text-emerald-300 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)]')
                : (theme === 'light' ? 'bg-white text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-100' : 'bg-white/5 text-[var(--txt)]/40 hover:text-emerald-400 hover:bg-white/10')
                }`}
            >
              <span className="text-[0.65rem] md:text-base">{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </header>

      {/* Content Area with Skeleton States */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 custom-scrollbar">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filteredRecords.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            <AnimatePresence mode="popLayout">
              {filteredRecords.map((rec, idx) => {
                const modalPrice = isQuintal ? rec.modal_price : (rec.modal_price / 5);
                const minPrice = isQuintal ? rec.min_price : (rec.min_price / 5);
                const maxPrice = isQuintal ? rec.max_price : (rec.max_price / 5);
                const unitLabel = isQuintal ? "Quintal" : "20 kg";

                return (
                  <motion.div
                    key={`${rec.market}-${rec.commodity}-${rec.variety}-${idx}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02, duration: 0.3 }}
                    whileHover={{ y: -6, scale: 1.01 }}
                    onClick={() => {
                      setSelectedCrop(rec);
                      fetchTrends(rec.commodity, rec.state);
                    }}
                    className={`group border rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-7 cursor-pointer transition-all shadow-xl relative overflow-hidden will-change-transform ${theme === 'light' ? 'bg-white border-gray-100 hover:border-emerald-300 shadow-emerald-900/5' : 'bg-[var(--dk2)]/80 border-[var(--glass-border)] hover:border-emerald-500/30'
                      }`}
                  >
                    {/* Lighter overlay for peak performance */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                    <div className="flex justify-between items-start mb-8 relative z-10">
                      <div className={`px-4 py-2 rounded-2xl border shadow-lg inline-flex items-center max-w-[80%] min-h-[2.5rem] ${theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-[var(--dk3)] border-emerald-500/20'
                        }`}>
                        <span className={`text-[0.75rem] font-black leading-tight drop-shadow-sm ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-500'}`}>
                          {rec.commodity || 'Unknown Crop'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                        <Calendar size={10} className={theme === 'light' ? 'text-gray-400' : 'text-[#86efac]/60'} />
                        <span className={`text-[0.55rem] font-bold ${theme === 'light' ? 'text-gray-400' : 'text-[#86efac]/40'}`}>{rec.arrival_date}</span>
                      </div>
                    </div>

                    <div className="space-y-6 relative">
                      <div>
                        <div className="text-[0.65rem] text-[var(--mut)] font-bold mb-1">Live mandi price</div>
                        <h3 className="text-3xl font-bold text-[var(--txt)] flex items-baseline gap-1">
                          ₹{(modalPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                          <span className="text-xs font-medium text-slate-500 dark:text-[var(--glt)]/40">/{unitLabel}</span>
                        </h3>
                        <div className="flex items-center gap-2 mt-2">
                          <div className={`flex items-center px-2 py-0.5 rounded-lg border gap-0.5 text-[0.65rem] font-bold ${rec.trend < 0 ? 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-400/5 dark:border-rose-400/10' : 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-400/5 dark:border-emerald-400/10'}`}>
                            {rec.trend < 0 ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
                            {Math.abs(rec.trend || 0).toFixed(1)}%
                          </div>
                          <span className="text-[0.65rem] text-[var(--mut)] font-bold">Market Trend</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 dark:bg-[var(--dk)]/30 rounded-2xl p-3 border border-slate-100 dark:border-emerald-500/5 transition-colors group-hover:border-emerald-500/10 shadow-inner">
                          <span className="block text-[0.55rem] text-[var(--mut)] font-bold mb-1">Min rate</span>
                          <span className="text-[0.85rem] font-bold text-[var(--txt)]">₹{minPrice.toFixed(1)}</span>
                        </div>
                        <div className="bg-slate-50 dark:bg-[var(--dk)]/30 rounded-2xl p-3 border border-slate-100 dark:border-emerald-500/5 transition-colors group-hover:border-emerald-500/10 shadow-inner">
                          <span className="block text-[0.55rem] text-[var(--mut)] font-bold mb-1">Max rate</span>
                          <span className="text-[0.85rem] font-bold text-[var(--txt)]">₹{maxPrice.toFixed(1)}</span>
                        </div>
                      </div>

                      <div className="pt-5 border-t border-slate-100 dark:border-emerald-500/10 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
                            <MapPin size={14} className="text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[0.75rem] font-bold text-[var(--txt)] truncate leading-tight">{rec.market || 'Unknown Mandi'}</p>
                            <p className="text-[0.6rem] text-slate-500 dark:text-[var(--glt)]/40 font-bold truncate leading-none mt-0.5">{rec.district || 'Nearby'}, {rec.state || 'India'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tooltip hint */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                      <ArrowUpRight size={14} className="text-[#4ade80]" />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-32 h-32 bg-emerald-500/5 rounded-full flex items-center justify-center mb-8 border-4 border-emerald-500/5 relative shadow-inner"
            >
              <X className="text-[#86efac]/20" size={48} />
              <div className="absolute inset-0 bg-emerald-500/10 blur-3xl animate-pulse" />
            </motion.div>
            <h2 className="text-2xl font-bold text-[var(--txt)] mb-3 tracking-tight">Search dead end</h2>
            <p className="text-[var(--glt)]/40 text-sm font-medium leading-relaxed">We couldn't find any results matching your filters. <br />Try adjusting your Search Term or State selection.</p>
            <button
              onClick={() => { setSearch(''); setFilters({ state: '', district: '', commodity: '' }); setPage(0); }}
              className="mt-8 px-8 py-3 bg-[#4ade80] border-none rounded-2xl text-xs font-bold text-[#052c16] hover:bg-[#22c55e] transition-all hover:shadow-[0_0_40px_rgba(74,222,128,0.3)] shadow-lg active:scale-95"
            >
              Reset Intelligence Filter
            </button>
          </div>
        )}

        {/* Pagination UI */}
        {total > limit && !loading && (
          <div className="flex items-center justify-center gap-6 mt-16 pb-12">
            <button
              onClick={() => { setPage(p => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={page === 0}
              className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-emerald-300/10 text-emerald-600 dark:text-emerald-400 disabled:opacity-20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 shadow-sm dark:shadow-none transition-all group active:scale-90"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="bg-white dark:bg-gradient-to-b dark:from-[#166534]/30 dark:to-[#052c16]/30 border border-slate-200 dark:border-emerald-500/20 px-8 py-4 rounded-3xl shadow-lg dark:shadow-xl flex flex-col items-center">
              <span className="text-[0.6rem] font-bold text-slate-500 dark:text-emerald-300/50 mb-1">Intelligence batch</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-slate-800 dark:text-white">{page + 1}</span>
                <span className="text-slate-300 dark:text-emerald-500/30 font-bold">/</span>
                <span className="text-xl font-bold text-slate-400 dark:text-emerald-500/30">{Math.ceil(total / limit)}</span>
              </div>
            </div>
            <button
              onClick={() => { setPage(p => p + 1); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              disabled={(page + 1) * limit >= total}
              className="p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-emerald-300/10 text-emerald-600 dark:text-emerald-400 disabled:opacity-20 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 shadow-sm dark:shadow-none transition-all group active:scale-90"
            >
              <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </div>

      {/* Analytics Modal Section */}
      <AnimatePresence>
        {selectedCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 backdrop-blur-md bg-black/40 dark:bg-black/80"
            onClick={() => setSelectedCrop(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 50, rotateX: 10 }}
              animate={{ scale: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl bg-white dark:bg-[#08180c] border border-slate-200 dark:border-emerald-500/20 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl dark:shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[90vh] sm:max-h-[80vh] h-full sm:h-auto transition-colors"
            >
              {/* Modal Header */}
              <div className="px-5 py-5 md:px-10 md:py-8 bg-gradient-to-r from-emerald-500/10 dark:from-emerald-950/50 to-transparent border-b border-slate-200 dark:border-emerald-500/10 flex items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="p-3.5 sm:p-4 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-2xl sm:rounded-[1.5rem] border border-emerald-500/20 dark:border-emerald-500/30 shrink-0">
                    <TrendingUp className="text-emerald-600 dark:text-emerald-400 w-6 h-6 sm:w-8 sm:h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-3xl font-bold text-slate-900 dark:text-[var(--txt)]">
                      {selectedCrop.commodity} <span className="text-emerald-600 dark:text-emerald-400 block sm:inline font-bold">Analytics</span>
                    </h2>
                    <p className="text-slate-500 dark:text-[var(--glt)]/40 text-[0.65rem] sm:text-xs font-bold mt-1">
                      {selectedCrop.market}, {selectedCrop.district} · 7-day market trajectory
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCrop(null)}
                  className="p-2.5 sm:p-3 bg-slate-100 hover:bg-slate-200 dark:bg-[var(--card-bg)] dark:hover:bg-[var(--glass-bg)] rounded-2xl transition-all text-slate-500 hover:text-slate-800 dark:text-[var(--mut)] dark:hover:text-[var(--txt)] shrink-0"
                >
                  <X size={22} className="sm:w-6 sm:h-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto custom-scrollbar min-h-0">
                {(() => {
                  // Start with the basic normalization
                  let normalizedTrend = trendData.map(d => ({
                    ...d,
                    price: isQuintal ? d.price : (d.price / 5)
                  }));

                  // CRITICAL: Anchor the last point to the EXACT price from the card for 100% consistency
                  if (normalizedTrend.length > 0 && selectedCrop) {
                    const directLivePrice = isQuintal ? selectedCrop.modal_price : (selectedCrop.modal_price / 5);
                    normalizedTrend[normalizedTrend.length - 1].price = directLivePrice;
                  }

                  const latestPrice = normalizedTrend.length > 0 ? normalizedTrend[normalizedTrend.length - 1].price : 0;
                  const avgPrice = normalizedTrend.length > 0 ? (normalizedTrend.reduce((acc, curr) => acc + curr.price, 0) / normalizedTrend.length) : 0;
                  const stability = avgPrice > 0 ? (100 - Math.min(100, Math.abs((latestPrice - avgPrice) / avgPrice * 100))).toFixed(1) : "N/A";
                  const isUp = normalizedTrend.length > 1 ? normalizedTrend[normalizedTrend.length - 1].price >= normalizedTrend[0].price : true;
                  const trendPerc = normalizedTrend.length > 1 ? ((normalizedTrend[normalizedTrend.length - 1].price - normalizedTrend[0].price) / normalizedTrend[0].price * 100).toFixed(1) : "0.0";
                  const sentimentText = isUp ? "Bullish" : "Bearish";
                  const sentimentDesc = isUp ? `Market up by ${trendPerc}% over 7 days.` : `Market down by ${Math.abs(trendPerc)}% over 7 days.`;
                  const unitLabel = isQuintal ? "Quintal" : "20 kg";

                  return (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-10">
                        <div className={`rounded-[1.5rem] sm:rounded-3xl p-5 sm:p-6 transition-all border ${
                          isUp 
                            ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/10 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/20' 
                            : 'bg-rose-50/70 border-rose-200 hover:bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/10 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/20'
                        }`}>
                          <span className={`block text-[0.65rem] font-bold mb-2 ${isUp ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-rose-700 dark:text-rose-400/80'}`}>7-day price trend</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold leading-none ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{Math.abs(parseFloat(trendPerc))}%</span>
                            {isUp ? <TrendingUp className="text-emerald-600 dark:text-emerald-400/50" size={24} /> : <TrendingDown className="text-rose-600 dark:text-rose-400/50" size={24} />}
                          </div>
                          <p className="text-[0.65rem] text-slate-600 dark:text-[#86efac]/40 mt-2 sm:mt-3 font-medium">Market trajectory is currently {sentimentText}.</p>
                        </div>
                        <div className={`rounded-[1.5rem] sm:rounded-3xl p-5 sm:p-6 transition-all border ${
                          isUp 
                            ? 'bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50 dark:bg-emerald-500/5 dark:border-emerald-500/10 dark:hover:bg-emerald-500/10 dark:hover:border-emerald-500/20' 
                            : 'bg-rose-50/70 border-rose-200 hover:bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/10 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/20'
                        }`}>
                          <span className={`block text-[0.65rem] font-bold mb-2 ${isUp ? 'text-emerald-700 dark:text-emerald-400/80' : 'text-rose-700 dark:text-rose-400/80'}`}>Trend sentiment</span>
                          <div className="flex items-center gap-3">
                            <span className={`text-3xl font-bold leading-none ${isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{sentimentText}</span>
                          </div>
                          <p className="text-[0.65rem] text-slate-600 dark:text-[var(--mut)] mt-2 sm:mt-3 font-medium">{sentimentDesc}</p>
                        </div>
                        <div className="flex flex-col gap-3 min-h-[100px]">
                          <button
                            onClick={() => handleShare(selectedCrop)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 border border-emerald-500 dark:border-emerald-400 rounded-2xl text-[0.65rem] font-bold text-white dark:text-emerald-950 transition-all flex items-center justify-center gap-2 shadow-[0_10px_40px_rgba(16,185,129,0.2)] grow active:scale-95"
                          >
                            <ArrowUpRight size={16} /> Data export
                          </button>
                          <p className="text-[0.55rem] text-slate-400 dark:text-[#86efac]/20 text-center font-bold italic">Verified by KrishiAI market OS · {new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* High Resolution Chart with Anchored Data */}
                      <div className="bg-slate-50 dark:bg-[var(--dk2)] border border-slate-200 dark:border-emerald-500/10 rounded-3xl sm:rounded-[2.5rem] p-4 sm:p-8 h-[280px] sm:h-[400px] relative overflow-hidden group/chart mt-4 sm:mt-0">
                        <div className="absolute top-4 left-4 flex items-center gap-2 opacity-70 group-hover/chart:opacity-100 transition-opacity">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse hidden sm:block" />
                          <span className="text-[0.5rem] sm:text-[0.6rem] font-bold text-emerald-700 dark:text-emerald-400 hidden sm:block">Live price feed (live anchor enabled)</span>
                        </div>
                        {loadingTrend ? (
                          <div className="h-full flex flex-col items-center justify-center gap-4">
                            <Loader2 className="animate-spin text-emerald-600 dark:text-emerald-400" size={40} />
                            <span className="text-xs font-bold text-slate-500 dark:text-emerald-500/40">Generating projection...</span>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%" minHeight={260} minWidth={100}>
                            <AreaChart data={normalizedTrend}>
                              <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#00000010' : 'rgba(16,185,129,0.05)'} vertical={false} />
                              <XAxis
                                dataKey="date"
                                stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(16,185,129,0.2)'}
                                tick={{ fill: theme === 'light' ? '#64748b' : 'rgba(134,239,172,0.4)', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dy={10}
                              />
                              <YAxis
                                stroke={theme === 'light' ? 'rgba(0,0,0,0.1)' : 'rgba(16,185,129,0.2)'}
                                tick={{ fill: theme === 'light' ? '#64748b' : 'rgba(134,239,172,0.4)', fontSize: 10, fontWeight: 700 }}
                                axisLine={false}
                                tickLine={false}
                                dx={-10}
                                domain={['dataMin - 100', 'auto']}
                                tickFormatter={(v) => `₹${v.toFixed(0)}`}
                              />
                              <Tooltip
                                contentStyle={{
                                  background: theme === 'light' ? '#ffffff' : '#08120b',
                                  border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(16,185,129,0.3)',
                                  borderRadius: '1.25rem',
                                  padding: '12px 16px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  boxShadow: theme === 'light' ? '0 10px 25px rgba(0,0,0,0.05)' : '0 20px 40px rgba(0,0,0,0.6)'
                                }}
                                labelStyle={{ color: theme === 'light' ? '#64748b' : 'rgba(16,185,129,0.5)', marginBottom: '4px' }}
                                itemStyle={{ color: '#10b981' }}
                                formatter={(value) => [`₹${value.toFixed(1)} / ${unitLabel}`, 'Live rate']}
                              />
                              <Area
                                type="monotone"
                                dataKey="price"
                                stroke="#10b981"
                                strokeWidth={4}
                                fillOpacity={1}
                                fill="url(#colorPrice)"
                                animationDuration={1000}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
