import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Factory, Store, RefreshCw, ArrowLeft, ArrowRight,
  CheckCircle2, XCircle, Wheat, Package, TrendingUp,
  Users, Warehouse, ShoppingCart, BarChart3, Truck,
  Shield, Sparkles
} from 'lucide-react';

const VENDOR_TYPES = [
  {
    id: 'procurement',
    title: 'Procurement Vendor',
    subtitle: 'Crop Buyer',
    icon: Factory,
    emoji: '🏭',
    color: '#f59e0b',
    gradientFrom: '#92400e',
    gradientTo: '#f59e0b',
    description: 'Purchase agricultural produce directly from farmers in bulk.',
    examples: ['Grain Trader', 'Rice Mill', 'Cotton Buyer', 'APMC Trader', 'Export Company', 'FPO'],
    canDo: [
      'Create Buying Requirements',
      'Receive Farmer Crop Offers',
      'Negotiate Prices',
      'Schedule Pickups',
      'Manage Warehouse',
      'View Procurement Analytics',
    ],
    cannotDo: [
      'Sell Products on Marketplace',
      'Create Product Listings',
      'Receive Product Orders',
    ],
    stats: { icon: Wheat, label: 'Crops', value: 'Buy' },
  },
  {
    id: 'seller',
    title: 'Agri Input Vendor',
    subtitle: 'Product Seller',
    icon: Store,
    emoji: '🏪',
    color: '#4ade80',
    gradientFrom: '#14532d',
    gradientTo: '#4ade80',
    description: 'Sell agricultural products, seeds, fertilizers, and equipment to farmers.',
    examples: ['Seed Dealer', 'Fertilizer Shop', 'Pesticide Dealer', 'Equipment Store', 'Nursery', 'Organic Seller'],
    canDo: [
      'List & Sell Products',
      'Manage Inventory',
      'Process Customer Orders',
      'Run Promotions & Discounts',
      'Track Sales Analytics',
      'Receive Customer Payments',
    ],
    cannotDo: [
      'Purchase Crops from Farmers',
      'Create Buying Requirements',
      'Manage Procurement',
    ],
    stats: { icon: Package, label: 'Products', value: 'Sell' },
  },
  {
    id: 'hybrid',
    title: 'Hybrid Vendor',
    subtitle: 'Buy & Sell Both',
    icon: RefreshCw,
    emoji: '🔄',
    color: '#a78bfa',
    gradientFrom: '#3b0764',
    gradientTo: '#a78bfa',
    description: 'Operate as both a crop buyer and product seller with one unified account.',
    examples: ['Agro Center', 'Agricultural Retail Chain', 'Cooperative Society', 'FPO Business Center', 'Large Agri Company'],
    canDo: [
      'Everything from Procurement',
      'Everything from Selling',
      'Unified Dashboard & Analytics',
      'Combined Payment Ledger',
      'Cross-Business Insights',
      'Mode Switching (Buy/Sell)',
    ],
    cannotDo: [],
    stats: { icon: TrendingUp, label: 'Both', value: 'Buy+Sell' },
    recommended: true,
  },
];

