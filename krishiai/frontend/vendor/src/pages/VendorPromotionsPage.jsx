import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Tag, Plus, CheckCircle2, Percent, Calendar } from 'lucide-react';

export default function VendorPromotionsPage() {
  const [promos, setPromos] = useState(() => {
    try {
      const saved = localStorage.getItem('vendor_promotions');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [minOrder, setMinOrder] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('vendor_promotions', JSON.stringify(promos));
    } catch (e) { }
  }, [promos]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!code || !discount) return;
    setPromos(prev => [...prev, {
      id: Date.now(),
      code: code.toUpperCase(),
      discount: `${discount}% OFF`,
      min_order: `₹${minOrder || '0'}`,
      valid_till: '2026-12-31',
      status: 'active'
    }]);
    setCode('');
    setDiscount('');
    setMinOrder('');
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'rgba(14, 38, 20, 0.9)',
    border: '1px solid rgba(134, 239, 172, 0.2)',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '0.88rem',
    outline: 'none',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Tag className="text-amber-400" size={32} />
          Promotions & Coupon Code Builder
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Create discount coupons, bulk volume discounts, and seasonal campaign offers for farmers.
        </p>
      </div>

      {/* Coupon Form */}
      <form onSubmit={handleCreate} style={cardStyle} className="p-6 space-y-4">
        <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
          <Plus size={20} className="text-amber-400" /> Create New Coupon Code
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Coupon Code (e.g. KHARIF15)</label>
            <input
              type="text"
              placeholder="e.g. KHARIF15"
              value={code}
              onChange={e => setCode(e.target.value)}
              style={inputStyle}
              className="uppercase font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Discount Percentage (%)</label>
            <input
              type="number"
              placeholder="15"
              value={discount}
              onChange={e => setDiscount(e.target.value)}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Min Order Amount (₹)</label>
            <input
              type="number"
              placeholder="1000"
              value={minOrder}
              onChange={e => setMinOrder(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm"
        >
          Publish Coupon Code
        </button>
      </form>

      {/* Active Coupons Grid */}
      {promos.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <Tag size={40} className="mx-auto text-amber-400/30" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Active Promotions</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            Create promotional coupon codes above to provide discounts for farmer bulk purchases.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {promos.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-3"
            >
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-sm font-mono font-extrabold rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {p.code}
                </span>
                <span className="text-xs text-[#4ade80] font-bold uppercase">{p.status}</span>
              </div>
              <p className="text-2xl font-extrabold text-white font-['Outfit']">{p.discount}</p>
              <div className="flex justify-between text-xs text-[#86efac]/70 border-t border-[#86efac]/10 pt-3">
                <span>Min Order: <strong className="text-white">{p.min_order}</strong></span>
                <span>Valid Till: <strong className="text-white">{p.valid_till}</strong></span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
