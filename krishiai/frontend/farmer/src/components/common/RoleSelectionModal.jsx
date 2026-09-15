import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, CheckCircle2 } from 'lucide-react';

const ROLES = [
  {
    id: 'customer',
    icon: '🌾',
    label: 'Customer',
    sublabel: 'Farmer / Consumer',
    description: 'Access AI-powered crop advisory, real-time market prices, weather alerts, disease detection, and government schemes.',
    benefits: [
      'AI crop disease diagnosis',
      'Live mandi price tracker',
      'Hyper-local weather alerts',
      'Govt. scheme navigator',
    ],
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #166534 0%, #15803d 60%, #4ade80 100%)',
    glowColor: 'rgba(74,222,128,0.35)',
    borderColor: 'rgba(74,222,128,0.25)',
    bgCard: 'rgba(22,101,52,0.1)',
    ctaTextColor: '#052e14',
    route: '/sign-up',
  },
  {
    id: 'vendor',
    icon: '🏪',
    label: 'Vendor',
    sublabel: 'Procurement, Seller, or Hybrid',
    description: 'Buy crops directly from farmers, sell agricultural inputs & equipment, or operate both with one account.',
    benefits: [
      'Product listing & store management',
      'Crop buying requirements & procurement',
      'Farmer negotiations & order tracking',
      'Vendor marketplace profile & analytics',
    ],
    vendorTypes: [
      { emoji: '🏭', label: 'Procurement Vendor', desc: 'Buy crops in bulk' },
      { emoji: '🏪', label: 'Agri Input Seller', desc: 'Sell products & tools' },
      { emoji: '🔄', label: 'Hybrid Vendor', desc: 'Buy crops & sell products' },
    ],
    color: '#facc15',
    gradient: 'linear-gradient(135deg, #713f12 0%, #a16207 60%, #facc15 100%)',
    glowColor: 'rgba(250,204,21,0.35)',
    borderColor: 'rgba(250,204,21,0.25)',
    bgCard: 'rgba(113,63,18,0.1)',
    ctaTextColor: '#1c0e00',
    route: '/vendor-type-select',
  },
];

