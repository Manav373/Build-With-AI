import React, { useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Target, Leaf, Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

gsap.registerPlugin(ScrollTrigger);

function TiltCard({ children }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["5deg", "-5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-5deg", "5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      className="glass-panel p-8 rounded-[2rem] border border-gray-200/40 bg-white/90 dark:bg-[#0a1a0d]/80 dark:border-[#86efac]/20 text-left relative group transition-colors hover:border-[#86efac]/40"
    >
      <div style={{ transform: "translateZ(30px)", backfaceVisibility: "hidden" }}>
        {children}
      </div>
    </motion.div>
  );
}

export default function Mission() {
  const mottoRef = useRef(null);
  const { language } = useLanguage();
  const t = translations[language].mission;

  const missionItems = [
    {
      icon: <Leaf className="text-[#86efac]" />,
      title: t.card1Title,
      desc: t.card1Desc
    },
    {
      icon: <Sprout className="text-[#facc15]" />,
      title: t.card2Title,
      desc: t.card2Desc
    },
    {
      icon: <Target className="text-[#4ade80]" />,
      title: t.card3Title,
      desc: t.card3Desc
    }
  ];

  useEffect(() => {
    if (mottoRef.current) {
      gsap.fromTo(mottoRef.current, 
        { backgroundPosition: '-200% center' },
        { 
          backgroundPosition: '200% center', 
          duration: 4, 
          repeat: -1, 
          ease: "linear" 
        }
      );
    }
  }, []);

  return (
    <section id="mission" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-[radial-gradient(circle,rgba(22,101,52,0.15)_0%,transparent_70%)] rounded-full blur-[120px] pointer-events-none -z-10"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-amber-300/30 bg-amber-100/70 text-amber-700 dark:border-[#facc15]/30 dark:bg-[#166534]/20 dark:text-[#facc15] text-sm font-bold mb-12 shadow-[0_0_30px_rgba(250,204,21,0.15)]"
        >
          <Target size={16} /> {t.badge}
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl lg:text-7xl font-outfit font-black text-slate-900 dark:text-white mb-8 leading-tight"
        >
          {t.title}<br />
          <span 
            ref={mottoRef}
            className="text-transparent bg-clip-text bg-[linear-gradient(90deg,#16a34a,#facc15,#4ade80,#16a34a)] bg-[length:200%_auto]"
          >
            {t.accent}
          </span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 max-w-4xl mx-auto mb-16 leading-relaxed font-normal"
        >
          {t.desc}
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto perspective-[1000px]">
          {missionItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <TiltCard>
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-6 border border-gray-200/40 dark:border-white/10 group-hover:bg-[#166534]/30 transition-colors">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 font-outfit">{item.title}</h3>
                <p className="text-slate-600 dark:text-slate-300 text-base leading-relaxed font-medium">{item.desc}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
