import React, { useState } from 'react';
import { ArrowRight, Mail, Phone, MapPin, Twitter, Github, Linkedin, Instagram, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { translations } from '../../utils/translations';

const socials = [
  { icon: Twitter, href: '#', label: 'Twitter / X', color: 'hover:text-sky-400' },
  { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-blue-400' },
  { icon: Github, href: 'https://github.com', label: 'GitHub', color: 'hover:text-gray-900 dark:hover:text-white' },
  { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-pink-400' },
  { icon: MessageCircle, href: 'https://wa.me/14155238886?text=join%20wish-aboard', label: 'WhatsApp', color: 'hover:text-green-400' },
];

export default function Footer() {
  const { language } = useLanguage();
  const t = translations[language];
  const ft = t.footer;
  
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const navLinks = {
    [ft.product]: [
      { label: t.navbar.features, href: '#features' },
      { label: t.navbar.howItWorks, href: '#howitworks' },
      { label: t.navbar.testimonials, href: '#testimonials' },
      { label: t.impact.badge, href: '#stats' },
      { label: t.faq.badge, href: '#faq' },
    ],
    [ft.company]: [
      { label: t.navbar.about, href: '#footer' },
      { label: t.mission.badge, href: '#mission' },
      { label: language === 'gu' ? 'બ્લોગ' : language === 'hi' ? 'ब्लॉग' : language === 'mr' ? 'ब्लॉग' : 'Blog', href: '#' },
      { label: language === 'gu' ? 'કારકિર્દી' : language === 'hi' ? 'करियर' : language === 'mr' ? 'करियर' : 'Careers', href: '#' },
    ],
    [ft.support]: [
      { label: language === 'gu' ? 'મદદ કેન્દ્ર' : language === 'hi' ? 'सहायता केंद्र' : language === 'mr' ? 'मदत केंद्र' : 'Help Center', href: '#' },
      { label: language === 'gu' ? 'અમારો સંપર્ક કરો' : language === 'hi' ? 'संपर्क करें' : language === 'mr' ? 'आमच्याशी संपर्क साधा' : 'Contact Us', href: 'mailto:support@krishiai.com' },
      { label: 'WhatsApp Bot', href: 'https://wa.me/14155238886?text=join%20wish-aboard' },
    ],
    [ft.legal]: [
      { label: ft.privacy, href: '/privacy', isRoute: true },
      { label: ft.terms, href: '/terms', isRoute: true },
      { label: language === 'gu' ? 'કૂકી નીતિ' : language === 'hi' ? 'कुकी नीति' : language === 'mr' ? 'कुकी धोरण' : 'Cookie Policy', href: '/privacy', isRoute: true },
    ],
  };

  const badges = Object.values(ft.badges);

  return (
    <footer id="footer" className="relative z-10 bg-white dark:bg-[#050e07] border-t border-gray-200/50 dark:border-[#86efac]/10 overflow-hidden">
      {/* Top glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-[#4ade80]/40 to-transparent" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-56 bg-emerald-400 rounded-[100%] mix-blend-screen filter blur-[80px] opacity-10 dark:opacity-15 pointer-events-none" />

      {/* CTA Strip */}
      <div className="relative z-10 border-b border-[#86efac]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14 flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-outfit font-black text-slate-900 dark:text-white mb-3 leading-tight">
              {ft.ready} <span className="text-[#166534] dark:text-[#86efac]">{ft.transform}</span><br className="hidden sm:block" /> {ft.yourFarm}
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed">
              {ft.subtitle}
            </p>
            <div className="flex flex-wrap gap-3 mt-5 justify-center lg:justify-start">
              {badges.map(b => (
                <span key={b} className="text-xs font-semibold text-[#166534]/90 dark:text-[#86efac]/80 bg-emerald-100/80 dark:bg-[#166534]/20 border border-emerald-200/60 dark:border-[#86efac]/20 px-3 py-1.5 rounded-full">{b}</span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 flex-shrink-0">
            <SignedOut>
              <a
                href="/chat"
                className="group inline-flex items-center justify-center px-8 py-4 font-bold text-[#050e07] bg-gradient-to-r from-[#86efac] to-[#4ade80] rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(74,222,128,0.35)] hover:shadow-[0_0_60px_rgba(74,222,128,0.55)] border border-[#86efac]/50 text-sm"
              >
                {ft.btnTry} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="https://wa.me/14155238886?text=join%20wish-aboard"
                target="_blank" rel="noopener noreferrer"
                aria-label="Open KrishiAI WhatsApp chat"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-[#166534] bg-emerald-100/90 border border-emerald-300/50 rounded-full hover:bg-emerald-100 hover:scale-105 transition-all duration-300 text-sm dark:text-[#86efac] dark:bg-[#166534]/20 dark:border-[#86efac]/40"
              >
                <MessageCircle size={18} />
                {language === 'gu' ? 'WhatsApp ખોલો' : language === 'hi' ? 'WhatsApp खोलें' : language === 'mr' ? 'WhatsApp उघडा' : 'Open WhatsApp'}
              </a>
            </SignedOut>
            <SignedIn>
              <a
                href="/chat"
                className="group inline-flex items-center justify-center px-8 py-4 font-bold text-[#050e07] bg-gradient-to-r from-[#86efac] to-[#4ade80] rounded-full hover:scale-105 transition-all duration-300 shadow-[0_0_40px_rgba(74,222,128,0.35)] text-sm"
              >
                {t.navbar.dashboard} <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </SignedIn>
          </div>
        </div>
      </div>
      </div>

      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12">

          {/* Brand Column */}
          <div className="lg:col-span-2">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#15803d] flex items-center justify-center shadow-lg border border-[#86efac]/30">
                <img src="/KrishiAI.png" alt="KrishiAI Logo" width="24" height="24" className="w-6 h-6 object-contain rounded" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <span className="text-lg hidden">🌾</span>
              </div>
              <span className="font-outfit font-black text-2xl text-slate-900 dark:text-white">
                Krishi<span className="text-[#facc15]">AI</span>
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 max-w-xs">
              {t.impact.subtitle}
            </p>

            {/* Newsletter */}
            <div className="mb-7">
              <p className="text-xs font-bold text-[#86efac]/70 mb-3">
                {language === 'gu' ? 'દર અઠવાડિયે ખેતીની ટિપ્સ મેળવો' : language === 'hi' ? 'સાપ્તાહિક ખેતી યુક્તियाँ પ્રાપ્ત કરેં' : language === 'mr' ? 'સાપ્તાહિક શેતી ટિપ્સ મેળવા' : 'Get Farming Tips Weekly'}
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-sm text-[#4ade80] font-semibold">
                  <span className="w-5 h-5 rounded-full bg-[#4ade80]/20 flex items-center justify-center text-xs">✓</span>
                  {language === 'gu' ? 'તમે સબ્સ્ક્રાઇબ કર્યું છે! 🌱' : language === 'hi' ? 'आप सब्सक्राइब कर चुके हैं! 🌱' : language === 'mr' ? 'तुम्ही सबस्क्राइब केले आहे! 🌱' : "You're subscribed! 🌱"}
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="flex-1 min-w-0 px-4 py-2.5 rounded-full bg-white/90 dark:bg-[#0a1a0d]/80 border border-gray-200/50 dark:border-[#86efac]/30 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:border-[#86efac]/60 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-full bg-[#166534] hover:bg-[#15803d] text-white text-sm font-bold transition-colors border border-[#86efac]/20"
                  >
                    <Mail size={14} />
                  </button>
                </form>
              )}
            </div>

            {/* Social icons */}
            <div>
              <p className="text-xs font-bold text-slate-600 dark:text-[#86efac]/70 mb-3">
                {language === 'gu' ? 'અમને અનુસરો' : language === 'hi' ? 'हमारा अनुसरण करें' : language === 'mr' ? 'आमचे अनुसरण करा' : 'Follow Us'}
              </p>
              <div className="flex items-center gap-3">
                {socials.map(s => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    aria-label={s.label}
                    className={`w-11 h-11 rounded-full bg-white/90 dark:bg-[#0a1a0d]/80 border border-gray-200/40 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-200 ${s.color} hover:border-[#86efac]/30 hover:scale-110 transition-all duration-200`}
                  >
                    <s.icon size={16} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-12 lg:gap-20"
        >
          {Object.entries(navLinks).map(([category, links], idx) => (
            <motion.div 
              key={category}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-5">{category}</h3>
              <ul className="space-y-3">
                {links.map(link => (
                  <li key={link.label}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-sm text-[#7aad86] hover:text-[#86efac] transition-colors inline-flex items-center gap-1.5 group"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith('http') ? '_blank' : undefined}
                        rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                        className="text-sm text-[#7aad86] hover:text-[#86efac] transition-colors"
                      >
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>

        {/* Contact Info Strip */}
        <div className="mt-12 pt-8 border-t border-[#86efac]/10 grid sm:grid-cols-3 gap-4">
          {[
            { icon: Mail, label: language === 'gu' ? 'અમને ઇમેઇલ કરો' : language === 'hi' ? 'हमें ईमेल करें' : language === 'mr' ? 'आम्हाला ईमेल करा' : 'Email Us', value: 'support@krishiai.com', href: 'mailto:support@krishiai.com' },
            { icon: Phone, label: language === 'gu' ? 'WhatsApp હેલ્પલાઇન' : language === 'hi' ? 'WhatsApp हेल्पलाइन' : language === 'mr' ? 'WhatsApp हेल्पलाइन' : 'WhatsApp Helpline', value: '+1 (415) 523-8886', href: 'https://wa.me/14155238886' },
            { icon: MapPin, label: language === 'gu' ? 'સેવા આપી રહ્યા છીએ' : language === 'hi' ? 'सेवा दे रहे हैं' : language === 'mr' ? 'सेवा देत आहोत' : 'Serving', value: language === 'gu' ? 'ભારતના તમામ રાજ્યો 🇮🇳' : language === 'hi' ? 'भारत के सभी राज्य 🇮🇳' : language === 'mr' ? 'भारतातील सर्व राज्ये 🇮🇳' : 'All States of India 🇮🇳', href: null },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/90 dark:bg-[#0a1a0d]/70 border border-gray-200/40 dark:border-white/10 hover:border-[#86efac]/20 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-emerald-100/60 dark:bg-[#166534]/40 flex items-center justify-center flex-shrink-0">
                <item.icon size={15} className="text-[#166534] dark:text-[#86efac]" />
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-600 dark:text-[#86efac]/80">{item.label}</div>
                {item.href ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className="text-xs text-slate-700 dark:text-slate-200 hover:text-[#166534] dark:hover:text-[#86efac] transition-colors font-medium">
                    {item.value}
                  </a>
                ) : (
                  <div className="text-xs text-slate-700 dark:text-slate-200 font-medium">{item.value}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200/40 dark:border-[#86efac]/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600 dark:text-[#86efac]/90">
          <div className="flex items-center gap-3 flex-wrap justify-center md:justify-start">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-emerald-100/50 dark:bg-[#166534]/50 flex items-center justify-center text-xs border border-emerald-200/40 dark:border-[#86efac]/20">
                <img src="/KrishiAI.png" alt="KrishiAI" className="w-4 h-4 object-contain rounded" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='inline'; }} />
                <span className="hidden">🌾</span>
              </div>
              <span>© 2026 KrishiAI. {ft.allRights}</span>
            </div>
            <span className="hidden md:inline text-[#86efac]/20">|</span>
            <span className="text-[#86efac]/50">{ft.madeWith}</span>
          </div>
          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link to="/privacy" className="hover:text-[#86efac] transition-colors">{ft.privacy}</Link>
            <Link to="/terms" className="hover:text-[#86efac] transition-colors">{ft.terms}</Link>
            <Link to="/privacy" className="hover:text-[#86efac] transition-colors">{language === 'gu' ? 'કૂકી નીતિ' : language === 'hi' ? 'कुकी नीति' : language === 'mr' ? 'कुकी धोरण' : 'Cookie Policy'}</Link>
            <span className="text-[#86efac]/60">v2.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
