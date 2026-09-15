import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Search, ExternalLink, Calendar, 
  CreditCard, ShieldCheck, Droplets, Info, 
  Sparkles, AlertCircle, ShoppingBag, Languages,
  Loader2, X, Menu
} from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { translations, LANGUAGES } from '../utils/translations/index';
import { useAuth } from '@clerk/clerk-react';
import { getAllSchemes, getAISchemeSummary } from '../services/api';

const FALLBACK_SCHEMES = [
  {
    "id": "pm-kisan-fallback",
    "title": "PM-KISAN Samman Nidhi",
    "desc": "Income support of ₹6,000 per year in three installments for all landholding farmers.",
    "benefit": "₹6,000 Yearly",
    "category": "Subsidy",
    "icon": "CreditCard",
    "color": "from-blue-500 to-indigo-600",
    "link": "https://pmkisan.gov.in/",
    "eligibility": ["Small and marginal farmers", "Own cultivable land"],
    "documents": ["Aadhaar card", "Land records"]
  },
  {
    "id": "pmfby-fallback",
    "title": "Fasal Bima Yojana (PMFBY)",
    "desc": "Comprehensive crop insurance against natural risks at very low premium rates.",
    "benefit": "Full Crop Cover",
    "category": "Insurance",
    "icon": "ShieldCheck",
    "color": "from-emerald-500 to-teal-600",
    "link": "https://pmfby.gov.in/",
    "eligibility": ["All farmers including sharecroppers"],
    "documents": ["Insurance receipt", "Aadhaar"]
  },
  {
    "id": "soil-health-fallback",
    "title": "Soil Health Card Scheme",
    "desc": "Provides farmers with their soil nutrient status and recommendations on dosage.",
    "benefit": "Free Soil Testing",
    "category": "Market",
    "icon": "Info",
    "color": "from-rose-500 to-pink-600",
    "link": "https://soilhealth.dac.gov.in/",
    "eligibility": ["All farmers in India"],
    "documents": ["Aadhaar number"]
  }
];

const ICON_MAP = {
  CreditCard: <CreditCard size={20} />,
  ShieldCheck: <ShieldCheck size={20} />,
  Droplets: <Droplets size={20} />,
  Sparkles: <Sparkles size={20} />,
  Info: <Info size={20} />,
  ShoppingBag: <ShoppingBag size={20} />
};