export default function VendorTypeSelectionPage() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/vendor-onboarding?type=${selectedType}`);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #030712 0%, #0a1628 40%, #030712 100%)',
        fontFamily: "'Inter', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background decorations */}
      <div style={{ position: 'absolute', top: -200, left: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: -200, right: -200, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(74,222,128,0.06), transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(167,139,250,0.04), transparent 70%)', pointerEvents: 'none' }} />

      {/* Back Button */}
      <motion.button
        type="button"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        onClick={() => navigate(-1)}
        style={{
          position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 100,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '50px', padding: '0.5rem 1rem', color: '#e2e8f0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem',
          fontSize: '0.82rem', fontWeight: 600, backdropFilter: 'blur(10px)',
        }}
        id="vendor-type-back-btn"
      >
        <ArrowLeft size={15} /> Back
      </motion.button>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: 'center', marginBottom: '3rem' }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'linear-gradient(135deg, #713f12, #facc15)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', marginBottom: '1rem',
            boxShadow: '0 8px 32px rgba(250,204,21,0.25)',
          }}>
            🏪
          </div>
          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            fontWeight: 900, color: '#fff', margin: '0 0 0.5rem',
            letterSpacing: '-0.03em', lineHeight: 1.2,
          }}>
            Choose Your <span style={{ color: '#facc15' }}>Business Type</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
            Select how you want to operate on KrishiAI. This determines your dashboard, features, and capabilities.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem',
        }}>
          {VENDOR_TYPES.map((type, index) => {
            const isSelected = selectedType === type.id;
            const isHovered = hoveredType === type.id;
            const Icon = type.icon;

            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setHoveredType(type.id)}
                onMouseLeave={() => setHoveredType(null)}
                onClick={() => setSelectedType(type.id)}
                style={{
                  position: 'relative',
                  borderRadius: '1.25rem',
                  padding: '1.5rem',
                  cursor: 'pointer',
                  background: isSelected
                    ? `linear-gradient(135deg, ${type.gradientFrom}22, ${type.gradientTo}11)`
                    : 'rgba(255,255,255,0.03)',
                  border: `2px solid ${isSelected ? type.color + '80' : isHovered ? type.color + '30' : 'rgba(255,255,255,0.08)'}`,
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)',
                  boxShadow: isSelected ? `0 8px 40px ${type.color}15` : 'none',
                }}
                id={`vendor-type-card-${type.id}`}
              >
                {/* Recommended Badge */}
                {type.recommended && (
                  <div style={{
                    position: 'absolute', top: -10, right: 16,
                    background: `linear-gradient(135deg, ${type.gradientFrom}, ${type.gradientTo})`,
                    color: '#fff', padding: '3px 12px', borderRadius: 20,
                    fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em',
                    display: 'flex', alignItems: 'center', gap: 4,
                    boxShadow: `0 4px 12px ${type.color}40`,
                  }}>
                    <Sparkles size={10} /> RECOMMENDED
                  </div>
                )}

                {/* Selected Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    style={{
                      position: 'absolute', top: 12, right: 12,
                      width: 28, height: 28, borderRadius: '50%',
                      background: type.color, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <CheckCircle2 size={16} style={{ color: '#000' }} />
                  </motion.div>
                )}

                {/* Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: `linear-gradient(135deg, ${type.gradientFrom}, ${type.gradientTo}90)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.3rem', flexShrink: 0,
                  }}>
                    {type.emoji}
                  </div>
                  <div>
                    <h3 style={{ color: '#fff', fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: '1.1rem', margin: 0, lineHeight: 1.2 }}>
                      {type.title}
                    </h3>
                    <p style={{ color: type.color, fontSize: '0.75rem', fontWeight: 600, margin: '2px 0 0', opacity: 0.9 }}>
                      {type.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.82rem', lineHeight: 1.5, margin: '0 0 1rem' }}>
                  {type.description}
                </p>

                {/* Examples */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
                  {type.examples.slice(0, 4).map((ex, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: '0.68rem', fontWeight: 600,
                        padding: '3px 8px', borderRadius: 6,
                        background: `${type.color}12`, color: type.color,
                        border: `1px solid ${type.color}20`,
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                  {type.examples.length > 4 && (
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'center' }}>
                      +{type.examples.length - 4} more
                    </span>
                  )}
                </div>

                {/* Can Do */}
                <div style={{ marginBottom: type.cannotDo.length > 0 ? '0.75rem' : 0 }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                    What you can do
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                    {type.canDo.map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <CheckCircle2 size={12} style={{ color: '#4ade80', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cannot Do */}
                {type.cannotDo.length > 0 && (
                  <div>
                    <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                      Restrictions
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      {type.cannotDo.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <XCircle size={12} style={{ color: '#ef4444', flexShrink: 0, opacity: 0.7 }} />
                          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Continue Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center' }}
        >
          <button
            type="button"
            disabled={!selectedType}
            onClick={handleContinue}
            style={{
              padding: '0.85rem 2.5rem',
              borderRadius: '1rem',
              border: 'none',
              fontWeight: 800,
              fontSize: '0.95rem',
              cursor: selectedType ? 'pointer' : 'not-allowed',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.3s ease',
              background: selectedType
                ? 'linear-gradient(135deg, #713f12, #a16207, #facc15)'
                : 'rgba(255,255,255,0.08)',
              color: selectedType ? '#1c0e00' : 'rgba(255,255,255,0.3)',
              boxShadow: selectedType ? '0 8px 30px rgba(250,204,21,0.3)' : 'none',
              opacity: selectedType ? 1 : 0.6,
            }}
            id="vendor-type-continue-btn"
          >
            Continue to Business Profile <ArrowRight size={18} />
          </button>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
            {selectedType
              ? `You selected: ${VENDOR_TYPES.find(t => t.id === selectedType)?.title}. You can upgrade to Hybrid later.`
              : 'Select a vendor type to continue'}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
