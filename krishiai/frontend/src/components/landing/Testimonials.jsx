import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const REVIEWS = [
  {
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=60&w=150&auto=format&fit=crop"
  },
  {
    img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=60&w=150&auto=format&fit=crop"
  },
  {
    img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=60&w=150&auto=format&fit=crop"
  }
];

export default function Testimonials() {
  const { language } = useLanguage();
  const t = translations[language].testimonials;
  const reviewData = translations[language].testimonialData;

  const dynamicReviews = REVIEWS.map((r, i) => ({
    ...r,
    ...reviewData[i]
  }));

  return (
    <section id="testimonials" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <h2 className="text-3xl sm:text-5xl font-outfit font-black text-center text-slate-900 dark:text-white mb-12 lg:mb-16">
          {t.titleMain} <span className="text-[#166534] dark:text-[#86efac]">{t.titleAccent}</span>
        </h2>
        
        <div className="grid lg:grid-cols-3 gap-8 test-grid">
          {dynamicReviews.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-panel p-8 rounded-3xl relative"
            >
              <Quote size={40} className="text-[#166534]/50 dark:text-[#86efac]/50 absolute top-6 right-6" />
              <p className="text-slate-700 dark:text-slate-200 text-lg italic mb-8 relative z-10 leading-relaxed">
                "{r.rev}"
              </p>
              <div className="flex items-center gap-4">
                <img src={r.img} alt={r.name} width="56" height="56" className="w-14 h-14 rounded-full bg-[#166534] border-2 border-[#86efac]/40" loading="lazy" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">{r.name}</h3>
                  <div className="text-sm text-slate-600 dark:text-[#a0c4a9]">{r.loc}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
