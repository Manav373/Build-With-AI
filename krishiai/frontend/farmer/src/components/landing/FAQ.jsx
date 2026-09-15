import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const FAQS = [
  {
    question: "How does the AI detect crop diseases?",
    answer: "You simply take a photo of the infected crop part and send it to our WhatsApp number. Our trained computer vision models analyze the visual symptoms (like spots, wilting, or discoloration) and provide a diagnosis along with treatment recommendations."
  },
  {
    question: "Do I need a smartphone or high-speed internet?",
    answer: "KrishiAI is designed to be accessible. While our visual diagnosis needs an image upload, most of our market and weather services work perfectly on basic WhatsApp connections, ensuring even farmers in remote villages stay informed."
  },
  {
    question: "In which languages is KrishiAI available?",
    answer: "We support over 15+ languages including English, Hindi, Punjabi, Marathi, Telugu, Tamil, Bengali, and more. The AI automatically detects your language preference during the first interaction."
  },
  {
    question: "Is KrishiAI really free for farmers?",
    answer: "Yes! Our core health and price services are 100% free for individual farmers. We believe access to agricultural wisdom is a fundamental right, not a luxury."
  },
  {
    question: "Is my farm data secure?",
    answer: "Absolutely. We follow strict data privacy protocols. Your farm location and personal details are only used to provide hyper-local services like weather and mandi rates and are never shared with third parties without your consent."
  }
];

function AccordionItem({ item, isOpen, onClick }) {
  return (
    <motion.div 
      layout
      className={`mb-4 rounded-[2rem] border transition-all duration-500 overflow-hidden ${
        isOpen 
          ? 'bg-emerald-100/70 dark:bg-[#166534]/30 border-emerald-300/40 dark:border-[#86efac]/50 shadow-[0_0_40px_rgba(134,239,172,0.15)] scale-[1.02]' 
          : 'bg-white/80 dark:bg-[#0a1a0d]/60 border-gray-200/20 dark:border-white/10 hover:border-[#86efac]/20 hover:bg-[#f8faf7]/90 dark:hover:bg-[#0a1a0d]/80'
      }`}
    >
      <button
        onClick={onClick}
        className="w-full px-8 py-7 flex items-center justify-between text-left focus:outline-none group"
      >
        <span className={`text-xl font-bold font-outfit transition-colors duration-300 ${isOpen ? 'text-[#166534] dark:text-[#86efac]' : 'text-slate-900 dark:text-white group-hover:text-[#166534] dark:group-hover:text-[#86efac]'}`}>
          {item.question}
        </span>
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#86efac] text-[#050e07] rotate-180' : 'bg-white/70 dark:bg-[#11260f]/70 text-[#166534] border border-gray-200/30 dark:border-white/10 group-hover:scale-110'}`}>
          {isOpen ? <Minus size={20} strokeWidth={3} /> : <Plus size={20} strokeWidth={3} />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-8 pb-8 text-lg text-slate-700 dark:text-slate-200 leading-relaxed border-t border-gray-200/40 dark:border-white/10 pt-6">
              {item.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const { language } = useLanguage();
  const t = translations[language].faq;
  const faqs = translations[language].faqData;

  return (
    <section id="faq" className="py-24 relative z-10">
      {/* Decorative Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-[#166534] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"></div>
      
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full border border-emerald-300/30 bg-emerald-100/70 text-emerald-700 dark:border-[#86efac]/30 dark:bg-[#166534]/20 dark:text-[#86efac] text-xs font-black mb-6"
          >
            <HelpCircle size={14} /> {t.badge}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl lg:text-6xl font-outfit font-black text-slate-900 dark:text-white mb-6 tracking-tight"
          >
            {t.titleMain} <span className="text-[#166534] dark:text-[#86efac]">{t.titleAccent}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-xl text-slate-700 dark:text-slate-300 font-medium max-w-xl mx-auto"
          >
            {t.subtitle}
          </motion.p>
        </div>

        <motion.div layout className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              item={faq}
              isOpen={openIndex === i}
              onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
            />
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mt-16 text-center p-10 rounded-[3rem] glass-panel bg-gradient-to-br from-[#166534]/20 via-transparent to-transparent border border-[#86efac]/10 relative overflow-hidden group"
        >
          <p className="text-xl text-gray-900 dark:text-white mb-6 font-medium relative z-10">{t.mailTitle}</p>
          <a 
            href="mailto:support@krishiai.com" 
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-[#86efac] text-[#050e07] font-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(134,239,172,0.3)]"
          >
            {t.mailBtn} <Plus size={18} />
          </a>
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        </motion.div>
      </div>
    </section>
  );
}

