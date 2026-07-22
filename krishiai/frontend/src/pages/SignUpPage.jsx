import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';

export default function SignUpPage() {
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
            Join thousands of farmers using AI
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
