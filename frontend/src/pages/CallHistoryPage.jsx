import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, Clock, FileText, User, ChevronRight, MessageSquare, Calendar, Search, RefreshCw, AlertCircle, Play, Pause, Headphones, Zap, Download, Menu } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { translations } from '../utils/translations/index';
import { getCallHistory } from '../services/api';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

export default function CallHistoryPage() {
  const { language } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme } = useTheme();
  const t = translations[language].chat.dashboard.callHistory;

  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await getCallHistory();
      setCalls(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching call history:', err);
      setError('Failed to load call history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filteredCalls = calls.filter(call =>
    call.phone_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    call.summary?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'hi' ? 'hi-IN' : language === 'mr' ? 'mr-IN' : 'en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (!seconds) return `0 ${t.sec}`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    if (mins > 0) return `${mins} ${t.min} ${secs} ${t.sec}`;
    return `${secs} ${t.sec}`;
  };

  return (
    <div className="flex-1 overflow-y-auto w-full relative z-10 bg-[var(--page-bg)]">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#166534]/10 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#166534]/5 blur-[100px] rounded-full -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3 mb-2"
            >
              <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-[var(--g)]/40 border border-[#86efac]/20 rounded-xl text-[var(--glt)] shrink-0">
                <Menu size={18} />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#166534]/30 border border-[#86efac]/20 flex items-center justify-center text-[var(--glt)]">
                <Headphones size={20} />
              </div>
              <h1 className={`text-2xl sm:text-3xl font-bold font-outfit tracking-tight transition-colors ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>
                {t.pageTitle}
              </h1>
            </motion.div>
            <p className={`${theme === 'light' ? 'text-[var(--mut)]' : 'text-[#86efac]/60'} text-sm sm:text-base`}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#86efac]/40 group-focus-within:text-[var(--glt)] transition-colors" size={18} />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`border rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all w-full sm:w-56 md:w-64 backdrop-blur-md ${
                  theme === 'light'
                    ? 'bg-white border-emerald-200 text-slate-900 placeholder-slate-400 focus:border-emerald-500 shadow-sm'
                    : 'bg-white/[0.03] border-white/10 text-white placeholder-white/30 focus:border-emerald-500/30'
                }`}
              />
            </div>
            <button
              onClick={fetchHistory}
              className="p-2.5 rounded-xl bg-[var(--dk2)]/50 border border-[var(--glass-border)] text-[var(--glt)] hover:bg-[#166534]/20 transition-all shadow-sm"
              title={t.refresh || 'Refresh'}
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-2xl bg-[var(--dk2)]/30 border border-[#86efac]/5 animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 mb-4 border border-red-500/20">
              <AlertCircle size={32} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>{t.errorLoading}</h3>
            <p className={`${theme === 'light' ? 'text-[var(--mut)]' : 'text-[#86efac]/40'} max-w-sm mb-6`}>{error || t.errorLoading}</p>
            <button
              onClick={fetchHistory}
              className="px-6 py-2 rounded-xl bg-[#166534] text-white font-bold hover:bg-[#15803d] transition-all"
            >
              {t.tryAgain}
            </button>
          </div>
        ) : filteredCalls.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center glass-card border-[var(--glass-border)] rounded-[3rem]">
            <div className="w-20 h-20 rounded-full bg-[#166534]/10 flex items-center justify-center text-[var(--glt)]/40 mb-6 border border-[var(--glass-border)]">
              <Phone size={40} />
            </div>
            <h3 className={`text-xl font-bold mb-2 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>{t.noCalls}</h3>
            <p className={`${theme === 'light' ? 'text-[var(--mut)]' : 'text-[#86efac]/40'}`}>{t.noCallsDesc || "You haven't made any voice calls yet."}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredCalls.map((call, idx) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative overflow-hidden glass-card transition-all border-[var(--glass-border)] hover:border-emerald-500/30 cursor-pointer rounded-3xl ${theme === 'light' ? 'bg-white hover:bg-emerald-50/30' : 'hover:bg-[#166534]/15'
                  }`}
                onClick={() => setSelectedCall(call)}
              >
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-[#4ade80]/10 text-[var(--glt)] px-3 py-1 rounded-full text-[0.65rem] font-bold border border-[#4ade80]/20">
                        Call ID: {call.call_id?.slice(-8).toUpperCase() || 'N/A'}
                      </div>
                      <span className={`${theme === 'light' ? 'text-[var(--mut)]' : 'text-[#86efac]/40'} text-xs flex items-center gap-1`}>
                        <Calendar size={12} /> {formatDate(call.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2 text-[var(--glt)] font-bold text-lg font-outfit">
                        <User size={18} className="text-emerald-500" />
                        {call.phone_number || t.unknown}
                      </div>
                      <div className="w-px h-4 bg-[#86efac]/10 hidden sm:block" />
                      <div className={`${theme === 'light' ? 'text-[var(--mut)]' : 'text-[#86efac]/60'} flex items-center gap-2 text-sm`}>
                        <Clock size={16} />
                        {formatDuration(call.duration)}
                      </div>
                      {call.recording_url && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[0.6rem] font-bold border border-emerald-500/10">
                          <Zap size={10} /> Recorded
                        </div>
                      )}
                    </div>

                    <div className={`text-[0.95rem] line-clamp-2 leading-relaxed italic transition-opacity ${theme === 'light' ? 'text-[var(--txt)] opacity-70 group-hover:opacity-100' : 'text-[var(--header-txt)] opacity-80 group-hover:opacity-100'
                      }`}>
                      "{call.summary || t.summaryUnavailable}"
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:flex-col md:items-end gap-3 shrink-0">
                    <button className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-emerald-500/20 text-sm font-bold transition-all shadow-xl ${theme === 'light' ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-500 hover:text-white' : 'bg-[#166534]/30 text-[var(--glt)] hover:bg-[#4ade80] hover:text-[#030905]'
                      }`}>
                      {t.viewTranscript} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Call Detail Modal */}
      <AnimatePresence>
        {selectedCall && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedCall(null);
                setIsPlaying(false);
              }}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className={`relative w-full sm:max-w-4xl max-h-[90vh] sm:max-h-[85vh] border border-emerald-500/20 rounded-t-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-[var(--dk2)]'
                }`}
            >
              {/* Modal Header */}
              <div className="p-4 sm:p-8 border-b border-emerald-500/10 flex items-center justify-between bg-emerald-500/5">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">
                    <Headphones size={28} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold font-outfit tracking-tight ${theme === 'light' ? 'text-[var(--txt)]' : 'text-white'}`}>{selectedCall.phone_number || t.unknown}</h3>
                    <p className={`${theme === 'light' ? 'text-emerald-700/60' : 'text-emerald-500/60'} font-bold text-[0.65rem] mt-1`}>{formatDate(selectedCall.timestamp)} • {formatDuration(selectedCall.duration)}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedCall(null);
                    setIsPlaying(false);
                  }}
                  className="p-3 rounded-full hover:bg-white/5 text-emerald-500/50 hover:text-white transition-all bg-black/20 border border-white/5"
                >
                  <XIcon size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-10 space-y-6 sm:space-y-10" style={{ scrollbarWidth: 'thin' }}>

                {/* Recording Player */}
                {selectedCall.recording_url && (
                  <div className="p-8 rounded-[2rem] bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Headphones size={80} className="text-emerald-500" />
                    </div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 text-emerald-400 font-bold text-[0.65rem] mb-6">
                        <Zap size={14} /> Call recording
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-8">
                        <button
                          onClick={() => {
                            const audio = document.getElementById('call-audio');
                            if (isPlaying) audio.pause();
                            else audio.play();
                            setIsPlaying(!isPlaying);
                          }}
                          className="w-20 h-20 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:scale-110 active:scale-95 transition-all"
                        >
                          {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                        </button>

                        <div className="flex-1 w-full">
                          <audio
                            id="call-audio"
                            src={selectedCall.recording_url}
                            onEnded={() => setIsPlaying(false)}
                            onPause={() => setIsPlaying(false)}
                            onPlay={() => setIsPlaying(true)}
                            className="hidden"
                          />
                          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                              animate={isPlaying ? { x: ['-100%', '100%'] } : {}}
                              transition={isPlaying ? { duration: 2, repeat: Infinity, ease: "linear" } : {}}
                              className="h-full w-full bg-emerald-500 opacity-30"
                            />
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[0.6rem] font-bold text-emerald-500/40 tracking-wider">Master studio audio</span>
                            <a
                              href={selectedCall.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 text-[0.6rem] font-bold tracking-wider"
                            >
                              <Download size={14} /> Download file
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Summary Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-[0.65rem] mb-2 px-2">
                    <FileText size={16} /> Analysis summary
                  </div>
                  <div className="p-8 rounded-[2rem] bg-[var(--page-bg)]/50 border border-emerald-500/10 shadow-inner relative group">
                    <div className="absolute inset-0 bg-emerald-500/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                    <p className={`leading-[1.8] text-[1.1rem] font-medium opacity-90 ${theme === 'light' ? 'text-[var(--txt)]' : 'text-[var(--header-txt)]'}`}>
                      {selectedCall.summary || t.summaryUnavailable}
                    </p>
                  </div>
                </div>

                {/* Transcript Section */}
                <div className="space-y-6 pb-6">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-[0.65rem] mb-4 px-2">
                    <MessageSquare size={16} /> Detailed transcript
                  </div>
                  <div className="space-y-8 pl-4 border-l border-emerald-500/5">
                    {selectedCall.transcript ? (
                      selectedCall.transcript.split('\n').filter(l => l.trim()).map((line, i) => {
                        const isFarmer = line.toLowerCase().includes('phone:') || line.toLowerCase().includes('user:') || line.toLowerCase().includes('farmer:');
                        const isAdmin = line.toLowerCase().includes('assistant:') || line.toLowerCase().includes('ai:');

                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative"
                          >
                            <div className={`flex items-center gap-4 mb-2`}>
                              <span className={`text-[0.6rem] font-bold tracking-wider ${isFarmer ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {isFarmer ? 'Farmer' : isAdmin ? 'KrishiAI' : 'Log'}
                              </span>
                              <div className="h-px flex-1 bg-emerald-500/5" />
                            </div>
                            <div className={`${theme === 'light' ? 'text-[var(--txt)] opacity-80' : 'text-[#86efac]/80'} leading-relaxed text-[1rem] pl-2`}>
                              {line.replace(/^(phone|user|farmer|assistant|ai|bot|agent):\s*/i, '')}
                            </div>
                          </motion.div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center p-12 bg-white/5 rounded-3xl border border-white/5 opacity-50 italic">
                        <Loader2 size={32} className="animate-spin mb-4 text-emerald-500/40" />
                        <p className="text-emerald-500/40">{t.transcriptSoon}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className={`p-4 sm:p-8 border-t border-emerald-500/10 flex justify-end pb-safe ${theme === 'light' ? 'bg-gray-50' : 'bg-[var(--dk2)]'}`}>
                <button
                  onClick={() => {
                    setSelectedCall(null);
                    setIsPlaying(false);
                  }}
                  className="w-full sm:w-auto px-10 py-3.5 rounded-2xl bg-emerald-500 text-black font-bold text-xs hover:bg-emerald-400 transition-all shadow-[0_4px_24px_rgba(16,185,129,0.3)]"
                >
                  {t.close}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Icons
function XIcon({ size, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  );
}

function Loader2({ size, className, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
