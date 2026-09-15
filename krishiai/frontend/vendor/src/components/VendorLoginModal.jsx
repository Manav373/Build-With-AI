import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Store, Lock, Phone, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function VendorLoginModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [phoneOrEmail, setPhoneOrEmail] = useState('9823011482');
  const [password, setPassword] = useState('Vendor@1234');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
      setLoading(false);
      onClose();
      navigate('/vendor-dashboard');
    }, 600);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.85)',
              backdropFilter: 'blur(12px)',
              zIndex: 9998,
            }}
          />

          {/* Modal Shell */}
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              style={{
                width: '100%',
                maxWidth: 440,
                background: 'linear-gradient(145deg, #09140b, #050d07)',
                border: '1px solid rgba(250,204,21,0.25)',
                borderRadius: '1.5rem',
                padding: '2rem',
                boxShadow: '0 30px 90px rgba(0,0,0,0.9), 0 0 60px rgba(250,204,21,0.1)',
                position: 'relative',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={onClose}
                style={{
                  position: 'absolute',
                  top: '1.2rem',
                  right: '1.2rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#9ca3af',
                  cursor: 'pointer',
                }}
              >
                <X size={16} />
              </button>

              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #713f12, #facc15)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.5rem',
                    marginBottom: '0.75rem',
                    boxShadow: '0 8px 24px rgba(250,204,21,0.3)',
                  }}
                >
                  🏪
                </div>
                <h2 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.5rem', color: '#fff', margin: 0 }}>
                  Vendor Portal Login
                </h2>
                <p style={{ color: 'rgba(250,204,21,0.7)', fontSize: '0.82rem', marginTop: '0.25rem', fontWeight: 500 }}>
                  Sign in to access your Store Catalog & Procurement Dashboard
                </p>
              </div>

              {/* Verified Credentials Notice */}
              <div style={{
                background: 'rgba(250,204,21,0.08)',
                border: '1px solid rgba(250,204,21,0.2)',
                borderRadius: '0.9rem',
                padding: '0.85rem 1rem',
                marginBottom: '1.25rem',
                fontSize: '0.78rem',
                color: '#e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#facc15', fontWeight: 700, marginBottom: 4 }}>
                  <ShieldCheck size={16} /> Pre-filled Verified Credentials
                </div>
                <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', lineHeight: 1.5 }}>
                  Account: <strong>MahaKrishi Agrotech (Hybrid)</strong><br />
                  Phone: <code style={{ color: '#facc15' }}>9823011482</code> | Password: <code style={{ color: '#facc15' }}>Vendor@1234</code>
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Phone Number / Email
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                      type="text"
                      value={phoneOrEmail}
                      onChange={(e) => setPhoneOrEmail(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600, display: 'block', marginBottom: '0.35rem' }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#6b7280' }} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem 0.75rem 2.5rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.75rem',
                        color: '#fff',
                        fontSize: '0.9rem',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: '0.5rem',
                    padding: '0.85rem',
                    borderRadius: '0.75rem',
                    background: 'linear-gradient(135deg, #713f12, #facc15)',
                    color: '#1c0e00',
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 6px 20px rgba(250,204,21,0.3)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {loading ? 'Logging in...' : 'Sign In as Vendor'}
                  <ArrowRight size={18} />
                </button>
              </form>

              {/* Demo 1-Click Login Button */}
              <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate('/vendor-dashboard');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4ade80',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  ⚡ Direct Demo Access (Skip Credentials)
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
