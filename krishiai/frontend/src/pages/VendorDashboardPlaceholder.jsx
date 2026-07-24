import React from 'react';
import { useOutletContext, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Construction, ArrowLeft } from 'lucide-react';

/**
 * Placeholder page for vendor dashboard sections that are still under development.
 * Shows the section name and a coming-soon message.
 */
export default function VendorDashboardPlaceholder() {
  const context = useOutletContext() || {};
  const { config = {} } = context;
  const location = useLocation();

  // Extract section name from path
  const pathParts = location.pathname.split('/').filter(Boolean);
  const sectionSlug = pathParts[pathParts.length - 1] || 'section';
  const sectionName = sectionSlug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '80vh', padding: '2rem',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: 420 }}
      >
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: `${config.color || '#facc15'}10`,
          border: `1px solid ${config.color || '#facc15'}25`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.25rem',
        }}>
          <Construction size={32} style={{ color: config.color || '#facc15' }} />
        </div>

        <h2 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem',
          fontWeight: 900, color: '#fff', marginBottom: '0.5rem',
        }}>
          {sectionName}
        </h2>
        <p style={{
          color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.6,
          marginBottom: '1.5rem',
        }}>
          This module is being built as part of the KrishiAI vendor ecosystem.
          It will be available in an upcoming release.
        </p>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '8px 16px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600,
        }}>
          🚧 Coming Soon — Phase 2 & 3
        </div>
      </motion.div>
    </div>
  );
}
