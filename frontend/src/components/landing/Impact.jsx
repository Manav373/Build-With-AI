import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { TrendingUp, Users, Sprout, Globe, Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

function ImpactCard({ stat, index }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-4deg", "4deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set( (e.clientX - rect.left) / rect.width - 0.5 );
    y.set( (e.clientY - rect.top) / rect.height - 0.5 );
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
      className="glass-panel p-8 rounded-[2rem] border border-gray-200/40 dark:border-[#86efac]/20 hover:border-[#86efac]/50 transition-colors group relative"
    >
      <div style={{ transform: "translateZ(20px)", backfaceVisibility: "hidden" }}>
        <div className="mb-6 p-4 rounded-2xl bg-white/10 dark:bg-slate-900/80 w-fit border border-gray-200/20 dark:border-[#86efac]/20 group-hover:scale-110 group-hover:bg-[#166534]/20 transition-all duration-300">
          {stat.icon}
        </div>
        <div className="text-xs font-bold text-[#166534] dark:text-[#86efac] mb-2">{stat.tag}</div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 font-outfit">{stat.title}</h3>
        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base font-medium">
          {stat.desc}
        </p>
      </div>
    </motion.div>
  );
}

const IMPACT_STATS = [
  {
    icon: <Users className="text-green-400" size={32} />,
    title: "100+ Villages",
    desc: "Active digital transformation in remote rural clusters across 12+ states.",
    tag: "Reach"
  },
  {
    icon: <Sprout className="text-yellow-400" size={32} />,
    title: "Traditional Care",
    desc: "AI-backed validation for organic methods and companion planting wisdom.",
    tag: "Tradition"
  },
  {
    icon: <TrendingUp className="text-blue-400" size={32} />,
    title: "No Middlemen",
    desc: "Direct market insights helping villagers secure 15% better prices locally.",
    tag: "Fairness"
  },
  {
    icon: <Globe className="text-purple-400" size={32} />,
    title: "Native Voice",
    desc: "Breaking the literacy barrier with AI that understands 15+ regional dialects.",
    tag: "Inclusion"
  }
];

export default function Impact() {
  const { language } = useLanguage();
  const t = translations[language].impact;

  const dynamicImpactStats = [
    {
      ...IMPACT_STATS[0],
      title: t.card1Title,
      desc: t.card1Desc,
      tag: t.card1Tag
    },
    {
      ...IMPACT_STATS[1],
      title: t.card2Title,
      desc: t.card2Desc,
      tag: t.card2Tag
    },
    {
      ...IMPACT_STATS[2],
      title: t.card3Title,
      desc: t.card3Desc,
      tag: t.card3Tag
    },
    {
      ...IMPACT_STATS[3],
      title: t.card4Title,
      desc: t.card4Desc,
      tag: t.card4Tag
    }
  ];

  return (
    <section className="py-24 relative z-10 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#166534]/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full border border-emerald-300/30 bg-emerald-100/70 text-emerald-700 dark:border-[#86efac]/30 dark:bg-[#166534]/20 dark:text-[#86efac] text-sm font-semibold mb-6"
          >
            {t.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-7xl font-outfit font-black text-slate-900 dark:text-white mb-6"
          >
            {t.titleMain} <span className="text-[#facc15] dark:text-[#86efac]">{t.titleAccent}</span> {t.titleEnd}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-lg text-slate-700 dark:text-slate-300 font-medium max-w-2xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15 }
            }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
        >
          {dynamicImpactStats.map((stat, i) => (
            <ImpactCard key={i} stat={stat} index={i} />
          ))}
        </motion.div>

        {/* Premium Testimonial */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative glass-panel rounded-[3rem] p-1 lg:p-1.5 bg-gradient-to-br from-white/10 via-white/5 to-transparent border border-gray-200/30 dark:border-white/10 shadow-2xl"
        >
          <div className="bg-white/90 dark:bg-[#050e07]/80 rounded-[2.9rem] p-8 lg:p-16 flex flex-col lg:flex-row items-center gap-12 backdrop-blur-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-12 text-[#166534]/20 dark:text-[#86efac]/10 pointer-events-none">
              <Quote size={200} />
            </div>
            
            <div className="relative z-10 w-32 h-32 lg:w-48 lg:h-48 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#86efac] to-[#facc15] rounded-full blur-xl opacity-30 animate-pulse"></div>
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=400&h=400&auto=format&fit=crop" 
                alt="Sohan Lal" 
                className="w-full h-full rounded-full object-cover border-4 border-[#166534] relative z-10 shadow-2xl"
              />
            </div>

            <div className="relative z-10 text-center lg:text-left">
              <p className="text-xl lg:text-3xl text-slate-900 dark:text-white font-medium italic leading-relaxed mb-8 text-shadow-strong">
                {t.testimonial}
              </p>
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-black text-slate-900 dark:text-white font-outfit">{t.author}</span>
                <span className="text-[#166534] dark:text-[#86efac] font-bold text-xs">{t.authorRole}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

