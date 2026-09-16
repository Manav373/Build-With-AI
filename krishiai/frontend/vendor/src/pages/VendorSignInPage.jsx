import React, { useState } from 'react';
import { SignIn } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, Lock, CheckCircle2 } from 'lucide-react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const isClerkEnabled = PUBLISHABLE_KEY && PUBLISHABLE_KEY !== 'pk_test_placeholder_key';

export default function VendorSignInPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/vendor-dashboard';

  // Demo fallback state if Clerk is offline or disabled
  const [phoneOrEmail, setPhoneOrEmail] = useState('vendor@krishiai.com');
  const [password, setPassword] = useState('Vendor@1234');
  const [loading, setLoading] = useState(false);

  const handleDemoLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(redirectTarget);
    }, 600);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #070d06 0%, #161204 50%, #080d07 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        position: 'relative',
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Back button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate('/vendors')}
        style={{
          position: 'fixed',
          top: '1.5rem',
          left: '1.5rem',
          zIndex: 100,
          background: 'rgba(113,63,18,0.25)',
          border: '1px solid rgba(250,204,21,0.3)',
          borderRadius: '50px',
          padding: '0.5rem 1rem',
          color: '#facc15',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.82rem',
          fontWeight: 600,
          backdropFilter: 'blur(10px)',
        }}
        id="vendor-signin-back-btn"
      >
        <ArrowLeft size={15} />
        Marketplace
      </motion.button>

      {/* Decorative Glow Elements */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: -120, left: -100, background: 'radial-gradient(circle, rgba(161,98,7,0.25), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', bottom: -100, right: -80, background: 'radial-gradient(circle, rgba(22,101,52,0.2), transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 460,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #713f12, #facc15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.7rem',
              marginBottom: '0.75rem',
              boxShadow: '0 8px 24px rgba(250,204,21,0.3)',
            }}
          >
            🏪
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.85rem',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 0.3rem',
              letterSpacing: '-0.02em',
            }}
          >
            Vendor <span style={{ color: '#facc15' }}>Sign In</span>
          </h1>
          <p style={{ color: 'rgba(250,204,21,0.75)', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Access your B2B store, procurement orders & buyer inquiries
          </p>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.78rem', marginTop: '0.4rem' }}>
            New to KrishiAI Vendor?{' '}
            <button
              type="button"
              onClick={() => navigate('/vendor-sign-up')}
              style={{ color: '#facc15', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, textDecoration: 'underline', padding: 0 }}
            >
              Register here
            </button>
          </p>
        </div>

        {/* Clerk Sign In or Fallback Demo Form */}
        {isClerkEnabled ? (
          <div
            style={{
              width: '100%',
              borderRadius: '1.5rem',
              overflow: 'hidden',
              boxShadow: '0 24px 80px rgba(0,0,0,0.75)',
            }}
          >
            <SignIn
              path="/vendor-sign-in"
              routing="path"
              signUpUrl="/vendor-sign-up"
              afterSignInUrl={redirectTarget}
              appearance={{
                variables: {
                  colorPrimary: '#facc15',
                  colorBackground: '#0a1a0d',
                  colorText: '#ffffff',
                  colorTextSecondary: '#94a3b8',
                  colorInputBackground: 'rgba(255, 255, 255, 0.07)',
                  colorInputText: '#ffffff',
                  colorTextOnPrimaryBackground: '#0a1a0d',
                  borderRadius: '0.85rem',
                  fontFamily: "'Inter', system-ui, sans-serif",
                },
                elements: {
                  card: {
                    background: 'rgba(10, 24, 13, 0.96)',
                    border: '1px solid rgba(250, 204, 21, 0.25)',
                    backdropFilter: 'blur(24px)',
                    padding: '2.25rem 2rem',
                    boxShadow: '0 25px 70px rgba(0, 0, 0, 0.85), 0 0 40px rgba(234, 179, 8, 0.08)',
                  },
                  headerTitle: {
                    color: '#ffffff',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.45rem',
                    fontWeight: 800,
                    letterSpacing: '-0.01em',
                  },
                  headerSubtitle: {
                    color: '#cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: 400,
                  },
                  socialButtonsBlockButton: {
                    background: 'rgba(255, 255, 255, 0.08) !important',
                    border: '1px solid rgba(255, 255, 255, 0.2) !important',
                    color: '#ffffff !important',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                  },
                  socialButtonsBlockButtonText: {
                    color: '#ffffff !important',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    opacity: 1,
                  },
                  socialButtonsBlockButton__google: {
                    color: '#ffffff !important',
                  },
                  dividerRow: {
                    margin: '1.25rem 0',
                  },
                  dividerLine: {
                    background: 'rgba(255, 255, 255, 0.18)',
                  },
                  dividerText: {
                    color: '#94a3b8',
                    fontWeight: 600,
                    fontSize: '0.82rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  },
                  formFieldLabel: {
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    marginBottom: '0.4rem',
                  },
                  formFieldInput: {
                    background: 'rgba(255, 255, 255, 0.07) !important',
                    border: '1px solid rgba(255, 255, 255, 0.18) !important',
                    color: '#ffffff !important',
                    fontSize: '0.92rem',
                    borderRadius: '0.75rem',
                  },
                  formButtonPrimary: {
                    background: 'linear-gradient(135deg, #facc15 0%, #eab308 100%) !important',
                    color: '#000000 !important',
                    fontWeight: '800 !important',
                    fontSize: '0.95rem !important',
                    boxShadow: '0 4px 20px rgba(250, 204, 21, 0.4) !important',
                    borderRadius: '0.75rem',
                    padding: '0.75rem',
                  },
                  footerActionText: {
                    color: '#94a3b8',
                    fontSize: '0.85rem',
                  },
                  footerActionLink: {
                    color: '#facc15',
                    fontWeight: 700,
                  },
                  identityPreviewText: {
                    color: '#ffffff',
                    fontWeight: 600,
                  },
                  identityPreviewEditButton: {
                    color: '#facc15',
                  },
                  formFieldAction: {
                    color: '#facc15',
                    fontWeight: 600,
                  },
                },
              }}
            />
          </div>
        ) : (
          <form
            onSubmit={handleDemoLogin}
            style={{
              width: '100%',
              background: 'rgba(12,22,13,0.92)',
              border: '1px solid rgba(250,204,21,0.25)',
              borderRadius: '1.25rem',
              padding: '1.75rem',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
          >
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#facc15', fontWeight: 600, marginBottom: '0.4rem' }}>
                Email / Phone Number
              </label>
              <input
                type="text"
                value={phoneOrEmail}
                onChange={(e) => setPhoneOrEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(250,204,21,0.25)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#facc15', fontWeight: 600, marginBottom: '0.4rem' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  borderRadius: '0.65rem',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(250,204,21,0.25)',
                  color: '#fff',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.85rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: 'linear-gradient(135deg, #713f12 0%, #a16207 60%, #facc15 100%)',
                color: '#1c0e00',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              {loading ? 'Authenticating...' : 'Sign In to Vendor Dashboard →'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
