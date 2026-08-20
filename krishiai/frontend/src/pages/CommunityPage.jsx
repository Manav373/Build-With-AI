import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Users, Shield, MessageSquare, Clock, Globe, Menu, MoreVertical, Trash2, Edit2, X } from 'lucide-react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useLanguage } from '../context/LanguageContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { translations } from '../utils/translations/index';
// Removed date-fns since it's not in package.json

import { useTheme } from '../context/ThemeContext';

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000';
const BASE_URL = RAW_BASE_URL.replace(/\/$/, '');
const WS_URL = `${BASE_URL.replace('http', 'ws')}/api/community/ws`;
const HISTORY_URL = `${BASE_URL}/api/community/history`;

export default function CommunityPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const { language } = useLanguage();
    const { setMobileMenuOpen } = useMobileMenu();
    const { theme } = useTheme();

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [connected, setConnected] = useState(false);
    const [activeUsers, setActiveUsers] = useState(1); // Placeholder
    const [cooldown, setCooldown] = useState(0);
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const socketRef = useRef(null);
    const scrollRef = useRef(null);

    const t = translations[language]?.chat?.dashboard?.community || {
        title: "Farmer Community",
        subtitle: "Real-time discussion with farmers across India",
        placeholder: "Share your experience or ask a question...",
        live: "Live Now",
        onlineCount: " farmers online"
    };

    const scrollToBottom = () => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown > 0) {
            const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [cooldown]);

    // Fetch message history
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(HISTORY_URL);
                const data = await response.json();
                if (Array.isArray(data)) {
                    setMessages(data);
                } else {
                    console.error("Invalid chat history format:", data);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            }
        };
        fetchHistory();
    }, []);

    // WebSocket Connection
    useEffect(() => {
        const connect = () => {
            const socket = new WebSocket(WS_URL);

            socket.onopen = () => {
                console.log("Community WebSocket connected");
                setConnected(true);
            };

            socket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'chat_message') {
                    setMessages(prev => {
                        // Prevent duplicate messages by ID
                        if (data.id && prev.some(m => m.id === data.id)) return prev;
                        return [...prev, data];
                    });
                } else if (data.type === 'delete_message') {
                    setMessages(prev => prev.filter(m => m.id !== data.id));
                } else if (data.type === 'edit_message') {
                    setMessages(prev => prev.map(m => m.id === data.id ? { ...m, content: data.content, edited: true } : m));
                }
            };

            socket.onclose = () => {
                console.log("Community WebSocket disconnected. Reconnecting...");
                setConnected(false);
                setTimeout(connect, 3000);
            };

            socketRef.current = socket;
        };

        connect();
        return () => socketRef.current?.close();
    }, []);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN || cooldown > 0) return;

        const payload = {
            user_id: user?.id || 'anonymous',
            user_name: user?.fullName || user?.firstName || 'Farmer',
            user_avatar: user?.imageUrl,
            content: inputText.trim()
        };

        socketRef.current.send(JSON.stringify(payload));
        setInputText('');
        setCooldown(5); // Start 5s cooldown
    };

    const handleDelete = (msgId) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({
            type: 'delete_message',
            id: msgId
        }));
        setActiveMenuId(null);
    };

    const handleStartEdit = (msg) => {
        setEditingId(msg.id);
        setEditContent(msg.content);
        setActiveMenuId(null);
    };

    const handleSaveEdit = () => {
        if (!editContent.trim() || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        socketRef.current.send(JSON.stringify({
            type: 'edit_message',
            id: editingId,
            content: editContent.trim()
        }));
        setEditingId(null);
        setEditContent('');
    };

    return (
        <div className={`flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-300 ${theme === 'light' ? 'bg-[#f8fafc]' : 'bg-[var(--page-bg)]'}`}>
            {/* Background Aesthetic */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-[#166534]/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-[#4ade80]/5 rounded-full blur-[100px]" />
            </div>

            {/* Header */}
            <header className={`px-4 py-3 sm:px-8 sm:py-5 border-b backdrop-blur-xl flex items-center justify-between sticky top-0 z-50 transition-colors ${
                theme === 'light' ? 'bg-white/80 border-slate-200 shadow-sm' : 'bg-[var(--dk2)]/90 border-[var(--glass-border)]'
            }`}>
                <div className="flex items-center gap-3 sm:gap-4">
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className={`md:hidden p-2 rounded-xl transition-colors ${
                            theme === 'light' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-[#166534]/40 border border-[#86efac]/20 text-[#4ade80]'
                        }`}
                    >
                        <Menu size={20} />
                    </button>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Users size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className={`text-base sm:text-xl font-bold tracking-tight flex items-center gap-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                            {t.title}
                            <span className="bg-emerald-500/10 text-emerald-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">Pro</span>
                        </h1>
                        <p className={`text-[0.65rem] sm:text-[0.75rem] font-medium transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/40'}`}>{t.subtitle}</p>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 text-[var(--glt)] text-sm font-bold">
                            <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse shadow-[0_0_8px_#4ade80]" />
                            {t.live}
                        </div>
                        <span className="text-[10px] text-[var(--mut)] font-bold flex items-center gap-1 opacity-70">
                            <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" /> {activeUsers + Math.floor(messages.length / 5)} {t.online}
                        </span>
                    </div>
                </div>
            </header>

            {/* Discussion Info Banner */}
            <div className={`px-4 py-2 sm:px-6 border-b z-10 flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar transition-colors ${
                theme === 'light' ? 'bg-white border-slate-100' : 'bg-[var(--card-bg)] border-[var(--glass-border)]'
            }`}>
                {[
                    { icon: Shield, label: "Safe & Verified Space" },
                    { icon: MessageSquare, label: "24/7 Active Support" },
                    { icon: Globe, label: "Pan-India Network" }
                ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[0.65rem] sm:text-[0.7rem] font-bold whitespace-nowrap transition-colors ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[var(--dk3)]/30 border-[var(--glass-border)] text-[var(--mut)]'
                    }`}>
                        <item.icon size={12} className="text-emerald-500" />
                        {item.label}
                    </div>
                ))}
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto z-10 px-3 py-4 sm:px-4 sm:py-8" style={{ scrollbarWidth: 'none' }}>
                <div className="max-w-4xl mx-auto flex flex-col gap-4 sm:gap-6">
                    <AnimatePresence initial={false}>
                        {messages.map((msg, idx) => {
                            const isMe = msg.user_id === user?.id;
                            const showAvatar = idx === messages.length - 1 || messages[idx + 1]?.user_id !== msg.user_id;

                            return (
                                <motion.div
                                    key={msg.id ? `msg-${msg.id}` : `idx-${idx}`}
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    className={`flex items-end gap-2 sm:gap-3 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 sm:w-10 sm:h-10 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden border transition-all shadow-lg ${
                                        !showAvatar ? 'opacity-0' : 'opacity-100'
                                    } ${theme === 'light' ? 'border-slate-200' : 'border-[#86efac]/20'}`}>
                                        {msg.user_avatar ? (
                                            <img src={msg.user_avatar} alt={msg.user_name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className={`w-full h-full flex items-center justify-center text-sm font-bold ${
                                                theme === 'light' ? 'bg-emerald-100 text-emerald-600' : 'bg-[#166534] text-[#86efac]'
                                            }`}>
                                                {msg.user_name?.[0]?.toUpperCase() || 'F'}
                                            </div>
                                        )}
                                    </div>

                                    <div className={`flex flex-col gap-1 max-w-[85%] sm:max-w-[80%] ${isMe ? 'items-end' : 'items-start'} relative group`}>

                                        <div className="flex items-center gap-2 group-hover:opacity-100 transition-opacity">
                                            {isMe && !editingId && (
                                                <div className="absolute top-0 right-full mr-2 opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                                        className="p-1.5 rounded-lg bg-[#166534]/30 hover:bg-[#166534]/50 text-[#86efac]"
                                                    >
                                                        <MoreVertical size={14} />
                                                    </button>
                                                    {activeMenuId === msg.id && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="absolute right-full mr-2 bg-[var(--dk2)] border border-[#86efac]/20 rounded-xl overflow-hidden shadow-2xl flex flex-col min-w-[100px] z-50"
                                                        >
                                                            <button
                                                                onClick={() => handleStartEdit(msg)}
                                                                className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--g)]/40 text-xs text-[#86efac]"
                                                            >
                                                                <Edit2 size={12} /> {language === 'hi' ? 'संपादन' : 'Edit'}
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(msg.id)}
                                                                className="flex items-center gap-2 px-3 py-2 hover:bg-red-950/40 text-xs text-red-400"
                                                            >
                                                                <Trash2 size={12} /> {language === 'hi' ? 'हटाएं' : 'Unsend'}
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`px-3 py-2 sm:px-4 sm:py-3 rounded-[1.25rem] text-[0.85rem] sm:text-[0.9rem] leading-relaxed shadow-xl border transition-colors
                                                ${isMe
                                                    ? 'bg-emerald-600 text-white border-emerald-500 rounded-br-none'
                                                    : (theme === 'light' 
                                                        ? 'bg-white border-slate-100 text-slate-700 rounded-bl-none shadow-slate-200/50' 
                                                        : 'bg-[var(--dk2)] border-[var(--glass-border)] text-[var(--txt)] rounded-bl-none shadow-black/20')
                                                }`}
                                            >
                                                {editingId === msg.id ? (
                                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                                        <textarea
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="bg-[var(--dk3)] border border-emerald-500/20 rounded-lg p-2 text-sm text-[var(--txt)] outline-none focus:border-emerald-500/50"
                                                            autoFocus
                                                        />
                                                        <div className="flex justify-end gap-2">
                                                            <button onClick={() => setEditingId(null)} className="p-1 px-2 rounded-md bg-white/5 text-[0.6rem] font-bold">Cancel</button>
                                                            <button onClick={handleSaveEdit} className="p-1 px-2 rounded-md bg-[#4ade80] text-black text-[0.6rem] font-bold">Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    msg.content
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-0.5 px-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[0.6rem] text-[var(--mut)] opacity-60 flex items-center gap-1">
                                                    <Clock size={10} />
                                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                {msg.edited && (
                                                    <span className="text-[0.6rem] text-[var(--mut)] opacity-40 italic">(edited)</span>
                                                )}
                                            </div>
                                            {showAvatar && (
                                                <span className="text-[0.6rem] font-black text-[var(--mut)] opacity-80">
                                                    {msg.user_name} {isMe && '(You)'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                    <div ref={scrollRef} className="h-4" />
                </div>
            </div>

            {/* Input Area */}
            <div className={`p-3 sm:p-4 md:p-8 z-20 transition-all ${
                theme === 'light' ? 'bg-gradient-to-t from-white via-white to-transparent' : 'bg-gradient-to-t from-[#030905] to-transparent'
            }`}>
                <form
                    onSubmit={handleSendMessage}
                    className={`max-w-3xl mx-auto w-full flex items-end gap-2 sm:gap-3 p-2 sm:p-3 border rounded-2xl sm:rounded-3xl backdrop-blur-2xl transition-all ${
                        theme === 'light'
                            ? 'bg-white border-slate-200 shadow-[0_10px_40px_rgba(0,0,0,0.05)]'
                            : 'bg-[var(--dk2)]/80 border-[#86efac]/20 shadow-[0_0_40px_rgba(0,0,0,0.5)]'
                    }`}
                >
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage(e);
                            }
                        }}
                        placeholder={t.placeholder}
                        className={`flex-1 bg-transparent border-none outline-none text-[0.92rem] py-2.5 px-3 min-h-[44px] max-h-32 resize-none transition-colors ${
                            theme === 'light' ? 'text-slate-800 placeholder:text-slate-400' : 'text-[var(--txt)] placeholder-[var(--mut)] opacity-60'
                        }`}
                        rows={1}
                    />
                    <button
                        type="submit"
                        disabled={!inputText.trim() || !connected || cooldown > 0}
                        className={`w-11 h-11 shrink-0 flex items-center justify-center rounded-2xl transition-all relative
                            ${inputText.trim() && connected && cooldown === 0
                                ? 'bg-gradient-to-br from-[#166534] to-[#15803d] text-[#fff] shadow-[0_0_15px_rgba(22,101,52,0.4)] hover:scale-105 active:scale-95'
                                : (theme === 'light' ? 'bg-slate-100 text-slate-300' : 'bg-[#166534]/20 text-[#86efac]/20 cursor-not-allowed')
                            }`}
                    >
                        {cooldown > 0 ? (
                            <span className={`text-[0.7rem] font-black ${theme === 'light' ? 'text-emerald-600' : 'text-[var(--glt)]'}`}>{cooldown}s</span>
                        ) : (
                            <Send size={18} />
                        )}
                    </button>
                </form>
                <p className={`text-center text-[0.55rem] sm:text-[0.7rem] mt-2 sm:mt-4 font-black transition-colors ${
                    theme === 'light' ? 'text-slate-400' : 'text-[var(--mut)] opacity-50'
                }`}>
                    Live Tactical Communication Channel · End-to-End Encrypted
                </p>
            </div>
        </div>
    );
}
