import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Factory, Store, RefreshCw, ArrowRight,
  CheckCircle2, XCircle, Sparkles
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
    examples: ['Grain Trader', 'Rice Mill', 'Cotton Buyer', 'APMC Trader'],
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
    examples: ['Seed Dealer', 'Fertilizer Shop', 'Pesticide Dealer', 'Equipment Store'],
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
    examples: ['Agro Center', 'Agricultural Retail Chain', 'Cooperative Society', 'FPO Business Center'],
    canDo: [
      'Everything from Procurement',
      'Everything from Selling',
      'Unified Dashboard & Analytics',
      'Combined Payment Ledger',
      'Cross-Business Insights',
      'Mode Switching (Buy/Sell)',
    ],
    cannotDo: [],
    recommended: true,
  },
];

export default function VendorTypeSelectionSection({ showHeader = true }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);
  const [hoveredType, setHoveredType] = useState(null);

  const handleContinue = () => {
    if (selectedType) {
      navigate(`/vendor-onboarding?type=${selectedType}`);
    }
  };

  return (
    <section className="relative py-12 px-4 max-w-7xl mx-auto font-['Inter'] text-white">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      {showHeader && (
        <div className="text-center space-y-3 mb-10 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#713f12] to-[#facc15] inline-flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20">
            🏪
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white font-['Outfit'] tracking-tight">
            Choose Your <span className="text-[#facc15]">Business Type</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto">
            Select how you want to operate on KrishiAI. This determines your dashboard, features, and capabilities.
          </p>
        </div>
      )}

      {/* Grid of 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        {VENDOR_TYPES.map((type) => {
          const isSelected = selectedType === type.id;
          const isHovered = hoveredType === type.id;

          return (
            <motion.div
              key={type.id}
              whileHover={{ y: -4 }}
              onClick={() => setSelectedType(type.id)}
              onMouseEnter={() => setHoveredType(type.id)}
              onMouseLeave={() => setHoveredType(null)}
              style={{
                background: isSelected
                  ? 'rgba(15, 23, 42, 0.95)'
                  : 'rgba(11, 19, 32, 0.85)',
                border: isSelected
                  ? `2px solid ${type.color}`
                  : isHovered
                  ? `1px solid ${type.color}88`
                  : '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: isSelected
                  ? `0 0 30px ${type.color}35`
                  : isHovered
                  ? `0 0 20px ${type.color}15`
                  : '0 10px 30px rgba(0, 0, 0, 0.5)',
              }}
              className="relative rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between"
            >
              {/* Recommended Badge */}
              {type.recommended && (
                <div className="absolute -top-3 right-6 bg-gradient-to-r from-purple-600 to-indigo-500 text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg flex items-center gap-1 border border-purple-400/30">
                  <Sparkles size={12} /> Recommended
                </div>
              )}

              <div className="space-y-5">
                {/* Header Icon & Title */}
                <div className="flex items-center gap-3">
                  <div
                    style={{ background: `linear-gradient(135deg, ${type.gradientFrom}, ${type.gradientTo})` }}
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-md shrink-0"
                  >
                    {type.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-lg text-white font-['Outfit']">{type.title}</h3>
                    </div>
                    <p className="text-xs font-semibold" style={{ color: type.color }}>
                      {type.subtitle}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {type.description}
                </p>

                {/* Examples / Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {type.examples.map((ex, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white/5 border border-white/10 text-gray-300"
                    >
                      {ex}
                    </span>
                  ))}
                </div>

                {/* WHAT YOU CAN DO */}
                <div className="space-y-2 pt-2 border-t border-white/10">
                  <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                    What you can do
                  </p>
                  <ul className="space-y-1.5">
                    {type.canDo.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-gray-200">
                        <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* RESTRICTIONS */}
                {type.cannotDo.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <p className="text-[11px] font-extrabold uppercase tracking-wider text-gray-400">
                      Restrictions
                    </p>
                    <ul className="space-y-1.5">
                      {type.cannotDo.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-xs text-red-400/80">
                          <XCircle size={14} className="text-red-400 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue CTA Button */}
      <div className="mt-10 text-center space-y-3 relative z-10">
        <motion.button
          type="button"
          disabled={!selectedType}
          onClick={handleContinue}
          whileHover={selectedType ? { scale: 1.02 } : {}}
          whileTap={selectedType ? { scale: 0.98 } : {}}
          style={{
            background: selectedType
              ? 'linear-gradient(135deg, #d97706, #f59e0b)'
              : 'rgba(255, 255, 255, 0.08)',
            cursor: selectedType ? 'pointer' : 'not-allowed',
            opacity: selectedType ? 1 : 0.6,
          }}
          className="px-8 py-3.5 rounded-xl font-bold text-sm text-white shadow-xl transition-all duration-300 inline-flex items-center gap-2"
        >
          <span>Continue to Business Profile</span>
          <ArrowRight size={18} />
        </motion.button>
        <p className="text-xs text-gray-400 font-medium">
          {selectedType ? 'Click to proceed with your business onboarding' : 'Select a vendor type to continue'}
        </p>
      </div>
    </section>
  );
}
