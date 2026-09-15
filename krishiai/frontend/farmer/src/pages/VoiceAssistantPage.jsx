import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, AlertCircle, History, Info, ChevronRight, Globe, Loader2, Menu, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';
import { useChat } from '../context/ChatContext';
import { translations } from '../utils/translations/index';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

const VoiceAssistantPage = () => {
    const { language } = useChat();
    const t = translations[language]?.voiceAssistant || {};
    const { theme } = useTheme();
    const { setMobileMenuOpen } = useMobileMenu();
    const {
        callStatus,
        isMuted,
        volumeLevel,
        transcript,
        messages,
        currentAction,
        isSpeaking,
        startCall,
        stopCall,
        toggleMute,
        sendVoiceText
    } = useVoiceAssistant();

    const transcriptEndRef = useRef(null);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, transcript]);

    const COMMAND_SUGGESTIONS = [
        { icon: "🌦️", text: "Weather in Mumbai", cmd: "What is the weather in Mumbai?" },
        { icon: "🌾", text: "Wheat Price Punjab", cmd: "What is the current market price of Wheat in Punjab?" },
        { icon: "🔬", text: "Analyze Soil Type", cmd: "Can you analyze my soil health? It's clayey." },
        { icon: "🐛", text: "Pest Alerts for Rice", cmd: "Are there any pest alerts for Rice in Rajasthan?" },
    ];

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { 
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <main className="flex-1 flex flex-col min-w-0 relative z-10 overflow-hidden bg-[var(--page-bg)]">
            {/* Advanced Mesh Gradient Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-900/10 blur-[80px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-900/5 blur-[100px] rounded-full" />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500/5 blur-[60px] rounded-full animate-bounce" style={{ animationDuration: '10s' }} />
            </div>

            {/* Premium Header */}
            <header className={`px-4 md:px-8 py-2 sm:py-4 border-b border-[var(--glass-border)] flex items-center justify-between backdrop-blur-xl sticky top-0 z-50 transform-gpu transition-colors duration-300 ${
                theme === 'light' ? 'bg-white/90 shadow-sm' : 'bg-[#08120b]/90'
            }`}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-1.5 bg-[var(--g)]/40 border border-[#86efac]/20 rounded-lg text-[var(--glt)] shrink-0">
                        <Menu size={18} />
                    </button>
                    <div className="p-1.5 sm:p-2.5 bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-lg sm:rounded-xl border border-emerald-400/30 text-white">
                        <Mic size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h1 className={`text-lg sm:text-xl font-bold font-outfit tracking-tight flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>
                            {t.title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">KrishiAI</span>
                        </h1>
                        <p className={`${theme === 'light' ? 'text-emerald-700/60' : 'text-[#86efac]/40'} text-[0.6rem] font-bold hidden sm:block`}>Real-time Agricultural Voice Intelligence</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20 text-[0.6rem] font-bold text-emerald-400 hidden sm:flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        OS native v3.4
                    </div>
                    {callStatus === 'active' && (
                        <div className="px-3 py-1 bg-red-500/10 rounded-full border border-red-500/20 text-[0.6rem] font-bold text-red-400 flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            Live
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row p-3 sm:p-6 gap-4 sm:gap-6 overflow-y-auto overflow-x-hidden lg:overflow-hidden">
                
                {/* Visualizer & Interaction Area */}
                <motion.div 
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="flex-1 flex flex-col bg-[var(--dk2)]/40 border border-emerald-500/10 rounded-[1.5rem] sm:rounded-[3rem] relative overflow-hidden p-4 sm:p-10 shrink-0 lg:shrink min-h-[480px] sm:min-h-[500px] lg:min-h-0"
                >
                    {/* Ambient Glow */}
                    <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />
                    
                    {/* Action Hub Status Ticker */}
                    <AnimatePresence>
                        {currentAction && (
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="absolute top-8 left-1/2 -translate-x-1/2 z-20"
                            >
                                <div className={`px-6 py-3 backdrop-blur-2xl border border-emerald-500/30 rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] flex items-center gap-4 ${
                                    theme === 'light' ? 'bg-white/90' : 'bg-black/60'
                                }`}>
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        {currentAction.status === 'calling' ? `Executing: ${currentAction.name.replace(/_/g, ' ')}...` : `Task completed: ${currentAction.name.replace(/_/g, ' ')}`}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main Interaction Circle */}
                    <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-0">
                        <div className="relative w-40 h-40 sm:w-80 sm:h-80 flex items-center justify-center mb-6 sm:mb-8">
                            {/* Spiraling Aura Layers */}
                            <AnimatePresence>
                                {(callStatus === 'active' || callStatus === 'loading') && (
                                    <>
                                        <motion.div
                                            animate={{ 
                                                rotate: 360,
                                                scale: [1, 1.05, 1],
                                            }}
                                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-0 rounded-full border border-emerald-500/10"
                                        />
                                        <motion.div
                                            animate={{ 
                                                rotate: -360,
                                                scale: [1.1, 1, 1.1],
                                            }}
                                            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                            className="absolute inset-[-10%] rounded-full border border-emerald-500/5"
                                        />
                                        {[0, 1, 2].map((i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ scale: 1, opacity: 0.5 }}
                                                animate={{ 
                                                    scale: 1 + (volumeLevel * (2 + i)) + (callStatus === 'loading' ? 0.1 : 0),
                                                    opacity: Math.max(0, 0.4 - (i * 0.1) + (volumeLevel * 0.6)),
                                                }}
                                                transition={{ duration: 0.08, ease: "linear" }}
                                                className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 to-transparent blur-xl"
                                            />
                                        ))}
                                    </>
                                )}
                            </AnimatePresence>

                            {/* Center Core */}
                            <motion.div 
                                whileHover={{ scale: 1.05 }}
                                className={`relative z-10 w-32 h-32 sm:w-56 sm:h-56 rounded-full flex items-center justify-center shadow-[0_0_100px_rgba(16,185,129,0.2)] border-2 border-white/10 transition-all duration-700 ${
                                    callStatus === 'active' 
                                    ? 'bg-gradient-to-br from-[#10b981] via-[#059669] to-[#064e3b]' 
                                    : callStatus === 'loading'
                                    ? 'bg-[var(--dk2)] overflow-hidden'
                                    : 'bg-[var(--mut)]/10 grayscale opacity-40'
                                }`}
                            >
                                {callStatus === 'loading' && (
                                    <motion.div 
                                        className="absolute inset-0 bg-emerald-500/20"
                                        animate={{ y: ["-100%", "100%"] }}
                                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                    />
                                )}
                                
                                {callStatus === 'loading' ? (
                                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin relative z-10" />
                                ) : (
                                    <motion.div
                                        animate={volumeLevel > 0.01 ? { 
                                            scale: [1, 1.15 + (volumeLevel * 0.5), 1],
                                            filter: `brightness(${1 + volumeLevel})`
                                        } : {}}
                                        transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                                    >
                                        <div className={`p-6 sm:p-12 rounded-full backdrop-blur-md border border-white/5 ${theme === 'light' ? 'bg-emerald-500/10' : 'bg-black/20'}`}>
                                            <Mic size={32} className={`sm:w-12 sm:h-12 ${callStatus === 'active' ? 'text-white' : (theme === 'light' ? 'text-emerald-900/20' : 'text-white/20')}`} />
                                        </div>
                                    </motion.div>
                                )}
                                
                                {/* Status Orb */}
                                <div className={`absolute -bottom-2 right-[10%] px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2 shadow-2xl ${theme === 'light' ? 'bg-white' : 'bg-black'}`}>
                                    <div className={`w-1.5 h-1.5 rounded-full ${callStatus === 'active' ? 'bg-emerald-400 animate-pulse' : (theme === 'light' ? 'bg-emerald-200' : 'bg-white/20')}`} />
                                    <span className={`text-[0.6rem] font-bold ${theme === 'light' ? 'text-emerald-900/60' : 'text-white/60'}`}>
                                        {callStatus === 'active' ? 'Synced' : 'Ready'}
                                    </span>
                                </div>
                            </motion.div>
                        </div>

                        {/* Text Status */}
                                <motion.h2 
                                    key={callStatus}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`text-xl sm:text-4xl font-bold tracking-tighter mb-2 sm:mb-4 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}
                                >
                                    {callStatus === 'active' ? (volumeLevel > 0.01 ? t.speaking : t.listening) : 
                                     callStatus === 'loading' ? t.statusLoading : t.statusInactive}
                                </motion.h2>
                                <p className={`text-[0.65rem] sm:text-[0.8rem] font-medium ${theme === 'light' ? 'text-emerald-700/60' : 'text-emerald-400/40'}`}>
                                    {callStatus === 'active' ? "Multi-lingual processing enabled" : "System Status: Optimized"}
                                </p>

                        {/* Controls Container */}
                        <div className="flex items-center gap-4 sm:gap-6 mt-8 sm:mt-12">
                            {callStatus === 'active' && (
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleMute}
                                    className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center transition-all border ${
                                        isMuted 
                                            ? 'bg-red-500/20 text-red-500 border-red-500/30' 
                                            : (theme === 'light' ? 'bg-gray-100 text-[var(--mut)] border-gray-200' : 'bg-white/5 text-white/40 border-white/10')
                                    }`}
                                >
                                    {isMuted ? <MicOff size={20} className="sm:w-6 sm:h-6" /> : <Mic size={20} className="sm:w-6 sm:h-6" />}
                                </motion.button>
                            )}

                            <button
                                disabled={callStatus === 'loading'}
                                onClick={() => callStatus === 'active' ? stopCall() : startCall(null, language)}
                                className={`px-6 sm:px-14 py-3.5 sm:py-5 rounded-2xl sm:rounded-[2.5rem] font-bold text-[0.65rem] sm:text-sm transition-all flex items-center gap-2 sm:gap-4 ${
                                    callStatus === 'active' 
                                    ? 'bg-red-500 text-white hover:bg-red-600 shadow-[0_20px_60px_rgba(239, 68, 68, 0.3)]' 
                                    : 'bg-[#10b981] text-black hover:bg-[#34d399] shadow-[0_20px_60px_rgba(16,185,129,0.3)]'
                                }`}
                            >
                                {callStatus === 'active' ? <PhoneOff size={18} className="sm:w-5 sm:h-5" /> : <Mic size={18} className="sm:w-5 sm:h-5" />}
                                {callStatus === 'loading' ? "Initializing..." : callStatus === 'active' ? t.stopCall : t.startCall}
                            </button>
                        </div>
                    </div>

                    {/* Interactive Command Slider */}
                    <div className="mt-6 pt-6 border-t border-emerald-500/10">
                        <p className="text-[0.6rem] font-bold text-emerald-400/40 mb-3">Try asking these commands</p>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {COMMAND_SUGGESTIONS.map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    onClick={() => {
                                        sendVoiceText(item.cmd, language);
                                    }}
                                    className={`${theme === 'light' ? 'bg-white shadow-md border-gray-100' : 'bg-black/40 border-emerald-500/10'} rounded-xl p-3 sm:p-4 min-w-[160px] sm:min-w-[200px] cursor-pointer hover:border-emerald-500/30 transition-all transition-gpu shadow-xl group/suggest`}
                                >
                                    <div className="text-lg mb-1.5 group-hover/suggest:scale-110 transition-transform">{item.icon}</div>
                                    <p className={`text-[0.6rem] sm:text-[0.65rem] font-bold mb-1 group-hover/suggest:text-emerald-600 transition-colors line-clamp-1 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white/80'}`}>{item.text}</p>
                                    <p className={`text-[0.55rem] sm:text-[0.6rem] leading-tight line-clamp-1 italic ${theme === 'light' ? 'text-[var(--mut)]/60' : 'text-[#86efac]/30'}`}>"{item.cmd}"</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Transcript Area */}
                <motion.div 
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className={`w-full lg:w-[350px] xl:w-[450px] flex flex-col backdrop-blur-md border border-[var(--glass-border)] rounded-[1.5rem] sm:rounded-[3rem] overflow-hidden lg:h-full h-[380px] sm:h-[550px] lg:min-h-0 shrink-0 lg:shrink ${
                        theme === 'light' ? 'bg-white/80 shadow-xl' : 'bg-black/40'
                    }`}
                >
                    <div className="p-4 sm:p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                        <div className="flex items-center gap-3">
                            <History size={18} className="text-emerald-500" />
                            <span className={`text-[0.7rem] font-bold underline decoration-emerald-500 decoration-4 underline-offset-8 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>Neural transcript</span>
                        </div>
                        <div className="px-2 py-0.5 bg-emerald-500/10 rounded border border-emerald-500/10 text-[0.55rem] font-bold text-emerald-400">AI active</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar bg-gradient-to-b from-transparent to-black/30">
                        {messages.length === 0 && !transcript && (
                            <div className="h-full flex flex-col items-center justify-center text-center px-10">
                                <Sparkles size={32} className="text-emerald-500/20 mb-4" />
                                <p className={`text-xs sm:text-sm font-medium ${theme === 'light' ? 'text-[var(--mut)]' : 'text-white/40'}`}>
                                    Speech intelligence is offline. Awaiting activation.
                                </p>
                            </div>
                        )}

                        <AnimatePresence mode="popLayout">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] px-5 py-3 rounded-2xl relative ${
                                        msg.role === 'user' 
                                        ? 'bg-emerald-600 text-white shadow-lg rounded-tr-none' 
                                        : (theme === 'light' ? 'bg-gray-100 text-[var(--txt)] border border-gray-200 rounded-tl-none' : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none')
                                    }`}>
                                        <div className={`text-[0.6rem] font-bold opacity-40 mb-1.5 flex items-center gap-2 ${msg.role === 'user' ? 'text-white/80' : ''}`}>
                                            {msg.role === 'user' ? <User size={10} /> : <Sparkles size={10} />}
                                            {msg.role === 'user' ? 'Human' : 'KrishiAI'}
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium leading-relaxed tracking-tight">
                                            {msg.role === 'user' ? (
                                                msg.text
                                            ) : (
                                                <div className="prose prose-sm prose-emerald dark:prose-invert max-w-none [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse [&_th]:border [&_th]:border-emerald-500/20 [&_th]:p-1.5 [&_td]:border [&_td]:border-emerald-500/10 [&_td]:p-1.5 [&_a]:text-emerald-400 [&_a]:underline [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4">
                                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Partial Transcript */}
                        <AnimatePresence>
                            {transcript && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-start"
                                >
                                    <div className={`border px-5 py-4 rounded-2xl rounded-tl-none ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-white/[0.02] border-white/5'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                                            <div className={`text-[0.55rem] font-bold opacity-30 ${theme === 'light' ? 'text-[var(--txt)]' : ''}`}>Analyzing speech...</div>
                                        </div>
                                        <p className={`text-sm font-medium italic leading-relaxed ${theme === 'light' ? 'text-[var(--mut)]' : 'text-white/40'}`}>{transcript}...</p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={transcriptEndRef} />
                    </div>

                    {/* Bottom Info Bar */}
                    <div className="p-4 sm:p-6 bg-white/[0.02] border-t border-white/5">
                        <div className="flex gap-4">
                            <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400 self-start">
                                <Info size={16} />
                            </div>
                             <div>
                                <p className={`text-[0.7rem] font-bold mb-1 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white/80'}`}>System notification</p>
                                <p className={`text-[0.65rem] leading-relaxed font-bold ${theme === 'light' ? 'text-[var(--mut)]' : 'text-white/30'}`}>
                                    Adaptive multi-lingual support active. Speak naturally in Hindi, Marathi, or English for optimal accuracy.
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </main>
    );
};

export default VoiceAssistantPage;
