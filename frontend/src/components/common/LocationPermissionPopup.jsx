import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Leaf, Wind, Droplets, AlertTriangle } from 'lucide-react';
import { sendLocation } from '../../services/api';

const LOCATION_KEY = 'krishiai_location_asked';

export default function LocationPermissionPopup() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | denied | error

  useEffect(() => {
    // Show popup only once per browser session
    const alreadyAsked = localStorage.getItem(LOCATION_KEY);
    if (!alreadyAsked) {
      const timer = setTimeout(() => setVisible(true), 1800); // slight delay for premium feel
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(LOCATION_KEY, 'skipped');
    setVisible(false);
  };

  const handleAllow = () => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setStatus('success');
        await sendLocation(latitude, longitude, 'web');
        localStorage.setItem(LOCATION_KEY, 'granted');
        setTimeout(() => setVisible(false), 1500);
      },
      () => {
        setStatus('denied');
        localStorage.setItem(LOCATION_KEY, 'denied');
      },
      { timeout: 15000, enableHighAccuracy: true, maximumAge: 0 }
    );
  };

  const features = [
    { icon: <Wind size={14} />, text: 'Local weather updates' },
    { icon: <Leaf size={14} />, text: 'Crop recommendations' },
    { icon: <Droplets size={14} />, text: 'Soil & irrigation insights' },
    { icon: <AlertTriangle size={14} />, text: 'Pest & disease alerts' },
  ];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="location-popup-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(5,14,7,0.75)', backdropFilter: 'blur(6px)',
            padding: '1rem',
          }}
        >
          <motion.div
            initial={{ scale: 0.85, y: 40, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.85, y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 22, stiffness: 260 }}
            style={{
              background: 'linear-gradient(135deg, rgba(10,26,13,0.98) 0%, rgba(22,101,52,0.15) 100%)',
              border: '1px solid rgba(134,239,172,0.25)',
              borderRadius: '1.25rem',
              padding: '2rem',
              maxWidth: '380px',
              width: '100%',
              boxShadow: '0 0 60px rgba(21,128,61,0.3), 0 0 0 1px rgba(134,239,172,0.1)',
              position: 'relative',
            }}
          >
            {/* Close button */}
            <button 
              onClick={dismiss} 
              aria-label="Close popup"
              style={{
                position: 'absolute', top: '1rem', right: '1rem',
                background: 'rgba(255,255,255,0.07)', border: 'none',
                borderRadius: '50%', width: '28px', height: '28px',
                cursor: 'pointer', color: '#7aad86', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={14} />
            </button>

            {/* Icon */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              style={{
                width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 1.25rem',
                background: 'linear-gradient(135deg, #166534, #15803d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 24px rgba(21,128,61,0.6)',
              }}
            >
              <MapPin size={26} color="#86efac" />
            </motion.div>

            {/* Title */}
            <h2 style={{
              textAlign: 'center', color: '#86efac', fontFamily: 'Outfit, sans-serif',
              fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem',
            }}>
              Enable Location for Better Farming Advice 🌾
            </h2>
            <p style={{
              textAlign: 'center', color: '#7aad86', fontSize: '0.82rem',
              marginBottom: '1.25rem', lineHeight: 1.55,
            }}>
              Allow KrishiAI to access your farm location for local insights:
            </p>

            {/* Feature list */}
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {features.map((f, i) => (
                <motion.li key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#e2f0e4', fontSize: '0.82rem' }}
                >
                  <span style={{ color: '#4ade80' }}>{f.icon}</span>
                  {f.text}
                </motion.li>
              ))}
            </ul>

            {/* Status messages */}
            {status === 'denied' && (
              <p style={{ color: '#fca5a5', textAlign: 'center', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                ⚠️ Location access denied. You can enable it in browser settings.
              </p>
            )}
            {status === 'error' && (
              <p style={{ color: '#fca5a5', textAlign: 'center', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                ⚠️ Geolocation is not supported by this browser.
              </p>
            )}
            {status === 'success' && (
              <p style={{ color: '#4ade80', textAlign: 'center', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
                ✅ Location saved! Personalizing your experience...
              </p>
            )}

            {/* Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleAllow}
                disabled={status === 'loading' || status === 'success'}
                style={{
                  flex: 1, padding: '0.75rem', borderRadius: '0.75rem', border: 'none',
                  background: status === 'success'
                    ? 'linear-gradient(135deg, #4ade80, #166534)'
                    : 'linear-gradient(135deg, #15803d, #166534)',
                  color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                  cursor: status === 'loading' ? 'wait' : 'pointer',
                  boxShadow: '0 0 20px rgba(21,128,61,0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                }}
              >
                {status === 'loading' ? '📡 Locating...' : status === 'success' ? '✅ Located!' : '📍 Allow Location'}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={dismiss}
                style={{
                  padding: '0.75rem 1rem', borderRadius: '0.75rem',
                  border: '1px solid rgba(134,239,172,0.2)',
                  background: 'rgba(255,255,255,0.04)', color: '#7aad86',
                  fontSize: '0.85rem', cursor: 'pointer',
                }}
              >
                Skip
              </motion.button>
            </div>
            <p style={{ textAlign: 'center', color: '#4a6b52', fontSize: '0.7rem', marginTop: '0.75rem' }}>
              🔒 Anonymous & secure — no personal data is stored.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
