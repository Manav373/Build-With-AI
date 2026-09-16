import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, ShieldCheck, MapPin, Building2, ExternalLink, Award, Sparkles } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const KvkStateStatsModal = ({ isOpen, onClose, statsData }) => {
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState('ALL');

  if (!isOpen) return null;

  const records = statsData?.records || [];
  const totalKvks = statsData?.total_kvks || 731;
  const asOnDate = statsData?.as_on_date || '31-01-2025';

  const zones = ['ALL', ...new Set(records.map(r => r.zone).filter(Boolean))];

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.state_ut.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesZone = selectedZone === 'ALL' || r.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className={`w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-900'
              : 'bg-[#0b130e] border-emerald-950/40 text-white'
          }`}
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-emerald-500/10 flex items-start justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[0.65rem] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck size={12} /> Official Govt. Dataset
                </span>
                <span className="text-[0.65rem] font-bold text-slate-400">
                  As on {asOnDate}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black leading-tight">
                State/UT-wise Number of Krishi Vigyan Kendras (KVKs)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                731 ICAR Farm Science Centres empowering 40M+ Indian farmers with localized research & advisory.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 rounded-xl border transition-colors shrink-0 ${
                theme === 'light'
                  ? 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  : 'border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 px-5 py-3 border-b border-emerald-500/10 bg-emerald-500/[0.02]">
            <div className="p-2.5 rounded-xl border border-emerald-500/10 text-center">
              <span className="text-[0.6rem] font-bold text-slate-400 block uppercase">Total KVKs</span>
              <span className="text-lg sm:text-xl font-black text-emerald-400">{totalKvks}</span>
            </div>
            <div className="p-2.5 rounded-xl border border-emerald-500/10 text-center">
              <span className="text-[0.6rem] font-bold text-slate-400 block uppercase">States & UTs</span>
              <span className="text-lg sm:text-xl font-black text-blue-400">34</span>
            </div>
            <div className="p-2.5 rounded-xl border border-emerald-500/10 text-center">
              <span className="text-[0.6rem] font-bold text-slate-400 block uppercase">Governing Body</span>
              <span className="text-xs sm:text-sm font-black text-amber-400 truncate block mt-1">ICAR / DARE</span>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-slate-200/10 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search state or union territory (e.g. Gujarat, Maharashtra, Punjab)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium border outline-none transition-all ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                    : 'bg-black/30 border-white/10 text-white focus:border-emerald-500/50'
                }`}
              />
            </div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border outline-none cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-50 border-slate-200 text-slate-900'
                  : 'bg-black/30 border-white/10 text-white'
              }`}
            >
              {zones.map(z => (
                <option key={z} value={z} className={theme === 'light' ? 'text-slate-900' : 'text-black'}>
                  {z === 'ALL' ? 'All ICAR Zones' : z}
                </option>
              ))}
            </select>
          </div>

          {/* Scrollable Table */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2 no-scrollbar">
            {filteredRecords.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No State/UT matching "{searchTerm}"
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRecords.map((item) => {
                  const pct = Math.round((item.kvks_count / 89) * 100); // 89 is max (UP)
                  return (
                    <div
                      key={item.s_no}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        theme === 'light'
                          ? 'bg-slate-50 hover:bg-slate-100/80 border-slate-200/80'
                          : 'bg-white/[0.02] hover:bg-white/[0.05] border-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[0.65rem] font-black flex items-center justify-center shrink-0">
                          {item.s_no}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold leading-tight truncate">
                            {item.state_ut}
                          </h4>
                          <span className="text-[0.6rem] text-slate-400 block mt-0.5">
                            {item.zone}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="w-20 sm:w-28 hidden sm:block">
                          <div className="h-1.5 w-full bg-slate-500/20 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 rounded-full"
                              style={{ width: `${Math.max(8, pct)}%` }}
                            />
                          </div>
                        </div>
                        <div className="text-right min-w-[50px]">
                          <span className="text-sm font-black text-emerald-400">
                            {item.kvks_count}
                          </span>
                          <span className="text-[0.6rem] text-slate-400 block">
                            KVKs
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Citation */}
          <div className="p-4 border-t border-slate-200/10 bg-emerald-500/[0.02] flex flex-col sm:flex-row items-center justify-between gap-2 text-[0.65rem] text-slate-400">
            <span>
              🏛️ Source: Ministry of Agriculture and Farmers Welfare (Rajya Sabha Report as on 31-01-2025)
            </span>
            <a
              href="https://kvk.icar.gov.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline flex items-center gap-1 shrink-0"
            >
              ICAR KVK Knowledge Network <ExternalLink size={12} />
            </a>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default KvkStateStatsModal;
