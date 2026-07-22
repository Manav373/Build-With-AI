import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Shield, 
  ChevronDown, 
  ArrowLeft, 
  CheckCircle2, 
  AlertTriangle,
  Scale,
  MessageSquare,
  ShieldCheck,
  Ban,
  Fingerprint,
  Lock,
  Leaf
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../utils/translations';

const TermsPage = () => {
  const { language } = useLanguage();
  const t = translations[language].terms;
  const [expandedSection, setExpandedSection] = useState('acceptance');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/10 py-4' : 'bg-transparent py-6'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
              <Scale className="w-6 h-6 text-black" fill="currentColor" />
            </div>
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Krishi<span className="text-green-400">AI</span>
            </span>
          </Link>
          <Link 
            to="/" 
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t.backHome}</span>
          </Link>
        </div>
      </nav>

      <main className="pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold mb-6">
              <ShieldCheck className="w-3 h-3" />
              {t.legal}
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
              {t.title.split(' ')[0]} <span className="text-green-400">{t.accent}</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              {t.subtitle}
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-green-500/50" />
                {t.lastUpdated}
              </span>
            </div>
          </motion.div>

          {/* Core Terms Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-green-500/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <CheckCircle2 className="w-16 h-16 text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white italic">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                {t.freeAccess.title}
              </h3>
              <p className="text-gray-400 leading-relaxed font-monoconsole">
                {t.freeAccess.content}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="p-8 rounded-3xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all duration-500 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <AlertTriangle className="w-16 h-16 text-amber-500" />
              </div>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-white italic">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {t.informationalOnly.title}
              </h3>
              <p className="text-gray-400 leading-relaxed font-monoconsole">
                {t.informationalOnly.content}
              </p>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Table of Contents - Sticky on Desktop */}
            <div className="lg:col-span-4 hidden lg:block">
              <div className="sticky top-32 space-y-2 p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                <h4 className="text-sm font-bold text-gray-500 mb-4 px-3 italic">{t.toc}</h4>
                {t.sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setExpandedSection(section.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all duration-300 flex items-center gap-3 border ${
                      expandedSection === section.id 
                        ? 'bg-green-500/10 text-green-400 border-green-500/20 font-bold italic translate-x-1' 
                        : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/5 font-monoconsole'
                    }`}
                  >
                   <div className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      expandedSection === section.id ? 'bg-green-400' : 'bg-gray-700'
                    }`} />
                    {section.title.split('. ')[1] || section.title.split('। ')[1] || section.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Content Sections */}
            <div className="lg:col-span-8 space-y-6">
              {t.sections.map((section) => (
                <motion.div
                  key={section.id}
                  className={`rounded-2xl border transition-all duration-500 overflow-hidden ${
                    expandedSection === section.id 
                      ? 'bg-white/[0.04] border-green-500/30' 
                      : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                  }`}
                >
                  <button
                    onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                        expandedSection === section.id ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-gray-500'
                      }`}>
                         {section.id === 'acceptance' && <CheckCircle2 className="w-4 h-4" />}
                         {section.id === 'description' && <MessageSquare className="w-4 h-4" />}
                         {section.id === 'user-responsibilities' && <Fingerprint className="w-4 h-4" />}
                         {section.id === 'prohibited-uses' && <Ban className="w-4 h-4" />}
                         {section.id === 'intellectual-property' && <Shield className="w-4 h-4" />}
                         {section.id === 'disclaimer' && <AlertTriangle className="w-4 h-4" />}
                         {section.id === 'limitation' && <Ban className="w-4 h-4" />}
                         {section.id === 'privacy' && <Lock className="w-4 h-4" />}
                         {section.id === 'modifications' && <FileText className="w-4 h-4" />}
                         {section.id === 'governing-law' && <Scale className="w-4 h-4" />}
                         {section.id === 'contact' && <ArrowLeft className="w-4 h-4 rotate-180" />}
                      </div>
                      <h2 className={`text-lg font-bold transition-colors ${
                        expandedSection === section.id ? 'text-white italic' : 'text-gray-300'
                      }`}>
                        {section.title}
                      </h2>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${
                      expandedSection === section.id ? 'rotate-180 text-green-400' : ''
                    }`} />
                  </button>

                  <AnimatePresence>
                    {expandedSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="px-6 pb-8 pt-2">
                          <div className="h-px w-full bg-gradient-to-r from-green-500/50 via-green-500/10 to-transparent mb-6" />
                          <div className="text-gray-400 leading-relaxed space-y-4 whitespace-pre-line text-[15px] font-monoconsole">
                            {section.content}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 text-center relative overflow-hidden group"
          >
             <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 blur-[100px] -translate-y-1/2 translate-x-1/2" />
             
            <p className="text-gray-300 mb-6 relative z-10 max-w-2xl mx-auto italic font-monoconsole">
              "{t.footerNote}"
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 relative z-10">
              <Link 
                to="/privacy" 
                className="text-green-400 hover:text-green-300 font-bold transition-colors underline decoration-green-500/30 underline-offset-8 text-xs"
              >
                {t.privacyLink}
              </Link>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>
    </div>
  );
};

export default TermsPage;
