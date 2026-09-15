import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Globe, Bell, Palette, Shield, Database, LogOut, Camera, Edit2, Check, Moon, Sun, Volume2, VolumeX, Smartphone, Monitor, MapPin, Menu } from 'lucide-react';
import { useUser, useClerk } from '@clerk/clerk-react';
import { useChat } from '../context/ChatContext';
import { translations, LANGUAGES } from '../utils/translations/index';
import { useMobileMenu } from '../context/MobileMenuContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const { language, setLanguage } = useChat();
  const { setMobileMenuOpen } = useMobileMenu();
  const { theme, toggleTheme } = useTheme();
  const t = translations[language]?.chat?.sidebar || {};

  // Settings state (persisted in localStorage)
  const [notifications, setNotifications] = useState(() => JSON.parse(localStorage.getItem('kri_notif') || 'true'));
  const [soundEnabled, setSoundEnabled] = useState(() => JSON.parse(localStorage.getItem('kri_sound') || 'true'));
  const [autoDetectLocation, setAutoDetectLocation] = useState(() => JSON.parse(localStorage.getItem('kri_autoloc') || 'true'));
  const [units, setUnits] = useState(() => localStorage.getItem('kri_units') || 'metric');
  const [dataUsage, setDataUsage] = useState(() => localStorage.getItem('kri_data') || 'normal');

  // Save settings to localStorage
  useEffect(() => { localStorage.setItem('kri_notif', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('kri_sound', JSON.stringify(soundEnabled)); }, [soundEnabled]);
  useEffect(() => { localStorage.setItem('kri_autoloc', JSON.stringify(autoDetectLocation)); }, [autoDetectLocation]);
  useEffect(() => { localStorage.setItem('kri_units', units); }, [units]);
  useEffect(() => { localStorage.setItem('kri_data', dataUsage); }, [dataUsage]);

  const handleLanguageChange = (langCode) => {
    setLanguage(langCode);
    localStorage.setItem('landing_language', langCode);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[var(--page-bg)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-8 space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 bg-[var(--g)]/40 border border-[#86efac]/20 rounded-xl text-[var(--glt)] shrink-0">
              <Menu size={18} />
            </button>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Settings size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[var(--txt)] tracking-tight">Settings</h1>
              <p className="text-[var(--mut)] text-sm font-medium">Manage your account & preferences</p>
            </div>
          </div>
        </motion.div>

        {/* ═══ PROFILE SECTION ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <SectionHeader icon={<User size={14} />} title="Profile" />
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl p-4 sm:p-6 space-y-5">

            {/* Profile Card */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="relative group shrink-0">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white text-2xl font-bold">
                      {(user?.firstName?.[0] || 'K').toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={20} className="text-white/80" />
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <h2 className="text-xl font-bold text-[var(--txt)]">{user?.fullName || user?.firstName || 'Farmer'}</h2>
                <p className="text-sm text-[var(--mut)]">{user?.primaryEmailAddress?.emailAddress || 'user@krishiai.in'}</p>
                <p className="text-[0.65rem] text-emerald-400/60 font-bold">
                  🌾 Pro member · Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'Jan 2026'}
                </p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <ProfileField label="Full Name" value={user?.fullName || 'Farmer'} />
              <ProfileField label="Email" value={user?.primaryEmailAddress?.emailAddress || 'user@krishiai.in'} />
              <ProfileField label="Phone" value={user?.primaryPhoneNumber?.phoneNumber || 'Not set'} />
              <ProfileField label="User ID" value={user?.id?.slice(0, 16) || 'KRI-XXXXXXXX'} mono />
            </div>
          </div>
        </motion.div>

        {/* ═══ LANGUAGE ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <SectionHeader icon={<Globe size={14} />} title="Language" />
          <div className={`border rounded-2xl p-4 sm:p-5 transition-colors ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-[var(--card-bg)] border-[var(--glass-border)]'}`}>
            <p className={`text-[0.7rem] mb-3 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-[var(--mut)]'}`}>Choose your preferred language for the entire app</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map(lang => (
                <button key={lang.code} onClick={() => handleLanguageChange(lang.code)}
                  className={`px-4 py-3 rounded-xl text-sm font-bold transition-all border flex flex-col items-center gap-1 ${language === lang.code
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
                    : theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400 hover:text-slate-600 hover:bg-gray-100' : 'bg-white/[0.02] border-white/5 text-white/40 hover:text-white hover:bg-white/[0.04]'
                    }`}>
                  <span className="text-lg">{lang.label}</span>
                  <span className="text-[0.65rem]">{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ═══ NOTIFICATIONS ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <SectionHeader icon={<Bell size={14} />} title="Notifications" />
          <div className="bg-[var(--card-bg)] border border-[var(--glass-border)] rounded-2xl divide-y divide-[var(--glass-border)]">
            <ToggleSetting
              icon={<Bell size={16} />}
              title="Push Notifications"
              subtitle="Market alerts, weather warnings, scheme updates"
              enabled={notifications}
              onToggle={() => setNotifications(!notifications)}
            />
            <ToggleSetting
              icon={soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              title="Sound Effects"
              subtitle="Chat message sounds and notification tones"
              enabled={soundEnabled}
              onToggle={() => setSoundEnabled(!soundEnabled)}
            />
          </div>
        </motion.div>

        {/* ═══ APPEARANCE ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SectionHeader icon={<Palette size={14} />} title="Appearance" />
          <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/[0.03] border-white/5'}`}>
            <div>
              <p className={`text-[0.7rem] mb-3 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Theme</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'dark', label: 'Dark', icon: <Moon size={14} /> },
                  { id: 'light', label: 'Light', icon: <Sun size={14} /> },
                ].map(item => (
                  <button key={item.id}
                    onClick={() => { if (theme !== item.id) toggleTheme(); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[0.75rem] font-bold border transition-all ${theme === item.id
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400 shadow-lg shadow-emerald-500/10'
                      : theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400 hover:text-slate-600' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50'
                      }`}>
                    {item.icon}
                    {item.label}
                    {theme === item.id && <Check size={12} className="ml-1" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ LOCATION & DATA ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <SectionHeader icon={<MapPin size={14} />} title="Location & Data" />
          <div className={`border rounded-2xl divide-y transition-colors ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm divide-gray-100' : 'bg-white/[0.03] border-white/5 divide-white/5'
            }`}>
            <ToggleSetting
              icon={<MapPin size={16} />}
              title="Auto-detect Location"
              subtitle="Automatically detect your GPS location for mandis & weather"
              enabled={autoDetectLocation}
              onToggle={() => setAutoDetectLocation(!autoDetectLocation)}
            />
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={theme === 'light' ? 'text-slate-300' : 'text-white/30'}><Database size={16} /></span>
                  <div>
                    <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>Data Usage</p>
                    <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Control satellite imagery & map quality</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {['low', 'normal', 'high'].map(opt => (
                  <button key={opt} onClick={() => setDataUsage(opt)}
                    className={`px-4 py-2 rounded-xl text-[0.75rem] font-bold border capitalize transition-all ${dataUsage === opt
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400 hover:text-slate-600' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50'
                      }`}>
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={theme === 'light' ? 'text-slate-300' : 'text-white/30'}><Smartphone size={16} /></span>
                  <div>
                    <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>Measurement Units</p>
                    <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Temperature, area, and weight units</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'metric', label: 'Metric (°C, ha, kg)' },
                  { id: 'imperial', label: 'Imperial (°F, acre, lb)' },
                ].map(opt => (
                  <button key={opt.id} onClick={() => setUnits(opt.id)}
                    className={`px-4 py-2 rounded-xl text-[0.75rem] font-bold border transition-all ${units === opt.id
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-400 hover:text-slate-600' : 'bg-white/[0.02] border-white/5 text-white/30 hover:text-white/50'
                      }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ═══ PRIVACY & SECURITY ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <SectionHeader icon={<Shield size={14} />} title="Privacy & Security" />
          <div className={`border rounded-2xl p-5 space-y-4 transition-colors ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/[0.03] border-white/5'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>Change Password</p>
                <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Update your account password</p>
              </div>
              <button className={`px-4 py-2 rounded-xl border text-[0.75rem] font-bold transition-all ${theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-500 hover:text-slate-800' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white'
                }`}>
                Update
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>Two-Factor Authentication</p>
                <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Add extra security to your account</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[0.65rem] font-bold">Coming Soon</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-white/80'}`}>Download My Data</p>
                <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-white/30'}`}>Get a copy of all your data</p>
              </div>
              <button className={`px-4 py-2 rounded-xl border text-[0.75rem] font-bold transition-all ${theme === 'light' ? 'bg-gray-50 border-gray-100 text-slate-500 hover:text-slate-800' : 'bg-white/[0.04] border-white/10 text-white/50 hover:text-white'
                }`}>
                Export
              </button>
            </div>
          </div>
        </motion.div>

        {/* ═══ ABOUT ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <SectionHeader icon={<Database size={14} />} title="About" />
          <div className={`border rounded-2xl p-5 space-y-2 transition-colors ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-white/[0.03] border-white/5'
            }`}>
            {[
              { label: 'App Version', value: 'v2.4.1' },
              { label: 'ML Model', value: 'RandomForest + XGBoost v3' },
              { label: 'Satellite Source', value: 'NASA GIBS MODIS + Sentinel-2' },
              { label: 'Market Data', value: 'data.gov.in APMC API' },
              { label: 'Built with', value: 'React + FastAPI + TensorFlow' },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className={theme === 'light' ? 'text-slate-400' : 'text-white/30'}>{item.label}</span>
                <span className={`font-bold transition-colors ${theme === 'light' ? 'text-slate-600' : 'text-white/60'}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <button onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-all">
            <LogOut size={16} />
            Sign Out
          </button>
        </motion.div>

        <div className="pb-safe" />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function SectionHeader({ icon, title }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className={theme === 'light' ? 'text-emerald-600' : 'text-[var(--mut)]'}>{icon}</span>
      <h2 className={`text-[0.65rem] font-bold uppercase tracking-wider transition-colors ${theme === 'light' ? 'text-emerald-700/60' : 'text-[var(--mut)]'}`}>{title}</h2>
    </div>
  );
}

function ProfileField({ label, value, mono }) {
  const { theme } = useTheme();
  return (
    <div className={`rounded-xl p-3 border transition-colors ${theme === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-[var(--dk)]/10 border-[var(--glass-border)]'
      }`}>
      <div className={`text-[0.55rem] font-bold mb-1 transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-[var(--mut)]'}`}>{label}</div>
      <div className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-700' : 'text-[var(--txt)]'} ${mono ? 'font-mono text-[0.75rem]' : ''}`}>{value}</div>
    </div>
  );
}

function ToggleSetting({ icon, title, subtitle, enabled, onToggle }) {
  const { theme } = useTheme();
  return (
    <div className="flex items-center justify-between p-4 sm:p-5 gap-3">
      <div className="flex items-center gap-3">
        <span className={theme === 'light' ? 'text-slate-300' : 'text-[var(--mut)]'}>{icon}</span>
        <div>
          <p className={`text-sm font-bold transition-colors ${theme === 'light' ? 'text-slate-800' : 'text-[var(--txt)]'}`}>{title}</p>
          <p className={`text-[0.65rem] transition-colors ${theme === 'light' ? 'text-slate-400' : 'text-[var(--mut)]'}`}>{subtitle}</p>
        </div>
      </div>
      <button onClick={onToggle} className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-emerald-500' : (theme === 'light' ? 'bg-gray-200' : 'bg-white/10')}`}>
        <div className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform duration-300 shadow-sm ${enabled ? 'translate-x-[16px]' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
