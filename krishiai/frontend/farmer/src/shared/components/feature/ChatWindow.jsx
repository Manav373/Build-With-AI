import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Copy, Check, ThumbsUp, ThumbsDown, ChevronDown,
  Volume2, VolumeX, Pin, PinOff, Bot, User, Sparkles, MapPin
} from 'lucide-react';

import { useTheme } from '../../context/ThemeContext';

// ── Smart follow-up suggestions ──────────────────────────────────────────────
function getSmartSuggestions(text) {
  const t = text.toLowerCase();
  if (t.includes('soil') || t.includes('amendment') || t.includes('deficiency'))
    return ['🌱 What fertilizer to add?', '💧 Irrigation required?', '🐛 Pest risk for this soil?'];
  if (t.includes('pest') || t.includes('insect') || t.includes('borer') || t.includes('aphid'))
    return ['💊 Where to buy pesticide?', '🌿 Organic alternative?', '🌤 Weather affecting pest?'];
  if (t.includes('yield') || t.includes('quintal') || t.includes('harvest'))
    return ['💰 What is the MSP?', '🏪 Nearest mandi?', '📜 Any subsidy available?'];
  if (t.includes('irrigat') || t.includes('water') || t.includes('drip'))
    return ['🌤 Will it rain soon?', '📅 Sowing calendar?', '🌾 Best irrigation method?'];
  if (t.includes('weather') || t.includes('temperature') || t.includes('rain'))
    return ['🌱 How does this affect crops?', '💧 Should I irrigate today?', '🐛 Pest alert today?'];
  if (t.includes('price') || t.includes('msp') || t.includes('mandi'))
    return ['📈 When should I sell?', '🗺 Nearest mandi?', '📜 Any scheme for support?'];
  if (t.includes('scheme') || t.includes('pm-kisan') || t.includes('pmfby'))
    return ['💳 How to apply for KCC?', '📱 PM-KISAN registration?', '🏦 Loan options?'];
  if (t.includes('disease') || t.includes('fungal') || t.includes('blight'))
    return ['💊 Available treatment?', '🌿 Organic remedy?', '📷 Upload another photo'];
  return ['🌤 Check weather', '💰 Market prices', '🌾 Crop advice'];
}

