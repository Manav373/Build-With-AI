import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Phone, Globe, Camera, Mic, MapPin, Leaf, TrendingUp, CloudRain, Shield, ChevronRight, CheckCircle, ArrowRight, Zap, Bot, Smartphone, Languages, Menu } from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { translations } from '../utils/translations';

const WHATSAPP_NUMBER = '+14155238886';
const WHATSAPP_LINK = `https://api.whatsapp.com/send/?phone=14155238886&text=join+wish-aboard&type=phone_number&app_absent=0`;

/* ═══ STATIC FEATURE CONFIG ═══ */
const FEATURE_CONFIG = [
  { id: 'weather', icon: <CloudRain size={20} />, color: 'from-blue-500 to-cyan-500', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'crop_advice', icon: <Leaf size={20} />, color: 'from-emerald-500 to-green-600', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'disease', icon: <Camera size={20} />, color: 'from-red-500 to-orange-500', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'voice', icon: <Mic size={20} />, color: 'from-violet-500 to-purple-600', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'market', icon: <TrendingUp size={20} />, color: 'from-amber-500 to-yellow-500', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'location', icon: <MapPin size={20} />, color: 'from-teal-500 to-emerald-500', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'schemes', icon: <Shield size={20} />, color: 'from-indigo-500 to-blue-600', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
  { id: 'yield', icon: <Zap size={20} />, color: 'from-lime-500 to-green-500', langs: ['EN', 'HI', 'GU', 'MR', 'TA', 'TE', 'BN', 'PA'] },
];

const LANGUAGES_DATA = [
  { code: 'EN', name: 'English', flag: '🇬🇧', num: '1' },
  { code: 'HI', name: 'हिंदी', flag: '🇮🇳', num: '2' },
  { code: 'GU', name: 'ગુજરાતી', flag: '🇮🇳', num: '3' },
  { code: 'MR', name: 'मराठी', flag: '🇮🇳', num: '4' },
  { code: 'TA', name: 'தமிழ்', flag: '🇮🇳', num: '5' },
  { code: 'TE', name: 'తెలుగు', flag: '🇮🇳', num: '6' },
  { code: 'BN', name: 'বাংলা', flag: '🇮🇳', num: '7' },
  { code: 'PA', name: 'ਪੰਜਾਬੀ', flag: '🇮🇳', num: '8' },
];

export default function WhatsAppPage({ isLanding = false }) {
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const t = translations[language];
  const wt = t.whatsappPage;

  // Map features to translated content
  const ALL_FEATURES = useMemo(() => FEATURE_CONFIG.map(f => ({
    ...f,
    title: wt.features[f.id].title,
    desc: wt.features[f.id].desc,
    inputs: wt.features[f.id].inputs,
    example: {
      user: wt.features[f.id].exampleUser,
      bot: wt.features[f.id].exampleBot
    }
  })), [wt]);

  // Map flow steps to translated content
  const FLOW_STEPS = useMemo(() => wt.algorithm.map(step => ({
    ...step,
    icon: step.icon // icon is stored in translation string for simplicity here
  })), [wt]);

  const [activeFeatureId, setActiveFeatureId] = useState(ALL_FEATURES[0].id);
  const activeFeature = ALL_FEATURES.find(f => f.id === activeFeatureId) || ALL_FEATURES[0];
  const [activeTab, setActiveTab] = useState('features');

  return (
    <div className={`flex-1 ${isLanding ? 'bg-transparent overflow-visible' : 'h-full flex flex-col bg-[var(--page-bg)] overflow-hidden'} relative`}>
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Page Header - Hidden on Landing Page */}
      {!isLanding && (
        <header className={`px-6 py-4 flex items-center justify-between border-b transition-colors sticky top-0 z-30 backdrop-blur-xl ${
          theme === 'light' ? 'bg-white/90 border-gray-100 shadow-sm' : 'bg-[var(--dk2)]/20 border-white/5'
        }`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className={`lg:hidden p-2 rounded-xl transition-all ${
                theme === 'light' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
              }`}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className={`text-xl font-bold flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                <span className="text-2xl">📱</span> {wt.title}
              </h1>
              <p className={`text-[0.7rem] font-bold ${theme === 'light' ? 'text-emerald-600/70' : 'text-emerald-400/50'}`}>{wt.subtitle}</p>
            </div>
          </div>
        </header>
      )}

      {/* Landing Page Section Header */}
      {isLanding && (
        <div className="text-center pt-24 pb-12 relative z-10 px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <span className={`px-4 py-1.5 rounded-full border text-xs font-bold transition-all ${
              theme === 'light' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400'
            }`}>
              {wt.heroTitle}
            </span>
            <h2 className={`text-5xl md:text-7xl font-bold tracking-tighter transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {wt.heroHeading.split('{botSDK}')[0]}
              <span className="text-emerald-500">{wt.botSDK}</span>
              {wt.heroHeading.split('{botSDK}')[1]}
            </h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-white/40'}`}>
              {wt.heroDesc}
            </p>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      <div className={`${isLanding ? 'w-full px-4 md:px-8 pb-32' : 'flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar'} relative z-10`}>
        <div className="max-w-6xl mx-auto space-y-8 pb-20">

          {/* ═══ HERO CARD ═══ */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`relative rounded-[2.5rem] overflow-hidden border p-6 md:p-10 transition-all duration-500 ${
              theme === 'light' 
                ? 'bg-white border-gray-100 shadow-[0_32px_120px_rgba(0,0,0,0.05)]' 
                : 'bg-[#020c05]/30 border-white/[0.05] backdrop-blur-[40px] shadow-[0_32px_120px_rgba(0,0,0,0.9)]'
            }`}
          >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />

            <div className="relative flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
              <div className="space-y-6 flex-1">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-[0_15px_35px_rgba(34,197,94,0.3)] transform -rotate-3 hover:rotate-0 transition-transform duration-500">
                    <MessageSquare size={28} className="text-white sm:w-8 sm:h-8 w-7 h-7" />
                  </div>
                  <div>
                    <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{wt.heroCardTitle}</h2>
                    <p className={`font-bold text-sm transition-colors ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`}>{wt.heroCardSubtitle}</p>
                  </div>
                </div>

                <p className={`text-[1rem] leading-relaxed max-w-2xl font-medium transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-white/50'}`}>
                  {wt.heroCardDesc.split('8 Indian languages').map((part, i, arr) => (
                    <React.Fragment key={i}>
                      {part}
                      {i < arr.length - 1 && <strong className={theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}>{wt.dialectsCount}</strong>}
                    </React.Fragment>
                  ))}
                  {/* Fallback if exact matching fails */}
                  {!wt.heroCardDesc.includes('8 Indian languages') && wt.heroCardDesc}
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2">
                  <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer"
                    className="flex justify-center items-center gap-3 px-5 py-3 sm:px-8 sm:py-4 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold text-sm transition-all shadow-[0_10px_30px_rgba(34,197,94,0.3)] hover:scale-105 group"
                  >
                    <MessageSquare size={20} /> {wt.btnChat}
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </a>
                  <div className={`flex justify-center items-center gap-3 px-5 py-3 sm:px-6 sm:py-4 rounded-2xl border text-[0.85rem] sm:text-[0.95rem] font-bold backdrop-blur-xl transition-colors ${
                    theme === 'light' ? 'bg-gray-100 border-gray-200 text-slate-700' : 'bg-white/5 border-white/5 text-white/90'
                  }`}>
                    <Phone size={16} className={theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'} /> {WHATSAPP_NUMBER}
                  </div>
                </div>
              </div>

              {/* Supported Languages Icons */}
              <div className="flex flex-wrap lg:grid lg:grid-cols-4 gap-2 shrink-0">
                {LANGUAGES_DATA.map(l => {
                  const isSupported = ['EN', 'HI', 'GU', 'MR'].includes(l.code);
                  const isActive = language?.toUpperCase() === l.code;

                  return (
                    <button 
                      key={l.code} 
                      onClick={() => isSupported && setLanguage(l.code.toLowerCase())}
                      disabled={!isSupported}
                      className={`px-4 py-2 border rounded-xl text-[0.7rem] font-bold flex items-center justify-center gap-2 transition-all backdrop-blur-md ${
                        isActive 
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : isSupported 
                            ? (theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200' : 'bg-white/[0.03] border-white/5 text-white/60 hover:bg-emerald-500/10 hover:border-emerald-500/20')
                            : (theme === 'light' ? 'bg-gray-50/50 border-gray-100/50 text-slate-300 cursor-not-allowed' : 'bg-white/[0.01] border-white/[0.02] text-white/20 cursor-not-allowed')
                      }`}
                    >
                      <span className={`transition-all ${isActive ? 'grayscale-0 scale-110' : 'grayscale-[0.5] group-hover:grayscale-0'}`}>{l.flag}</span>
                      <span className="tracking-tighter">{l.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ═══ TABS ═══ */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
              { id: 'features', label: wt.tabs.features, icon: <Zap size={16} /> },
              { id: 'algorithm', label: wt.tabs.algorithm, icon: <Bot size={16} /> },
              { id: 'languages', label: wt.tabs.languages, icon: <Globe size={16} /> },
              { id: 'inputs', label: wt.tabs.inputs, icon: <Smartphone size={16} /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 sm:gap-2.5 px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-2xl text-[0.75rem] sm:text-[0.85rem] font-bold transition-all border whitespace-nowrap backdrop-blur-md ${activeTab === tab.id
                  ? (theme === 'light' ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/20' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-[0_10px_20px_rgba(16,185,129,0.1)]')
                  : (theme === 'light' ? 'bg-white border-gray-100 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50' : 'bg-white/[0.01] border-white/5 text-white/30 hover:text-white/60 hover:bg-white/[0.03]')
                  }`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* ═══ TAB CONTENT ═══ */}
          <AnimatePresence mode="wait">
            {activeTab === 'features' && (
              <motion.div
                key="features" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                {/* Left: Feature List */}
                <div className="lg:col-span-4 space-y-3">
                  <div className="flex items-center justify-between px-2 mb-4">
                    <h3 className={`text-[0.7rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/50'}`}>Feature list</h3>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[0.6rem] font-bold border border-emerald-500/20">{wt.modulesCount}</span>
                  </div>
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                    {ALL_FEATURES.map(f => (
                      <button 
                        key={f.id} onClick={() => setActiveFeatureId(f.id)}
                        className={`w-full group flex items-center gap-4 p-4 rounded-[1.25rem] text-left transition-all border relative overflow-hidden backdrop-blur-md ${activeFeatureId === f.id
                          ? (theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-slate-900' : 'bg-emerald-500/10 border-emerald-500/30 text-white')
                          : (theme === 'light' ? 'bg-white border-gray-100 text-slate-400 hover:bg-gray-50 hover:text-slate-600' : 'bg-white/[0.01] border-white/5 text-white/40 hover:bg-white/[0.03]')
                          }`}
                      >
                        {activeFeatureId === f.id && (
                          <motion.div layoutId="active-pill" className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full" />
                        )}
                        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white flex-shrink-0 shadow-lg`}>
                          {f.icon}
                        </div>
                        <div className="min-w-0 pr-4">
                          <p className={`text-[0.9rem] font-bold tracking-tight mb-0.5 ${activeFeatureId === f.id ? (theme === 'light' ? 'text-slate-900' : 'text-white') : (theme === 'light' ? 'text-slate-400' : 'text-white/60')}`}>{f.title}</p>
                          <p className={`text-[0.68rem] truncate leading-tight font-medium ${theme === 'light' ? 'text-slate-500' : 'text-white/60'}`}>{f.desc}</p>
                        </div>
                        <ChevronRight size={16} className={`ml-auto shrink-0 transition-transform ${activeFeatureId === f.id ? 'text-emerald-400 translate-x-1' : (theme === 'light' ? 'text-gray-200' : 'text-white/10')}`} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right: Feature Detail + Chat Preview */}
                <div className="lg:col-span-8 space-y-6">
                  {/* Detail Panel */}
                  <motion.div layout
                    className={`rounded-[2rem] border p-4 sm:p-6 md:p-8 shadow-2xl relative overflow-hidden backdrop-blur-3xl transition-all duration-500 ${
                      theme === 'light' ? 'bg-white border-gray-100 shadow-emerald-900/5' : 'bg-[#0b1410]/40 border-white/5 shadow-black/50'
                    }`}
                  >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl" />

                    <div className="relative flex flex-col md:flex-row gap-5 sm:gap-8 items-start">
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br ${activeFeature.color} flex items-center justify-center text-white shrink-0 shadow-2xl shadow-emerald-500/20`}>
                        {React.cloneElement(activeFeature.icon, { className: "w-8 h-8 sm:w-9 sm:h-9" })}
                      </div>
                      <div className="space-y-6 flex-1">
                        <div>
                          <h2 className={`text-2xl font-bold transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{activeFeature.title}</h2>
                          <p className={`text-[0.95rem] font-medium leading-relaxed transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-white/70'}`}>{activeFeature.desc}</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                          {/* Inputs */}
                          <div className="space-y-3">
                            <h3 className={`text-[0.65rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/50'}`}>What to send</h3>
                            <div className="flex flex-col gap-2">
                              {activeFeature.inputs.map((inp, i) => (
                                <div key={i} className={`flex items-center gap-3 px-4 py-3 border rounded-xl text-[0.8rem] font-bold group transition-all backdrop-blur-sm ${
                                  theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-500 hover:border-emerald-300' : 'bg-white/[0.03] border-white/5 text-white/50 hover:border-emerald-500/20'
                                }`}>
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                  {inp}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Languages */}
                          <div className="space-y-3">
                            <h3 className={`text-[0.65rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/50'}`}>Supported languages</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {activeFeature.langs.map(l => (
                                <span key={l} className={`px-3 py-1.5 border rounded-lg text-[0.7rem] font-bold backdrop-blur-sm transition-all ${
                                  theme === 'light' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-emerald-500/5 border border-emerald-500/10 text-emerald-400'
                                }`}>{l}</span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Chat Preview (The "Attached" look) */}
                  <div className={`rounded-[2.5rem] border overflow-hidden shadow-2xl relative backdrop-blur-2xl transition-all duration-500 ${
                    theme === 'light' ? 'bg-white border-gray-100' : 'bg-[#08120b]/40 border-white/5'
                  }`}>
                    <div className={`px-6 py-4 flex items-center justify-between border-b backdrop-blur-xl transition-colors ${
                      theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-emerald-950/40 border-white/5'
                    }`}>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-xl shadow-lg">🌾</div>
                        <div>
                          <p className={`text-[0.9rem] font-bold transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{wt.botName}</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            <p className="text-[0.65rem] text-green-400 font-bold">Online</p>
                          </div>
                        </div>
                      </div>
                      <div className={`flex gap-4 transition-colors ${theme === 'light' ? 'text-slate-300' : 'text-white/25'}`}>
                        <Phone size={18} />
                        <Bot size={18} />
                        <ChevronRight size={18} className="rotate-90" />
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 md:p-10 space-y-4 sm:space-y-6 min-h-[350px] relative overflow-hidden">
                      {/* User message */}
                      <motion.div key={`u-${activeFeatureId}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex justify-end">
                        <div className={`rounded-2xl rounded-tr-md px-4 py-3 sm:px-5 sm:py-4 max-w-[85%] sm:max-w-[80%] shadow-xl relative backdrop-blur-md ${
                          theme === 'light' ? 'bg-emerald-600 text-white' : 'bg-emerald-600/40 border border-emerald-500/30'
                        }`}>
                          <p className="text-[0.85rem] sm:text-[0.95rem] font-medium whitespace-pre-wrap">{activeFeature.example.user}</p>
                          <div className={`flex items-center justify-end gap-1 mt-2 ${theme === 'light' ? 'text-emerald-100' : 'text-white/40'}`}>
                            <span className="text-[0.6rem]">12:00 PM</span>
                            <span className="text-[0.6rem] text-emerald-300">✓✓</span>
                          </div>
                        </div>
                      </motion.div>

                      {/* Bot reply */}
                      <motion.div key={`b-${activeFeatureId}`} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="flex justify-start">
                        <div className={`border rounded-2xl rounded-tl-md px-4 py-4 sm:px-6 sm:py-5 max-w-[95%] sm:max-w-[90%] shadow-xl backdrop-blur-md transition-all ${
                          theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-600' : 'bg-white/[0.04] border-white/10 text-white/80'
                        }`}>
                          <p className="text-[0.85rem] sm:text-[0.95rem] whitespace-pre-wrap leading-relaxed font-outfit">{activeFeature.example.bot}</p>
                          <p className={`text-[0.6rem] text-right mt-3 font-bold ${theme === 'light' ? 'text-slate-300' : 'text-white/20'}`}>12:01 PM</p>
                        </div>
                      </motion.div>
                    </div>

                    <div className={`absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t ${theme === 'light' ? 'from-gray-50' : 'from-[#08120b]/20'} to-transparent z-10 pointer-events-none`} />
                  </div>

                  {/* Additional Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-6 rounded-[1.5rem] border backdrop-blur-md ${
                      theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/[0.01] border-white/5'
                    }`}>
                      <h3 className={`text-[0.6rem] font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/60'}`}>Global reach</h3>
                      <p className={`text-sm font-medium leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-white/70'}`}>{wt.globalReachDesc}</p>
                      <div className="flex gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-md text-[0.6rem] font-bold border ${theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400' : 'bg-white/5 border-white/5 text-white/40'}`}>META CLOUD</span>
                        <span className={`px-2 py-1 rounded-md text-[0.6rem] font-bold border ${theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400' : 'bg-white/5 border-white/5 text-white/40'}`}>TWILIO API</span>
                      </div>
                    </div>
                    <div className={`p-6 rounded-[1.5rem] border backdrop-blur-md ${
                      theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/5 border border-emerald-500/10'
                    }`}>
                      <h3 className={`text-[0.6rem] font-bold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400/60'}`}>Agent intelligence</h3>
                      <p className={`text-sm font-medium leading-relaxed ${theme === 'light' ? 'text-emerald-800' : 'text-emerald-400/80'}`}>{wt.agentIntelDesc.split('99.9% Uptime').map((part, i, arr) => (
                        <React.Fragment key={i}>
                          {part}
                          {i < arr.length - 1 && <span className="text-emerald-500 font-bold">99.9% Uptime</span>}
                        </React.Fragment>
                      ))}</p>
                      <div className="flex gap-2 mt-3">
                        <span className={`px-2 py-1 rounded-md text-[0.6rem] font-bold border ${theme === 'light' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400/40'}`}>VISION AI</span>
                        <span className={`px-2 py-1 rounded-md text-[0.6rem] font-bold border ${theme === 'light' ? 'bg-emerald-100 border-emerald-200 text-emerald-600' : 'bg-emerald-500/10 border-emerald-500/10 text-emerald-400/40'}`}>VOCALAI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'algorithm' && (
              <motion.div key="algo" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {FLOW_STEPS.map((step, i) => (
                    <motion.div key={i} whileHover={{ y: -5 }} className={`glass-panel p-6 rounded-[2rem] border relative group transition-all duration-300 ${
                      theme === 'light' ? 'bg-white border-gray-100 shadow-xl' : 'bg-white/[0.01] border-white/5 backdrop-blur-xl'
                    }`}>
                      <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">{step.icon}</div>
                      <span className={`text-[0.55rem] font-bold mb-2 block transition-colors ${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400/50'}`}>Stage {step.num}</span>
                      <h3 className={`text-[1rem] font-bold mb-2 transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{step.title}</h3>
                      <p className={`text-[0.75rem] leading-relaxed font-medium transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>{step.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className={`p-4 sm:p-6 md:p-8 rounded-[2.5rem] border backdrop-blur-2xl ${
                  theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-gradient-to-br from-emerald-900/10 to-green-900/5 border-white/5'
                }`}>
                  <div className="flex flex-col lg:flex-row gap-6 sm:gap-10 items-center">
                    <div className="lg:w-1/3 text-center lg:text-left space-y-4">
                      <div className={`inline-flex px-4 py-1 rounded-full text-[0.6rem] font-bold ${theme === 'light' ? 'bg-emerald-100 text-emerald-700' : 'bg-emerald-500/10 text-emerald-400'}`}>Processing stack</div>
                      <h2 className={`text-2xl font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{wt.processMessagesTitle}</h2>
                      <a href={WHATSAPP_LINK} className={`inline-flex items-center gap-2 font-bold text-sm border-b pb-1 transition-colors ${
                        theme === 'light' ? 'text-emerald-600 border-emerald-200 hover:text-emerald-800' : 'text-emerald-400 border-emerald-500/30 hover:text-emerald-300'
                      }`}>
                        {wt.liveDashboard} <ArrowRight size={14} />
                      </a>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                      <div className={`p-6 rounded-2xl border backdrop-blur-xl transition-all ${theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
                        <p className={`font-bold text-lg ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>95ms</p>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Latency</p>
                        <p className={`text-[0.7rem] ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>{wt.latencyDesc}</p>
                      </div>
                      <div className={`p-6 rounded-2xl border backdrop-blur-xl transition-all ${theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04]'}`}>
                        <p className={`font-bold text-lg ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>92%</p>
                        <p className={`text-xs font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Accuracy</p>
                        <p className={`text-[0.7rem] ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>{wt.accuracyDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'languages' && (
              <motion.div key="langs" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <div className="flex items-center justify-between px-2">
                  <h2 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{wt.lingueIntelTitle}</h2>
                  <span className={`${theme === 'light' ? 'text-emerald-600' : 'text-emerald-400'} font-bold text-[0.65rem]`}>{wt.dialectsCount}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {LANGUAGES_DATA.map(lang => (
                    <motion.div key={lang.code} whileHover={{ scale: 1.02 }} className={`border rounded-[1.5rem] p-4 sm:p-6 backdrop-blur-xl transition-all text-center group ${
                      theme === 'light' ? 'bg-white border-gray-100 shadow-sm hover:border-emerald-200' : 'bg-white/[0.01] border-white/5 hover:border-emerald-500/30'
                    }`}>
                      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{lang.flag}</div>
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <span className={`w-5 h-5 rounded-md text-[0.6rem] font-bold flex items-center justify-center border ${
                          theme === 'light' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                        }`}>{lang.num}</span>
                        <h3 className={`text-[1rem] font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{lang.name}</h3>
                      </div>
                      <p className={`text-[0.65rem] font-bold ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>{wt.sendToStart.replace('{num}', lang.num)}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'inputs' && (
              <motion.div key="inputs" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className={`border p-6 rounded-3xl mb-4 backdrop-blur-xl transition-all ${
                  theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/5 border border-emerald-500/10'
                }`}>
                   <p className={`text-sm font-medium leading-relaxed transition-colors ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400/80'}`}>
                     {wt.naturalLanguageTip}
                   </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ALL_FEATURES.map(f => (
                    <div key={f.id} className={`flex items-center gap-5 p-5 border rounded-2xl group transition-all backdrop-blur-xl ${
                      theme === 'light' ? 'bg-white border-gray-100 hover:bg-gray-50' : 'bg-white/[0.01] border-white/5 hover:bg-white/[0.03]'
                    }`}>
                       <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                        {f.icon}
                       </div>
                       <div className="flex-1 min-w-0">
                         <h3 className={`text-sm font-bold mb-1 group-hover:text-emerald-600 transition-colors tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{f.title}</h3>
                         <div className="flex flex-wrap gap-1.5 mt-2">
                           {f.inputs.map((inp, i) => (
                             <span key={i} className={`px-2.5 py-1 rounded-md text-[0.6rem] font-bold border italic transition-all ${
                               theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400' : 'bg-white/5 border-white/5 text-white/40'
                             }`}>"{inp}"</span>
                           ))}
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

      {/* Decorative Blur Bottom */}
      <div className="absolute bottom-[-5%] right-[-5%] w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
