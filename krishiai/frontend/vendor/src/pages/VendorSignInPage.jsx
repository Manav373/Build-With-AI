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
                  colorBackground: '#0d180e',
                  colorText: '#f0fdf4',
                  colorTextSecondary: 'rgba(250,204,21,0.7)',
                  colorInputBackground: 'rgba(255,255,255,0.05)',
                  colorInputText: '#fff',
                  borderRadius: '0.75rem',
                },
                elements: {
                  card: {
                    background: 'rgba(12,22,13,0.94)',
                    border: '1px solid rgba(250,204,21,0.22)',
                    backdropFilter: 'blur(20px)',
                    padding: '2rem',
                  },
                  headerTitle: { color: '#fff', fontFamily: "'Outfit', sans-serif" },
                  headerSubtitle: { color: 'rgba(250,204,21,0.7)' },
                  formButtonPrimary: {
                    background: 'linear-gradient(135deg, #713f12 0%, #a16207 60%, #facc15 100%)',
                    color: '#1c0e00',
                    fontWeight: '800',
                    boxShadow: '0 4px 20px rgba(250,204,21,0.3)',
                  },
                  footerActionLink: { color: '#facc15' },
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
