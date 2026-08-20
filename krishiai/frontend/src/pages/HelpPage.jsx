import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Mail, Phone, MessageSquare, ChevronDown, ChevronUp, ExternalLink, BookOpen, Shield, Bug, Headphones, Clock, MapPin, Globe, Menu } from 'lucide-react';
import { useChat } from '../context/ChatContext';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

const FAQ_DATA = [
  {
    q: 'How does KrishiAI predict crop yields?',
    a: 'KrishiAI uses machine learning models trained on government agricultural datasets (data.gov.in), combining soil type, weather patterns, fertilizer usage, and historical yield data to generate predictions. The model uses Random Forest and XGBoost algorithms with 85%+ accuracy.'
  },
  {
    q: 'Where does the market price data come from?',
    a: 'All market (mandi) prices are fetched in real-time from the Government of India\'s APMC API (api.data.gov.in). Prices are updated daily and include wholesale, terminal, and retail market rates across 500+ mandis.'
  },
  {
    q: 'How accurate is the satellite crop health analysis?',
    a: 'The NDVI (Normalized Difference Vegetation Index) data comes from NASA\'s MODIS Terra satellite via the GIBS service, updated every 8 days. Combined with Sentinel-2 data at 10m resolution, it provides reliable vegetation health indicators. Note: point-level analysis uses derived estimates.'
  },
  {
    q: 'Is my location data safe?',
    a: 'Yes. Your GPS coordinates are only used to fetch nearby mandis and weather data. We do not store or share your location with third parties. All data stays on your device and our secure servers during your session only.'
  },
  {
    q: 'What government schemes can I access?',
    a: 'KrishiAI provides information on PM-KISAN, PMFBY (Crop Insurance), Soil Health Card Scheme, KCC (Kisan Credit Card), and other state-specific schemes. We guide you through eligibility and application processes.'
  },
  {
    q: 'Can I use KrishiAI in Hindi or regional languages?',
    a: 'Yes! KrishiAI supports English, Hindi (हिन्दी), Gujarati (ગુજરાતી), and Marathi (मराठी). You can switch languages from the globe icon in the chat header or from Settings.'
  },
  {
    q: 'How do I report incorrect data or a bug?',
    a: 'Please email us at support@krishiai.in with a screenshot and description. You can also use the "Report Bug" option below. We aim to respond within 24 hours.'
  },
  {
    q: 'Is KrishiAI free to use?',
    a: 'Yes, KrishiAI is completely free for all Indian farmers. It is built as an open-source agriculture intelligence platform for the benefit of the farming community.'
  },
];

