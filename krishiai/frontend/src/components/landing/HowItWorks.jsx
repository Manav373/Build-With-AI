import React, { useRef, useState, useEffect, memo } from 'react';
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, BrainCircuit, CheckCircle2, Image as ImageIcon, Bot, ArrowRight, CheckCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { translations } from '../../utils/translations';

const STEPS = [
  {
    num: "01",
    title: "Scan this QR",
    desc: "Scan the QR code using your phone camera to start a chat with KrishiAI instantly.",
    img: "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?auto=format&fit=crop&q=80&w=800",
    color: "from-blue-500 via-cyan-400 to-emerald-400",
    icon: MessageSquare,
    badgeText: "Instant Access"
  },
  {
    num: "02",
    title: "Ask Your Question",
    desc: "Send a text or voice note in your native language, or snap a photo of your fields.",
    img: "https://images.unsplash.com/photo-1590682680695-43b964a3ae17?auto=format&fit=crop&q=80&w=800",
    color: "from-emerald-400 via-green-500 to-lime-400",
    icon: BrainCircuit,
    badgeText: "Multilingual AI"
  },
  {
    num: "03",
    title: "Get AI Solutions",
    desc: "Receive precise, real-time alerts and actionable remedies verified by top agronomy databases.",
    img: "https://images.unsplash.com/photo-1592982537447-6f2a6a0a091c?auto=format&fit=crop&q=80&w=800",
    color: "from-lime-400 via-yellow-400 to-amber-500",
    icon: CheckCircle2,
    badgeText: "Expert Verified"
  }
];

// ─── Tilt card: only runs on desktop, uses translate3d (GPU) ─────────────────
function TiltFrame({ children, className }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Smooth with CSS transition instead of useMotionTemplate (avoids reflow)
  function handleMouseMove(e) {
    if (!ref.current || isMobile) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = ((e.clientY - rect.top)  / rect.height - 0.5) * -8;
    const yPct = ((e.clientX - rect.left) / rect.width  - 0.5) *  8;
    setTilt({ x: xPct, y: yPct });
  }

  function handleMouseLeave() { setTilt({ x: 0, y: 0 }); }

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: isMobile
          ? 'none'
          : `perspective(1200px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02,1.02,1.02)`,
        transition: 'transform 0.25s ease-out',
        willChange: 'transform',
      }}
      className={className}
    >
      {children}
    </div>
  );
}

// ─── Orb: uses opacity + transform only (no blur on animated elements) ───────
const FloatingOrb = memo(function FloatingOrb({ delay, duration, x1, y1, x2, y2, size }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.35, 0], x: [0, x2, 0], y: [0, y2, 0] }}
      transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        position: 'absolute',
        left: x1, top: y1,
        width: size, height: size,
        borderRadius: '50%',
        background: 'rgba(74,222,128,0.18)',
        // Static blur on a non-animated wrapper instead
        filter: 'blur(40px)',
        pointerEvents: 'none',
        willChange: 'transform, opacity',
      }}
    />
  );
});

// ─── Chat messages (no backdrop-filter inside animated container) ─────────────
const ChatScreen = memo(function ChatScreen({ messages }) {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`absolute inset-0 flex flex-col pt-10 pb-4 z-40 transition-colors duration-500 ${
        theme === 'light' ? 'bg-[#f0fdf4]' : 'bg-[#000a04]'
      }`}
    >
      {/* WhatsApp-style Header — no backdropFilter here */}
      <div className={`px-4 py-2 flex items-center gap-3 relative z-10 shadow-md border-b transition-colors ${
        theme === 'light' ? 'bg-white border-emerald-100' : 'bg-[#0a1a0d] border-[#4ade80]/20'
      }`}>
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ade80] to-[#166534] flex items-center justify-center border border-[#86efac]/30 overflow-hidden text-white">
            <Bot size={22} />
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#4ade80] rounded-full border-2 border-[#0a1a0d]" />
        </div>
        <div>
          <div className={`font-bold text-sm transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>KrishiAI</div>
          <div className="text-[#4ade80] text-[10px] font-medium">Online</div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-hidden relative z-10">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 + 0.05, duration: 0.35, ease: 'easeOut' }}
            className={`p-3 text-[13.5px] leading-relaxed max-w-[88%] shadow-sm relative whitespace-pre-wrap ${
              msg.type === 'user'
                ? 'bg-gradient-to-br from-[#166534] to-[#14532d] text-white self-end rounded-2xl rounded-tr-sm border border-[#4ade80]/20'
                : `self-start rounded-2xl rounded-tl-sm border transition-all ${
                    theme === 'light' 
                      ? 'bg-white border-emerald-100 text-slate-800' 
                      : 'bg-[#050e07] border-[#86efac]/20 text-[#e2f0e4]'
                  }`
            }`}
          >
            {msg.text}
            {msg.type === 'user' && (
              <div className="absolute bottom-1 right-2 flex text-[#86efac] opacity-90">
                <CheckCheck size={12} strokeWidth={3} />
              </div>
            )}
            {msg.type === 'bot' && (
              <div className="absolute bottom-1 right-1.5 text-[#4ade80]/70 text-[9px] font-mono">Just now</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="px-4 mt-auto relative z-10">
        <div className={`rounded-full pl-4 pr-1 py-1 text-[13px] border flex items-center justify-between transition-all ${
          theme === 'light' 
            ? 'bg-white border-emerald-200 text-slate-400' 
            : 'bg-[#050e07] border-[#4ade80]/20 text-white/40'
        }`}>
          <span className="flex-1 line-clamp-1">Message...</span>
          <div className="w-8 h-8 rounded-full bg-[#4ade80] flex items-center justify-center shrink-0">
            <ArrowRight className="w-4 h-4 text-[#050e07] stroke-[3px]" />
          </div>
        </div>
      </div>
      <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full z-10 ${theme === 'light' ? 'bg-slate-200' : 'bg-white/20'}`} />
    </motion.div>
  );
});

