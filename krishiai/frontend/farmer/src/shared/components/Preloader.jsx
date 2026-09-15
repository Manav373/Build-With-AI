import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const PARTICLES = [
  { size: 4, color: '#4ade80', opacity: 0.55, top: '14%', left: '18%', dur: 5.8 },
  { size: 3, color: '#86efac', opacity: 0.40, top: '24%', left: '76%', dur: 7.5 },
  { size: 5, color: '#facc15', opacity: 0.30, top: '62%', left: '9%', dur: 6.8 },
  { size: 3, color: '#4ade80', opacity: 0.50, top: '81%', left: '84%', dur: 8.9 },
  { size: 4, color: '#86efac', opacity: 0.35, top: '41%', left: '4%', dur: 10.5 },
  { size: 3, color: '#4ade80', opacity: 0.42, top: '71%', left: '56%', dur: 6.2 },
  { size: 5, color: '#86efac', opacity: 0.22, top: '9%', left: '51%', dur: 9.8 },
  { size: 3, color: '#facc15', opacity: 0.32, top: '91%', left: '29%', dur: 8.2 },
  { size: 4, color: '#4ade80', opacity: 0.45, top: '50%', left: '93%', dur: 7.2 },
  { size: 3, color: '#86efac', opacity: 0.28, top: '32%', left: '41%', dur: 9.2 },
  { size: 5, color: '#4ade80', opacity: 0.18, top: '4%', left: '87%', dur: 11.5 },
  { size: 3, color: '#facc15', opacity: 0.38, top: '76%', left: '61%', dur: 6.5 },
];

const DEFAULT_STATUS_LABELS = ['Initializing…', 'Loading data…', 'Preparing…', 'Almost ready…', '✓ Ready!'];

