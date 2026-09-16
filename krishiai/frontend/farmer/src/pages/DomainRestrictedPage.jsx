import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  Sprout, 
  Store, 
  ExternalLink, 
  Home
} from 'lucide-react';

const VENDOR_APP_URL = import.meta.env.VITE_VENDOR_URL || 'http://localhost:5174';

export default function DomainRestrictedPage({ targetDomain = 'Vendor' }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isVendor = targetDomain.toLowerCase() === 'vendor';

  return (
    <div className="min-h-screen bg-[#070b09] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative overflow-hidden font-['Inter',sans-serif]">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card */}
      <div className="relative z-10 max-w-2xl w-full bg-[#0d1611]/90 border border-emerald-900/40 rounded-2xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
        
        {/* Top Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-emerald-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-lg">
              🌾
            </div>
            <span className="font-['Outfit'] font-black tracking-tight text-white text-lg">
              Krishi<span className="text-emerald-400">AI</span>
            </span>
            <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Farmer Domain
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-400/90 font-medium bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-lg">
            <Lock className="w-3.5 h-3.5" />
            <span>Domain Isolation Active</span>
          </div>
        </div>

        {/* Central Warning / Restriction Display */}
        <div className="text-center mt-6">
          <div className="relative inline-flex items-center justify-center mb-4">
            <div className="w-20 h-20 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
              <ShieldAlert className="w-10 h-10 animate-pulse" />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white font-['Outfit'] tracking-tight">
            {targetDomain} Portal Access Restricted
          </h1>

          <p className="mt-3 text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            You are currently on the <strong className="text-emerald-400 font-semibold">Farmer Portal</strong>. 
            For role security and data isolation, {targetDomain.toLowerCase()} management tools and routes cannot be navigated directly on this domain.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 bg-[#080e0a] border border-emerald-900/50 rounded-lg px-3 py-1.5 text-xs text-slate-400 font-mono">
            <span>Restricted Route:</span>
            <span className="text-amber-300 font-semibold">{location.pathname}</span>
          </div>
        </div>

        {/* Informational Guidance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
          {/* Card 1: Farmer Produce */}
          <div className="bg-[#111c15]/80 border border-emerald-800/30 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mb-2">
                <Sprout className="w-4 h-4" />
                <span>Farmer Produce Selling</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Looking to sell your agricultural produce to verified buyers? You do not need a vendor account. Browse buyer tenders and post offers directly in the Farmer Portal.
              </p>
            </div>
            <button
              onClick={() => navigate('/sell-crops')}
              className="mt-4 w-full bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>Sell Produce to Buyers</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>

          {/* Card 2: Dedicated Vendor Domain */}
          <div className="bg-[#111c15]/80 border border-blue-900/30 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm mb-2">
                <Store className="w-4 h-4" />
                <span>Dedicated {targetDomain} Portal</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                Vendor registration, procurement logistics, and merchant inventory operate exclusively on the dedicated {targetDomain} Domain to maintain strict role separation.
              </p>
            </div>
            {isVendor ? (
              <a
                href={VENDOR_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 hover:text-blue-200 text-xs font-medium py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>Open Vendor Portal in New Tab</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            ) : (
              <div className="mt-4 text-[11px] text-slate-500 italic">
                Isolated admin console available on port 5175.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-6 border-t border-emerald-950/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={() => navigate('/chat')}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-black font-semibold text-sm rounded-xl shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Farmer Dashboard</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full sm:w-auto px-4 py-2.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/40 text-slate-300 hover:text-white text-sm rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Farmer Home</span>
          </button>
        </div>

      </div>

      {/* Footer Notice */}
      <p className="mt-6 text-xs text-slate-500 text-center max-w-md">
        KrishiAI multi-domain architecture strictly enforces domain isolation. Cross-domain automatic redirects are restricted.
      </p>
    </div>
  );
}
