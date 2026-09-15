import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, MicOff, Volume2, Loader2, Sparkles, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useVoiceAssistant } from '../context/VoiceAssistantContext';

const VapiCall = ({ assistantId }) => {
    const {
        callStatus,
        isMuted,
        volumeLevel,
        transcript,
        messages,
        currentAction,
        startCall,
        stopCall,
        toggleMute
    } = useVoiceAssistant();

    const [showCallUI, setShowCallUI] = useState(false);
    const transcriptEndRef = useRef(null);

    const scrollToBottom = () => {
        transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, transcript]);

    useEffect(() => {
        if (callStatus === "active") {
            setShowCallUI(true);
        } else if (callStatus === "inactive") {
            setShowCallUI(false);
        }
    }, [callStatus]);

    const handleStart = () => {
        setShowCallUI(true);
        startCall();
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100]">
            <AnimatePresence>
                {!showCallUI && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0, x: 20 }}
                        animate={{ scale: 1, opacity: 1, x: 0 }}
                        exit={{ scale: 0, opacity: 0, x: 20 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleStart}
                        className="group relative flex items-center bg-gradient-to-r from-emerald-600 to-green-700 rounded-full p-0 shadow-[0_8px_32px_rgba(16,185,129,0.4)] overflow-hidden transition-all duration-300 hover:pr-5"
                    >
                        {/* Phone Icon Circle */}
                        <div className="relative w-16 h-16 rounded-full flex items-center justify-center text-white border-2 border-white/20 overflow-hidden shrink-0 z-20 bg-emerald-600">
                            <Phone className="w-7 h-7 relative z-10" />
                            <motion.div
                                animate={{
                                    scale: [1, 1.4, 1],
                                    opacity: [0.2, 0.4, 0.2]
                                }}
                                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                                className="absolute inset-0 bg-white"
                            />
                        </div>

                        {/* Expandable Label */}
                        <div className="max-w-0 opacity-0 group-hover:max-w-xs group-hover:opacity-100 transition-all duration-500 ease-out overflow-hidden z-10">
                            <span className="text-white font-black text-sm pl-2 pr-4 whitespace-nowrap">
                                Talk to KrishiAI
                            </span>
                        </div>

                        {/* Subtle Ambient Pulse */}
                        <motion.div
                            animate={{ opacity: [0.1, 0.3, 0.1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-0 bg-white/10"
                        />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCallUI && (
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20, originX: 1, originY: 1 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        className="w-80 sm:w-96 rounded-3xl bg-[#0d1f11]/95 backdrop-blur-2xl border border-emerald-500/30 shadow-[0_20px_60px_rgba(0,0,0,0.6)] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-emerald-950/50 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-sm">AI Voice Assistant</h3>
                                    <p className="text-emerald-400/60 text-[10px] font-bold flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full ${callStatus === 'active' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                                        {currentAction ? `${currentAction.name}...` :
                                            callStatus === 'loading' ? 'Establishing Link...' :
                                            callStatus === 'active' ? (volumeLevel > 0.01 ? 'KrishiAI is speaking...' : 'Listening to you...') :
                                                'Ready'}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { stopCall(); setShowCallUI(false); }} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="p-8 flex flex-col items-center justify-center">
                            {/* Visualizer Area */}
                            <div className="relative w-48 h-48 flex items-center justify-center mb-8">
                                {/* Ambient Background Glow */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.1, 0.2, 0.1]
                                    }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 rounded-full bg-emerald-500/10 blur-3xl"
                                />

                                {/* Dynamic Audio Rings */}
                                {[1, 2, 3].map((i) => (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            scale: 1 + (volumeLevel * (1.5 + i)),
                                            opacity: Math.max(0.1, 0.4 - (i * 0.1) + volumeLevel),
                                            borderWidth: 1 + volumeLevel * 4
                                        }}
                                        className="absolute inset-0 rounded-full border border-emerald-400 group-hover:border-emerald-300 transition-colors"
                                    />
                                ))}

                                {/* Core Avatar */}
                                <div className="relative z-10 w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-800 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-white/20">
                                    {callStatus === 'loading' ? (
                                        <Loader2 className="w-10 h-10 text-white animate-spin" />
                                    ) : (
                                        <motion.div
                                            animate={volumeLevel > 0.01 ? {
                                                scale: [1, 1.1, 1],
                                            } : {}}
                                            transition={{ duration: 0.2, repeat: Infinity }}
                                        >
                                            <Volume2 className="w-10 h-10 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Conversation History / Live Transcript */}
                            <div className="w-full space-y-4 mb-8 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                <AnimatePresence mode="popLayout">
                                    {messages.slice(-3).map((msg) => (
                                        <motion.div
                                            key={msg.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`max-w-[85%] px-4 py-2 rounded-2xl text-xs font-medium leading-relaxed ${msg.role === 'user'
                                                    ? 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 rounded-tr-none'
                                                    : 'bg-white/5 text-white/90 border border-white/10 rounded-tl-none'
                                                }`}>
                                                {msg.role === 'user' ? (
                                                    msg.text
                                                ) : (
                                                    <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_a]:text-emerald-400 [&_a]:underline">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>

                                {/* Live Partial Transcript */}
                                <AnimatePresence>
                                    {transcript && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className="flex justify-start"
                                        >
                                            <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl rounded-tl-none text-xs text-white/60 italic">
                                                {transcript}...
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div ref={transcriptEndRef} />

                                {!transcript && messages.length === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-center py-4"
                                    >
                                        <span className="text-emerald-400/40 text-[10px] font-black animate-pulse">
                                            {callStatus === 'loading' ? 'Initializing Assistant...' : 'Listening to you...'}
                                        </span>
                                    </motion.div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex items-center gap-6 pb-2">
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={toggleMute}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-red-500/20 text-red-500 border border-red-500/40' : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'}`}
                                >
                                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={stopCall}
                                    className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center shadow-[0_8px_24px_rgba(239,68,68,0.4)] hover:bg-red-600 transition-colors"
                                >
                                    <PhoneOff size={24} />
                                </motion.button>
                            </div>
                        </div>

                        {/* Footer Hint */}
                        <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-center gap-2">
                            <span className="text-[10px] text-emerald-400/40 font-bold">Powered by Vapi AI</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default VapiCall;