export default function Preloader({
  onDone,
  tagline = 'Your Personal Agricultural Advisor',
  icon = '🌾',
  statusLabels = DEFAULT_STATUS_LABELS,
}) {
  const [done, setDone] = useState(false);
  const [rawProgress, setRawProgress] = useState(0);

  const motionProgress = useMotionValue(0);
  const springProgress = useSpring(motionProgress, { stiffness: 60, damping: 20 });
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const unsub = springProgress.on('change', (v) => setDisplayPct(Math.round(v)));
    return unsub;
  }, [springProgress]);

  useEffect(() => {
    const steps = [
      { to: 25, delay: 0 },
      { to: 55, delay: 420 },
      { to: 82, delay: 900 },
      { to: 100, delay: 1300 },
    ];
    const timers = steps.map(({ to, delay }) =>
      setTimeout(() => {
        setRawProgress(to);
        motionProgress.set(to);
        if (to === 100) {
          setTimeout(() => setDone(true), 350);
          setTimeout(() => onDone?.(), 1050);
        }
      }, delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  function getStatus(p) {
    if (p < 30) return statusLabels[0] || 'Initializing…';
    if (p < 60) return statusLabels[1] || 'Loading data…';
    if (p < 85) return statusLabels[2] || 'Preparing…';
    if (p < 100) return statusLabels[3] || 'Almost ready…';
    return statusLabels[4] || '✓ Ready!';
  }

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
          className="preloader-root"
          aria-label="Loading KrishiAI"
          role="status"
        >
          <style>{`
            .preloader-root {
              position: fixed;
              inset: 0;
              z-index: 99999;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #030905;
              overflow: hidden;
            }
            .preloader-glow {
              position: absolute;
              border-radius: 50%;
              pointer-events: none;
              filter: blur(80px);
              animation: preloaderGlowPulse 3s ease-in-out infinite alternate;
            }
            .preloader-glow-1 {
              width: 500px;
              height: 500px;
              top: -100px;
              right: -80px;
              background: radial-gradient(circle, rgba(22, 101, 52, 0.25), transparent 70%);
            }
            .preloader-glow-2 {
              width: 400px;
              height: 400px;
              bottom: -80px;
              left: -60px;
              background: radial-gradient(circle, rgba(74, 222, 128, 0.12), transparent 70%);
              animation-delay: 1.5s;
            }
            .preloader-grid {
              position: absolute;
              inset: 0;
              background-image: linear-gradient(rgba(134, 239, 172, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(134, 239, 172, 0.03) 1px, transparent 1px);
              background-size: 60px 60px;
              -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
              mask-image: radial-gradient(ellipse 70% 70% at 50% 50%, black 20%, transparent 100%);
            }
            .preloader-content {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1.2rem;
              position: relative;
              z-index: 2;
            }
            .preloader-logo-wrap {
              position: relative;
              width: 96px;
              height: 96px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .preloader-logo-ring {
              position: absolute;
              inset: 0;
              border-radius: 50%;
              border: 2px solid transparent;
            }
            .preloader-logo-ring-outer {
              border-top-color: rgba(74, 222, 128, 0.7);
              box-shadow: 0 0 18px rgba(74, 222, 128, 0.3);
            }
            .preloader-logo-ring-inner {
              inset: 10px;
              border-bottom-color: rgba(250, 204, 21, 0.6);
            }
            .preloader-logo-icon {
              font-size: 2.2rem;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .preloader-brand {
              font-family: 'Outfit', system-ui, -apple-system, sans-serif;
              font-size: 2.6rem;
              font-weight: 900;
              color: #e2f0e4;
              letter-spacing: -0.05em;
              display: flex;
              align-items: center;
              gap: 2px;
            }
            .preloader-brand-krishi {
              color: #e2f0e4;
            }
            .preloader-brand-ai {
              background: linear-gradient(90deg, #4ade80, #86efac, #4ade80);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .preloader-tagline {
              font-size: 0.95rem;
              color: #86efac;
              font-weight: 500;
              letter-spacing: 0.02em;
              margin-top: -0.4rem;
            }
            .preloader-bar-track {
              width: 260px;
              height: 4px;
              border-radius: 999px;
              background: rgba(134, 239, 172, 0.1);
              overflow: hidden;
            }
            .preloader-bar-fill {
              height: 100%;
              background: linear-gradient(90deg, #166534, #4ade80, #86efac);
              position: relative;
              overflow: hidden;
            }
            .preloader-bar-shine {
              position: absolute;
              inset: 0;
              background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%);
              animation: preloaderShine 1.4s linear infinite;
            }
            @keyframes preloaderShine {
              from { transform: translateX(-100%); }
              to { transform: translateX(200%); }
            }
            .preloader-progress-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 260px;
            }
            .preloader-status {
              font-family: 'Inter', sans-serif;
              font-size: 0.78rem;
              color: rgba(134, 239, 172, 0.6);
              font-weight: 500;
            }
            .preloader-pct {
              font-family: 'Outfit', sans-serif;
              font-size: 0.85rem;
              color: #4ade80;
              font-weight: 700;
            }
            @keyframes preloaderGlowPulse {
              0% { opacity: 0.6; transform: scale(1); }
              100% { opacity: 1; transform: scale(1.12); }
            }
            .preloader-particle {
              position: absolute;
              border-radius: 50%;
              pointer-events: none;
              will-change: transform, opacity;
            }
            @keyframes particleFloat {
              0%, 100% { transform: translate(0, 0); opacity: var(--op); }
              33% { transform: translate(8px, -18px); opacity: calc(var(--op) * 1.4); }
              66% { transform: translate(-10px, -6px); opacity: calc(var(--op) * 0.7); }
            }
          `}</style>

          {/* Ambient glows */}
          <motion.div
            className="preloader-glow preloader-glow-1"
            animate={{ scale: [1, 1.14, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="preloader-glow preloader-glow-2"
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          />

          {/* Grid */}
          <div className="preloader-grid" />

          {/* Floating particles */}
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="preloader-particle"
              style={{
                width: p.size,
                height: p.size,
                background: p.color,
                top: p.top,
                left: p.left,
                '--op': p.opacity,
                animation: `particleFloat ${p.dur}s ease-in-out ${i * 0.28}s infinite`,
              }}
            />
          ))}

          {/* Central content */}
          <motion.div variants={container} initial="hidden" animate="show" className="preloader-content">
            {/* Logo */}
            <motion.div variants={item} className="preloader-logo-wrap">
              <motion.div
                className="preloader-logo-ring preloader-logo-ring-outer"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
              <motion.div
                className="preloader-logo-ring preloader-logo-ring-inner"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
              <motion.span
                className="preloader-logo-icon"
                animate={{ scale: [1, 1.09, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                {icon}
              </motion.span>
            </motion.div>

            {/* Brand */}
            <motion.div variants={item} className="preloader-brand">
              <span className="preloader-brand-krishi">Krishi</span>
              <span className="preloader-brand-ai">AI</span>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={item} className="preloader-tagline">
              {tagline}
            </motion.p>

            {/* Progress bar */}
            <motion.div variants={item} className="preloader-bar-track">
              <motion.div
                className="preloader-bar-fill"
                style={{ width: `${rawProgress}%` }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              >
                <div className="preloader-bar-shine" />
              </motion.div>
            </motion.div>

            {/* Status row */}
            <motion.div variants={item} className="preloader-progress-row">
              <AnimatePresence mode="wait">
                <motion.span
                  key={getStatus(displayPct)}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="preloader-status"
                >
                  {getStatus(displayPct)}
                </motion.span>
              </AnimatePresence>
              <motion.span className="preloader-pct">{displayPct}%</motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
