import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatWindow from '../components/feature/ChatWindow';
import MessageInput from '../components/feature/MessageInput';
import PriceTrendChart from '../components/feature/PriceTrendChart';
import MandiMap from '../components/feature/MandiMap';

import '../styles/Chat.css';
import { Trash2, Pin, X, Menu } from 'lucide-react';
import { translations } from '../utils/translations/index';

import { useChat } from '../context/ChatContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

export default function ChatPage() {
    const {
        messages,
        pinnedIds,
        language,
        setLanguage,
        handleSelectChat,
        addMessage,
        updateCurrentChatMessages,
        handlePin,
        handleClearHistory,

        showPriceChart,
        setShowPriceChart,
        showMandiMap,
        setShowMandiMap,
        isTyping,
        processMessage,
        userLocation,
        setUserLocation
    } = useChat();

    const { setMobileMenuOpen } = useMobileMenu();
    const { theme } = useTheme();
    const [time, setTime] = useState(new Date());
    const [showPinned, setShowPinned] = useState(false);

    const t = translations[language]?.chat || {};

    const quickActions = useMemo(() => [
        { emoji: '🌤', label: t.quickActions?.weather, query: language === 'en' ? "What's the weather forecast?" : t.quickActions?.weather },
        { emoji: '💰', label: t.quickActions?.msp, query: language === 'en' ? 'What is the current MSP for wheat?' : t.quickActions?.msp },
        { emoji: '🐛', label: t.quickActions?.pest, query: language === 'en' ? 'What pests should I watch out for my wheat crop?' : t.quickActions?.pest },
        { emoji: '🌱', label: t.quickActions?.soil, query: language === 'en' ? 'Analyze my black soil health for cotton crop' : t.quickActions?.soil },
        { emoji: '📊', label: t.quickActions?.yield, query: language === 'en' ? 'Estimate yield for 5 acres of wheat with hybrid seeds' : t.quickActions?.yield },
        { emoji: '💧', label: t.quickActions?.irrigation, query: language === 'en' ? 'How much water does my cotton crop need in flowering stage?' : t.quickActions?.irrigation },
        { emoji: '📜', label: t.quickActions?.schemes, query: language === 'en' ? 'What government schemes am I eligible for?' : t.quickActions?.schemes },
        { emoji: '🔬', label: t.quickActions?.disease, query: language === 'en' ? 'Help me identify a crop disease' : t.quickActions?.disease },
    ], [language, t]);

    useEffect(() => { const t = setInterval(() => setTime(new Date()), 60000); return () => clearInterval(t); }, []);

    const handleLanguageSelect = (langCode) => {
        setLanguage(langCode);
        localStorage.setItem('landing_language', langCode);
        updateCurrentChatMessages(prev => {
            return prev.map(m => m.id === 'lang_selection' ? {
                ...m,
                id: Date.now(),
                isLanguageSelection: false,
                text: translations[langCode].chat.initialMsg
            } : m);
        });
    };

    const handleFeedback = (messageId, type) => console.log(`Feedback: ${messageId} → ${type}`);

    const handleSuggestionClick = (s) => {
        const cleaned = s.replace(/^[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}️✅⚠️📍📱🔗💊🌿📷🏦💳💰🌤🌾🌱📜🔬🐛📊💧]+\s*/u, '');
        processMessage(cleaned);
    };

    const pinnedMessages = messages.filter(m => pinnedIds.has(m.id));

    return (
        <div className="chat-bg-trigger h-full flex flex-col min-w-0 bg-white text-slate-900 dark:bg-transparent dark:text-[#e2f0e4] transition-colors duration-500">
            <div className="flex-1 flex flex-col min-w-0 relative z-10 w-full h-full overflow-hidden">
                {/* Background glow */}
                <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', top: '0%', right: '10%', background: 'radial-gradient(circle,rgba(22,101,52,0.1),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', bottom: '0%', left: '10%', background: 'radial-gradient(circle,rgba(22,101,52,0.08),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

                <AnimatePresence>
                    {showPinned && pinnedMessages.length > 0 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                            className="absolute right-6 top-24 z-40 w-72 rounded-xl overflow-hidden shadow-2xl border transition-all"
                            style={{ 
                                background: theme === 'light' ? 'rgba(255,255,255,0.96)' : 'rgba(8,18,11,0.96)', 
                                borderColor: theme === 'light' ? 'rgba(16,185,129,0.2)' : 'rgba(251,191,36,0.3)',
                                backdropFilter: 'blur(16px)' 
                            }}>
                            <div className="flex items-center justify-between px-4 py-3 border-b"
                                style={{ 
                                    background: theme === 'light' ? 'rgba(16,185,129,0.05)' : 'rgba(251,191,36,0.1)',
                                    borderColor: theme === 'light' ? 'rgba(16,185,129,0.1)' : 'rgba(251,191,36,0.2)'
                                }}>
                                <div className={`flex items-center gap-2 text-[0.85rem] font-bold ${theme === 'light' ? 'text-emerald-600' : 'text-amber-400'}`}>
                                    <Pin size={14} /> {translations[language].header.pinned} ({pinnedMessages.length})
                                </div>
                                <button onClick={() => setShowPinned(false)} className={`cursor-pointer text-[0.8rem] ${theme === 'light' ? 'text-emerald-400' : 'text-amber-400/50 hover:text-amber-400'}`}>✕</button>
                            </div>
                            <div className="overflow-y-auto p-3" style={{ maxHeight: '60vh' }}>
                                {pinnedMessages.map(m => (
                                    <div key={m.id} className={`mb-3 p-3 rounded-xl border transition-colors ${
                                        theme === 'light' ? 'bg-emerald-50 border-emerald-100 hover:border-emerald-200' : 'bg-[#166534]/10 border-[#86efac]/10 hover:border-[#86efac]/30'
                                    }`}>
                                        <div className={`text-[0.8rem] leading-relaxed line-clamp-4 whitespace-pre-wrap ${theme === 'light' ? 'text-slate-700' : 'text-[#86efac]/90'}`}>
                                            {m.text.slice(0, 200)}{m.text.length > 200 ? '...' : ''}
                                        </div>
                                        <div className={`text-[0.65rem] mt-2 font-medium ${theme === 'light' ? 'text-slate-400' : 'text-[#86efac]/40'}`}>
                                            {new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <header className={`chat-header-glass px-4 md:px-8 py-3 sm:py-4 flex items-center justify-between flex-shrink-0 relative z-40 border-b backdrop-blur-xl transition-all duration-500 ${
                    theme === 'light' ? 'bg-white/90 border-emerald-100' : 'bg-[#0a1a0d]/90 border-white/5'
                }`}>
                    <div className="flex items-center gap-3 md:gap-4">
                        <button
                            onClick={() => setMobileMenuOpen(true)}
                            aria-label="Open navigation menu"
                            className={`md:hidden p-2 -ml-2 border rounded-xl transition-colors ${
                                theme === 'light' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-[#166534]/40 border-[#86efac]/20 text-[#4ade80] hover:bg-[#166534]/60'
                            }`}
                        >
                            <Menu size={20} />
                        </button>

                        <div className="hidden sm:block relative group">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-[1.5rem] border-2 shadow-lg group-hover:scale-105 transition-transform duration-300 ${
                                theme === 'light' ? 'bg-emerald-50 border-emerald-100' : 'bg-gradient-to-br from-[#166534] to-[#15803d] border-white/20'
                            }`}>
                                🌾
                            </div>
                            <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-[#4ade80] border-2 border-white dark:border-[#08120b] animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className={`font-outfit text-[1.15rem] sm:text-[1.25rem] font-black leading-tight transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                                KrishiAI <span className="text-[#4ade80]/90">Assistant</span>
                            </h1>
                            <div className="text-[0.75rem] sm:text-[0.8rem] text-[#4ade80]/80 flex items-center gap-1.5 font-bold mt-0.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] shadow-[0_0_8px_#4ade80]" />
                                {translations[language].header.online}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:flex flex-col items-end mr-2">
                            <div className={`text-[0.8rem] font-bold ${theme === 'light' ? 'text-slate-700' : 'text-[#86efac]/80'}`}>{time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                            <div className={`text-[0.7rem] font-medium ${theme === 'light' ? 'text-slate-400' : 'text-[#7aad86]/60'}`}>{time.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</div>
                        </div>

                        <motion.button 
                            whileHover={{ y: -2 }} 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowPinned(s => !s)} 
                            title="Pinned messages"
                            aria-label="Toggle pinned messages"
                            className={`control-btn relative transition-all ${
                                theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-400' : ''
                            } ${pinnedIds.size > 0 ? (theme === 'light' ? 'border-emerald-300 text-emerald-600 bg-emerald-50' : 'control-btnActive') : ''}`}
                        >
                            <Pin className="w-4 h-4 sm:w-5 sm:h-5" />
                            {pinnedIds.size > 0 && (
                                <span className={`absolute -top-1 -right-1 text-[0.65rem] rounded-full w-4.5 h-4.5 flex items-center justify-center font-black border-2 shadow-lg ${
                                    theme === 'light' ? 'bg-emerald-500 text-white border-white' : 'bg-amber-400 text-[#0a1a0d] border-[#0a1a0d]'
                                }`}>
                                    {pinnedIds.size}
                                </span>
                            )}
                        </motion.button>

                        <motion.button 
                            whileHover={{ scale: 1.1 }} 
                            whileTap={{ scale: 0.9 }} 
                            onClick={handleClearHistory} 
                            title="Clear chat"
                            aria-label="Clear chat history"
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/5 border border-red-500/10 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-400/40 cursor-pointer transition-all ml-1"
                        >
                            <Trash2 className="w-4 h-4" />
                        </motion.button>
                    </div>
                </header>

                <div className={`flex gap-2 sm:gap-2.5 px-4 py-2 sm:px-6 sm:py-3 border-b overflow-x-auto backdrop-blur-sm shadow-inner relative z-20 no-scrollbar transition-all duration-500 ${
                    theme === 'light' ? 'bg-slate-50/80 border-emerald-100' : 'bg-[#030905]/40 border-white/5'
                }`}>
                    {quickActions.map(a => (
                        <motion.button key={a.label}
                            whileHover={{ scale: 1.02, y: -1 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => processMessage(a.query)}
                            disabled={isTyping}
                            className={`quick-action-btn transition-all ${
                                theme === 'light' ? 'bg-white border-emerald-100 text-slate-700 shadow-sm hover:border-emerald-300 hover:text-emerald-700' : ''
                            }`}
                        >
                            <span className="text-[1.1rem] filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{a.emoji}</span>
                            <span>{a.label}</span>
                        </motion.button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto w-full relative z-10 p-0" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(134,239,172,0.15) transparent' }}>
                    <div className="max-w-5xl mx-auto w-full h-full p-2 sm:p-4 md:p-8">
                        <ChatWindow
                            messages={messages} isTyping={isTyping}
                            onFeedback={handleFeedback}
                            onSuggestionClick={handleSuggestionClick}
                            onPin={handlePin}
                            pinnedIds={pinnedIds}
                            language={language}
                            onLanguageSelect={handleLanguageSelect}
                        />
                    </div>
                </div>

                <div className="pb-4 sm:pb-8 pt-2 px-3 sm:px-4 shrink-0 z-20 w-full relative">
                    <div className="max-w-3xl mx-auto w-full">

                        <MessageInput
                            onSendMessage={processMessage}
                            disabled={isTyping}
                            onLocationChange={(loc) => setUserLocation(loc)}
                        />
                    </div>
                </div>

                <AnimatePresence>
                    {showPriceChart && <PriceTrendChart onClose={() => setShowPriceChart(false)} />}
                    {showMandiMap && (
                        <MandiMap
                            onClose={() => setShowMandiMap(false)}
                            userLat={userLocation?.lat}
                            userLon={userLocation?.lon}
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
