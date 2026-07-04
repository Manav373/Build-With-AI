import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';

const PARTICLES = [
  { size: 4, color: '#4ade80', opacity: 0.55, top: '14%',  left: '18%',  dur: 5.8 },
  { size: 3, color: '#86efac', opacity: 0.40, top: '24%',  left: '76%',  dur: 7.5 },
  { size: 5, color: '#facc15', opacity: 0.30, top: '62%',  left: '9%',   dur: 6.8 },
  { size: 3, color: '#4ade80', opacity: 0.50, top: '81%',  left: '84%',  dur: 8.9 },
  { size: 4, color: '#86efac', opacity: 0.35, top: '41%',  left: '4%',   dur: 10.5},
  { size: 3, color: '#4ade80', opacity: 0.42, top: '71%',  left: '56%',  dur: 6.2 },
  { size: 5, color: '#86efac', opacity: 0.22, top: '9%',   left: '51%',  dur: 9.8 },
  { size: 3, color: '#facc15', opacity: 0.32, top: '91%',  left: '29%',  dur: 8.2 },
  { size: 4, color: '#4ade80', opacity: 0.45, top: '50%',  left: '93%',  dur: 7.2 },
  { size: 3, color: '#86efac', opacity: 0.28, top: '32%',  left: '41%',  dur: 9.2 },
  { size: 5, color: '#4ade80', opacity: 0.18, top: '4%',   left: '87%',  dur: 11.5},
  { size: 3, color: '#facc15', opacity: 0.38, top: '76%',  left: '61%',  dur: 6.5 },
];

const STATUS_LABELS = ['Initializing…', 'Loading data…', 'Preparing advisor…', 'Almost ready…', '✓ Ready!'];

function getStatus(p) {
  if (p < 30)  return STATUS_LABELS[0];
  if (p < 60)  return STATUS_LABELS[1];
  if (p < 85)  return STATUS_LABELS[2];
  if (p < 100) return STATUS_LABELS[3];
  return STATUS_LABELS[4];
}

export default function Preloader({ onDone }) {
  const [done, setDone] = useState(false);
  const [rawProgress, setRawProgress] = useState(0);

  // Springy display value so the number ticks smoothly
  const motionProgress = useMotionValue(0);
  const springProgress = useSpring(motionProgress, { stiffness: 60, damping: 20 });
  const [displayPct, setDisplayPct] = useState(0);

  useEffect(() => {
    const unsub = springProgress.on('change', v => setDisplayPct(Math.round(v)));
    return unsub;
  }, [springProgress]);

  // Drive the raw progress through timed steps
  useEffect(() => {
    const steps = [
      { to: 25,  delay: 0   },
      { to: 55,  delay: 420 },
      { to: 82,  delay: 900 },
      { to: 100, delay: 1300},
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Staggered child entrance
  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.05 } },
  };
  const item = {
    hidden: { opacity: 0, y: 18, scale: 0.95 },
    show:   { opacity: 1, y: 0,  scale: 1,    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] } },
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

          {/* Floating particles (CSS-driven for performance) */}
          {PARTICLES.map((p, i) => (
            <div
              key={i}
              className="preloader-particle"
              style={{
                width: p.size, height: p.size,
                background: p.color,
                top: p.top, left: p.left,
                '--op': p.opacity,
                animation: `particleFloat ${p.dur}s ease-in-out ${i * 0.28}s infinite`,
              }}
            />
          ))}

          {/* ── Central content ── */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="preloader-content"
          >
            {/* Logo */}
            <motion.div variants={item} className="preloader-logo-wrap">
              {/* Outer ring */}
              <motion.div
                className="preloader-logo-ring preloader-logo-ring-outer"
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
              {/* Inner ring */}
              <motion.div
                className="preloader-logo-ring preloader-logo-ring-inner"
                animate={{ rotate: -360 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
              />
              {/* Icon */}
              <motion.span
                className="preloader-logo-icon"
                animate={{ scale: [1, 1.09, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                🌾
              </motion.span>
            </motion.div>

            {/* Brand */}
            <motion.div variants={item} className="preloader-brand">
              <span className="preloader-brand-krishi">Krishi</span>
              <span className="preloader-brand-ai">AI</span>
            </motion.div>

            {/* Tagline */}
            <motion.p variants={item} className="preloader-tagline">
              Your Personal Agricultural Advisor
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
                  exit={{   opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="preloader-status"
                >
                  {getStatus(displayPct)}
                </motion.span>
              </AnimatePresence>
              <motion.span className="preloader-pct">
                {displayPct}%
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
