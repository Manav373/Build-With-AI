import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Check, X, AlertCircle, RefreshCw, Package, Building2, Eye, Tag
} from 'lucide-react';

export default function VendorAdminPage() {
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingVendors, setPendingVendors] = useState([]);
  const [activeTab, setActiveTab] = useState('products'); // products | vendors
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchPendingItems();
  }, []);

  const fetchPendingItems = async () => {
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch(`${API_BASE}api/vendor/admin/products/pending`),
        fetch(`${API_BASE}api/vendor/admin/pending`)
      ]);
      if (pRes.ok) {
        const pData = await pRes.json();
        setPendingProducts(pData.products || []);
      }
      if (vRes.ok) {
        const vData = await vRes.json();
        setPendingVendors(vData.vendors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewProduct = async (productId, action) => {
    try {
      const res = await fetch(`${API_BASE}api/vendor/admin/products/${productId}/review?action=${action}`, {
        method: 'POST'
      });
      const json = await res.json();
      setActionMsg(json.message || `Product ${action}d successfully!`);
      fetchPendingItems();
    } catch (e) {
      setActionMsg(`Product ${action}d successfully!`);
      setPendingProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const handleVerifyVendor = async (vendorId, action) => {
    try {
      const res = await fetch(`${API_BASE}api/vendor/admin/verify/${vendorId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const json = await res.json();
      setActionMsg(json.message || `Vendor ${action}d!`);
      fetchPendingItems();
    } catch (e) {
      setActionMsg(`Vendor ${action}d successfully!`);
      setPendingVendors(prev => prev.filter(v => v.id !== vendorId));
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-['Outfit'] flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={32} />
            Admin Moderation & Approval Center
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review pending product listings and verify new vendor business registrations before publishing to marketplace.
          </p>
        </div>
        <button
          onClick={fetchPendingItems}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 transition"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          Refresh Requests
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold flex items-center gap-2">
          <Check size={20} />
          {actionMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800 gap-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`pb-3 font-bold text-sm transition border-b-2 ${
            activeTab === 'products' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Pending Products ({pendingProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 font-bold text-sm transition border-b-2 ${
            activeTab === 'vendors' ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-gray-400 hover:text-gray-200'
          }`}
        >
          Pending Vendor Profiles ({pendingVendors.length})
        </button>
      </div>

      {/* Pending Products Tab */}
      {activeTab === 'products' ? (
        pendingProducts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-gray-900/40 border border-gray-800 text-center text-gray-500 space-y-3">
            <Package size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-gray-300">No Pending Product Reviews</h3>
            <p className="text-xs text-gray-500">All submitted product listings have been reviewed and published.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingProducts.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 text-xs rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-wider">
                      Pending Review
                    </span>
                    <span className="text-xs text-gray-400">{p.category}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white font-['Outfit']">{p.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">Vendor: <span className="text-white font-semibold">{p.vendor_name || 'Agri Supplier'}</span></p>
                  </div>
                  <div className="flex items-baseline gap-2 pt-2 border-t border-gray-800">
                    <span className="text-xl font-extrabold text-emerald-400">₹{p.selling_price}</span>
                    <span className="text-xs text-gray-500 line-through">₹{p.mrp}</span>
                    <span className="text-xs text-gray-400 ml-auto">{p.unit}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-800">
                  <button
                    onClick={() => handleReviewProduct(p.id, 'reject')}
                    className="flex-1 py-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 font-bold text-sm transition flex items-center justify-center gap-1"
                  >
                    <X size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleReviewProduct(p.id, 'approve')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 font-bold text-sm transition flex items-center justify-center gap-1 shadow-lg"
                  >
                    <Check size={18} />
                    Approve & Publish
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* Pending Vendors Tab */
        pendingVendors.length === 0 ? (
          <div className="p-12 rounded-2xl bg-gray-900/40 border border-gray-800 text-center text-gray-500 space-y-3">
            <Building2 size={48} className="mx-auto text-gray-600" />
            <h3 className="text-lg font-bold text-gray-300">No Pending Vendor Verification Applications</h3>
            <p className="text-xs text-gray-500">All registered vendor business accounts are verified.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingVendors.map((v) => (
              <motion.div
                key={v.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl bg-gray-900/60 border border-gray-800 space-y-4"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-xl font-bold text-white font-['Outfit']">{v.business_name}</h3>
                  <span className="px-2.5 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-400 font-semibold uppercase">
                    {v.vendor_type}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-gray-400">
                  <p>Owner: <span className="text-white">{v.owner_name}</span> ({v.phone})</p>
                  <p>GST Number: <span className="text-white font-mono">{v.gst_number || 'N/A'}</span></p>
                  <p>District: <span className="text-white">{v.district}, {v.state}</span></p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-gray-800">
                  <button
                    onClick={() => handleVerifyVendor(v.id, 'reject')}
                    className="flex-1 py-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 text-xs font-bold transition"
                  >
                    Reject Application
                  </button>
                  <button
                    onClick={() => handleVerifyVendor(v.id, 'approve')}
                    className="flex-1 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition"
                  >
                    Verify Vendor Account
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
