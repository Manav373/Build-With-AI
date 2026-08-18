import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Bot, MessageCircle, Globe, X, Target, Zap, Shield, TrendingUp, Cpu } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

// Floating element component for 3D parallax effect
const FloatingElement = ({ children, delay = 0, x, y, rotate }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0 }}
    animate={{ 
      opacity: 1, 
      scale: 1,
      y: [0, y, 0],
      x: [0, x, 0],
      rotate: [0, rotate, 0]
    }}
    transition={{ 
      delay,
      duration: 10 + Math.random() * 5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none"
  >
    {children}
  </motion.div>
);

export default function Hero() {
  const { language } = useLanguage();
  const t = translations[language].hero;
  const tc = translations[language].chatSelection;
  const tm = translations[language].heroMessages;

  const [showPathSelection, setShowPathSelection] = useState(false);

  return (
    <section className="relative min-h-[100vh] flex items-center pt-24 pb-12 overflow-hidden bg-white dark:bg-[#000a04]">

      {/* Background Video */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-screen mix-blend-luminosity"
        >
          <source src="/hero-bg.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-[#000a04] via-transparent to-[#000a04]"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#000a04] via-transparent to-[#000a04]/80"></div>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[#166534] rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-[orbFloat_10s_ease-in-out_infinite_alternate] z-0"></div>
      <div className="absolute top-1/3 -right-20 w-[30rem] h-[30rem] bg-[#facc15] rounded-full mix-blend-screen filter blur-[150px] opacity-10 animate-[orbFloat_12s_ease-in-out_infinite_alternate-reverse] z-0"></div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center w-full z-10 hero-grid relative">

        {/* TEXT CONTENT */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } } }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#facc15]/30 bg-[#facc15]/10 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#facc15] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#facc15]"></span>
            </span>
            <span className="text-sm font-bold text-[#facc15]">Recently Added: Satellite & Mandi Map</span>
          </motion.div>

          <motion.h1 
            variants={{ 
              hidden: { opacity: 0, y: 30 }, 
              visible: { 
                opacity: 1, 
                y: 0, 
                transition: { 
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1] 
                } 
              } 
            }} 
            className="text-4xl sm:text-5xl lg:text-7xl font-outfit font-black leading-[1.05] mb-6 text-slate-900 dark:text-white drop-shadow-2xl"
          >
            {t.titleMain} <br />
            <motion.span 
              animate={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              style={{ backgroundSize: "200% auto" }}
              className="bg-gradient-to-r from-[#86efac] via-[#facc15] to-[#4ade80] bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(74,222,128,0.3)] inline-block hover:scale-[1.02] transition-transform cursor-default"
            >
              {t.titleAccent}
            </motion.span>
          </motion.h1>

          <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-xl leading-relaxed font-light">
            Empowering Bharat's farmers with orbital intelligence, real-time market discovery, and multilingual voice AI. {t.subtitle}
          </motion.p>


          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-wrap items-center gap-4 relative">
            {!showPathSelection ? (
              <motion.button
                layoutId="hero-cta"
                onClick={() => setShowPathSelection(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#050e07] bg-[#4ade80] rounded-full overflow-hidden transition-all shadow-[0_0_40px_rgba(74,222,128,0.4)] hover:shadow-[0_0_60px_rgba(74,222,128,0.6)] border border-[#86efac]"
              >
                <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-20"></span>
                <span className="relative flex items-center gap-2">{t.btnChat} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="flex flex-col sm:flex-row gap-4 p-4 rounded-[2rem] bg-white/90 dark:bg-[#0a1a0d]/60 backdrop-blur-xl border border-gray-200/50 dark:border-[#86efac]/20 shadow-2xl relative"
              >
                <button
                  onClick={() => setShowPathSelection(false)}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40 transition-colors border border-red-500/30"
                >
                  <X size={14} />
                </button>

                <motion.a
                  whileHover={{ y: -5, scale: 1.02 }}
                  href="https://api.whatsapp.com/send/?phone=14155238886&text=join+wish-aboard&type=phone_number&app_absent=0"
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#25D366]/10 border border-[#25D366]/30 hover:bg-[#25D366]/20 transition-all group min-w-[200px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#25D366] flex items-center justify-center shadow-lg shadow-[#25D366]/20 group-hover:scale-110 transition-transform">
                    <MessageCircle size={24} className="text-gray-700 dark:text-white dark:fill-white" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#25D366]">{tc.whatsappTag}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{tc.whatsappTitle}</div>
                  </div>
                </motion.a>

                <motion.a
                  whileHover={{ y: -5, scale: 1.02 }}
                  href="/chat"
                  className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-[#4ade80]/10 border border-[#4ade80]/30 hover:bg-[#4ade80]/20 transition-all group min-w-[200px]"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#166534] to-[#15803d] flex items-center justify-center shadow-lg shadow-[#166534]/20 group-hover:scale-110 transition-transform border border-[#86efac]/30">
                    <Globe size={24} className="text-[#86efac]" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#4ade80]">{tc.webAppTag}</div>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{tc.webAppTitle}</div>
                  </div>
                </motion.a>
              </motion.div>
            )}

            {!showPathSelection && (
              <motion.a whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} href="#howitworks" className="inline-flex items-center justify-center px-8 py-4 font-semibold text-gray-900 dark:text-white border border-gray-300 dark:border-[#86efac]/30 rounded-full hover:bg-gray-100 dark:hover:bg-[#86efac]/10 transition-colors backdrop-blur-sm mt-4 sm:mt-0">
                {t.btnExplore}
              </motion.a>
            )}
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 1 } } }} className="mt-12 flex items-center gap-4 text-sm text-[#e2f0e4]/60 font-medium cursor-default">
            <div className="flex -space-x-3 hover:-space-x-1 transition-all duration-300">
              {[1, 2, 3, 4].map(i => (
                <img key={i} src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}&backgroundColor=b6e3f4`} alt="farmer" className="w-10 h-10 rounded-full border-2 border-[#050e07] hover:scale-110 hover:z-10 transition-transform" />
              ))}
            </div>
            <div>
              <span className="text-gray-900 dark:text-white font-bold">10,000+</span> farmers across India <br /> use KrishiAI daily
            </div>
          </motion.div>
        </motion.div>

        {/* VISUAL MOCKUP WITH FLOATING ELEMENTS */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.3, delayChildren: 0.4 }
            }
          }}
          className="relative hero-visual h-auto lg:h-[600px] flex justify-center perspective-[1000px] mt-12 lg:mt-0"
        >
          {/* Floating Data Decorators */}
          <FloatingElement delay={1} x={20} y={-30} rotate={10}>
            <div className="absolute top-20 -left-20 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-[#4ade80]/30 shadow-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Target size={20} />
              </div>
              <div>
                <div className="text-[10px] text-emerald-400 font-bold">Satellite Health</div>
                <div className="text-sm text-gray-900 dark:text-white font-black">NDVI Index: 0.72</div>
              </div>
            </div>
          </FloatingElement>

          <FloatingElement delay={1.5} x={-20} y={40} rotate={-5}>
            <div className="absolute bottom-40 -right-20 p-4 rounded-2xl bg-black/40 backdrop-blur-xl border border-[#facc15]/30 shadow-2xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-400">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-[10px] text-yellow-400 font-bold">Mandi Live</div>
                <div className="text-sm text-gray-900 dark:text-white font-black">₹2,400/qtl Onion</div>
              </div>
            </div>
          </FloatingElement>

          <FloatingElement delay={2} x={10} y={20} rotate={15}>
            <div className="absolute top-1/2 -left-32 p-3 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-700 dark:text-white">
                <Globe size={16} />
              </div>
              <div className="pr-2">
                <div className="text-[10px] text-gray-500 dark:text-white/50 font-bold">Linguistic AI</div>
                <div className="text-xs text-gray-900 dark:text-white font-black">15+ Dialects</div>
              </div>
            </div>
          </FloatingElement>

          {/* Main Phone UI Wrapper */}
          <motion.div
            variants={{
              hidden: { opacity: 0, x: 150, rotateY: 45 },
              visible: { opacity: 1, x: 0, rotateY: -15, transition: { type: "spring", stiffness: 50, damping: 20 } }
            }}
            whileHover={{ rotateY: -25, rotateX: 5, scale: 1.05 }}
            className="relative lg:absolute top-0 right-0 lg:right-10 z-10 w-full flex justify-center lg:block transform-gpu transition-all duration-700"
          >
            <motion.div
              animate={{ y: [-10, 10, -10] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-[320px] h-[580px] rounded-[3rem] p-3 bg-white/95 dark:bg-[#0a1a0d]/90 backdrop-blur-md border-[4px] border-[#166534]/60 shadow-[0_30px_100px_rgba(74,222,128,0.2)] flex flex-col relative overflow-hidden"
            >
              {/* Glass Inner Glow */}
              <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

              {/* Nav */}
              <div className="flex items-center gap-3 pb-3 mb-2 border-b border-[#86efac]/10 px-2 mt-4 text-[#86efac] relative z-10">
                <div className="relative">
                  <Bot size={24} className="text-[#4ade80]" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#4ade80] rounded-full animate-pulse shadow-[0_0_10px_#4ade80]"></span>
                </div>
                <span className="font-outfit font-black">KrishiAI Pro</span>
              </div>
              {/* Chat Body Mock */}
              <div className="flex-1 flex flex-col gap-4 mt-2 px-2 pb-6 relative z-10">
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: 50 },
                    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100 } }
                  }}
                  className="bg-gradient-to-br from-[#166534] to-[#14532d] text-white p-3 rounded-2xl rounded-tr-sm self-end max-w-[85%] text-sm shadow-xl border border-[#4ade80]/20"
                >
                  {tm[0].content}
                </motion.div>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, x: -50 },
                    visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 100, delay: 0.8 } }
                  }}
                  className="bg-slate-950 text-[#e2f0e4] dark:bg-slate-900 dark:text-[#e2f0e4] p-3 rounded-2xl rounded-tl-sm self-start max-w-[95%] text-sm shadow-xl border border-[#86efac]/30"
                >
                   <div dangerouslySetInnerHTML={{ __html: tm[1].content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </motion.div>
                
                {/* Recent Feature Card in Mockup */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.5 }}
                  className="mt-2 p-3 rounded-xl bg-[#4ade80]/10 border border-[#4ade80]/20 flex items-center gap-3"
                >
                  <Target size={20} className="text-[#4ade80]" />
                  <div className="text-[11px] font-bold text-gray-900 dark:text-white leading-tight">New: Orbital Health Monitoring Active for North Zone</div>
                </motion.div>
              </div>
              {/* input mock */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, delay: 1 } }
                }}
                className="bg-white/90 dark:bg-[#050e07]/80 p-3 rounded-3xl border border-gray-200/50 dark:border-[#86efac]/30 text-slate-900 dark:text-[#7aad86] text-sm flex items-center justify-between mx-2 mb-2 relative z-10"
              >
                Type a message... <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4ade80] to-[#166534] flex items-center justify-center shadow-lg"><ArrowRight size={16} className="text-black stroke-[3px]" /></div>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>

      </div>
      
      {/* Trending Marquee Scroll */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden border-t border-[#86efac]/10 bg-[#000a04]/90 backdrop-blur-md py-3 flex pointer-events-none z-20">
        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 25, ease: "linear", repeat: Infinity }}
          className="flex whitespace-nowrap items-center text-[#86efac]/70 text-sm md:text-base font-bold"
        >
          {Array(8).fill("✦ NEXT-GEN AI FOR INDIAN AGRICULTURE ✦ PREDICT YIELD WITH 95% ACCURACY ✦ MULTILINGUAL SMART VOICE ASSISTANT ✦ REAL-TIME MANDI RATES ✦ ").map((text, i) => (
            <span key={i} className="mx-4">{text}</span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

