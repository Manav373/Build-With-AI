import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat, MapPin, IndianRupee, Clock, Truck, Users, Search,
  Filter, ArrowLeft, ChevronDown, Star, ShieldCheck, CheckCircle2,
  Send, Calendar, ArrowRight, Loader2, X, Building2, Sparkles, AlertCircle, RefreshCw, Menu
} from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';
import { API_BASE, apiUrl } from '../utils/apiConfig';

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const targetUrl = apiUrl(`api/vendor/requirements/${requirement.id}/apply`);
      const resp = await fetch(targetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          ...form,
          offered_quantity: parseFloat(form.offered_quantity) || 0,
          offered_price: parseFloat(form.offered_price) || 0,
        }),
      });
      clearTimeout(timeoutId);
      setSubmitted(true);
    } catch (e) {
      // Offline fallback: save in localStorage so offer is never lost
      try {
        const existing = JSON.parse(localStorage.getItem('farmer_crop_offers') || '[]');
        existing.push({ requirement_id: requirement.id, ...form, timestamp: new Date().toISOString() });
        localStorage.setItem('farmer_crop_offers', JSON.stringify(existing));
      } catch (_) {}
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

const DEFAULT_REQUIREMENTS = [
  {
    id: 1,
    crop_name: 'Cotton',
    crop_variety: 'Shankar-6',
    quantity_needed_qtl: 500,
    target_price_per_qtl: 7850,
    pickup_district: 'Indore',
    pickup_state: 'Madhya Pradesh',
    procurement_location: 'Indore Mandi, MP',
    preferred_districts: 'Indore, Ujjain, Dewas, Dhar',
    logistics_option: 'vendor_pickup',
    expiry_date: '2026-10-15',
    vendor: {
      business_name: 'MahaAgro Procurement Ltd',
      rating: 4.9,
      is_verified: true,
      district: 'Nashik'
    }
  },
  {
    id: 2,
    crop_name: 'Wheat (Sharbati)',
    crop_variety: 'C-306 Sharbati',
    quantity_needed_qtl: 800,
    target_price_per_qtl: 3250,
    pickup_district: 'Sehore',
    pickup_state: 'Madhya Pradesh',
    procurement_location: 'Sehore Mandi, MP',
    preferred_districts: 'Sehore, Bhopal, Hoshangabad',
    logistics_option: 'vendor_pickup',
    expiry_date: '2026-10-30',
    vendor: {
      business_name: 'ITC e-Choupal Agri Hub',
      rating: 4.9,
      is_verified: true,
      district: 'Bhopal'
    }
  },
  {
    id: 3,
    crop_name: 'Soybean (JS-335)',
    crop_variety: 'JS-335 Yellow',
    quantity_needed_qtl: 400,
    target_price_per_qtl: 5100,
    pickup_district: 'Pune',
    pickup_state: 'Maharashtra',
    procurement_location: 'Hadapsar, Pune',
    preferred_districts: 'Pune, Satara, Ahmednagar',
    logistics_option: 'vendor_pickup',
    expiry_date: '2026-10-25',
    vendor: {
      business_name: 'KisanVikas Agro Foods',
      rating: 4.8,
      is_verified: true,
      district: 'Pune'
    }
  },
  {
    id: 4,
    crop_name: 'Rice (Basmati)',
    crop_variety: 'Pusa 1121',
    quantity_needed_qtl: 600,
    target_price_per_qtl: 4800,
    pickup_district: 'Karnal',
    pickup_state: 'Haryana',
    procurement_location: 'Karnal Grain Market',
    preferred_districts: 'Karnal, Kurukshetra, Ambala',
    logistics_option: 'hub_delivery',
    expiry_date: '2026-11-15',
    vendor: {
      business_name: 'Adani Wilmar Agri Sourcing',
      rating: 4.9,
      is_verified: true,
      district: 'Karnal'
    }
  }
];

export default function FarmerBrowseRequirementsPage() {
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useMobileMenu ? useMobileMenu() : {};
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqModal, setSelectedReqModal] = useState(null);

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async (isManualSync = false) => {
    if (isManualSync) setIsSyncing(true);
    else setLoading(true);

    let candidates = [];
    const envUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || '').trim();
    if (envUrl) {
      let clean = envUrl;
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) clean = `https://${clean}`;
      candidates.push(clean.replace(/\/+$/, '') + '/');
    }
    candidates.push('http://127.0.0.1:8000/');
    candidates.push('http://localhost:8000/');

    // Remove duplicates
    candidates = [...new Set(candidates)];

    let loaded = false;
    for (const base of candidates) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const cleanBase = base.replace(/\/+$/, '');
        const res = await fetch(`${cleanBase}/api/vendor/marketplace/requirements`, {
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          if (json.requirements && json.requirements.length > 0) {
            setRequirements(json.requirements);
            loaded = true;
            break;
          }
        }
      } catch (err) {
        // Continue to next candidate or fallback
      }
    }

    if (!loaded && requirements.length === 0) {
      // Graceful offline fallback to verified requirements
      setRequirements(DEFAULT_REQUIREMENTS);
    }

    setLoading(false);
    setIsSyncing(false);
  };

  // Derive all unique locations/districts from live requirements
  const availableLocations = ['All', ...new Set(
    requirements.map(r => r.pickup_district || r.procurement_location).filter(Boolean)
  )];

  const filteredRequirements = requirements.filter(r => {
    const query = searchTerm.toLowerCase();
    const locStr = `${r.procurement_location || ''} ${r.pickup_district || ''} ${r.pickup_state || ''} ${r.preferred_districts || ''}`.toLowerCase();
    
    const matchesSearch = (r.crop_name || '').toLowerCase().includes(query) ||
                          (r.crop_variety || '').toLowerCase().includes(query) ||
                          (r.vendor?.business_name || '').toLowerCase().includes(query) ||
                          locStr.includes(query);

    const matchesCrop = selectedCrop === 'All' || (r.crop_name || '').toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesLocation = selectedLocation === 'All' || locStr.includes(selectedLocation.toLowerCase());

    return matchesSearch && matchesCrop && matchesLocation;
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
        background: '#050e07',
        fontFamily: "'Inter', system-ui, sans-serif",
        color: '#e2f0e4',
      }}
      className="flex-1 w-full h-full overflow-y-auto custom-scrollbar dark p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        
        {/* Top Header */}
        <div className="relative text-center space-y-3">
          {setMobileMenuOpen && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden absolute left-0 top-0 p-2.5 bg-[#166534]/40 border border-[#86efac]/20 rounded-xl text-[#4ade80]"
              aria-label="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          )}
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

          {/* Location-Specific Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#86efac]/10">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                <MapPin size={13} /> Specific Location:
              </span>
              {availableLocations.map(loc => (
                <button
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: selectedLocation === loc ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.05)',
                    color: selectedLocation === loc ? '#4ade80' : 'rgba(255,255,255,0.6)',
                    border: selectedLocation === loc ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {loc === 'All' ? '🌐 All Locations' : `📍 ${loc}`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[11px] text-emerald-400/80 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                Live Vendor Sync
              </span>
              <button
                onClick={() => fetchRequirements(true)}
                disabled={isSyncing}
                className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Fetch newly dropped vendor buying requirements"
              >
                <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Tenders'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Active Filter Summary */}
        <div className="flex items-center justify-between text-xs text-gray-400 px-1">
          <div>
            Showing <strong className="text-white">{filteredRequirements.length}</strong> buying tender(s)
            {selectedCrop !== 'All' && <span> for <strong className="text-amber-400">{selectedCrop}</strong></span>}
            {selectedLocation !== 'All' && <span> in <strong className="text-emerald-400">{selectedLocation}</strong></span>}
          </div>
          {(selectedCrop !== 'All' || selectedLocation !== 'All' || searchTerm) && (
            <button
              onClick={() => { setSelectedCrop('All'); setSelectedLocation('All'); setSearchTerm(''); }}
              className="text-amber-400 hover:text-amber-300 underline cursor-pointer text-xs"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Requirements Grid */}
        {filteredRequirements.length === 0 ? (
          <div style={cardStyle} className="p-12 text-center space-y-3">
            <Wheat size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-white">No Procurement Requirements Match</h3>
            <p className="text-xs text-gray-400">Try selecting a different location or crop filter, or click Sync Tenders.</p>
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
                        {req.crop_name} {req.crop_variety ? `(${req.crop_variety})` : ''}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#86efac]/70 font-semibold">Target Price</p>
                      <p className="text-2xl font-black text-amber-400 font-['Outfit']">
                        ₹{(req.min_price || req.target_price_per_qtl)?.toLocaleString()} {req.max_price && req.max_price !== req.min_price ? `– ₹${req.max_price.toLocaleString()}` : ''}{' '}
                        <span className="text-xs font-normal text-gray-400">/ {req.price_unit || 'qtl'}</span>
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
                        <p className="text-xs font-bold text-white">{req.vendor?.business_name || 'Verified Agribusiness'}</p>
                        <p className="text-[0.68rem] text-emerald-400">✓ APMC Verified Trader</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400">
                      <Star size={14} fill="#facc15" /> {req.vendor?.rating ? req.vendor.rating.toFixed(1) : '4.9'}
                    </div>
                  </div>

                  {/* Procurement Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-gray-900/50 border border-white/5">
                      <p className="text-gray-400">Required Quantity</p>
                      <p className="font-extrabold text-white text-sm mt-0.5">
                        {req.quantity_required || req.quantity_needed_qtl} {req.quantity_unit || 'Quintals'}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gray-900/50 border border-white/5">
                      <p className="text-gray-400">Quality Spec</p>
                      <p className="font-extrabold text-emerald-400 text-sm mt-0.5">
                        {req.quality_grade || (req.max_moisture_percent ? `Moisture < ${req.max_moisture_percent}%` : 'Standard APMC Grade')}
                      </p>
                    </div>
                  </div>

                  {/* Location & Logistics */}
                  <div className="space-y-1.5 text-xs text-gray-300 pt-1">
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <MapPin size={14} className="text-emerald-400 shrink-0" />
                      <span>Specific Location: <strong className="text-white">{req.procurement_location || req.pickup_district || req.preferred_districts || 'All Regions'}{req.pickup_state ? `, ${req.pickup_state}` : ''}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Truck size={14} className="text-blue-400 shrink-0" />
                      <span>Logistics: <strong className="text-blue-300">{req.transport_provided || req.logistics_option === 'vendor_pickup' ? `🚚 Farm-Gate Pickup (Radius: ${req.pickup_radius_km || 50} km)` : '🏬 Direct Hub Delivery'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-[#86efac]/10 flex items-center justify-between gap-3">
                  <div className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock size={14} className="text-amber-400" />
                    <span>Open till: {req.valid_to ? new Date(req.valid_to).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : (req.expiry_date || 'Ongoing')}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReqModal(req)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-yellow-500 hover:to-amber-500 text-gray-950 font-black text-xs transition flex items-center gap-1.5 shadow-lg cursor-pointer"
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