export default function RoleSelectionModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key';

  const handleSelect = (role) => {
    onClose();
    if (role.id === 'vendor') {
      navigate('/vendor-type-select');
    } else {
      navigate(isClerkEnabled ? '/sign-up' : '/chat');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="rsm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.82)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              zIndex: 9998,
            }}
          />

          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '1rem',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              key="rsm-panel"
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: '100%',
                maxWidth: 820,
                maxHeight: 'calc(100vh - 2rem)',
                overflowY: 'auto',
                pointerEvents: 'all',
                borderRadius: '2rem',
                fontFamily: "'Inter', system-ui, sans-serif",
              }}
            >
              <div
                style={{
                  background: 'linear-gradient(145deg, rgba(4,12,6,0.98), rgba(6,18,8,0.99))',
                  border: '1px solid rgba(134,239,172,0.15)',
                  borderRadius: '2rem',
                  padding: 'clamp(1.25rem, 3vw, 2rem)',
                  boxShadow: '0 40px 120px rgba(0,0,0,0.85), 0 0 80px rgba(22,101,52,0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', top: -100, left: -80, background: 'radial-gradient(circle, rgba(22,101,52,0.2), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
                <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', bottom: -70, right: -60, background: 'radial-gradient(circle, rgba(113,63,18,0.18), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

                <button
                  type="button"
                  onClick={onClose}
                  id="role-modal-close"
                  aria-label="Close"
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'rgba(255,255,255,0.5)',
                    zIndex: 10,
                    flexShrink: 0,
                    outline: 'none',
                    transition: 'background 0.2s, color 0.2s',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.14)';
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '1.4rem', position: 'relative', zIndex: 1 }}>
                  <motion.div
                    animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.06, 1] }}
                    transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                    style={{ fontSize: '2.2rem', marginBottom: '0.45rem', display: 'inline-block' }}
                  >
                    🌱
                  </motion.div>
                  <h2
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 900,
                      fontSize: 'clamp(1.3rem, 3.5vw, 1.85rem)',
                      color: '#f0fdf4',
                      margin: '0 0 0.3rem',
                      letterSpacing: '-0.03em',
                      lineHeight: 1.15,
                    }}
                  >
                    Join{' '}
                    <span
                      style={{
                        background: 'linear-gradient(135deg, #86efac, #4ade80)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                      }}
                    >
                      KrishiAI
                    </span>{' '}
                    as…
                  </h2>
                  <p style={{ color: 'rgba(134,239,172,0.5)', fontSize: '0.85rem', margin: 0, fontWeight: 500 }}>
                    Choose your role — get started in 30 seconds, free forever
                  </p>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(255px, 1fr))',
                    gap: '0.9rem',
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  {ROLES.map((role, i) => (
                    <motion.button
                      key={role.id}
                      type="button"
                      id={`role-select-${role.id}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 + i * 0.1, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      onClick={() => handleSelect(role)}
                      whileHover={{ scale: 1.02, y: -4 }}
                      whileTap={{ scale: 0.975 }}
                      aria-label={`Sign up as ${role.label}`}
                      style={{
                        background: role.bgCard,
                        border: `1.5px solid ${role.borderColor}`,
                        borderRadius: '1.2rem',
                        padding: '1.3rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        position: 'relative',
                        overflow: 'hidden',
                        outline: 'none',
                        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.boxShadow = `0 8px 36px ${role.glowColor}`;
                        e.currentTarget.style.borderColor = role.color;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = role.borderColor;
                      }}
                    >
                      <div
                        style={{
                          position: 'absolute',
                          top: 0, left: 0, right: 0,
                          height: 3,
                          background: role.gradient,
                          borderRadius: '1.2rem 1.2rem 0 0',
                          pointerEvents: 'none',
                        }}
                      />

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <div
                            style={{
                              width: 46,
                              height: 46,
                              borderRadius: '11px',
                              background: role.gradient,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '1.45rem',
                              boxShadow: `0 4px 14px ${role.glowColor}`,
                              flexShrink: 0,
                            }}
                          >
                            {role.icon}
                          </div>
                          <div>
                            <div
                              style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontWeight: 800,
                                fontSize: '1.15rem',
                                color: '#f0fdf4',
                                lineHeight: 1,
                                marginBottom: '0.18rem',
                              }}
                            >
                              {role.label}
                            </div>
                            <div style={{ fontSize: '0.7rem', color: role.color, fontWeight: 600 }}>
                              {role.sublabel}
                            </div>
                          </div>
                        </div>
                        <div
                          style={{
                            width: 30,
                            height: 30,
                            borderRadius: '50%',
                            background: `${role.color}18`,
                            border: `1px solid ${role.color}44`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: role.color,
                            flexShrink: 0,
                          }}
                        >
                          <ArrowRight size={13} />
                        </div>
                      </div>

                      <p style={{ color: 'rgba(220,240,225,0.6)', fontSize: '0.8rem', lineHeight: 1.6, margin: 0 }}>
                        {role.description}
                      </p>

                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        {role.benefits.map((b, j) => (
                          <li
                            key={j}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.38rem',
                              color: 'rgba(220,240,225,0.8)',
                              fontSize: '0.77rem',
                              fontWeight: 500,
                            }}
                          >
                            <CheckCircle2 size={12} style={{ color: role.color, flexShrink: 0 }} />
                            {b}
                          </li>
                        ))}
                      </ul>

                      {role.vendorTypes && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', padding: '0.5rem', borderRadius: '0.6rem', background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)' }}>
                          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Includes 3 Vendor Types:
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.25rem' }}>
                            {role.vendorTypes.map((vt, k) => (
                              <div key={k} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '4px 2px', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
                                <span style={{ fontSize: '0.9rem' }}>{vt.emoji}</span>
                                <span style={{ fontSize: '0.62rem', color: '#f0fdf4', fontWeight: 700, marginTop: 2, lineHeight: 1.1 }}>{vt.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div
                        style={{
                          padding: '0.55rem 1rem',
                          borderRadius: '0.6rem',
                          background: role.gradient,
                          color: role.ctaTextColor,
                          fontWeight: 800,
                          fontSize: '0.82rem',
                          textAlign: 'center',
                          boxShadow: `0 3px 12px ${role.glowColor}`,
                        }}
                      >
                        Get Started as {role.label} →
                      </div>
                    </motion.button>
                  ))}
                </div>

                <p
                  style={{
                    textAlign: 'center',
                    color: 'rgba(134,239,172,0.3)',
                    fontSize: '0.75rem',
                    marginTop: '1.1rem',
                    marginBottom: 0,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { onClose(); navigate('/sign-in'); }}
                    id="modal-sign-in-link"
                    style={{
                      color: '#4ade80',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: 'inherit',
                      padding: 0,
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      outline: 'none',
                    }}
                  >
                    Sign in here
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
