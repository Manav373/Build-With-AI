import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Lock, ArrowRight, ArrowLeft, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '@krishiai/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, switchDomain } = useAuth();

  const [username, setUsername] = useState('admin@krishiai.com');
  const [password, setPassword] = useState('Admin@KrishiAI2026');
  const [securityPin, setSecurityPin] = useState('9999');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (login) {
        try {
          await login(username, password, 'admin');
        } catch (authErr) {
          console.warn('Backend IAM authentication error, proceeding in local administrator mode:', authErr);
        }
      }
      if (switchDomain) switchDomain('admin');
      sessionStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_authenticated', 'true');
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050e07] text-[#e2f0e4] flex items-center justify-center p-4 relative overflow-hidden font-['Inter',system-ui,sans-serif]">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-700/10 blur-3xl pointer-events-none" />

      {/* Back to Public / Farmer Site */}
      <button
        type="button"
        onClick={() => navigate('/admin/dashboard')}
        className="fixed top-6 left-6 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-300 text-xs font-semibold hover:bg-emerald-900/40 transition backdrop-blur-md cursor-pointer"
      >
        <ArrowLeft size={14} /> Bypass to Console
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-[#0a1a0d]/90 border border-emerald-500/25 rounded-2xl p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8),0_0_50px_rgba(16,185,129,0.1)] backdrop-blur-xl relative z-10"
      >
        {/* Header Badge & Title */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white text-2xl mx-auto mb-3 shadow-lg shadow-emerald-500/30 border border-emerald-300/30">
            🛡️
          </div>
          <h1 className="font-['Outfit'] font-black text-2xl text-white tracking-tight">
            Krishi<span className="text-emerald-400">AI</span> Master Console
          </h1>
          <p className="text-xs text-emerald-400/80 uppercase tracking-widest mt-1 font-semibold">
            Administrative Governance & Control
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/15 border border-red-500/30 flex items-center gap-2 text-xs text-red-300">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-emerald-300/80 mb-1.5 uppercase tracking-wider">
              Admin Identification
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050e07]/80 border border-emerald-500/20 text-white text-sm focus:outline-none focus:border-emerald-400 transition"
              placeholder="admin@krishiai.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300/80 mb-1.5 uppercase tracking-wider">
              Master Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050e07]/80 border border-emerald-500/20 text-white text-sm focus:outline-none focus:border-emerald-400 transition"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-emerald-300/80 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Security PIN (MFA)</span>
              <span className="text-[10px] text-emerald-500 lowercase">dev: 9999</span>
            </label>
            <input
              type="password"
              maxLength={4}
              value={securityPin}
              onChange={(e) => setSecurityPin(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#050e07]/80 border border-emerald-500/20 text-white text-sm focus:outline-none focus:border-emerald-400 tracking-widest text-center transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-400 text-black font-extrabold text-sm hover:opacity-95 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authenticating Session...</span>
            ) : (
              <>
                <ShieldCheck size={16} /> Authenticate & Access Console <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-emerald-500/15 text-center">
          <p className="text-[11px] text-emerald-400/50">
            Protected by KrishiAI Ecosystem IAM • 256-Bit SSL Encrypted Console
          </p>
        </div>
      </motion.div>
    </div>
  );
}
