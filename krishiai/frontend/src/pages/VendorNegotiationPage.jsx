import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Check, X, ArrowRight, DollarSign, Calculator, RefreshCw } from 'lucide-react';

export default function VendorNegotiationPage() {
  const [negotiations, setNegotiations] = useState([
    {
      id: 101,
      farmer_name: 'Suresh Patil',
      farmer_location: 'Baramati, Pune',
      crop_name: 'Cotton (Shankar-6)',
      offered_qty: 150,
      buyer_target_price: 7200,
      farmer_offered_price: 7550,
      vendor_counter_price: 7350,
      round: 2,
      status: 'under_negotiation'
    },
    {
      id: 102,
      farmer_name: 'Anand Shinde',
      farmer_location: 'Kopargaon, Ahmednagar',
      crop_name: 'Soybean (JS-335)',
      offered_qty: 200,
      buyer_target_price: 4800,
      farmer_offered_price: 4900,
      vendor_counter_price: 4850,
      round: 1,
      status: 'under_negotiation'
    }
  ]);

  const [counterInput, setCounterInput] = useState({});
  const [actionMsg, setActionMsg] = useState('');

  const handleAction = (id, action) => {
    setNegotiations(prev =>
      prev.map(item => {
        if (item.id === id) {
          if (action === 'accept') {
            setActionMsg(`Deal accepted with ${item.farmer_name} at ₹${item.vendor_counter_price || item.farmer_offered_price}/qtl!`);
            return { ...item, status: 'accepted' };
          } else if (action === 'reject') {
            setActionMsg(`Offer rejected.`);
            return { ...item, status: 'rejected' };
          } else if (action === 'counter') {
            const price = counterInput[id] || item.vendor_counter_price;
            setActionMsg(`Counter offer of ₹${price}/qtl sent to ${item.farmer_name}.`);
            return { ...item, vendor_counter_price: parseFloat(price), round: item.round + 1 };
          }
        }
        return item;
      })
    );
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <MessageCircle className="text-purple-400" size={32} />
          Farmer Deal Negotiation Desk
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Review incoming crop price offers, calculate margin impact, send counter-offers, or finalize crop purchase contracts.
        </p>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 font-semibold">
          ✓ {actionMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {negotiations.map(n => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            style={cardStyle}
            className="p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">{n.farmer_name}</h3>
                <p className="text-xs text-[#86efac]/60">{n.farmer_location}</p>
              </div>
              <span className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 font-bold">
                Round {n.round} / 5
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#86efac]/70">Crop & Quantity:</span>
                <span className="font-bold text-white">{n.crop_name} ({n.offered_qty} qtl)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86efac]/70">Target Benchmark:</span>
                <span className="text-gray-300">₹{n.buyer_target_price}/qtl</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#86efac]/70">Farmer Offered Price:</span>
                <span className="font-bold text-amber-400">₹{n.farmer_offered_price}/qtl</span>
              </div>
              <div className="flex justify-between border-t border-[#86efac]/10 pt-2">
                <span className="text-[#86efac]/70">Current Counter Price:</span>
                <span className="font-bold text-[#4ade80]">₹{n.vendor_counter_price}/qtl</span>
              </div>
            </div>

            {n.status === 'under_negotiation' ? (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Enter counter price (₹)"
                    value={counterInput[n.id] || ''}
                    onChange={e => setCounterInput({ ...counterInput, [n.id]: e.target.value })}
                    style={{
                      flex: 1, padding: '0.65rem 1rem',
                      background: 'rgba(14, 38, 20, 0.9)',
                      border: '1px solid rgba(134, 239, 172, 0.2)',
                      borderRadius: '0.75rem', color: '#ffffff', fontSize: '0.88rem', outline: 'none'
                    }}
                  />
                  <button
                    onClick={() => handleAction(n.id, 'counter')}
                    className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold text-sm"
                  >
                    Counter
                  </button>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction(n.id, 'reject')}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-sm"
                  >
                    Reject Offer
                  </button>
                  <button
                    onClick={() => handleAction(n.id, 'accept')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm"
                  >
                    Accept Deal
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 text-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm font-bold capitalize text-emerald-400">
                Status: {n.status}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
