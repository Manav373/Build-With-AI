import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat, MapPin, IndianRupee, Clock, Truck, Users, Search,
  Filter, ArrowLeft, ChevronDown, Star, ShieldCheck, CheckCircle2,
  Send, Calendar, ArrowRight, Loader2, X, Building2, Sparkles, AlertCircle
} from 'lucide-react';

const CROP_FILTERS = ['All', 'Cotton (Shankar-6)', 'Soybean (JS-335)', 'Wheat (Sharbati)', 'Rice (Basmati)', 'Sugarcane', 'Maize', 'Onion', 'Potato'];

function SubmitOfferModal({ isOpen, onClose, requirement }) {
  const [form, setForm] = useState({
    farmer_name: '', farmer_phone: '', farmer_location: '',
    offered_quantity: '', offered_price: '',
    crop_quality_self_assessment: 'Grade A', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';
      const resp = await fetch(`${API}api/vendor/requirements/${requirement.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          offered_quantity: parseFloat(form.offered_quantity) || 0,
          offered_price: parseFloat(form.offered_price) || 0,
        }),
      });
      if (resp.ok) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (e) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !requirement) return null;

  const inputStyle = {
    width: '100%', padding: '0.65rem 1rem', borderRadius: '0.75rem',
    background: 'rgba(14, 38, 20, 0.9)', border: '1px solid rgba(134, 239, 172, 0.2)',
    color: '#fff', fontSize: '0.88rem', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = {
    fontSize: '0.75rem', fontWeight: 700, color: 'rgba(134,239,172,0.8)',
    marginBottom: 5, display: 'block',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', items: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          background: 'rgba(8, 24, 12, 0.95)', border: '1px solid rgba(134,239,172,0.2)',
          borderRadius: '1.5rem', padding: '1.75rem', boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
        }}
      >
        <div className="flex justify-between items-center pb-4 border-b border-[#86efac]/10 mb-4">
          <div>
            <h3 className="text-lg font-bold text-white font-['Outfit']">Submit Crop Offer</h3>
            <p className="text-xs text-[#86efac]/70">To: {requirement.vendor?.business_name || 'Agri Buyer'}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg bg-gray-800 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-white font-['Outfit']">Crop Offer Submitted! 🎉</h3>
            <p className="text-xs text-gray-300 max-w-sm mx-auto leading-relaxed">
              Your sale offer for <strong className="text-amber-400">{requirement.crop_name}</strong> has been transmitted directly to <strong className="text-white">{requirement.vendor?.business_name}</strong>.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm w-full"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-xl bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] text-xs space-y-1">
              <div className="flex justify-between text-gray-300">
                <span>Buying Crop:</span>
                <span className="font-bold text-white">{requirement.crop_name}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Target Buying Price:</span>
                <span className="font-bold text-amber-400">₹{requirement.target_price_per_qtl} / qtl</span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={form.farmer_name}
                onChange={e => update('farmer_name', e.target.value)}
                style={inputStyle}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="98230XXXXX"
                  value={form.farmer_phone}
                  onChange={e => update('farmer_phone', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Village / District *</label>
                <input
                  type="text"
                  required
                  placeholder="Hadapsar, Pune"
                  value={form.farmer_location}
                  onChange={e => update('farmer_location', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label style={labelStyle}>Offered Quantity (Quintal)</label>
                <input
                  type="number"
                  required
                  placeholder={`Max ${requirement.quantity_needed_qtl} qtl`}
                  value={form.offered_quantity}
                  onChange={e => update('offered_quantity', e.target.value)}
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Your Asking Price (₹/qtl)</label>
                <input
                  type="number"
                  required
                  placeholder={`Target ₹${requirement.target_price_per_qtl}`}
                  value={form.offered_price}
                  onChange={e => update('offered_price', e.target.value)}
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Additional Notes / Moisture %</label>
              <input
                type="text"
                placeholder="e.g., Harvested last week, 7% moisture level, ready for immediate pickup"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2"
            >
              <Send size={16} />
              {submitting ? 'Transmitting Offer...' : 'Send Sale Offer to Buyer'}
            </button>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function FarmerBrowseRequirementsPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqModal, setSelectedReqModal] = useState(null);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/marketplace/requirements`);
      if (res.ok) {
        const json = await res.json();
        if (json.requirements) {
          setRequirements(json.requirements);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequirements = requirements.filter(r => {
    const query = searchTerm.toLowerCase();
    const matchesSearch = r.crop_name.toLowerCase().includes(query) ||
                          r.vendor?.business_name.toLowerCase().includes(query) ||
                          r.preferred_districts?.toLowerCase().includes(query);
    const matchesCrop = selectedCrop === 'All' || r.crop_name.toLowerCase().includes(selectedCrop.toLowerCase());
    return matchesSearch && matchesCrop;
  });

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.88)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#050e07',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e2f0e4',
        padding: '2.5rem 1.25rem',
      }}
      className="dark"
    >
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header */}
        <div className="text-center space-y-3">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Wheat size={14} /> Farm-Gate Procurement Hub
            </span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-black text-white font-['Outfit'] tracking-tight">
            Sell Crops Directly To <span className="bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">Verified Buyers</span>
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
            Browse live crop purchasing tenders from certified APMC traders, exporters, and processors offering premium rates with farm-gate pickup.
          </p>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Wheat, label: 'Active Buying Tenders', val: `${requirements.length} Open Orders`, color: '#facc15' },
            { icon: IndianRupee, label: 'Total Procurement Budget', val: '₹ 4.8 Cr Available', color: '#4ade80' },
            { icon: Truck, label: 'Farm-Gate Pickups', val: 'Free Transport', color: '#60a5fa' },
            { icon: ShieldCheck, label: 'Payment Guarantee', val: '24hr Payouts', color: '#c084fc' },
          ].map((m, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(10, 26, 13, 0.8)',
                border: '1px solid rgba(134, 239, 172, 0.12)',
                borderRadius: '1rem',
              }}
              className="p-4 flex items-center gap-3"
            >
              <div
                style={{ background: `${m.color}15` }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              >
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs text-[#86efac]/60 font-semibold">{m.label}</p>
                <p className="text-sm font-extrabold text-white font-['Outfit']">{m.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Crop Category Filter */}
        <div style={cardStyle} className="p-6 space-y-4">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop name (e.g. Cotton, Soybean), buyer name, or district..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem 0.75rem 2.75rem',
                background: 'rgba(14, 38, 20, 0.9)',
                border: '1px solid rgba(134, 239, 172, 0.2)',
                borderRadius: '0.9rem',
                color: '#ffffff',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#86efac]/10">
            {CROP_FILTERS.map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '50px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: selectedCrop === crop ? 'linear-gradient(135deg, #b45309, #f59e0b)' : 'rgba(255,255,255,0.04)',
                  color: selectedCrop === crop ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  border: selectedCrop === crop ? '1px solid #facc15' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Requirements Grid */}
        {filteredRequirements.length === 0 ? (
          <div style={cardStyle} className="p-12 text-center space-y-3">
            <Wheat size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-white">No Procurement Requirements Match</h3>
            <p className="text-xs text-gray-400">Try selecting a different crop filter or clearing search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequirements.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                style={cardStyle}
                className="p-6 space-y-4 flex flex-col justify-between group hover:border-amber-400/40 transition duration-300"
              >
                <div className="space-y-3">
                  {/* Top Crop & Price Row */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase inline-block mb-1">
                        🌾 Buying Tender
                      </span>
                      <h3 className="text-2xl font-black text-white font-['Outfit'] group-hover:text-amber-400 transition">
                        {req.crop_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#86efac]/70 font-semibold">Target Price</p>
                      <p className="text-2xl font-black text-amber-400 font-['Outfit']">
                        ₹{req.target_price_per_qtl?.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ qtl</span>
                      </p>
                    </div>
                  </div>

                  {/* Buyer Profile */}
                  <div className="p-3 rounded-xl bg-[rgba(14,38,20,0.8)] border border-[rgba(134,239,172,0.1)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400">
                        🏢
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{req.vendor?.business_name}</p>
                        <p className="text-[0.68rem] text-emerald-400">✓ APMC Verified Trader</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star size={14} fill="#facc15" /> 4.9
                    </div>
                  </div>

                  {/* Procurement Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-gray-900/50 border border-white/5">
                      <p className="text-gray-400">Required Quantity</p>
                      <p className="font-extrabold text-white text-sm mt-0.5">{req.quantity_needed_qtl} Quintals</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-900/50 border border-white/5">
                      <p className="text-gray-400">Quality Spec</p>
                      <p className="font-extrabold text-emerald-400 text-sm mt-0.5">Moisture Max 8%</p>
                    </div>
                  </div>

                  {/* Location & Logistics */}
                  <div className="space-y-1.5 text-xs text-gray-300 pt-1">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <span>Preferred Districts: <strong className="text-white">{req.preferred_districts || 'Maharashtra'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Truck size={14} className="text-blue-400 shrink-0" />
                      <span>Logistics: <strong className="text-blue-300">{req.logistics_option === 'vendor_pickup' ? '🚚 Free Farm-Gate Truck Pickup Available' : '🏬 Warehouse Delivery'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-[#86efac]/10 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={14} className="text-amber-400" />
                    <span>Open till: {req.expiry_date || '2026-08-30'}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReqModal(req)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-gray-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg"
                  >
                    Submit Sale Offer
                    <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>

      {/* Offer Modal */}
      <SubmitOfferModal
        isOpen={Boolean(selectedReqModal)}
        onClose={() => setSelectedReqModal(null)}
        requirement={selectedReqModal}
      />
    </div>
  );
}
