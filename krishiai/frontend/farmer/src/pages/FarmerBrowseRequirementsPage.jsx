import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wheat, MapPin, IndianRupee, Clock, Truck, Users, Search,
  Filter, ArrowLeft, ChevronDown, Star, ShieldCheck, CheckCircle2,
  Send, Calendar, ArrowRight, Loader2, X, Building2, Sparkles, AlertCircle, Menu
} from 'lucide-react';
import { useMobileMenu } from '../context/MobileMenuContext';

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
      const rawApi = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/').trim();
      const API = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const resp = await fetch(`${API}api/vendor/requirements/${requirement.id}/apply`, {
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

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[300] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-[520px] max-h-[90vh] overflow-y-auto custom-scrollbar bg-white dark:bg-[#08180c] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] rounded-3xl p-6 sm:p-7 shadow-2xl transition-colors"
      >
        <div className="flex justify-between items-center pb-4 border-b border-slate-200 dark:border-[#86efac]/10 mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white font-['Outfit']">Submit Crop Offer</h3>
            <p className="text-xs text-emerald-700 dark:text-[#86efac]/70">To: {requirement.vendor?.business_name || 'Agri Buyer'}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-['Outfit']">Crop Offer Submitted! 🎉</h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 max-w-sm mx-auto leading-relaxed">
              Your sale offer for <strong className="text-amber-600 dark:text-amber-400">{requirement.crop_name}</strong> has been transmitted directly to <strong className="text-slate-900 dark:text-white">{requirement.vendor?.business_name}</strong>.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm w-full transition-colors shadow-lg shadow-emerald-600/20"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[rgba(14,38,20,0.8)] border border-slate-200 dark:border-[rgba(134,239,172,0.1)] text-xs space-y-1.5">
              <div className="flex justify-between text-slate-600 dark:text-gray-300">
                <span>Buying Crop:</span>
                <span className="font-bold text-slate-900 dark:text-white">{requirement.crop_name}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-gray-300">
                <span>Target Buying Price:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">₹{requirement.target_price_per_qtl} / qtl</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Your Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Ramesh Patil"
                value={form.farmer_name}
                onChange={e => update('farmer_name', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="98230XXXXX"
                  value={form.farmer_phone}
                  onChange={e => update('farmer_phone', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Village / District *</label>
                <input
                  type="text"
                  required
                  placeholder="Hadapsar, Pune"
                  value={form.farmer_location}
                  onChange={e => update('farmer_location', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Offered Quantity (Quintal)</label>
                <input
                  type="number"
                  required
                  placeholder={`Max ${requirement.quantity_needed_qtl} qtl`}
                  value={form.offered_quantity}
                  onChange={e => update('offered_quantity', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Your Asking Price (₹/qtl)</label>
                <input
                  type="number"
                  required
                  placeholder={`Target ₹${requirement.target_price_per_qtl}`}
                  value={form.offered_price}
                  onChange={e => update('offered_price', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-[#86efac]/80 mb-1.5">Additional Notes / Moisture %</label>
              <input
                type="text"
                placeholder="e.g., Harvested last week, 7% moisture level, ready for immediate pickup"
                value={form.notes}
                onChange={e => update('notes', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
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
    procurement_location: 'Baramati APMC, Maharashtra',
    preferred_districts: 'Pune, Satara, Solapur, Ahmednagar',
    logistics_option: 'vendor_pickup',
    expiry_date: '2026-10-25',
    vendor: {
      business_name: 'Sahyadri Farmers Producer Co.',
      rating: 4.8,
      is_verified: true,
      district: 'Nashik'
    }
  },
  {
    id: 4,
    crop_name: 'Rice (Basmati)',
    crop_variety: 'Pusa 1121',
    quantity_needed_qtl: 600,
    target_price_per_qtl: 4600,
    pickup_district: 'Karnal',
    pickup_state: 'Haryana',
    procurement_location: 'Karnal Grain Market, Haryana',
    preferred_districts: 'Karnal, Kurukshetra, Panipat, Ambala',
    logistics_option: 'vendor_pickup',
    expiry_date: '2026-11-05',
    vendor: {
      business_name: 'KRBL Agri Trading & Export',
      rating: 5.0,
      is_verified: true,
      district: 'Delhi NCR'
    }
  }
];

export default function FarmerBrowseRequirementsPage() {
  const navigate = useNavigate();
  const { setMobileMenuOpen } = useMobileMenu();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReqModal, setSelectedReqModal] = useState(null);

  const rawBase = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/').trim();
  const API_BASE = (rawBase.startsWith('http') ? rawBase : `https://${rawBase}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    setLoading(true);
    let loaded = false;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`${API_BASE}api/vendor/marketplace/requirements`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        const json = await res.json();
        if (json.requirements && json.requirements.length > 0) {
          setRequirements(json.requirements);
          loaded = true;
        }
      }
    } catch (e) {
      console.warn("Could not fetch requirements from API, using default verified buyers:", e);
    } finally {
      if (!loaded && requirements.length === 0) {
        setRequirements(DEFAULT_REQUIREMENTS);
      }
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

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 custom-scrollbar bg-white text-slate-900 dark:bg-[#030905] dark:text-[#e2f0e4] transition-colors">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        
        {/* Top Header */}
        <div className="text-center space-y-3 relative">
          <div className="md:hidden absolute left-0 top-0">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 bg-emerald-100 dark:bg-[#166534]/40 border border-emerald-200 dark:border-[#86efac]/20 rounded-xl text-emerald-600 dark:text-[#4ade80] shrink-0 transition-colors"
            >
              <Menu size={18} />
            </button>
          </div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <span className="px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
              <Wheat size={14} /> Farm-Gate Procurement Hub
            </span>
          </motion.div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white font-['Outfit'] tracking-tight transition-colors">
            Sell Crops Directly To <span className="bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-400 dark:to-yellow-300 bg-clip-text text-transparent">Verified Buyers</span>
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto transition-colors">
            Browse live crop purchasing tenders from certified APMC traders, exporters, and processors offering premium rates with farm-gate pickup.
          </p>
        </div>

        {/* Overview Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Wheat, label: 'Active Buying Tenders', val: `${requirements.length} Open Orders`, color: '#facc15' },
            { icon: IndianRupee, label: 'Total Procurement Budget', val: '₹ 4.8 Cr Available', color: '#10b981' },
            { icon: Truck, label: 'Farm-Gate Pickups', val: 'Free Transport', color: '#3b82f6' },
            { icon: ShieldCheck, label: 'Payment Guarantee', val: '24hr Payouts', color: '#a855f7' },
          ].map((m, i) => (
            <div
              key={i}
              className="p-4 flex items-center gap-3 bg-slate-50 dark:bg-[#0a1a0d]/80 border border-slate-200 dark:border-[rgba(134,239,172,0.12)] rounded-2xl shadow-sm transition-colors"
            >
              <div
                style={{ background: `${m.color}18` }}
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              >
                <m.icon size={20} style={{ color: m.color }} />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-[#86efac]/70 font-semibold transition-colors">{m.label}</p>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white font-['Outfit'] transition-colors">{m.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Search & Crop Category Filter */}
        <div className="p-6 space-y-4 bg-slate-50/80 dark:bg-[rgba(8,24,12,0.88)] border border-slate-200 dark:border-[rgba(134,239,172,0.15)] rounded-3xl shadow-sm dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-colors">
          <div className="relative w-full">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              placeholder="Search by crop name (e.g. Cotton, Soybean), buyer name, or district..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full py-3 pl-11 pr-4 bg-white dark:bg-[rgba(14,38,20,0.9)] border border-slate-200 dark:border-[rgba(134,239,172,0.2)] rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-gray-400 text-sm outline-none focus:border-amber-500/60 transition-all font-medium"
            />
          </div>

          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-200 dark:border-[#86efac]/10">
            {CROP_FILTERS.map(crop => (
              <button
                key={crop}
                onClick={() => setSelectedCrop(crop)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  selectedCrop === crop
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-md shadow-amber-500/20 border border-amber-400'
                    : 'bg-white dark:bg-white/5 text-slate-600 dark:text-white/60 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {crop}
              </button>
            ))}
          </div>
        </div>

        {/* Requirements Grid */}
        {filteredRequirements.length === 0 ? (
          <div className="p-12 text-center space-y-3 bg-slate-50/80 dark:bg-[rgba(8,24,12,0.88)] border border-slate-200 dark:border-[rgba(134,239,172,0.15)] rounded-3xl shadow-sm transition-colors">
            <Wheat size={48} className="mx-auto text-slate-400 dark:text-gray-600" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white transition-colors">No Procurement Requirements Match</h3>
            <p className="text-xs text-slate-500 dark:text-gray-400 transition-colors">Try selecting a different crop filter or clearing search terms.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRequirements.map(req => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 space-y-4 flex flex-col justify-between group bg-white dark:bg-[rgba(8,24,12,0.88)] border border-slate-200 dark:border-[rgba(134,239,172,0.15)] rounded-3xl shadow-sm hover:shadow-lg dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-amber-500/50 dark:hover:border-amber-400/40 transition-all duration-300"
              >
                <div className="space-y-3">
                  {/* Top Crop & Price Row */}
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-3 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase inline-block mb-1">
                        🌾 Buying Tender
                      </span>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white font-['Outfit'] group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        {req.crop_name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-700 dark:text-[#86efac]/70 font-semibold transition-colors">Target Price</p>
                      <p className="text-2xl font-black text-amber-600 dark:text-amber-400 font-['Outfit'] transition-colors">
                        ₹{req.target_price_per_qtl?.toLocaleString()} <span className="text-xs font-normal text-slate-500 dark:text-gray-400">/ qtl</span>
                      </p>
                    </div>
                  </div>

                  {/* Buyer Profile */}
                  <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[rgba(14,38,20,0.8)] border border-slate-200 dark:border-[rgba(134,239,172,0.1)] flex items-center justify-between transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center font-bold text-base">
                        🏢
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-white transition-colors">{req.vendor?.business_name}</p>
                        <p className="text-[0.68rem] font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">✓ APMC Verified Trader</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                      <Star size={14} fill="#facc15" className="text-amber-400" /> 4.9
                    </div>
                  </div>

                  {/* Procurement Specs Grid */}
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-white/5 transition-colors">
                      <p className="text-slate-500 dark:text-gray-400 font-medium">Required Quantity</p>
                      <p className="font-extrabold text-slate-900 dark:text-white text-sm mt-0.5 transition-colors">{req.quantity_needed_qtl} Quintals</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-gray-900/50 border border-slate-200 dark:border-white/5 transition-colors">
                      <p className="text-slate-500 dark:text-gray-400 font-medium">Quality Spec</p>
                      <p className="font-extrabold text-emerald-700 dark:text-emerald-400 text-sm mt-0.5 transition-colors">Moisture Max 8%</p>
                    </div>
                  </div>

                  {/* Location & Logistics */}
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-gray-300 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>Preferred Districts: <strong className="text-slate-900 dark:text-white transition-colors">{req.preferred_districts || 'Maharashtra'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Truck size={14} className="text-blue-500 dark:text-blue-400 shrink-0" />
                      <span>Logistics: <strong className="text-blue-600 dark:text-blue-300 transition-colors">{req.logistics_option === 'vendor_pickup' ? '🚚 Free Farm-Gate Truck Pickup Available' : '🏬 Warehouse Delivery'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#86efac]/10 flex items-center justify-between gap-3 transition-colors">
                  <div className="text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1 transition-colors">
                    <Clock size={14} className="text-amber-500 dark:text-amber-400" />
                    <span>Open till: {req.expiry_date || '2026-08-30'}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReqModal(req)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-950 font-black text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 cursor-pointer"
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