export default function SchemesPage() {
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { language, setLanguage, handleNewChat, processMessage } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const t = translations?.[language]?.features?.govtSchemes || translations?.en?.features?.govtSchemes || {};
  
  const [schemes, setSchemes] = useState(FALLBACK_SCHEMES);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [summaryModal, setSummaryModal] = useState(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        const token = await getToken();
        const data = await getAllSchemes(token);
        if (data && Array.isArray(data) && data.length > 0) {
          setSchemes(data);
        }
      } catch (error) {
        console.error("Failed to fetch schemes, using fallback:", error);
      } finally {
        setTimeout(() => setLoading(false), 800);
      }
    };
    fetchSchemes();
  }, []);

  const filteredSchemes = useMemo(() => {
    return schemes.filter(s => {
      const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || 
                          s.desc.toLowerCase().includes(search.toLowerCase());
      const matchCategory = category === 'All' || s.category === category;
      return matchSearch && matchCategory;
    });
  }, [search, category, schemes]);

  const categories = ['All', 'Subsidy', 'Insurance', 'Credit', 'Irrigation', 'Organic', 'Market'];

  const handleExplainDetailed = (schemeName) => {
    const chatT = translations?.[language]?.chat || translations?.en?.chat || {};
    const explainPrompt = chatT.prompts.explainScheme(schemeName);
    const newChatId = handleNewChat();
    processMessage(explainPrompt, null, null, null, null, newChatId);
    navigate('/chat');
  };

  const handleAISummary = async (e, scheme) => {
    e.stopPropagation(); // Don't trigger the card click (redirect)
    setSummaryModal({ ...scheme, summary: '' });
    setSummarizing(true);
    setSummarizing(true);
    try {
      const token = await getToken();
      const data = await getAISchemeSummary(scheme.id, language, token);
      if (data) {
        setSummaryModal(prev => ({ ...prev, summary: data.summary }));
      }
    } catch (error) {
      setSummaryModal(prev => ({ ...prev, summary: "Could not generate summary at this time. Please try again later." }));
    } finally {
      setSummarizing(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 pt-4 md:pt-8 pb-4 custom-scrollbar bg-white text-slate-900 dark:bg-[#030905] dark:text-[#e2f0e4]">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 pb-12">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-[#166534]/40 border border-[#86efac]/20 rounded-xl text-[#4ade80] shrink-0">
              <Menu size={18} />
            </button>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <ShieldCheck size={24} className="text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white tracking-tight transition-colors">{t.title || 'Govt schemes'}</h1>
            </div>
            <p className="text-slate-500 dark:text-emerald-100/60 ml-1 font-medium transition-colors">{t.desc || 'Explore support programs and subsidies tailored for your farm.'}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Language Switcher */}
            <div className="flex gap-1 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl border border-slate-200 dark:border-white/10 transition-colors">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all ${
                    language === lang.code 
                      ? 'bg-emerald-600 dark:bg-emerald-50 text-white dark:text-emerald-900 shadow-lg' 
                      : 'text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'
                  }`}
                >
                  {lang.short}
                </button>
              ))}
            </div>

            <div className="relative group w-full sm:w-auto sm:min-w-[200px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400/50 group-focus-within:text-emerald-400 transition-colors" />
              <input 
                type="text"
                placeholder={t.searchPlaceholder || "Search..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl py-2.5 pl-12 pr-4 text-slate-800 dark:text-white focus:border-emerald-500/50 focus:ring-0 transition-all placeholder:text-slate-400 dark:placeholder:text-white/20 text-sm"
              />
            </div>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto no-scrollbar pb-2">
           {categories.map(cat => (
             <button
               key={cat}
               onClick={() => setCategory(cat)}
               className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                 category === cat 
                   ? 'bg-emerald-600 dark:bg-emerald-500/10 border-emerald-500 text-white dark:text-emerald-400 shadow-lg shadow-emerald-500/20' 
                   : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/40 hover:bg-slate-200 dark:hover:bg-white/10 hover:border-slate-300 dark:hover:border-white/20'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Grid Area */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 premium-glass rounded-3xl border animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSchemes.map((scheme, idx) => (
                <motion.div
                  key={scheme.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => handleExplainDetailed(scheme.title)}
                  className="group relative flex flex-col h-full premium-glass rounded-3xl border transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 p-6 overflow-hidden cursor-pointer"
                >
                  {/* Accent Background */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${scheme.color} opacity-[0.03] group-hover:opacity-10 rounded-bl-[100px] transition-all`} />

                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scheme.color} flex items-center justify-center text-white shadow-lg`}>
                      {ICON_MAP[scheme.icon] || <Info size={20} />}
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[0.6rem] font-bold text-emerald-400/70 group-hover:text-emerald-400 transition-colors">
                      {scheme.category}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3 relative z-10">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">{scheme.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-white/40 leading-relaxed font-medium line-clamp-3 group-hover:text-slate-700 dark:group-hover:text-white/60 transition-colors">
                      {scheme.desc}
                    </p>
                  </div>

                  <div className="mt-6 space-y-4 pt-4 border-t border-slate-200 dark:border-white/5 transition-colors">
                    <div className="flex justify-between items-center bg-slate-100 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/5 transition-colors">
                      <span className="text-[0.65rem] font-bold text-slate-400 dark:text-white/30">Main benefit</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{scheme.benefit}</span>
                    </div>

                    <div className="flex gap-1.5 sm:gap-2">
                       <button 
                        onClick={(e) => handleAISummary(e, scheme)}
                        className="p-2.5 sm:p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-emerald-600 dark:text-emerald-400/60 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all"
                        title="Quick AI Preview"
                      >
                        <Sparkles size={16} className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                      </button>
                      <button 
                        className="flex-1 py-2 sm:py-3 px-3 sm:px-4 bg-emerald-600 group-hover:bg-emerald-500 text-white font-bold rounded-xl text-[0.65rem] sm:text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-emerald-900/40 leading-tight text-center"
                      >
                        {t.applyAI || 'Detailed AI Guide'}
                      </button>
                      <a 
                        href={scheme.link} target="_blank" rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-2.5 sm:p-3 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/60 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 rounded-xl transition-all flex items-center justify-center"
                      >
                        <ExternalLink size={16} className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]" />
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* AI Summary Modal */}
        <AnimatePresence>
          {summaryModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="w-full max-w-lg premium-glass border rounded-[2rem] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar transition-all duration-500"
              >
                <div className="p-5 sm:p-6 space-y-5 sm:space-y-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 transition-colors">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3 className="text-slate-800 dark:text-white font-bold transition-colors">{summaryModal.title}</h3>
                        <p className="text-emerald-600 dark:text-emerald-400/60 text-[10px] font-bold transition-colors">AI simplified guide</p>
                      </div>
                    </div>
                    <button onClick={() => setSummaryModal(null)} className="p-2 text-slate-400 dark:text-white/20 hover:text-slate-600 dark:hover:text-white transition-colors">
                      <X size={20} />
                    </button>
                  </div>

                  <div className="bg-slate-100 dark:bg-white/5 rounded-2xl p-5 border border-slate-200 dark:border-white/5 min-h-[120px] flex items-center justify-center transition-colors">
                    {summarizing ? (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 size={32} className="text-emerald-500 animate-spin" />
                        <span className="text-slate-400 dark:text-white/40 text-[10px] font-bold transition-colors">Generating with AI...</span>
                      </div>
                    ) : (
                      <div className="text-slate-700 dark:text-white/80 text-sm leading-relaxed whitespace-pre-wrap transition-colors">
                        {summaryModal.summary}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 mb-2 transition-colors">Eligibility</p>
                        <ul className="space-y-1">
                          {summaryModal.eligibility?.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-[11px] text-slate-600 dark:text-white/60 flex items-center gap-2 transition-colors">
                              <div className="w-1 h-1 rounded-full bg-emerald-500" /> {item}
                            </li>
                          ))}
                        </ul>
                     </div>
                     <div className="p-4 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 transition-colors">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-white/30 mb-2 transition-colors">Documents</p>
                        <ul className="space-y-1">
                          {summaryModal.documents?.slice(0, 3).map((item, i) => (
                            <li key={i} className="text-[11px] text-slate-600 dark:text-white/60 flex items-center gap-2 transition-colors">
                              <div className="w-1 h-1 rounded-full bg-blue-500" /> {item}
                            </li>
                          ))}
                        </ul>
                     </div>
                  </div>

                  <button 
                    onClick={() => { handleExplainDetailed(summaryModal.title); setSummaryModal(null); }}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-900/40"
                  >
                    Generate full AI report
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer info */}
        <section className="premium-glass p-5 sm:p-8 rounded-[2rem] sm:rounded-3xl border transition-all duration-500 flex flex-col md:flex-row items-center gap-4 sm:gap-8 justify-between">
           <div className="space-y-2 text-center md:text-left">
              <h4 className="text-slate-800 dark:text-white font-bold tracking-tight flex items-center gap-2 justify-center md:justify-start transition-colors">
                 <Calendar size={18} className="text-emerald-600 dark:text-emerald-400 transition-colors" /> {t.trackDeadlines || 'Track Deadlines'}
              </h4>
              <p className="text-slate-500 dark:text-white/40 text-xs leading-relaxed max-w-md transition-colors">
                 KrishiAI automatically notifies Pro members via WhatsApp when scheme application deadlines or installment dates approach.
              </p>
           </div>
           <button className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-[#86efac]/20 text-emerald-600 dark:text-[#4ade80] font-bold text-xs hover:bg-slate-200 dark:hover:bg-[#166534]/20 transition-all shadow-lg dark:shadow-[0_0_15px_rgba(22,101,52,0.2)]">
              {t.upgradePro || 'Upgrade to Pro advisor'}
           </button>
        </section>
      </div>
    </div>
  );
}