// ─── Phone mockup ─────────────────────────────────────────────────────────────
const PhoneMockup = memo(function PhoneMockup({ stepIndex }) {
  const { theme } = useTheme();

  return (
    <TiltFrame className="relative p-[2px] rounded-[2.5rem] shadow-[0_30px_60px_rgba(250,204,21,0.12)] group cursor-crosshair w-full max-w-[280px] sm:max-w-[320px] mx-auto scale-90 sm:scale-100">
      {/* Outer frame glow — static, not animated */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#facc15]/50 via-[#4ade80]/30 to-[#166534] rounded-[2.5rem] opacity-70 blur-[2px]" />

      {/* Phone Body */}
      <div className={`relative w-full aspect-[9/19] rounded-[calc(2.5rem-2px)] overflow-hidden border-4 flex flex-col transition-colors duration-500 ${
        theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#050e07] border-[#1a1f1b]'
      }`}>
        {/* Dynamic Island */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-6 bg-black rounded-full z-50" />

        <AnimatePresence mode="wait">
          {/* Screen 1: QR Scanner */}
          {stepIndex === 0 && (
            <motion.div key="screen-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="absolute inset-0 flex flex-col z-40">
              <div className="absolute top-12 left-0 w-full px-6 flex justify-between items-center z-20 text-white/80">
                <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center border border-white/10 text-xl leading-none">×</div>
                <div className="text-xs font-bold bg-black/50 px-3 py-1.5 rounded-full border border-white/10 text-[#86efac]">Scan Code</div>
                <div className="w-8 h-8 rounded-full bg-black/50 border border-white/10 flex items-center justify-center"><ImageIcon size={14} /></div>
              </div>

              <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-[#166534]/40 to-[#020502] relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1592982537447-6f2a6a0a091c?auto=format&fit=crop&w=400&q=80')] bg-cover bg-center opacity-30 blur-sm" />

                {/* Viewfinder */}
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center">
                  <div className="relative w-[85%] aspect-square">
                    <div className="absolute inset-0 border-2 border-dashed border-white/30 rounded-3xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]" />
                    <div className="absolute -top-2 -left-2 w-10 h-10 border-t-4 border-l-4 border-[#facc15] rounded-tl-2xl shadow-[0_0_12px_rgba(250,204,21,0.4)]" />
                    <div className="absolute -top-2 -right-2 w-10 h-10 border-t-4 border-r-4 border-[#facc15] rounded-tr-2xl shadow-[0_0_12px_rgba(250,204,21,0.4)]" />
                    <div className="absolute -bottom-2 -left-2 w-10 h-10 border-b-4 border-l-4 border-[#facc15] rounded-bl-2xl shadow-[0_0_12px_rgba(250,204,21,0.4)]" />
                    <div className="absolute -bottom-2 -right-2 w-10 h-10 border-b-4 border-r-4 border-[#facc15] rounded-br-2xl shadow-[0_0_12px_rgba(250,204,21,0.4)]" />
                    {/* Laser line: only transform — pure GPU */}
                    <motion.div
                      animate={{ top: ['5%', '95%', '5%'] }}
                      transition={{ duration: 2.8, ease: 'linear', repeat: Infinity }}
                      style={{ position: 'absolute', left: '5%', width: '90%', height: 3,
                               background: '#4ade80', boxShadow: '0 0 16px #4ade80',
                               zIndex: 30, willChange: 'top' }}
                    />
                  </div>
                </div>

                {/* QR card */}
                <motion.a
                  href="https://wa.me/14155238886?text=join%20wish-aboard"
                  target="_blank" rel="noopener noreferrer"
                  aria-label="Scan to join KrishiAI WhatsApp community"
                  whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="relative z-20 w-44 h-44 bg-white rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.2)] cursor-pointer"
                >
                  <div className="w-40 h-40 bg-[url('https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=http%3A%2F%2Fwa.me%2F%2B14155238886%3Ftext%3Djoin%2520wish-aboard&color=000000&bgcolor=ffffff')] bg-contain bg-no-repeat bg-center" />
                </motion.a>
              </div>

              <div className={`h-24 border-t flex items-center justify-center gap-8 px-6 z-20 transition-colors ${theme === 'light' ? 'bg-white border-slate-100' : 'bg-black/80 border-white/10'}`}>
                <div className={`w-10 h-10 rounded-full border ${theme === 'light' ? 'border-slate-200' : 'border-white/20'}`} />
                <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${theme === 'light' ? 'border-slate-100' : 'border-white'}`}>
                  <div className={`w-12 h-12 rounded-full ${theme === 'light' ? 'bg-slate-50' : 'bg-white'}`} />
                </div>
                <div className={`w-10 h-10 rounded-full border ${theme === 'light' ? 'border-slate-200' : 'border-white/20'}`} />
              </div>
              <div className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-24 h-1 rounded-full z-50 ${theme === 'light' ? 'bg-slate-300' : 'bg-white/60'}`} />
            </motion.div>
          )}

          {stepIndex === 1 && (
            <ChatScreen key="screen-1" messages={[
              { type: 'bot',  text: 'Namaste! 🙏 Welcome to KrishiAI. Send me a photo or describe your farm issue.' },
              { type: 'user', text: 'My tomato crop has yellowing leaves with dark spots. What fertilizer should I use? 🍅' }
            ]} />
          )}

          {stepIndex === 2 && (
            <ChatScreen key="screen-2" messages={[
              { type: 'user', text: 'My tomato crop has yellowing leaves with dark spots...' },
              { type: 'bot',  text: 'Based on the symptoms, this looks like Early Blight. I recommend using a Copper-based fungicide like Blitox 50.' },
              { type: 'bot',  text: 'Dosage: Mix 3g per liter of water.\nPrecaution: Do not spray during peak sunlight.' }
            ]} />
          )}
        </AnimatePresence>
      </div>

      {/* Outer glass overlay — static */}
      <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay" />
    </TiltFrame>
  );
});

// ─── Main section ─────────────────────────────────────────────────────────────
export default function HowItWorks() {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const t = translations[language].howItWorks;

  const dynamicSteps = [
    {
      ...STEPS[0],
      title: t.step1Title,
      desc: t.step1Desc,
      badgeText: t.step1Badge
    },
    {
      ...STEPS[1],
      title: t.step2Title,
      desc: t.step2Desc,
      badgeText: t.step2Badge
    },
    {
      ...STEPS[2],
      title: t.step3Title,
      desc: t.step3Desc,
      badgeText: t.step3Badge
    }
  ];

  const [orbs] = useState(() => {
    const count = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 6;
    return Array.from({ length: count }).map((_, i) => ({
      x1: `${Math.random() * 80 + 10}%`, y1: `${Math.random() * 80 + 10}%`,
      x2: (Math.random() - 0.5) * 120,   y2: (Math.random() - 0.5) * 120,
      delay: i * 1.2,
      dur: 14 + Math.random() * 8,
      size: 60 + Math.random() * 80,
    }));
  });

  return (
    <section id="howitworks" className="py-16 sm:py-32 relative z-10 border-y border-emerald-200/30 dark:border-[#4ade80]/20 overflow-hidden bg-transparent">

      {/* Static ambient — no animation, pure CSS */}
      <div className="absolute top-0 right-1/2 translate-x-1/2 w-[60vw] h-[60vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle,rgba(22,101,52,0.25)_0%,transparent_70%)] rounded-full blur-[80px] pointer-events-none" />

      {/* Floating orbs — fewer, lighter */}
      {orbs.map((orb, i) => (
        <FloatingOrb key={i} x1={orb.x1} y1={orb.y1} x2={orb.x2} y2={orb.y2}
          delay={orb.delay} duration={orb.dur} size={orb.size} />
      ))}

      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
        <div className="flex flex-col gap-24 lg:gap-40">
          {dynamicSteps.map((step, i) => {
            const isEven = i % 2 === 0;
            const Icon = step.icon;

            return (
              <div key={i} className={`flex flex-col lg:flex-row items-center gap-12 lg:gap-24 ${isEven ? '' : 'lg:flex-row-reverse'}`}>

                {/* Text column */}
                <div className="flex-1 flex flex-col w-full lg:w-1/2 relative">
                  {i === 0 && (
                    <div className="mb-12">
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.55, ease: 'easeOut' }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-[#facc15]/40 bg-gradient-to-r from-[#facc15]/20 to-white/40 dark:to-[#0a1a0d]/40 text-[#facc15] text-sm font-bold mb-6 shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                      >
                        <Sparkles size={14} className="text-[#facc15] animate-pulse" />
                         <span>{t.badge}</span>
                      </motion.div>

                      <h2 className="text-4xl sm:text-6xl lg:text-7xl font-outfit font-black text-center lg:text-left text-slate-900 dark:text-white mb-6 leading-tight">
                        {t.title} <br />
                        <span className="relative inline-block">
                          <span className="absolute -inset-2 bg-[#facc15] blur-2xl opacity-20" />
                          <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-[#facc15] via-[#fbbf24] to-[#f59e0b]">1-2-3</span>
                        </span>
                      </h2>
                      <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 text-center lg:text-left font-light leading-relaxed">
                        {t.subtitle}
                      </p>
                    </div>
                  )}

                  <TiltFrame className="relative h-full">
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 }}
                      className="glass-panel p-8 lg:p-12 rounded-[3rem] border border-gray-200/30 dark:border-white/5 h-full relative group hover:border-[#4ade80]/40 transition-all duration-500 bg-transparent dark:bg-[#020502]/80 overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] hover:shadow-[0_30px_80px_rgba(74,222,128,0.15)]"
                    >
                      <div className="absolute top-6 right-6 z-30 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out">
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-black/40 border border-gray-200 dark:border-white/20 shadow-xl">
                          <Icon size={14} className="text-[#4ade80]" />
                          <span className="text-slate-900 dark:text-white text-xs font-bold">{step.badgeText}</span>
                        </div>
                      </div>

                      {/* Background glow — only opacity transitions, no blur animation */}
                      <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl ${step.color} rounded-full blur-[80px] opacity-5 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none`} />

                      <div className="relative z-20">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-black/50 border border-gray-200 dark:border-white/10 flex items-center justify-center font-outfit text-3xl font-black text-slate-400 dark:text-white/70 shadow-2xl mb-8 group-hover:scale-110 group-hover:border-[#4ade80]/50 transition-all duration-400">
                          {step.num}
                        </div>

                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-transparent dark:bg-black/40 border border-gray-200/30 dark:border-white/10 shadow-xl mb-6 w-max group-hover:-translate-y-1 transition-transform duration-400">
                          <Icon size={16} className="text-[#4ade80]" />
                          <span className="text-slate-900 dark:text-white text-xs font-bold">{step.badgeText}</span>
                        </div>

                        <h3 className={`text-2xl sm:text-3xl lg:text-4xl font-bold font-outfit text-slate-900 dark:text-white mb-4 transition-all duration-400 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r ${step.color} group-hover:translate-x-1 text-center lg:text-left`}>
                          {step.title}
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 text-center lg:text-left leading-relaxed font-light text-base sm:text-lg lg:text-xl transition-colors duration-400 dark:group-hover:text-white group-hover:text-slate-900 group-hover:translate-x-1">
                          {step.desc}
                        </p>
                      </div>
                    </motion.div>
                  </TiltFrame>
                </div>

                {/* Phone column */}
                <div className="flex-1 flex justify-center w-full lg:w-1/2" style={{ perspective: '1200px' }}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85, y: 40 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
                    transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1], delay: i * 0.05 + 0.1 }}
                    className="w-full relative group"
                  >
                    {/* Hover aura — only opacity, no blur animation */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-gradient-to-br ${step.color} rounded-full blur-[80px] opacity-0 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none`} />
                    <PhoneMockup stepIndex={i} />
                  </motion.div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
