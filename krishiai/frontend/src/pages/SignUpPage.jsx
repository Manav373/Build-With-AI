import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export default function SignUpPage() {
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
        background: '#050e07',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Back button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 100,
          background: 'rgba(22,101,52,0.18)',
          border: '1px solid rgba(74,222,128,0.22)',
          borderRadius: '50px',
          padding: '0.5rem 1rem',
          color: 'rgba(74,222,128,0.8)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
        }}
        id="signup-back-btn"
        aria-label="Go back"
      >
        <ArrowLeft size={15} />
        Back
      </motion.button>

      {/* Background video */}
      <div className="landing-bg-container">
        <video className="landing-bg-video" autoPlay loop muted playsInline preload="auto">
          <source src="https://cdn.pixabay.com/video/2021/08/04/83818-584758509_large.mp4" type="video/mp4" />
        </video>
        <div className="landing-bg-overlay" />
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', top: '-5%', right: '-10%', background: 'radial-gradient(circle,rgba(22,101,52,0.25),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', bottom: '0%', left: '-10%', background: 'radial-gradient(circle,rgba(22,101,52,0.18),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}
      >
        {/* Logo + title */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 0 20px rgba(74,222,128,0.4))' }}>🌾</div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.9rem', color: '#f0fdf4', letterSpacing: '-0.02em', margin: 0 }}>
            Krishi<span style={{ color: '#4ade80' }}>AI</span>
          </h1>
          <p style={{ color: 'rgba(134,239,172,0.6)', fontSize: '0.88rem', marginTop: '0.4rem', fontWeight: 500 }}>
            Join KrishiAI as a Customer
          </p>
          <p style={{ color: 'rgba(134,239,172,0.35)', fontSize: '0.76rem', marginTop: '0.2rem' }}>
            Selling products?{' '}
            <button
              type="button"
              onClick={() => navigate('/vendor-type-select')}
              style={{ color: '#facc15', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              id="signup-switch-vendor"
            >
              Sign up as Vendor
            </button>
          </p>
        </div>

        {/* Clerk SignUp */}
        <SignUp
          routing="path"
          path="/sign-up"
          afterSignInUrl="/chat"
          afterSignUpUrl="/chat"
          appearance={{
            variables: {
              colorPrimary: '#16a34a',
              colorBackground: 'rgba(8,18,11,0.96)',
              colorInputBackground: 'rgba(13,31,17,0.85)',
              colorInputText: '#e2f0e4',
              colorText: '#e2f0e4',
              colorTextSecondary: 'rgba(134,239,172,0.6)',
              colorNeutral: '#86efac',
              borderRadius: '0.9rem',
              fontFamily: "'Inter', system-ui, sans-serif",
            },
            elements: {
              card: {
                border: '1px solid rgba(134,239,172,0.18)',
                boxShadow: '0 30px 90px rgba(0,0,0,0.7), 0 0 60px rgba(22,101,52,0.12)',
                backdropFilter: 'blur(24px)',
                background: 'rgba(8,18,11,0.96)',
              },
              headerTitle: { color: '#f0fdf4', fontWeight: 700 },
              headerSubtitle: { color: 'rgba(134,239,172,0.6)' },
              socialButtonsBlockButton: {
                background: 'rgba(22,101,52,0.15)',
                border: '1px solid rgba(134,239,172,0.2)',
                color: '#e2f0e4',
              },
              dividerLine: { background: 'rgba(134,239,172,0.12)' },
              dividerText: { color: 'rgba(134,239,172,0.4)' },
              formButtonPrimary: {
                background: 'linear-gradient(135deg,#166534,#15803d)',
                boxShadow: '0 0 20px rgba(22,101,52,0.5)',
              },
              footerActionLink: { color: '#4ade80' },
            },
          }}
        />
      </motion.div>
    </div>
  );
}
