import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  CloudRain, Sprout, Bug, ShieldCheck, MessageSquare, Satellite, 
  MapPin, Radar, Store, Mic, Users, ArrowUpRight 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const FEATURE_METADATA = [
  { 
    id: 'vendors',
    icon: <Store size={28} />, 
    color: "text-amber-400", bg: "bg-amber-500/10",
    colSpan: "lg:col-span-2", rowSpan: "row-span-1"
  },
  { 
    id: 'voice',
    icon: <Mic size={28} />, 
    color: "text-emerald-400", bg: "bg-emerald-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'community',
    icon: <Users size={28} />, 
    color: "text-sky-400", bg: "bg-sky-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'satellite',
    icon: <Satellite size={28} />, 
    color: "text-teal-400", bg: "bg-teal-500/10",
    colSpan: "lg:col-span-2", rowSpan: "row-span-1"
  },
  { 
    id: 'pest',
    icon: <Bug size={28} />, 
    color: "text-red-400", bg: "bg-red-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'recommend',
    icon: <Sprout size={28} />, 
    color: "text-green-400", bg: "bg-green-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'mandi',
    icon: <MapPin size={28} />, 
    color: "text-yellow-400", bg: "bg-yellow-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'weather',
    icon: <CloudRain size={28} />, 
    color: "text-blue-400", bg: "bg-blue-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'subsidies',
    icon: <ShieldCheck size={28} />, 
    color: "text-purple-400", bg: "bg-purple-500/10",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  },
  { 
    id: 'multilingual',
    icon: <MessageSquare size={28} />, 
    color: "text-[#86efac]", bg: "bg-[#166534]/30",
    colSpan: "lg:col-span-1", rowSpan: "row-span-1"
  }
];

function BentoCard({ feat, index }) {
  const cardRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseLeave = () => {
    setMousePos({ x: -1000, y: -1000 });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      variants={{
        hidden: { opacity: 0, y: 30, scale: 0.98 },
        visible: { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: { type: "spring", stiffness: 80, delay: index * 0.05 }
        }
      }}
      className={`glass-panel p-7 lg:p-9 rounded-[2.5rem] flex flex-col justify-between items-start gap-6 group hover:border-[#86efac]/50 transition-all duration-500 relative overflow-hidden backdrop-blur-2xl ${feat.colSpan} ${feat.rowSpan}`}
      style={{
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)'
      }}
    >
      {/* Spotlight Hover Effect */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          background: `radial-gradient(500px circle at ${mousePos.x}px ${mousePos.y}px, rgba(134, 239, 172, 0.12), transparent 50%)`
        }}
      />

      <div className="w-full flex items-center justify-between relative z-10">
        <div className={`p-4 rounded-2xl ${feat.bg} flex-shrink-0 ${feat.color} shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
          {feat.icon}
        </div>
        {feat.badge && (
          <span className="text-[0.7rem] font-bold tracking-wider uppercase px-3 py-1 rounded-full bg-white/10 dark:bg-white/5 border border-white/20 text-slate-700 dark:text-emerald-300">
            {feat.badge}
          </span>
        )}
      </div>

      <div className="relative z-10 flex flex-col justify-end h-full w-full">
        <h3 className="text-xl lg:text-2xl font-bold text-slate-900 dark:text-white mb-2 font-outfit leading-tight group-hover:text-[#4ade80] transition-colors">
          {feat.title}
        </h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm lg:text-base mb-4">
          {feat.desc}
        </p>

        {feat.route && (
          <Link
            to={feat.route}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-[#166534] dark:text-[#86efac] group-hover:translate-x-1 transition-transform"
          >
            Explore Tool <ArrowUpRight size={14} />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export default function Features() {
  const { language } = useLanguage();
  const t = translations[language].platformFeatures;

  const LOCALIZED_FEATURES = FEATURE_METADATA.map(item => ({
    ...item,
    title: t.items[item.id]?.title || item.id,
    desc: t.items[item.id]?.desc || '',
    badge: t.items[item.id]?.badge || null,
    route: t.items[item.id]?.route || '/chat'
  }));

  return (
    <section id="features" className="py-24 relative z-10 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-gray-200/40 dark:border-[#86efac]/30 bg-white/80 dark:bg-[#166534]/20 text-gray-800 dark:text-[#86efac] text-[0.7rem] font-black mb-8 backdrop-blur-md"
          >
            <Radar size={14} className="animate-pulse" /> {t.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl lg:text-7xl font-outfit font-black text-slate-900 dark:text-white mb-8 leading-[1.1]"
          >
            {t.titleMain} <span className="text-[#166534] dark:text-[#86efac] drop-shadow-[0_0_20px_rgba(134,239,172,0.3)]">{t.titleAccent}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg lg:text-xl text-slate-700 dark:text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 grid-flow-dense gap-6 lg:gap-8"
        >
          {LOCALIZED_FEATURES.map((feat, i) => (
            <BentoCard key={i} feat={feat} index={i} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
