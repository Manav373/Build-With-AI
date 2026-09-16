import React, { useState } from 'react';
import { 
  Building2, Phone, MessageSquare, Navigation, MapPin, 
  Award, BookOpen, ShieldCheck, ChevronRight, ExternalLink, 
  Sparkles, Users, Beaker, Leaf, Wrench
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const KvkScientistCard = ({ kvkData, farmerCoords, onOpenStatsModal }) => {
  const { theme } = useTheme();
  const [showAllScientists, setShowAllScientists] = useState(false);

  const nearest = kvkData?.nearest_kvk;
  if (!nearest) return null;

  const senior = nearest.senior_scientist || {};
  const scientists = nearest.scientists || [];
  const distance = nearest.distance_km ?? '--';
  const stateCount = kvkData.official_state_kvk_count || 30;
  const nationalTotal = kvkData.national_total_kvks_2025 || 731;

  // Google Maps directions URL from farmer location to KVK
  const directionsUrl = farmerCoords?.lat && farmerCoords?.lng
    ? `https://www.google.com/maps/dir/?api=1&origin=${farmerCoords.lat},${farmerCoords.lng}&destination=${nearest.lat},${nearest.lon}`
    : `https://www.google.com/maps/search/?api=1&query=${nearest.lat},${nearest.lon}`;

  // WhatsApp advisory link
  const cleanPhone = senior.phone ? senior.phone.replace(/[^0-9]/g, '') : '';
  const waUrl = cleanPhone 
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Namaste Dr. ${senior.name}, I am a farmer connecting via KrishiAI Satellite Intelligence for crop advisory.`)}`
    : null;

  return (
    <div className={`p-5 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
      theme === 'light'
        ? 'bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 border-emerald-200/80 shadow-emerald-500/5'
        : 'bg-gradient-to-br from-emerald-950/20 via-[#0b130e] to-black/60 border-emerald-500/20 shadow-black/80'
    }`}>
      {/* Decorative Accent Glow */}
      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

      {/* Header Tag */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <Building2 size={12} className="text-emerald-500" />
          <span className="text-[0.6rem] font-black uppercase tracking-wider text-emerald-500">
            Nearest Farm Science Centre (KVK)
          </span>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[0.65rem] font-bold">
          <Navigation size={10} />
          <span>{distance} km away</span>
        </div>
      </div>

      {/* Center Name & Host */}
      <div className="mb-4">
        <h3 className="text-sm font-black leading-snug">
          {nearest.name}
        </h3>
        <p className="text-[0.65rem] text-slate-400 mt-0.5 flex items-center gap-1">
          <MapPin size={10} className="text-emerald-400 shrink-0" />
          <span className="truncate">{nearest.host_institution}</span>
        </p>
      </div>

      {/* Senior Scientist In-Charge Spotlight */}
      <div className={`p-4 rounded-2xl border mb-4 relative ${
        theme === 'light'
          ? 'bg-white border-emerald-100 shadow-sm'
          : 'bg-white/[0.03] border-white/5'
      }`}>
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-emerald-500/20 shrink-0">
            👨‍🔬
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-xs font-black text-emerald-400 truncate">
                {senior.name}
              </h4>
              <span className="text-[0.55rem] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shrink-0">
                Center Head
              </span>
            </div>
            <p className="text-[0.62rem] text-slate-400 font-medium mt-0.5">
              {senior.designation} • {senior.qualification}
            </p>
            {senior.specialization && (
              <p className="text-[0.6rem] text-emerald-300/80 mt-1 font-semibold flex items-center gap-1">
                <Sparkles size={10} className="text-emerald-400 shrink-0" />
                <span className="truncate">Specialization: {senior.specialization}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons for Senior Scientist */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-200/10">
          {senior.phone ? (
            <a
              href={`tel:${senior.phone}`}
              className="px-2 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[0.65rem] font-black flex items-center justify-center gap-1 transition-all shadow-md active:scale-95 text-center"
              title="Call Scientist"
            >
              <Phone size={12} />
              <span>Call</span>
            </a>
          ) : (
            <button disabled className="opacity-40 px-2 py-1.5 rounded-xl bg-slate-500 text-white text-[0.65rem] font-bold flex items-center justify-center gap-1">
              <Phone size={12} /> Call
            </button>
          )}

          {waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[0.65rem] font-black flex items-center justify-center gap-1 transition-all active:scale-95 text-center"
              title="Chat on WhatsApp"
            >
              <MessageSquare size={12} />
              <span>WhatsApp</span>
            </a>
          ) : (
            <div className="px-2 py-1.5 rounded-xl bg-slate-500/10 text-slate-400 text-[0.65rem] font-bold text-center">
              Advisory
            </div>
          )}

          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[0.65rem] font-black flex items-center justify-center gap-1 transition-all active:scale-95 text-center"
            title="Navigate in Google Maps"
          >
            <Navigation size={12} />
            <span>Map</span>
          </a>
        </div>
      </div>

      {/* Specialized Subject Matter Specialists (SMS) */}
      {scientists.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
              <Users size={12} /> Specialized Agri Scientists ({scientists.length})
            </span>
            <button
              onClick={() => setShowAllScientists(!showAllScientists)}
              className="text-[0.6rem] font-bold text-emerald-400 hover:underline"
            >
              {showAllScientists ? 'Show Less' : 'View All'}
            </button>
          </div>

          <div className="space-y-1.5">
            {(showAllScientists ? scientists : scientists.slice(0, 2)).map((sci, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-slate-50/80 border-slate-200/80'
                    : 'bg-white/[0.02] border-white/5'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <h5 className="text-[0.68rem] font-black truncate">
                    {sci.name}
                  </h5>
                  <p className="text-[0.58rem] text-slate-400 truncate">
                    {sci.role}
                  </p>
                  <span className="text-[0.55rem] text-emerald-400 font-semibold block truncate">
                    • {sci.specialization}
                  </span>
                </div>
                {sci.phone && (
                  <a
                    href={`tel:${sci.phone}`}
                    className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white transition-all border border-emerald-500/20 shrink-0"
                    title={`Call ${sci.name}`}
                  >
                    <Phone size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Facilities Pills */}
      {nearest.facilities?.length > 0 && (
        <div className="mb-4">
          <span className="text-[0.6rem] font-bold text-slate-400 block mb-1.5 uppercase">
            Available Labs & Services
          </span>
          <div className="flex flex-wrap gap-1">
            {nearest.facilities.map((fac, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md text-[0.55rem] font-semibold bg-slate-500/10 text-slate-300 border border-slate-500/20"
              >
                {fac}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Official State / National Statistics Badge & Modal Trigger */}
      <div className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
        theme === 'light'
          ? 'bg-emerald-50/50 border-emerald-100'
          : 'bg-emerald-500/5 border-emerald-500/10'
      }`}>
        <div>
          <span className="text-[0.58rem] font-black uppercase text-emerald-500 block">
            🇮🇳 {nearest.state}: {stateCount} KVKs • India: {nationalTotal}
          </span>
          <span className="text-[0.6rem] text-slate-400 block mt-0.5">
            Official Govt. Registry as on 31-01-2025
          </span>
        </div>
        <button
          onClick={onOpenStatsModal}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 text-[0.65rem] font-bold flex items-center gap-1 transition-all shrink-0"
        >
          <span>All States</span>
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default KvkScientistCard;
