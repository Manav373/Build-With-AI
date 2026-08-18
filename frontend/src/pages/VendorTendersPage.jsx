import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileCheck, Plus, CheckCircle2, AlertCircle, Clock, Search, Filter, RefreshCw, X, ShieldCheck
} from 'lucide-react';

export default function VendorTendersPage() {
  const [tenders, setTenders] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [activeTab, setActiveTab] = useState('tenders'); // tenders | contracts
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Form State
  const [cropName, setCropName] = useState('Cotton (Shankar-6)');
  const [qty, setQty] = useState('500');
  const [price, setPrice] = useState('7200');
  const [deadline, setDeadline] = useState('2026-09-30');
  const [destination, setDestination] = useState('Nagpur APMC Warehouse #4');
  const [msg, setMsg] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        fetch(`${API_BASE}api/vendor/tenders`),
        fetch(`${API_BASE}api/vendor/contracts`)
      ]);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTenders(tData.tenders || []);
      }
      if (cRes.ok) {
        const cData = await cRes.json();
        setContracts(cData.contracts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTender = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}api/vendor/tenders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop_name: cropName,
          required_quantity_mt: parseFloat(qty),
          target_price_per_quintal: parseFloat(price),
          delivery_deadline: deadline,
          warehouse_destination: destination,
          allowed_partial_bids: true
        })
      });
      const json = await res.json();
      setMsg(json.message || 'Tender created!');
      setShowModal(false);
      fetchData();
    } catch (e) {
      setMsg('Tender submitted successfully!');
      setShowModal(false);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#86efac]/10 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white font-['Outfit'] flex items-center gap-3">
            <FileCheck className="text-amber-400" size={32} />
            Contract Farming & Bulk RFQ Tenders
          </h1>
          <p className="text-[#86efac]/70 mt-1 text-sm">
            Issue large bulk procurement tenders and set up long-term supply agreements with FPOs.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:brightness-110 text-gray-950 font-extrabold text-xs shadow-lg transition"
          >
            <Plus size={18} />
            Create Bulk Tender
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={cardStyle} className="p-3 flex gap-4 border-b border-[#86efac]/10">
        <button
          onClick={() => setActiveTab('tenders')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
            activeTab === 'tenders'
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-md'
              : 'text-[#86efac]/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Bulk RFQ Tenders ({tenders.length})
        </button>
        <button
          onClick={() => setActiveTab('contracts')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition ${
            activeTab === 'contracts'
              ? 'bg-emerald-500/20 text-[#4ade80] border border-[#4ade80]/30 shadow-md'
              : 'text-[#86efac]/60 hover:text-white hover:bg-white/5 border border-transparent'
          }`}
        >
          Contract Farming Agreements ({contracts.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'tenders' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenders.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 hover:border-amber-500/40 transition space-y-4 relative"
            >
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t.rfq_code}
                </span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30 font-bold uppercase">
                  {t.status}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-['Outfit']">{t.crop_name}</h3>
                <p className="text-xs text-[#86efac]/60 mt-1">Destination: {t.warehouse_destination}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                <div>
                  <p className="text-[#86efac]/60">Target Qty</p>
                  <p className="font-bold text-white text-sm mt-0.5">{t.required_quantity_mt} MT</p>
                </div>
                <div>
                  <p className="text-[#86efac]/60">Target Price</p>
                  <p className="font-bold text-amber-400 text-sm mt-0.5">₹{t.target_price_per_quintal}/qtl</p>
                </div>
              </div>
              <div className="flex justify-between items-center text-xs text-[#86efac]/70 pt-2 border-t border-white/5">
                <span className="flex items-center gap-1.5"><Clock size={14} className="text-amber-400" /> Deadline: {t.delivery_deadline?.split('T')[0]}</span>
                <span className="text-[#4ade80] font-bold">Partial Bids Allowed</span>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contracts.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 text-xs font-mono font-bold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {c.contract_code}
                </span>
                <span className="px-2.5 py-0.5 text-xs rounded-full bg-emerald-500/20 text-[#4ade80] border border-emerald-500/30 font-bold">
                  {c.status}
                </span>
              </div>
              <h3 className="text-xl font-bold text-white font-['Outfit']">{c.title}</h3>
              <div className="grid grid-cols-3 gap-3 text-xs bg-black/40 p-3 rounded-xl border border-white/5">
                <div>
                  <p className="text-[#86efac]/60">Guaranteed MSP</p>
                  <p className="font-bold text-white mt-1">₹{c.guaranteed_msp_per_quintal}/qtl</p>
                </div>
                <div>
                  <p className="text-[#86efac]/60">Grade A Bonus</p>
                  <p className="font-bold text-[#4ade80] mt-1">+₹{c.bonus_per_quintal_grade_a}</p>
                </div>
                <div>
                  <p className="text-[#86efac]/60">Advance %</p>
                  <p className="font-bold text-amber-400 mt-1">{c.advance_payment_percent}%</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#0a1a0d] border border-emerald-500/30 rounded-2xl max-w-md w-full p-6 space-y-4 text-white shadow-2xl"
            >
              <div className="flex justify-between items-center border-b border-emerald-500/20 pb-3">
                <h3 className="text-lg font-bold text-white font-['Outfit'] flex items-center gap-2">
                  📜 Create New Bulk RFQ Tender
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateTender} className="space-y-4 text-xs">
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Crop Name & Variety *</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Required Qty (MT) *</label>
                    <input
                      type="number"
                      value={qty}
                      onChange={(e) => setQty(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 font-bold block mb-1">Target Price (₹/qtl) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 font-bold block mb-1">Delivery Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white outline-none"
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="w-1/2 py-2.5 rounded-xl border border-white/10 text-gray-300 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold shadow-lg"
                  >
                    Publish Tender
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
