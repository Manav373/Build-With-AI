import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function SignInPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        background: theme === 'light' ? '#f8faf7' : '#050e07',
        fontFamily: "'Inter', system-ui, sans-serif",
        transition: 'background 0.3s ease',
        padding: '1.5rem 1rem',
      }}
    >
      {/* Top Bar: Back to Home + 2-Mode Theme Toggle */}
      <div
        style={{
          position: 'fixed',
          top: '1.25rem',
          left: '1.25rem',
          right: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        {/* Back Button */}
        <button
          type="button"
          onClick={() => navigate('/')}
          style={{
            pointerEvents: 'auto',
            background: theme === 'light' ? 'rgba(255, 255, 255, 0.9)' : 'rgba(22, 101, 52, 0.2)',
            border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(74, 222, 128, 0.25)',
            borderRadius: '9999px',
            padding: '0.5rem 1.1rem',
            color: theme === 'light' ? '#0f172a' : '#86efac',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            backdropFilter: 'blur(12px)',
            boxShadow: theme === 'light' ? '0 4px 14px rgba(0,0,0,0.06)' : '0 4px 18px rgba(0,0,0,0.4)',
            transition: 'all 0.2s ease',
          }}
          aria-label="Back to Home"
        >
          <ArrowLeft size={16} />
          <span>Home</span>
        </button>

        {/* 2-Mode Switch: Light & Dark */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            background: theme === 'light' ? 'rgba(241, 245, 249, 0.92)' : 'rgba(10, 26, 13, 0.88)',
            padding: '4px',
            borderRadius: '9999px',
            border: theme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(74, 222, 128, 0.25)',
            backdropFilter: 'blur(16px)',
            boxShadow: theme === 'light' ? '0 4px 14px rgba(0,0,0,0.06)' : '0 4px 20px rgba(0,0,0,0.4)',
          }}
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: theme === 'light' ? '#ffffff' : 'transparent',
              color: theme === 'light' ? '#166534' : 'rgba(226, 240, 228, 0.65)',
              boxShadow: theme === 'light' ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
            }}
          >
            <Sun size={15} style={{ color: theme === 'light' ? '#d97706' : 'inherit' }} />
            <span>Light</span>
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '9999px',
              fontSize: '0.82rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              background: theme === 'dark' ? '#166534' : 'transparent',
              color: theme === 'dark' ? '#4ade80' : '#64748b',
              boxShadow: theme === 'dark' ? '0 2px 10px rgba(22, 101, 52, 0.5)' : 'none',
            }}
          >
            <Moon size={15} style={{ color: theme === 'dark' ? '#a78bfa' : 'inherit' }} />
            <span>Dark</span>
          </button>
        </div>
      </div>

      {/* Background video */}
      <div className="landing-bg-container" style={{ opacity: theme === 'light' ? 0.05 : 1 }}>
        <video className="landing-bg-video" autoPlay loop muted playsInline preload="auto">
          <source src="https://cdn.pixabay.com/video/2021/08/04/83818-584758509_large.mp4" type="video/mp4" />
        </video>
        <div className="landing-bg-overlay" />
      </div>

      {/* Glow orbs */}
      <div
        style={{
          position: 'absolute',
          width: 500,
          height: 500,
          borderRadius: '50%',
          top: '-5%',
          right: '-10%',
          background: theme === 'light' ? 'radial-gradient(circle,rgba(22,163,74,0.08),transparent 70%)' : 'radial-gradient(circle,rgba(22,101,52,0.25),transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 400,
          height: 400,
          borderRadius: '50%',
          bottom: '0%',
          left: '-10%',
          background: theme === 'light' ? 'radial-gradient(circle,rgba(22,163,74,0.06),transparent 70%)' : 'radial-gradient(circle,rgba(22,101,52,0.18),transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
          maxWidth: '480px',
          width: '100%',
          marginTop: '2.5rem',
        }}
      >
        {/* Logo + title */}
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: '3rem',
              marginBottom: '0.5rem',
              filter: theme === 'light' ? 'drop-shadow(0 0 10px rgba(22,163,74,0.25))' : 'drop-shadow(0 0 20px rgba(74,222,128,0.4))',
            }}
          >
            🌾
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              fontSize: '2rem',
              color: theme === 'light' ? '#0f172a' : '#f0fdf4',
              letterSpacing: '-0.02em',
              margin: 0,
            }}
          >
            Krishi<span style={{ color: theme === 'light' ? '#166534' : '#4ade80' }}>AI</span>
          </h1>
          <p
            style={{
              color: theme === 'light' ? '#475569' : 'rgba(134,239,172,0.7)',
              fontSize: '0.9rem',
              marginTop: '0.35rem',
              fontWeight: 500,
            }}
          >
            Your personal agricultural advisor
          </p>
          <p
            style={{
              color: theme === 'light' ? '#64748b' : 'rgba(134,239,172,0.5)',
              fontSize: '0.8rem',
              marginTop: '0.3rem',
            }}
          >
            Are you a Vendor?{' '}
            <button
              type="button"
              onClick={() => navigate('/vendor-sign-in')}
              style={{
                color: theme === 'light' ? '#166534' : '#facc15',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 'inherit',
                padding: 0,
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
              id="signin-switch-vendor"
            >
              Sign in as Vendor
            </button>
          </p>
        </div>

        {/* Clerk SignIn */}
        <SignIn
          routing="path"
          path="/sign-in"
          afterSignInUrl="/chat"
          afterSignUpUrl="/chat"
          appearance={{
            variables: {
              colorPrimary: '#16a34a',
              colorBackground: theme === 'light' ? '#ffffff' : 'rgba(8,18,11,0.96)',
              colorInputBackground: theme === 'light' ? '#f8fafc' : 'rgba(13,31,17,0.85)',
              colorInputText: theme === 'light' ? '#0f172a' : '#e2f0e4',
              colorText: theme === 'light' ? '#0f172a' : '#e2f0e4',
              colorTextSecondary: theme === 'light' ? '#475569' : 'rgba(134,239,172,0.6)',
              colorNeutral: theme === 'light' ? '#0f172a' : '#86efac',
              borderRadius: '0.9rem',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            elements: {
              card: {
                border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(134,239,172,0.18)',
                boxShadow: theme === 'light' ? '0 20px 50px rgba(0,0,0,0.06)' : '0 30px 90px rgba(0,0,0,0.7), 0 0 60px rgba(22,101,52,0.12)',
                backdropFilter: 'blur(24px)',
                background: theme === 'light' ? '#ffffff' : 'rgba(8,18,11,0.96)',
              },
              headerTitle: { color: theme === 'light' ? '#0f172a' : '#f0fdf4', fontWeight: 700 },
              headerSubtitle: { color: theme === 'light' ? '#64748b' : 'rgba(134,239,172,0.6)' },
              socialButtonsBlockButton: {
                background: theme === 'light' ? '#f8fafc' : 'rgba(22,101,52,0.15)',
                border: theme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(134,239,172,0.2)',
                color: theme === 'light' ? '#0f172a' : '#e2f0e4',
              },
              dividerLine: { background: theme === 'light' ? '#e2e8f0' : 'rgba(134,239,172,0.12)' },
              dividerText: { color: theme === 'light' ? '#94a3b8' : 'rgba(134,239,172,0.4)' },
              formButtonPrimary: {
                background: 'linear-gradient(135deg,#166534,#15803d)',
                boxShadow: theme === 'light' ? '0 4px 14px rgba(22,101,52,0.3)' : '0 0 20px rgba(22,101,52,0.5)',
              },
              footerActionLink: { color: theme === 'light' ? '#166534' : '#4ade80', fontWeight: 600 },
            },
          }}
        />
      </motion.div>
    </div>
  );
}