export default function HelpPage() {
  const { language } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme } = useTheme();
  const [openFAQ, setOpenFAQ] = useState(null);

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--page-bg)]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className={`md:hidden p-2 rounded-xl transition-all ${
              theme === 'light' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-[var(--g)]/40 border border-[#86efac]/20 text-[var(--glt)]'
            }`}>
              <Menu size={18} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HelpCircle size={20} className="text-white" />
            </div>
            <div>
              <h1 className={`text-2xl font-bold transition-colors ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Help & Support</h1>
              <p className={`text-sm font-medium transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>We're here to help you succeed</p>
            </div>
          </div>
        </motion.div>

        {/* Contact Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">

          <ContactCard
            icon={<Phone size={20} />}
            title="WhatsApp"
            value="+1 415 523 8886"
            subtitle="Send 'join wish-aboard' to start"
            color="from-green-500 to-emerald-600"
            href="https://api.whatsapp.com/send/?phone=14155238886&text=join+wish-aboard&type=phone_number&app_absent=0"
          />
          <ContactCard
            icon={<Mail size={20} />}
            title="Email Us"
            value="support@krishiai.in"
            subtitle="Response within 24 hours"
            color="from-blue-500 to-indigo-600"
            href="mailto:support@krishiai.in"
          />
          <ContactCard
            icon={<MessageSquare size={20} />}
            title="WhatsApp Bot"
            value="+1 415 523 8886"
            subtitle="Twilio Sandbox — join wish-aboard"
            color="from-green-500 to-emerald-600"
            href="https://api.whatsapp.com/send/?phone=14155238886&text=join+wish-aboard&type=phone_number&app_absent=0"
          />
        </motion.div>

        {/* Quick Links */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <QuickLink icon={<Bug size={16} />} label="Report Bug" href="mailto:bugs@krishiai.in?subject=Bug Report" />
          <QuickLink icon={<BookOpen size={16} />} label="User Guide" />
          <QuickLink icon={<Shield size={16} />} label="Privacy Policy" href="/privacy" />
          <QuickLink icon={<Headphones size={16} />} label="Live Chat" />
        </motion.div>

        {/* FAQ Section */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-3">
          <h2 className={`text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>
            <HelpCircle size={12} /> Frequently asked questions
          </h2>
          <div className="space-y-2">
            {FAQ_DATA.map((faq, i) => (
              <div key={i} className={`border rounded-2xl overflow-hidden transition-all ${
                theme === 'light' ? 'bg-white border-gray-100 hover:border-emerald-200' : 'bg-white/[0.03] border-white/5 hover:border-white/10'
              }`}>
                <button
                  onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left gap-3">
                  <span className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-700' : 'text-white/80'}`}>{faq.q}</span>
                  {openFAQ === i ? <ChevronUp size={16} className="text-emerald-400 flex-shrink-0" /> : <ChevronDown size={16} className={`${theme === 'light' ? 'text-slate-300' : 'text-white/20'} flex-shrink-0`} />}
                </button>
                {openFAQ === i && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                    className="px-5 pb-4">
                    <p className={`text-[0.78rem] leading-relaxed transition-colors ${theme === 'light' ? 'text-slate-500' : 'text-white/50'}`}>{faq.a}</p>
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Support Hours & Office */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className={`border rounded-2xl p-5 space-y-3 transition-colors ${
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/[0.03] border-white/5'
          }`}>
            <h3 className={`text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>
              <Clock size={12} /> Support hours
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-white/40'}>Monday – Friday</span>
                <span className="text-emerald-500 font-bold">9:00 AM – 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-white/40'}>Saturday</span>
                <span className="text-emerald-500 font-bold">10:00 AM – 4:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-white/40'}>Sunday</span>
                <span className="text-red-500 font-bold">Closed</span>
              </div>
            </div>
            <p className={`text-[0.65rem] font-medium transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>All times in IST (Indian Standard Time)</p>
          </div>

          <div className={`border rounded-2xl p-5 space-y-3 transition-colors ${
            theme === 'light' ? 'bg-white border-gray-100' : 'bg-white/[0.03] border-white/5'
          }`}>
            <h3 className={`text-xs font-bold flex items-center gap-2 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>
              <MapPin size={12} /> Office address
            </h3>
            <p className={`text-sm leading-relaxed transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-white/50'}`}>
              KrishiAI Solutions Pvt. Ltd.<br />
              Agri-Tech Innovation Hub<br />
              IIT Gandhinagar Campus<br />
              Palaj, Gujarat - 382355<br />
              India
            </p>
            <div className={`flex items-center gap-2 text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/20'}`}>
              <Globe size={10} />
              <span>www.krishiai.in</span>
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className={`border rounded-2xl p-6 text-center space-y-3 transition-colors ${
            theme === 'light' ? 'bg-emerald-50 border-emerald-100 shadow-sm' : 'bg-gradient-to-r from-emerald-900/30 to-green-900/20 border-emerald-500/20'
          }`}>
          <h3 className={`font-bold text-lg transition-colors ${theme === 'light' ? 'text-emerald-900' : 'text-white'}`}>Still need help?</h3>
          <p className={`text-sm max-w-md mx-auto transition-colors ${theme === 'light' ? 'text-emerald-700/60' : 'text-white/40'}`}>
            Our agricultural experts are available to assist you with crop planning, scheme applications, and technical queries.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <a href="mailto:support@krishiai.in"
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                theme === 'light' ? 'bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50' : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
              }`}>
              📧 Email Support
            </a>
            <a href="https://api.whatsapp.com/send/?phone=14155238886&text=join+wish-aboard&type=phone_number&app_absent=0"
              target="_blank" rel="noopener noreferrer"
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                theme === 'light' ? 'bg-emerald-600 text-white border-emerald-500 hover:bg-emerald-700 shadow-lg' : 'bg-green-500/20 border-green-500/30 text-green-400 hover:bg-green-500/30'
              }`}>
              💬 WhatsApp Chat
            </a>
          </div>
        </motion.div>

        <div className="pb-8" />
      </div>
    </div>
  );
}

function ContactCard({ icon, title, value, subtitle, color, href }) {
  const { theme } = useTheme();
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      className={`border rounded-2xl p-5 transition-all group block ${
        theme === 'light' ? 'bg-white border-gray-100 hover:border-emerald-200 shadow-sm' : 'bg-white/[0.03] border-white/5 hover:border-white/15'
      }`}>
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white shadow-lg mb-3 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className={`text-[0.65rem] font-bold mb-1 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/25'}`}>{title}</div>
      <div className={`font-bold text-sm mb-1 transition-colors ${theme === 'light' ? 'text-slate-900 group-hover:text-emerald-600' : 'text-white group-hover:text-emerald-400'}`}>{value}</div>
      <div className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>{subtitle}</div>
    </a>
  );
}

function QuickLink({ icon, label, href }) {
  const { theme } = useTheme();
  const Tag = href ? 'a' : 'button';
  const props = href ? { href, target: href.startsWith('http') ? '_blank' : undefined, rel: 'noopener' } : {};
  return (
    <Tag {...props}
      className={`border rounded-xl p-3 flex items-center gap-2 transition-all text-[0.75rem] font-bold ${
        theme === 'light' ? 'bg-white border-gray-100 text-slate-500 hover:border-emerald-200 hover:text-emerald-600' : 'bg-white/[0.03] border-white/5 text-white/50 hover:text-white hover:bg-white/[0.05]'
      }`}>
      <span className={theme === 'light' ? 'text-emerald-600/70' : 'text-emerald-400/50'}>{icon}</span>
      {label}
      <ExternalLink size={10} className="ml-auto opacity-30" />
    </Tag>
  );
}
