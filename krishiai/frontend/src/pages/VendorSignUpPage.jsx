import React from 'react';
import { SignUp } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Store, ShieldCheck, TrendingUp, Users, Factory, RefreshCw } from 'lucide-react';

const TYPE_BADGES = {
  procurement: { title: 'Procurement Vendor', emoji: '🏭', color: '#f59e0b' },
  seller: { title: 'Agri Input Seller', emoji: '🏪', color: '#4ade80' },
  hybrid: { title: 'Hybrid Vendor', emoji: '🔄', color: '#a78bfa' },
};

export default function VendorSignUpPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorType = searchParams.get('type');
  const selectedTypeInfo = vendorType ? TYPE_BADGES[vendorType] : null;

  const afterSignUpTarget = vendorType ? `/vendor-onboarding?type=${vendorType}` : '/vendor-type-select';

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
        onClick={() => navigate(-1)}
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
        id="vendor-signup-back-btn"
      >
        <ArrowLeft size={15} />
        Back
      </motion.button>

      {/* Decorative Background Blur Blobs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', top: -120, left: -100, background: 'radial-gradient(circle, rgba(161,98,7,0.25), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 350, height: 350, borderRadius: '50%', bottom: -100, right: -80, background: 'radial-gradient(circle, rgba(22,101,52,0.2), transparent 70%)', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '100%',
          maxWidth: 480,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          zIndex: 1,
        }}
      >
        {/* Vendor Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.4rem' }}>
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #713f12, #facc15)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              marginBottom: '0.75rem',
              boxShadow: '0 8px 24px rgba(250,204,21,0.3)',
            }}
          >
            🏪
          </div>
          <h1
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.8rem',
              fontWeight: 900,
              color: '#fff',
              margin: '0 0 0.25rem',
              letterSpacing: '-0.02em',
            }}
          >
            Krishi<span style={{ color: '#facc15' }}>AI</span> Vendor Portal
          </h1>
          <p style={{ color: 'rgba(250,204,21,0.7)', fontSize: '0.88rem', margin: 0, fontWeight: 500 }}>
            Grow your agri-business & reach thousands of local farmers
          </p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.76rem', marginTop: '0.3rem' }}>
            Looking to buy?{' '}
            <button
              type="button"
              onClick={() => navigate('/sign-up')}
              style={{ color: '#4ade80', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 'inherit', padding: 0, textDecoration: 'underline', textUnderlineOffset: '2px' }}
              id="vendor-signup-switch-customer"
            >
              Sign up as Customer
            </button>
          </p>
        </div>

        {/* Benefits bar */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.5rem',
            width: '100%',
            marginBottom: '1.25rem',
            padding: '0.6rem',
            borderRadius: '0.85rem',
            background: 'rgba(113,63,18,0.15)',
            border: '1px solid rgba(250,204,21,0.2)',
          }}
        >
          {[
            { icon: Store, text: 'Digital Storefront' },
            { icon: Users, text: 'Direct Farmer Reach' },
            { icon: TrendingUp, text: 'Sales Analytics' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDir: 'column', alignItems: 'center', textAlign: 'center', gap: '0.2rem' }}>
              <item.icon size={15} style={{ color: '#facc15' }} />
              <span style={{ fontSize: '0.68rem', color: 'rgba(250,204,21,0.85)', fontWeight: 600 }}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* Pre-selected Vendor Type Badge */}
        {selectedTypeInfo && (
          <div
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '20px',
              background: `${selectedTypeInfo.color}18`,
              border: `1px solid ${selectedTypeInfo.color}40`,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span>{selectedTypeInfo.emoji}</span>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: selectedTypeInfo.color }}>
              Selected: {selectedTypeInfo.title}
            </span>
          </div>
        )}

        {/* Clerk Sign Up Component with Gold Appearance */}
        <div
          style={{
            width: '100%',
            borderRadius: '1.5rem',
            overflow: 'hidden',
            boxShadow: '0 24px 80px rgba(0,0,0,0.7)',
          }}
        >
          <SignUp
            path="/vendor-sign-up"
            routing="path"
            signInUrl="/sign-in"
            afterSignUpUrl={afterSignUpTarget}
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
                  background: 'rgba(12,22,13,0.92)',
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
      </motion.div>
    </div>
  );
}
