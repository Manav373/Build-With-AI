import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Lock, 
  Eye, 
  FileText, 
  ChevronDown, 
  ArrowLeft,
  Info,
  Globe,
  Database,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const PrivacyPage = () => {
  const { language } = useLanguage();
  const t = translations[language].privacy;
  const [openSection, setOpenSection] = useState('information-collected');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-inter dark:bg-[#030905] dark:text-[#e2f0e4]">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#0a1a0d] to-[#030905] border-b border-[#86efac]/10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#166534] rounded-full blur-[120px] opacity-20" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#facc15] rounded-full blur-[100px] opacity-5" />
        </div>
        <div className="max-w-4xl mx-auto px-6 py-16 relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#86efac]/70 hover:text-[#86efac] transition-colors mb-8 group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            {t.backHome}
          </Link>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#15803d] flex items-center justify-center shadow-lg border border-[#86efac]/30">
                <Shield size={20} className="text-[#86efac]" />
              </div>
              <span className="text-sm font-semibold text-[#86efac]">{t.legal}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-outfit font-black text-white mb-4 leading-tight">
              {t.title.split(' ')[0]} <span className="text-[#86efac]">{t.accent}</span>
            </h1>
            <p className="text-[#e2f0e4]/60 text-lg max-w-2xl leading-relaxed">
              {t.subtitle}
            </p>
            <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#166534]/20 border border-[#86efac]/20 text-sm text-[#86efac]/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
              {t.lastUpdated}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-10">
        {/* Summary Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid sm:grid-cols-3 gap-4 mb-10"
        >
          {t.summary.map(item => (
            <div key={item.title} className="bg-[#0a1a0d]/60 border border-[#86efac]/10 rounded-2xl p-5 backdrop-blur-sm">
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-bold text-white text-sm mb-1">{item.title}</div>
              <div className="text-[#86efac]/60 text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </motion.div>

        {/* Table of Contents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="bg-[#0a1a0d]/60 border border-[#86efac]/10 rounded-2xl p-6 mb-10 backdrop-blur-sm"
        >
          <h2 className="text-sm font-bold text-[#86efac] mb-4">{t.toc}</h2>
          <div className="grid sm:grid-cols-2 gap-2">
            {t.sections.map((s, i) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={(e) => { e.preventDefault(); setOpenSection(openSection === s.id ? null : s.id); document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}
                className="flex items-center gap-2 text-sm text-[#86efac]/70 hover:text-[#86efac] transition-colors py-1 group"
              >
                <span className="text-[#4ade80]/50 group-hover:text-[#4ade80] font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                {s.title.replace(/^\d+\.\s/, '')}
              </a>
            ))}
          </div>
        </motion.div>

        {/* Sections */}
        <div className="space-y-4">
          {t.sections.map((section, i) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 * i }}
              className="border border-[#86efac]/10 rounded-2xl overflow-hidden bg-[#0a1a0d]/40 backdrop-blur-sm hover:border-[#86efac]/20 transition-colors"
            >
              <button
                onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                className="w-full flex items-center justify-between px-6 py-5 text-left group cursor-pointer"
              >
                <h3 className="font-outfit font-bold text-white text-lg group-hover:text-[#86efac] transition-colors">
                  {section.title}
                </h3>
                <div className="w-8 h-8 rounded-full bg-[#166534]/30 flex items-center justify-center flex-shrink-0 ml-4 group-hover:bg-[#166534]/60 transition-colors">
                  {openSection === section.id
                    ? <span className="text-[#86efac] text-lg leading-none">−</span>
                    : <span className="text-[#86efac]/60 text-lg leading-none">+</span>}
                </div>
              </button>
              {openSection === section.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-6 pb-6"
                >
                  <div className="border-t border-[#86efac]/10 pt-5">
                    <p className="text-[#e2f0e4]/75 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {section.content}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center py-10 border-t border-[#86efac]/10"
        >
          <div className="text-4xl mb-4">🛡️</div>
          <p className="text-[#e2f0e4]/50 text-sm max-w-lg mx-auto leading-relaxed">
            {t.footerNote}
          </p>
          <div className="flex justify-center gap-6 mt-6">
            <Link to="/terms" className="text-[#86efac]/70 hover:text-[#86efac] text-sm transition-colors underline underline-offset-4">
              {t.termsLink}
            </Link>
            <Link to="/" className="text-[#86efac]/70 hover:text-[#86efac] text-sm transition-colors underline underline-offset-4">
              {t.backHome}
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPage;
