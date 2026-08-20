import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Leaf, Globe, ChevronDown, Sun, Moon } from 'lucide-react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LANGUAGES, translations } from '../../utils/translations';
import RoleSelectionModal from '../common/RoleSelectionModal';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [langOpen, setLangOpen] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const t = translations[language].navbar;

  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${isVisible || menuOpen ? 'translate-y-0' : '-translate-y-full'
          } ${menuOpen
            ? 'py-3 sm:py-5'
            : scrolled
              ? 'py-3 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-gray-200/20 dark:border-white/5 shadow-2xl'
              : 'py-5 bg-white/60 dark:bg-black/60 backdrop-blur-xl'
          }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 flex items-center justify-between">
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
            <div className="w-[200%] h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,rgba(74,222,128,0.5)_1px,rgba(74,222,128,0.5)_2px)] animate-[scanline_10s_linear_infinite]"></div>
          </div>

          {/* LOGO */}
          <div className="flex items-center gap-2 group cursor-pointer z-50 flex-shrink-0">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#166534] to-[#15803d] flex items-center justify-center shadow-lg shadow-[#166534]/40 border border-[#86efac]/30 group-hover:scale-105 transition-transform duration-300">
              <span className="text-xl">🌾</span>
            </div>
            <span className="font-outfit font-bold text-2xl text-gray-800 dark:text-white group-hover:text-[#86efac] transition-colors whitespace-nowrap">
              Krishi<span className="text-[#facc15]">AI</span>
            </span>
          </div>

          {/* DESKTOP NAV */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6 px-6 py-2.5 rounded-full bg-gray-100/40 dark:bg-[#0a1a0d]/60 backdrop-blur-xl border border-gray-200/20 dark:border-[#86efac]/15 text-[0.84rem] xl:text-[0.92rem] font-bold text-gray-700 dark:text-[#e2f0e4]/90 shadow-[0_0_20px_rgba(0,0,0,0.4)] whitespace-nowrap flex-shrink-0">
            <a href="#features" className="hover:text-[#4ade80] transition-all hover:scale-105 whitespace-nowrap">{t.features}</a>
            <a href="/vendors" className="hover:text-[#facc15] transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap">🏪 Vendors</a>
            <a href="/community" className="hover:text-[#38bdf8] transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap">💬 Community</a>
            <a href="/voice-assistant" className="hover:text-[#4ade80] transition-all hover:scale-105 flex items-center gap-1.5 whitespace-nowrap">🎙️ Voice AI</a>
            <a href="#howitworks" className="hover:text-[#4ade80] transition-all hover:scale-105 whitespace-nowrap">{t.howItWorks}</a>
            <a href="#footer" className="hover:text-[#4ade80] transition-all hover:scale-105 whitespace-nowrap">{t.about}</a>
          </nav>

          {/* Desktop CTA & Lang */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-5 flex-shrink-0 whitespace-nowrap">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full border border-gray-300/50 dark:border-[#86efac]/20 bg-white/80 dark:bg-[#166534]/10 text-gray-800 dark:text-[#86efac] hover:bg-gray-100 dark:hover:bg-[#166534]/20 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300/50 dark:border-[#86efac]/20 bg-white/80 dark:bg-[#166534]/10 text-gray-800 dark:text-[#86efac] hover:bg-gray-100 dark:hover:bg-[#166534]/20 transition-all cursor-pointer"
              >
                <Globe size={16} />
                <span className="text-sm font-bold">{LANGUAGES.find(l => l.code === language)?.short}</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-3 w-40 bg-white/95 dark:bg-[#0a1a0d] border border-gray-200 dark:border-[#86efac]/20 rounded-2xl shadow-2xl overflow-hidden py-2 backdrop-blur-xl"
                  >
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          setLangOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-[#166534]/20 transition-colors ${language === lang.code ? 'text-[#166534] dark:text-[#86efac] font-bold' : 'text-gray-600 dark:text-[#e2f0e4]/60'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <SignedOut>
              <a href="/sign-in" className="font-medium text-gray-700 dark:text-[#86efac] hover:text-gray-900 dark:hover:text-white transition-colors">{t.login}</a>
              <button
                type="button"
                id="navbar-try-free-btn"
                onClick={() => setRoleModalOpen(true)}
                className="font-semibold text-[#0a1a0d] bg-gradient-to-r from-[#86efac] to-[#4ade80] px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] hover:scale-105 transition-all duration-300 cursor-pointer border-0"
              >
                {t.tryFree}
              </button>
            </SignedOut>
            <SignedIn>
              <a href="/chat" className="font-semibold text-[#0a1a0d] bg-gradient-to-r from-[#86efac] to-[#4ade80] px-8 py-2.5 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.3)] hover:shadow-[0_0_30px_rgba(74,222,128,0.6)] hover:scale-105 transition-all duration-300">
                {t.dashboard}
              </a>
            </SignedIn>
          </div>

          {/* MOBILE TOGGLE */}
          <button
            type="button"
            className="lg:hidden p-3 -mr-3 text-gray-800 dark:text-white z-50 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors active:scale-90"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle Menu"
          >
            {menuOpen ? <X size={28} /> : <Menu size={30} />}
          </button>

          {/* MOBILE MENU */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 w-full h-screen bg-gray-100/60 dark:bg-[#050e07]/60 backdrop-blur-2xl flex flex-col items-center justify-center -z-10"
              >
                <nav className="flex flex-col items-center gap-6 text-2xl text-gray-800 dark:text-white font-bold">
                  <a href="#features" onClick={() => setMenuOpen(false)} className="hover:text-[#86efac] transition-colors">{t.features}</a>
                  <a href="#howitworks" onClick={() => setMenuOpen(false)} className="hover:text-[#86efac] transition-colors">{t.howItWorks}</a>
                  <a href="/vendors" onClick={() => setMenuOpen(false)} className="hover:text-[#facc15] transition-colors">🏪 Marketplace</a>
                  <a href="#testimonials" onClick={() => setMenuOpen(false)} className="hover:text-[#86efac] transition-colors">{t.testimonials}</a>
                  <a href="#aboutinfo" onClick={() => setMenuOpen(false)} className="hover:text-[#86efac] transition-colors">{t.about}</a>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-3 rounded-full border border-gray-300/50 dark:border-[#86efac]/30 bg-white/90 dark:bg-[#166534]/20 text-gray-800 dark:text-[#86efac] hover:bg-gray-100 dark:hover:bg-[#166534]/30 transition-colors"
                  >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    <span className="text-sm font-semibold">{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span>
                  </button>

                  <div className="flex flex-wrap items-center justify-center gap-4 mt-4 px-6">
                    {LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => setLanguage(lang.code)}
                        className={`text-sm px-5 py-3 rounded-full border transition-all ${language === lang.code ? 'border-[#86efac] bg-[#166534]/30 text-[#86efac]' : 'border-gray-300 dark:border-white/10 text-gray-600 dark:text-white/50'}`}
                      >
                        {lang.label}
                      </button>
                    ))}
                  </div>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center gap-4 mt-8"
                  >
                    <SignedOut>
                      <a href="/sign-in" className="text-[#86efac] text-lg" onClick={() => setMenuOpen(false)}>{t.login}</a>
                      <button
                        type="button"
                        id="navbar-mobile-try-free-btn"
                        className="px-10 py-4 bg-gradient-to-r from-[#86efac] to-[#4ade80] text-[#0a1a0d] font-black rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)] cursor-pointer border-0"
                        onClick={() => { setMenuOpen(false); setRoleModalOpen(true); }}
                      >
                        {t.tryFree}
                      </button>
                    </SignedOut>
                    <SignedIn>
                      <a href="/chat" className="px-12 py-4 bg-gradient-to-r from-[#86efac] to-[#4ade80] text-[#0a1a0d] font-black rounded-full shadow-[0_0_30px_rgba(74,222,128,0.4)]" onClick={() => setMenuOpen(false)}>
                        {t.dashboard}
                      </a>
                    </SignedIn>
                  </motion.div>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* Role Selection Modal */}
      <RoleSelectionModal isOpen={roleModalOpen} onClose={() => setRoleModalOpen(false)} />
    </>
  );
}