// ── TTS Hook ─────────────────────────────────────────────────────────────────
function useSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    const loadVoices = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) setVoices(v);
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, []);

  const speak = (text, language = 'en') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/\*\*/g, '').replace(/[#*_~`]/g, '').replace(/\n/g, ' ');
    const utt = new SpeechSynthesisUtterance(clean.slice(0, 1000));

    // BCP-47 Map
    const langMap = { hi: 'hi-IN', gu: 'gu-IN', mr: 'mr-IN', en: 'en-IN' };
    let targetLang = langMap[language] || 'en-IN';

    // Advanced script-based auto-detection
    const hasDevanagari = /[\u0900-\u097F]/.test(text); // Hindi, Marathi
    const hasGujarati = /[\u0a80-\u0aff]/.test(text);   // Gujarati

    if (hasGujarati) targetLang = 'gu-IN';
    else if (hasDevanagari) targetLang = 'hi-IN';

    utt.lang = targetLang;

    // Voice selection: find most natural voice for target lang
    const voiceList = voices.length > 0 ? voices : window.speechSynthesis.getVoices();
    const bestVoice = voiceList.find(v => v.lang.startsWith(targetLang) &&
      (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Premium')))
      || voiceList.find(v => v.lang.startsWith(targetLang))
      || voiceList.find(v => v.lang === 'en-IN');

    if (bestVoice) {
      utt.voice = bestVoice;
      // Fine-tune rate for non-English to sound more natural
      utt.rate = targetLang === 'en-IN' ? 0.95 : 0.85;
      utt.pitch = 1.05; // Slightly higher pitch for clarity
    } else {
      utt.rate = 0.9;
    }

    utt.onstart = () => setSpeaking(true);
    utt.onend = () => setSpeaking(false);
    utt.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utt);
  };
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  return { speak, stop, speaking };
}

// ── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ isAI }) {
  const { theme } = useTheme();
  return (
    <div className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all border ${isAI
        ? theme === 'light'
          ? 'bg-gradient-to-br from-[var(--g)] to-[var(--g2)] border-[var(--glt)]/30 shadow-[0_0_15px_rgba(22,101,52,0.2)]'
          : 'bg-gradient-to-br from-[#166534] to-[#15803d] border-[#4ade80]/30 shadow-[0_0_15px_rgba(22,101,52,0.4)]'
        : theme === 'light'
          ? 'bg-[var(--dk2)] border-[var(--glass-border)]'
          : 'bg-[#0a1a0d] border-white/5'
      }`}>
      {isAI
        ? <Bot size={18} className={theme === 'light' ? "text-white" : "text-[#4ade80]"} />
        : <User size={16} className={theme === 'light' ? "text-[var(--mut)]" : "text-[#7aad86]"} />
      }
    </div>
  );
}

// ── Action Button ────────────────────────────────────────────────────────────
function ActionBtn({ onClick, title, active, activeClass = '', children }) {
  const { theme } = useTheme();
  return (
    <motion.button
      whileHover={{ scale: 1.07, y: -0.5 }}
      whileTap={{ scale: 0.93 }}
      onClick={onClick}
      title={title}
      className={`flex items-center gap-1 text-[0.67rem] px-2 py-[0.28rem] rounded-full border transition-all duration-200 cursor-pointer font-medium ${active
          ? activeClass
          : theme === 'light'
            ? 'text-[var(--mut)]/80 border-transparent hover:text-[var(--glt)] hover:bg-[var(--g)]/10 hover:border-[var(--glt)]/15'
            : 'text-[#86efac]/60 border-transparent hover:text-[#86efac] hover:bg-[#166534]/20 hover:border-[#86efac]/15'
        }`}
    >
      {children}
    </motion.button>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ m, onFeedback, onSuggestionClick, onPin, isPinned, language, onLanguageSelect }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { speak, stop, speaking } = useSpeech();
  const isAI = m.sender === 'ai';

  // Typewriter effect state
  const isNewMessage = useRef(isAI && (Date.now() - (m.timestamp || 0) < 1000)).current;
  const [displayedText, setDisplayedText] = useState(isNewMessage ? '' : m.text);
  const [isTypingComplete, setIsTypingComplete] = useState(!isNewMessage);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (!isNewMessage) {
      setDisplayedText(m.text);
      setIsTypingComplete(true);
      return;
    }

    let i = 0;
    const textLen = m.text.length;
    // Calculate base chunk size depending on text length
    const baseChunk = Math.max(1, Math.ceil(textLen / 150));

    const typeNext = () => {
      if (i >= textLen) {
        setDisplayedText(m.text);
        setIsTypingComplete(true);
        return;
      }
      
      const chunkSize = baseChunk + Math.floor(Math.random() * 2);
      const chunk = m.text.slice(i, i + chunkSize);
      i += chunkSize;
      
      setDisplayedText(m.text.slice(0, i));
      
      // Fast, continuous, smooth typing without getting stuck
      let delay = Math.floor(Math.random() * 10) + 5; 

      timeoutRef.current = setTimeout(typeNext, delay);
    };
    
    timeoutRef.current = setTimeout(typeNext, 20);
    return () => clearTimeout(timeoutRef.current);
  }, [m.text, isNewMessage]);

  const handleCopy = () => {
    navigator.clipboard.writeText(m.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  const handleFeedback = (type) => { setFeedback(type); onFeedback?.(m.id, type); };
  const handleVoice = () => { speaking ? stop() : speak(m.text, language); };
  const suggestions = isAI ? getSmartSuggestions(m.text) : [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className={`flex gap-4 w-full py-6 last:border-none ${isAI ? 'justify-start' : 'justify-start flex-row-reverse'}`}
    >
      {/* Avatar */}
      <div className="mt-1"><Avatar isAI={isAI} /></div>

      {/* Content column */}
      <div className={`flex flex-col max-w-[95%] md:max-w-[80%] gap-[0.28rem] ${isAI ? 'items-start' : 'items-end'}`}>

        {/* Pinned label */}
        {isPinned && (
          <div className="flex items-center gap-3">
            <span className="text-[0.65rem] font-black text-emerald-400">Pinned message</span>
            <div className="flex-1 h-[1px] bg-emerald-500/10" />
          </div>
        )}

        {/* Bubble */}
        <div className={`relative w-full text-[0.95rem] leading-[1.75] ${isAI
            ? 'chat-bubble-ai'
            : 'chat-bubble-user px-5 py-3.5'
          }`}>

          {/* Image */}
          {m.isImage && m.previewUrl && (
            <div className="mb-3 rounded-xl overflow-hidden border border-white/10 shadow-inner">
              <img src={m.previewUrl} alt="Uploaded" className="max-w-full max-h-[220px] object-contain" />
            </div>
          )}

          {/* Location Badge */}
          {m.location && (
            <div className="mb-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[0.7rem] font-bold">
              <MapPin size={11} className="animate-pulse" />
              <span>Location Attached</span>
            </div>
          )}

          {/* Markdown */}
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              table: ({ node, ...p }) =>
                <div className="overflow-x-auto my-3 rounded-lg border border-[#166534]/20">
                  <table className="min-w-full border-collapse" {...p} />
                </div>,
              th: ({ node, ...p }) =>
                <th className="bg-[var(--g)]/15 border-b border-[var(--glass-border)] px-3 py-2 text-left text-[0.82rem] font-semibold text-[var(--glt)]" {...p} />,
              td: ({ node, ...p }) =>
                <td className={`border-b px-3 py-2 text-[0.85rem] ${theme === 'light' ? 'border-[var(--glass-border)]/50' : 'border-white/5'}`} {...p} />,
              ul: ({ node, ...p }) => <ul className="list-disc list-outside ml-5 mb-2.5 space-y-0.5" {...p} />,
              ol: ({ node, ...p }) => <ol className="list-decimal list-outside ml-5 mb-2.5 space-y-0.5" {...p} />,
              li: ({ node, ...p }) => <li className="pl-1" {...p} />,
              a: ({ node, ...p }) =>
                <a className={`font-semibold underline underline-offset-2 transition-colors ${theme === 'light' ? 'text-[var(--g)] hover:text-[var(--glt)]' : 'text-[#4ade80] hover:text-[#86efac]'}`} {...p} />,
              strong: ({ node, ...p }) => <strong className="font-bold text-current" {...p} />,
              code: ({ node, inline, ...p }) =>
                inline
                  ? <code className={`px-1.5 py-0.5 rounded text-[0.83em] font-mono ${theme === 'light' ? 'bg-[var(--g)]/10 text-[var(--g)]' : 'bg-[#166534]/40 text-[#86efac]'}`} {...p} />
                  : <pre className={`border rounded-xl p-3 overflow-x-auto my-2 text-[0.82em] font-mono leading-relaxed ${theme === 'light' ? 'bg-[var(--dk2)] border-[var(--glass-border)]' : 'bg-[#0a1a0d] border-white/5'}`}>
                    <code {...p} />
                  </pre>,
              blockquote: ({ node, ...p }) =>
                <blockquote className="border-l-2 border-[var(--g)]/40 pl-3 my-2 text-[var(--mut)] italic" {...p} />,
              p: ({ node, ...p }) => <p className="mb-2.5 last:mb-0 whitespace-pre-wrap inline" {...p} />, // Made 'inline' to flow smoothly with cursor
            }}
          >
            {displayedText}
          </ReactMarkdown>

          {/* Animated 3-Dot Cursor */}
          {isAI && !isTypingComplete && (
            <span className="inline-flex items-center gap-[3px] ml-2 align-middle translate-y-[-2px]">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
                  className={`w-1.5 h-1.5 rounded-full ${theme === 'light' ? 'bg-[var(--g)]' : 'bg-[#4ade80] shadow-[0_0_5px_rgba(74,222,128,0.3)]'}`}
                />
              ))}
            </span>
          )}

          {/* Language Selection Buttons */}
          {m.isLanguageSelection && (
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { code: 'en', label: 'English', emoji: '🇬🇧' },
                { code: 'hi', label: 'हिन्दी', emoji: '🇮🇳' },
                { code: 'gu', label: 'ગુજરાતી', emoji: '🇮🇳' },
                { code: 'mr', label: 'मરાઠી', emoji: '🇮🇳' },
              ].map((lang) => (
                <motion.button
                  key={lang.code}
                  whileHover={{ scale: 1.05, backgroundColor: theme === 'light' ? 'var(--g)' : '#166534' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onLanguageSelect?.(lang.code)}
                  className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-[var(--g)]/10 border border-[var(--glass-border)] text-[var(--g)] hover:bg-[var(--g)]/20'
                      : 'bg-[#166534]/20 border border-[#86efac]/20 text-[#86efac] hover:border-[#4ade80]/50'
                  }`}
                >
                  <span>{lang.emoji}</span>
                  <span>{lang.label}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-[0.6rem] text-[var(--mut)]/60 px-1 ${isAI ? 'text-left' : 'text-right'}`}>
          {m.timestamp
            ? new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </div>

        {/* AI actions */}
        {isAI && isTypingComplete && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="flex items-center flex-wrap gap-0.5 px-0.5"
          >
            <ActionBtn onClick={handleCopy} title="Copy" active={copied}
              activeClass={theme === 'light' ? 'text-[var(--g)] border-[var(--g)]/20 bg-[var(--g)]/10' : 'text-[#86efac] border-[#86efac]/25 bg-[#166534]/25'}>
              {copied ? <Check size={11} /> : <Copy size={11} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </ActionBtn>

            <ActionBtn onClick={handleVoice} title="Read aloud" active={speaking}
              activeClass={theme === 'light' ? 'text-[var(--g)] border-[var(--g)]/20 bg-[var(--g)]/10' : 'text-[#86efac] border-[#86efac]/25 bg-[#166534]/25'}>
              {speaking ? <VolumeX size={11} /> : <Volume2 size={11} />}
              <span>{speaking ? 'Stop' : 'Listen'}</span>
            </ActionBtn>

            <ActionBtn onClick={() => onPin?.(m)} title={isPinned ? 'Unpin' : 'Pin'} active={isPinned}
              activeClass={theme === 'light' ? 'text-amber-600 border-amber-600/20 bg-amber-500/10' : 'text-amber-400 border-amber-400/25 bg-amber-500/10'}>
              {isPinned ? <PinOff size={11} /> : <Pin size={11} />}
              <span>{isPinned ? 'Unpin' : 'Pin'}</span>
            </ActionBtn>

            {/* Divider */}
            <span className="w-px h-3 bg-[#86efac]/12 mx-0.5" />

            {/* Thumbs */}
            {[
              { type: 'up', Icon: ThumbsUp, active: feedback === 'up', cls: 'text-emerald-500 bg-emerald-500/15 border-emerald-500/25', hover: 'hover:text-emerald-500 hover:bg-emerald-500/10' },
              { type: 'down', Icon: ThumbsDown, active: feedback === 'down', cls: 'text-red-500 bg-red-500/15 border-red-500/25', hover: 'hover:text-red-500 hover:bg-red-500/10' },
            ].map(({ type, Icon, active, cls, hover }) => (
              <motion.button key={type}
                whileHover={{ scale: 1.18, y: -1 }} whileTap={{ scale: 0.85 }}
                onClick={() => handleFeedback(type)}
                className={`p-1.5 rounded-full border transition-all cursor-pointer ${active ? cls : `text-[var(--mut)]/60 border-transparent ${hover}`
                  }`}
              ><Icon size={12} /></motion.button>
            ))}

            {/* Divider */}
            <span className="w-px h-3 bg-[#86efac]/12 mx-0.5" />

            <ActionBtn onClick={() => setShowSuggestions(s => !s)} title="Smart suggestions"
              active={showSuggestions}
              activeClass={theme === 'light' ? 'text-[var(--g)] border-[var(--g)]/20 bg-[var(--g)]/10' : 'text-[#86efac] border-[#86efac]/25 bg-[#166534]/20'}>
              <Sparkles size={11} />
              <span>Ideas</span>
              <ChevronDown size={10} className={`transition-transform duration-300 ${showSuggestions ? 'rotate-180' : ''}`} />
            </ActionBtn>
          </motion.div>
        )}

        {/* Smart suggestion chips */}
        <AnimatePresence>
          {isAI && showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="flex flex-wrap gap-1.5 mt-0.5 px-0.5"
            >
              {suggestions.map((s, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, scale: 0.82, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ delay: i * 0.055, type: 'spring', stiffness: 420 }}
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => { onSuggestionClick(s); setShowSuggestions(false); }}
                  className="suggestion-chip"
                >
                  {s}
                </motion.button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────────
function TypingIndicator({ messages }) {
  const { theme } = useTheme();
  const lastUserMsg = [...messages].reverse().find(m => m.sender === 'user');
  const isLocationMsg = lastUserMsg?.location;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex gap-3 justify-start items-end"
    >
      <div className="mb-1"><Avatar isAI /></div>
      <div className={`chat-bubble-ai rounded-2xl rounded-bl-[4px] px-5 py-3 flex items-center gap-4 border transition-all ${
        theme === 'light' 
          ? 'bg-[var(--g)]/5 border-[var(--glass-border)] shadow-sm' 
          : 'bg-[#166534]/15 border-white/5'
      }`}>
        <div className="flex gap-1">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3], scale: [1, 1.2, 1] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} className={`w-1 h-1 rounded-full ${theme === 'light' ? 'bg-[var(--g)]' : 'bg-[#4ade80]'}`} />
          ))}
        </div>
        <span className={`text-[0.65rem] font-bold ${theme === 'light' ? 'text-[var(--g)]' : 'text-[#86efac]/60'}`}>KrishiAI is typing...</span>
      </div>
    </motion.div>
  );
}

// ── ChatWindow ────────────────────────────────────────────────────────────────
export default function ChatWindow({ messages, isTyping, onFeedback, onSuggestionClick, onPin, pinnedIds, language, onLanguageSelect }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);

  // Auto-scroll when messages or typing status changes
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  // Auto-scroll when content size changes (e.g., during typewriter effect)
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'auto' });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="chat-container-centered flex flex-col pt-4">
      <AnimatePresence initial={false}>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            m={m}
            onFeedback={onFeedback}
            onSuggestionClick={onSuggestionClick}
            onPin={onPin}
            isPinned={typeof pinnedIds?.has === 'function' ? pinnedIds.has(m.id) : (Array.isArray(pinnedIds) ? pinnedIds.includes(m.id) : false)}
            language={language}
            onLanguageSelect={onLanguageSelect}
          />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {isTyping && <TypingIndicator key="typing" messages={messages} />}
      </AnimatePresence>

      <div ref={bottomRef} className="h-40 shrink-0" />
    </div>
  );
}
