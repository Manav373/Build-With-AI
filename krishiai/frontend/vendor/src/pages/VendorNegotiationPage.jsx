import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Check, X, ArrowRight, DollarSign, Calculator, RefreshCw } from 'lucide-react';

export default function VendorNegotiationPage() {
  const [negotiations, setNegotiations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [counterInput, setCounterInput] = useState({});
  const [actionMsg, setActionMsg] = useState('');

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchNegotiations();
  }, []);

  const fetchNegotiations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/applications`);
      if (res.ok) {
        const json = await res.json();
        const apps = (json.applications || []).map(a => ({
          id: a.id,
          farmer_name: a.farmer_name || 'Registered Farmer',
          farmer_location: a.farmer_location || 'Maharashtra',
          crop_name: a.crop_quality_self_assessment || 'Crop Lot',
          offered_qty: a.offered_quantity,
          buyer_target_price: a.final_agreed_price || a.offered_price,
          farmer_offered_price: a.offered_price,
          vendor_counter_price: a.counter_offer_price || a.offered_price,
          round: a.negotiation_rounds || 1,
          status: a.status || 'pending'
        }));
        setNegotiations(apps);
      } else {
        setNegotiations([]);
      }
    } catch (e) {
      console.error('Failed to fetch negotiations:', e);
      setNegotiations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    const price = counterInput[id];
    let queryAction = action;
    if (action === 'counter') queryAction = 'counter_offer';

    try {
      const url = new URL(`${API_BASE}api/vendor/applications/${id}/respond`);
      url.searchParams.append('action', queryAction);
      if (price) url.searchParams.append('counter_price', price);

      const res = await fetch(url.toString(), { method: 'POST' });
      if (res.ok) {
        setActionMsg(`Offer ${action}ed successfully!`);
        fetchNegotiations();
      } else {
        const err = await res.json();
        setActionMsg(err.detail || 'Action could not be processed.');
      }
    } catch (e) {
      console.error('Negotiation action failed:', e);
      setActionMsg('Failed to connect to server.');
    }
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

      {negotiations.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <MessageCircle size={40} className="mx-auto text-purple-400/40" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Active Negotiations</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            When farmers submit offers for your buying requirements, you can negotiate prices, counter-bid, or accept deals directly here.
          </p>
        </div>
      ) : (
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
                  <span className="text-[#86efac]/70">Offered Quantity:</span>
                  <span className="font-bold text-white">{n.offered_qty} quintals</span>
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

              {n.status === 'under_negotiation' || n.status === 'pending' || n.status === 'shortlisted' ? (
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
                  Status: {n.status.replace(/_/g, ' ')}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
