import React, { useRef, useState, useLayoutEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { 
  CloudRain, Sprout, Bug, ShieldCheck, MessageSquare, MessageCircle, Layout, X,
  Satellite, MapPin, TrendingUp as MarketIcon, Target, Globe, TrendingUp, ArrowRight,
  Store, Mic, Users
} from 'lucide-react';
const FeaturePhone = React.lazy(() => import('../common/FeaturePhone'));
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations/index';

gsap.registerPlugin(ScrollTrigger);

const HERO_MESSAGES = []; // Will be populated from translations

// Floating element component for 3D parallax effect
const FloatingElement = ({ children, delay = 0, x, y, rotate }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ 
            opacity: 1, 
            scale: 1,
            transition: { delay, duration: 0.5 }
        }}
        animate={{ 
            y: [0, y, 0],
            x: [0, x, 0],
            rotate: [0, rotate, 0]
        }}
        transition={{ 
            duration: 10 + Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut"
        }}
        className="absolute pointer-events-none"
    >
        {children}
    </motion.div>
);


export default function ScrollJourney() {
  const containerRef = useRef(null);
  const phoneWrapperRef = useRef(null);
  const phoneRef = useRef(null);
  const heroLeftRef = useRef(null);
  const featuresStartRef = useRef(null);

  const [activeMessageIndex, setActiveMessageIndex] = useState(-1); // -1 = Hero, 0-5 = Features
  const [showChatOptions, setShowChatOptions] = useState(false);
  const { language } = useLanguage();
  const t = translations[language];

  // Map icons and colors to localized content
  const localizedFeatures = [
    { icon: <Store size={28} />, color: "text-amber-400", bg: "bg-amber-500/10", title: t.features.vendorMarketplace?.title || "Agri Marketplace", desc: t.features.vendorMarketplace?.desc || "Sell crops directly & buy inputs", messages: t.features.vendorMarketplace?.messages || [] },
    { icon: <Mic size={28} />, color: "text-emerald-400", bg: "bg-emerald-500/10", title: t.features.voiceAssistant?.title || "Voice Assistant", desc: t.features.voiceAssistant?.desc || "Hands-free real-time voice advice", messages: t.features.voiceAssistant?.messages || [] },
    { icon: <Users size={28} />, color: "text-sky-400", bg: "bg-sky-500/10", title: t.features.community?.title || "Farmer Community", desc: t.features.community?.desc || "Connect & discuss with farmers", messages: t.features.community?.messages || [] },
    { icon: <CloudRain size={28} />, color: "text-blue-400", bg: "bg-blue-500/10", title: t.features.liveWeather.title, desc: t.features.liveWeather.desc, messages: t.features.liveWeather.messages },
    { icon: <Bug size={28} />, color: "text-red-400", bg: "bg-red-500/10", title: t.features.diseaseDetection.title, desc: t.features.diseaseDetection.desc, messages: t.features.diseaseDetection.messages },
    { icon: <Sprout size={28} />, color: "text-green-400", bg: "bg-green-500/10", title: t.features.cropAdvisory.title, desc: t.features.cropAdvisory.desc, messages: t.features.cropAdvisory.messages },
    { icon: <MarketIcon size={28} />, color: "text-yellow-400", bg: "bg-yellow-500/10", title: t.features.marketPrices.title, desc: t.features.marketPrices.desc, messages: t.features.marketPrices.messages },
    { icon: <Satellite size={28} />, color: "text-emerald-400", bg: "bg-emerald-500/10", title: t.features.satellite.title, desc: t.features.satellite.desc, messages: t.features.satellite.messages },
    { icon: <ShieldCheck size={28} />, color: "text-purple-400", bg: "bg-purple-500/10", title: t.features.govtSchemes.title, desc: t.features.govtSchemes.desc, messages: t.features.govtSchemes.messages },
    { icon: <MessageSquare size={28} />, color: "text-[#86efac]", bg: "bg-[#166534]/30", title: t.features.multilingual.title, desc: t.features.multilingual.desc, messages: t.features.multilingual.messages },
  ];

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // 1. Pin the phone container globally
      ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        pin: phoneWrapperRef.current, // Pin the wrapper to avoid transform conflicts
        pinSpacing: false, // Don't add spacing, it's just a floating element
      });

      // 2. Animate phone from Right to Left.
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        // Calculate the exact distance to move from the right column to the left column
        const calculateXMove = () => {
          if (!heroLeftRef.current || !phoneRef.current) return -600;

          // We want to move the phone from exactly where it is now, to exactly the center of the left column.
          const leftCol = heroLeftRef.current.getBoundingClientRect();
          const phone = phoneRef.current.getBoundingClientRect();

          // Calculate center of left col
          const leftCenterX = leftCol.left + (leftCol.width / 2);

          // Calculate current center of phone
          const phoneCenterX = phone.left + (phone.width / 2);

          // The distance is the difference
          return leftCenterX - phoneCenterX;
        };

        gsap.fromTo(phoneRef.current,
          {
            x: 0,
            rotateY: -15,
            rotateX: 5,
            scale: 1,
            z: 0
          },
          {
            x: calculateXMove,
            rotateY: -360,
            rotateX: 0,
            scale: 1,
            z: 0,
            ease: "power2.inOut",
            force3D: true, // Ensure hardware acceleration
            scrollTrigger: {
              trigger: featuresStartRef.current,
              start: "top 100%",
              end: "top 10%",
              scrub: 1, // Faster scrub for snappiness
              invalidateOnRefresh: true,
            }
          }
        );

        // 3. Feature Triggers for updating phone content
        const featureItems = gsap.utils.toArray('.feature-scroll-item');
        featureItems.forEach((item, index) => {

          // Initial inactive state
          gsap.set(item, { opacity: 0.4, scale: 0.95 });

          ScrollTrigger.create({
            trigger: item,
            start: "top 40%", // Activate when the top of the item hits 60% of the viewport (near center)
            end: "bottom 40%", // Deactivate when the bottom passes 40% 
            onEnter: () => {
              setActiveMessageIndex(index);
              gsap.to(item, { opacity: 1, scale: 1, borderColor: "rgba(134, 239, 172, 0.4)", duration: 0.4, ease: "back.out(1.5)" });
            },
            onEnterBack: () => {
              setActiveMessageIndex(index);
              gsap.to(item, { opacity: 1, scale: 1, borderColor: "rgba(134, 239, 172, 0.4)", duration: 0.4, ease: "back.out(1.5)" });
            },
            onLeave: () => {
              gsap.to(item, { opacity: 0.4, scale: 0.95, borderColor: "rgba(134, 239, 172, 0.1)", duration: 0.4 });
            },
            onLeaveBack: () => {
              gsap.to(item, { opacity: 0.4, scale: 0.95, borderColor: "rgba(134, 239, 172, 0.1)", duration: 0.4 });
              // Revert to hero messages if scrolling all the way back up past the first item
              if (index === 0) setActiveMessageIndex(-1);
            }
          });
        });
      });

    }, containerRef); // Scope to container

    return () => ctx.revert(); // Cleanup GSAP
  }, []);

  const activeMessages = activeMessageIndex === -1 ? t.heroMessages : localizedFeatures[activeMessageIndex].messages;

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden z-10">

      {/* ================= PINNED DESKTOP PHONE ================= */}
      <div className="absolute top-0 left-0 w-full h-screen pointer-events-none hidden lg:block z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-full grid grid-cols-2 gap-16 items-center">
          {/* Left Col (empty spacer for grid alignment) */}
          <div className="w-full"></div>
          {/* Right Col (where phone starts) */}
          <div className="flex justify-center w-full" ref={phoneWrapperRef} style={{ perspective: '1000px' }}>
            <div ref={phoneRef} className="pointer-events-auto origin-center will-change-transform transform-gpu">
              <Suspense fallback={<div className="w-[300px] h-[600px] bg-white/5 animate-pulse rounded-[3rem]" />}>
                <FeaturePhone messages={activeMessages} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[100vh] flex items-center pt-32 pb-12 z-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* TEXT CONTENT */}
          <motion.div
            ref={heroLeftRef}
            initial="hidden" animate="visible"
            className="pr-4 lg:pr-8 relative"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
            }}
          >


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
                className="text-4xl sm:text-6xl lg:text-7xl font-outfit font-black leading-[1.05] mb-8 text-gray-900 dark:text-white drop-shadow-2xl text-center lg:text-left"
                style={{ textShadow: '0 2px 12px rgba(255,255,255,0.5)' }}
            >
              {t.hero.titleMain} <br />
              <motion.span
                animate={{
                   backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  filter: ["drop-shadow(0 0 10px rgba(134, 239, 172, 0))", "drop-shadow(0 0 20px rgba(134, 239, 172, 0.4))", "drop-shadow(0 0 10px rgba(134, 239, 172, 0))"]
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ backgroundSize: "200% auto" }}
                className="bg-gradient-to-r from-[#86efac] via-[#facc15] to-[#4ade80] bg-clip-text text-transparent inline-block hover:scale-105 transition-transform cursor-default pb-2"
              >
                {t.hero.titleAccent}
              </motion.span>
            </motion.h1>


            <motion.p variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="text-base sm:text-lg lg:text-xl text-gray-900 dark:text-[#e2f0e4]/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed font-light text-center lg:text-left">
              {t.hero.subtitle}
            </motion.p>

            <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={() => setShowChatOptions(true)}
                className="group relative inline-flex items-center justify-center px-8 py-4 font-bold text-[#050e07] bg-gradient-to-r from-[#86efac] to-[#4ade80] rounded-full overflow-hidden transition-all hover:scale-105 shadow-[0_0_30px_rgba(74,222,128,0.3)] hover:shadow-[0_0_50px_rgba(74,222,128,0.5)] border border-[#86efac]/50 cursor-pointer"
              >
                <span className="relative flex items-center gap-2">{t.hero.btnChat} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
              </button>
              <a href="#features" className="inline-flex items-center justify-center px-8 py-4 font-semibold text-gray-800 dark:text-white border border-gray-300 dark:border-[#86efac]/30 rounded-full hover:bg-gray-100 dark:hover:bg-[#86efac]/10 transition-colors backdrop-blur-sm">
                {t.hero.btnExplore}
              </a>
            </motion.div>
          </motion.div>

          {/* VISUAL DECORATORS FOR HERO (Parallax icons) */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-visible hidden lg:block">
             <FloatingElement delay={1} x={25} y={-40} rotate={15}>
                <div className="absolute top-[15%] right-[20%] p-4 rounded-2xl bg-white/80 dark:bg-[#0a1a0d]/40 backdrop-blur-xl border border-emerald-200/60 dark:border-[#4ade80]/30 shadow-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <Target size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Satellite Pro</div>
                        <div className="text-xs text-gray-800 dark:text-white font-black">Scanning Farm Zone B</div>
                    </div>
                </div>
             </FloatingElement>

             <FloatingElement delay={1.8} x={-15} y={35} rotate={-10}>
                <div className="absolute bottom-[25%] left-[10%] p-4 rounded-2xl bg-white/80 dark:bg-[#0a1a0d]/40 backdrop-blur-xl border border-yellow-200/60 dark:border-[#facc15]/30 shadow-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center text-yellow-600 dark:text-yellow-400">
                        <TrendingUp size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] text-yellow-600 dark:text-yellow-400 font-bold">Mandi Map</div>
                        <div className="text-xs text-gray-800 dark:text-white font-black">₹2,400/qtl lasalgaon</div>
                    </div>
                </div>
             </FloatingElement>


          </div>

          {/* MOBILE ONLY PHONE MOCKUP (Hidden on Desktop since Desktop uses the Pinned Global Phone) */}
          <div className="lg:hidden flex justify-center mt-12 scale-75 sm:scale-100 origin-top z-30">
            <Suspense fallback={<div className="w-[280px] h-[550px] bg-white/5 animate-pulse rounded-[3rem]" />}>
              <FeaturePhone messages={t.heroMessages} />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SCROLL SECTION ================= */}
      <section ref={featuresStartRef} id="features" className="py-24 relative z-10 w-full overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16">
          {/* LEFT COLUMN: Empty on desktop (phone moves here), full grid on mobile */}
          <div className="hidden lg:block relative">
            {/* Spacer for phone */}
          </div>

          {/* RIGHT COLUMN: Feature Descriptions scrolling up */}
          <div className="flex flex-col gap-[15vh] sm:gap-[30vh] lg:pb-[20vh] relative z-20">

            {/* Features Header - Now in the right column so it doesn't overlap phone */}
            <div className="pt-[5vh] lg:pt-[10vh] pb-[5vh] text-center lg:text-left">
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-outfit font-black text-gray-900 dark:text-white mb-6">
                {t.features.titleMain} <br />
                <span className="text-[#4ade80]">{t.features.titleAccent}</span>
              </h2>
              <p className="text-base sm:text-lg text-gray-700 dark:text-[#e2f0e4]/70 max-w-md mx-auto lg:mx-0">
                {t.features.subtitle}
              </p>
            </div>

            {localizedFeatures.map((feat, i) => (
              <div key={feat.title || i} className="feature-scroll-item glass-panel p-8 rounded-[2rem] flex flex-col items-start gap-6 border border-gray-200/10 dark:border-[#86efac]/10 hover:border-gray-300/30 dark:hover:border-[#86efac]/30 transition-colors shadow-2xl backdrop-blur-xl bg-white/60 dark:bg-[#050e07]/40">
                <div className={`p-4 rounded-2xl ${feat.bg} ${feat.color} shadow-inner`}>
                  {feat.icon}
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 font-outfit">{feat.title}</h3>
                  <p className="text-lg text-gray-700 dark:text-[#7aad86] leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      <AnimatePresence>
        {showChatOptions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowChatOptions(false)}
              className="absolute inset-0 bg-[#050e07]/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white/95 dark:bg-[#0a1a0d]/90 border border-gray-200/40 dark:border-[#86efac]/20 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_100px_rgba(74,222,128,0.1)] overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#4ade80]/10 blur-[80px] -mr-32 -mt-32" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#facc15]/5 blur-[80px] -ml-32 -mb-32" />

              <button
                onClick={() => setShowChatOptions(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-900 dark:text-white/80 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X size={24} />
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-outfit font-black text-slate-900 dark:text-white mb-4">{t.chatSelection.title}</h2>
                <p className="text-slate-600 dark:text-slate-300 text-lg">{t.chatSelection.subtitle}</p>
              </div>

              <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
                {/* WhatsApp Option */}
                <motion.a
                  href="https://wa.me/14155238886?text=join%20wish-aboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join our WhatsApp community"
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-[2rem] bg-emerald-50/90 dark:bg-[#166534]/20 border border-emerald-200/40 dark:border-[#86efac]/10 hover:border-[#86efac]/40 transition-all w-full flex-1"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-200/40 text-emerald-600 dark:bg-[#25D366]/20 dark:text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition-colors duration-500">
                    <MessageCircle size={36} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.chatSelection.whatsappTitle}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">{t.chatSelection.whatsappDesc}</p>
                  </div>
                  <div className="mt-2 px-5 py-2 rounded-full bg-emerald-200/50 text-emerald-600 dark:bg-[#25D366]/20 dark:text-[#25D366] text-xs sm:text-sm font-bold group-hover:bg-[#25D366]/20 transition-colors">
                    {t.chatSelection.whatsappTag}
                  </div>
                </motion.a>

                {/* Web Chat Option */}
                <motion.a
                  href="/chat"
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group relative flex flex-col items-center gap-4 sm:gap-6 p-6 sm:p-8 rounded-[2rem] bg-amber-50/90 dark:bg-[#facc15]/10 border border-amber-200/40 dark:border-[#facc15]/20 hover:border-[#facc15]/40 transition-all w-full flex-1"
                >
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-200/40 text-amber-600 dark:bg-[#facc15]/20 dark:text-[#facc15] group-hover:bg-[#facc15] group-hover:text-white transition-colors duration-500">
                    <Layout size={36} />
                  </div>
                  <div className="text-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">{t.chatSelection.webAppTitle}</h3>
                    <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">{t.chatSelection.webAppDesc}</p>
                  </div>
                  <div className="mt-2 px-5 py-2 rounded-full bg-amber-200/50 text-amber-600 dark:bg-[#facc15]/20 dark:text-[#facc15] text-xs sm:text-sm font-bold group-hover:bg-[#facc15]/20 transition-colors">
                    {t.chatSelection.webAppTag}
                  </div>
                </motion.a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
