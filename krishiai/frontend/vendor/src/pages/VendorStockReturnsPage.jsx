import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RotateCcw, AlertTriangle, ShieldAlert, CheckCircle2,
  Clock, Plus, Search, Filter, ArrowUpRight, ArrowDownRight,
  Package, Truck, DollarSign, FileSpreadsheet, X, RefreshCw, AlertCircle, Trash2
} from 'lucide-react';

// Mock initial datasets for Returns & Audits
const INITIAL_SALES_RETURNS = [
  { id: 'SR-1092', orderId: 'ORD-8821', customer: 'Ramesh Patel', product: 'Hybrid Cotton Seed Mahyco 7351', qty: 5, amount: 2450, reason: 'Wrong Seed Variety Delivered', status: 'Approved & Restocked', date: '2026-09-12' },
  { id: 'SR-1093', orderId: 'ORD-8845', customer: 'Suresh Kumar', product: 'Neem-based Pesticide Spray 1L', qty: 2, amount: 980, reason: 'Leaked Bottle in Transit', status: 'Damaged - Written Off', date: '2026-09-14' },
  { id: 'SR-1094', orderId: 'ORD-8890', customer: 'Vijay Singh', product: 'Organic NPK Bio-Fertilizer (50kg)', qty: 1, amount: 1250, reason: 'Farmer Order Cancellation', status: 'Pending Inspection', date: '2026-09-15' },
];

const INITIAL_PURCHASE_RETURNS = [
  { id: 'PR-401', supplier: 'Mahyco Agri Seeds Ltd', batch: 'B-2026-90', product: 'Hybrid Cotton Seed Mahyco 7351', qty: 20, rma: 'RMA-9921', refundAmount: 9800, status: 'Claim Approved', date: '2026-09-10' },
  { id: 'PR-402', supplier: 'BioFert Organic Labs', batch: 'B-2025-11', product: 'Organic NPK Bio-Fertilizer (50kg)', qty: 10, rma: 'RMA-9940', refundAmount: 11000, status: 'Pending Supplier Pickup', date: '2026-09-13' },
];

const INITIAL_DAMAGED_STOCK = [
  { id: 'DMG-801', product: 'Neem-based Pesticide Spray 1L', batch: 'B-2026-44', qty: 6, costLoss: 1800, location: 'Warehouse Bay 3', reason: 'Pallet drop during handling', reportedDate: '2026-09-08' },
  { id: 'DMG-802', product: 'Organic NPK Bio-Fertilizer (50kg)', batch: 'B-2026-12', qty: 3, costLoss: 3300, location: 'Storage Rack B', reason: 'Moisture damage / Bag torn', reportedDate: '2026-09-11' },
];

const INITIAL_EXPIRED_STOCK = [
  { id: 'EXP-301', product: 'Bio-Fungicide Trichoderma 500g', batch: 'B-2024-88', qty: 15, expiryDate: '2026-08-30', status: 'Quarantined', risk: 'Expired (Past 15 days)' },
  { id: 'EXP-302', product: 'Organic NPK Bio-Fertilizer (50kg)', batch: 'B-2026-12', qty: 10, expiryDate: '2026-10-15', status: 'Near Expiry Alert', risk: 'Expires in 30 Days' },
];

export default function VendorStockReturnsPage() {
  const [activeTab, setActiveTab] = useState('sales_returns'); // 'sales_returns', 'purchase_returns', 'damaged', 'expired'
  const [searchTerm, setSearchTerm] = useState('');

  // States
  const [salesReturns, setSalesReturns] = useState(INITIAL_SALES_RETURNS);
  const [purchaseReturns, setPurchaseReturns] = useState(INITIAL_PURCHASE_RETURNS);
  const [damagedStock, setDamagedStock] = useState(INITIAL_DAMAGED_STOCK);
  const [expiredStock, setExpiredStock] = useState(INITIAL_EXPIRED_STOCK);

  // Modal Control
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});

  // Helper Stats
  const totalSalesReturnVal = salesReturns.reduce((acc, r) => acc + r.amount, 0);
  const totalSupplierRefundVal = purchaseReturns.reduce((acc, r) => acc + r.refundAmount, 0);
  const totalDamageLossVal = damagedStock.reduce((acc, d) => acc + d.costLoss, 0);
  const expiredQuarantineCount = expiredStock.filter(e => e.status === 'Quarantined').reduce((acc, e) => acc + e.qty, 0);

  const handleOpenModal = () => {
    setFormData({});
    setShowModal(true);
  };

  const handleSaveEntry = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    if (activeTab === 'sales_returns') {
      const newEntry = {
        id: `SR-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: formData.orderId || `ORD-${Math.floor(8000 + Math.random() * 1000)}`,
        customer: formData.customer || 'Walk-in Customer',
        product: formData.product || 'Standard Product',
        qty: parseInt(formData.qty) || 1,
        amount: parseFloat(formData.amount) || 500,
        reason: formData.reason || 'Defective Item',
        status: formData.action === 'restock' ? 'Approved & Restocked' : 'Damaged - Written Off',
        date: today
      };
      setSalesReturns([newEntry, ...salesReturns]);
    } else if (activeTab === 'purchase_returns') {
      const newEntry = {
        id: `PR-${Math.floor(400 + Math.random() * 500)}`,
        supplier: formData.supplier || 'Agri Supplier Co.',
        batch: formData.batch || 'B-2026-99',
        product: formData.product || 'Bulk Supply Product',
        qty: parseInt(formData.qty) || 1,
        rma: formData.rma || `RMA-${Math.floor(9000 + Math.random() * 999)}`,
        refundAmount: parseFloat(formData.refundAmount) || 1000,
        status: 'Pending Supplier Pickup',
        date: today
      };
      setPurchaseReturns([newEntry, ...purchaseReturns]);
    } else if (activeTab === 'damaged') {
      const newEntry = {
        id: `DMG-${Math.floor(800 + Math.random() * 100)}`,
        product: formData.product || 'Warehouse Inventory Product',
        batch: formData.batch || 'B-2026-00',
        qty: parseInt(formData.qty) || 1,
        costLoss: parseFloat(formData.costLoss) || 450,
        location: formData.location || 'Main Storage',
        reason: formData.reason || 'Transit Damage',
        reportedDate: today
      };
      setDamagedStock([newEntry, ...damagedStock]);
    } else if (activeTab === 'expired') {
      const newEntry = {
        id: `EXP-${Math.floor(300 + Math.random() * 100)}`,
        product: formData.product || 'Chemical / Bio Product',
        batch: formData.batch || 'B-2026-10',
        qty: parseInt(formData.qty) || 1,
        expiryDate: formData.expiryDate || today,
        status: 'Quarantined',
        risk: 'Quarantined by Vendor'
      };
      setExpiredStock([newEntry, ...expiredStock]);
    }

    setShowModal(false);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 text-white">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
            <RotateCcw className="text-[#4ade80]" size={32} />
            Stock Returns & Quality Audits
          </h1>
          <p className="text-[#86efac]/70 mt-1 text-sm">
            Manage customer sales returns, supplier purchase return claims, damaged items, and expired quarantine stock.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="px-4 py-2.5 bg-[#4ade80] hover:bg-[#22c55e] text-black font-bold text-sm rounded-xl transition shadow-lg flex items-center gap-2"
          >
            <Plus size={18} />
            {activeTab === 'sales_returns' && 'Log Customer Return'}
            {activeTab === 'purchase_returns' && 'Log Supplier Return'}
            {activeTab === 'damaged' && 'Report Damaged Stock'}
            {activeTab === 'expired' && 'Log Expired Stock'}
          </button>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-[#0e2614] to-[#08180c] shadow-xl"
        >
          <div className="flex items-center justify-between text-[#86efac]/70 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Customer Sales Returns</span>
            <RotateCcw size={18} className="text-[#4ade80]" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            ₹{totalSalesReturnVal.toLocaleString()}
          </div>
          <div className="text-xs text-[#86efac]/80 mt-1 flex items-center gap-1">
            <ArrowDownRight size={14} className="text-[#4ade80]" />
            {salesReturns.length} return claims processed
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-blue-500/20 bg-gradient-to-br from-[#0c2038] to-[#081524] shadow-xl"
        >
          <div className="flex items-center justify-between text-blue-300/70 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Supplier Return Claims</span>
            <Truck size={18} className="text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            ₹{totalSupplierRefundVal.toLocaleString()}
          </div>
          <div className="text-xs text-blue-300/80 mt-1 flex items-center gap-1">
            <CheckCircle2 size={14} className="text-blue-400" />
            {purchaseReturns.length} RMA claims active
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-[#2b1f09] to-[#1a1205] shadow-xl"
        >
          <div className="flex items-center justify-between text-amber-300/70 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Damaged Stock Loss</span>
            <AlertTriangle size={18} className="text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            ₹{totalDamageLossVal.toLocaleString()}
          </div>
          <div className="text-xs text-amber-300/80 mt-1 flex items-center gap-1">
            <ShieldAlert size={14} className="text-amber-400" />
            {damagedStock.length} damage reports logged
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -3 }}
          className="p-5 rounded-2xl border border-red-500/20 bg-gradient-to-br from-[#300c0c] to-[#1c0707] shadow-xl"
        >
          <div className="flex items-center justify-between text-red-300/70 mb-2 text-xs font-semibold uppercase tracking-wider">
            <span>Quarantined / Expired</span>
            <Clock size={18} className="text-red-400" />
          </div>
          <div className="text-2xl font-black text-white font-['Outfit']">
            {expiredQuarantineCount} units
          </div>
          <div className="text-xs text-red-300/80 mt-1 flex items-center gap-1">
            <AlertCircle size={14} className="text-red-400" />
            {expiredStock.length} batch items flagged
          </div>
        </motion.div>
      </div>

      {/* Tabs Navigation & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#86efac]/15 pb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {[
            { id: 'sales_returns', label: 'Sales Returns (Customer)', icon: RotateCcw, count: salesReturns.length },
            { id: 'purchase_returns', label: 'Purchase Returns (Supplier)', icon: Truck, count: purchaseReturns.length },
            { id: 'damaged', label: 'Damaged Stock', icon: AlertTriangle, count: damagedStock.length },
            { id: 'expired', label: 'Expired & Quarantine', icon: Clock, count: expiredStock.length },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
                  isActive
                    ? 'bg-[#4ade80] text-black shadow-lg shadow-[#4ade80]/20'
                    : 'bg-[#0e2614]/80 text-[#86efac]/70 hover:bg-[#143820] hover:text-white border border-[#86efac]/10'
                }`}
              >
                <Icon size={16} />
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isActive ? 'bg-black/20 text-black font-extrabold' : 'bg-white/10 text-gray-300'
                }`}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            placeholder="Search batch, product, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              background: 'rgba(14, 38, 20, 0.9)',
              border: '1px solid rgba(134, 239, 172, 0.2)',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '0.85rem'
            }}
            className="w-full pl-9 pr-4 py-2 focus:outline-none focus:border-[#4ade80]"
          />
        </div>
      </div>

      {/* Main Content Tables */}
      <div style={{ background: 'rgba(8, 24, 12, 0.85)', border: '1px solid rgba(134, 239, 172, 0.15)', borderRadius: '1.25rem' }} className="overflow-x-auto shadow-2xl">
        {/* TAB 1: SALES RETURNS */}
        {activeTab === 'sales_returns' && (
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Return ID</th>
                <th className="p-4">Order & Customer</th>
                <th className="p-4">Product Returned</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Return Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {salesReturns
                .filter(r => r.product.toLowerCase().includes(searchTerm.toLowerCase()) || r.id.toLowerCase().includes(searchTerm.toLowerCase()) || r.customer.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <tr key={item.id} className="hover:bg-[#143820]/40 transition">
                    <td className="p-4 font-mono text-[#4ade80] font-bold">{item.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{item.customer}</div>
                      <div className="text-xs text-gray-400 font-mono">{item.orderId}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-200">{item.product}</td>
                    <td className="p-4 font-bold text-white">{item.qty} units</td>
                    <td className="p-4 font-extrabold text-emerald-400">₹{item.amount.toLocaleString()}</td>
                    <td className="p-4 text-xs text-amber-300">{item.reason}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${
                        item.status.includes('Restocked')
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : item.status.includes('Damaged')
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{item.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* TAB 2: PURCHASE RETURNS */}
        {activeTab === 'purchase_returns' && (
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Claim ID</th>
                <th className="p-4">Supplier Name</th>
                <th className="p-4">Product & Batch</th>
                <th className="p-4">Returned Qty</th>
                <th className="p-4">RMA / Tracking</th>
                <th className="p-4">Claim Refund</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Logged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {purchaseReturns
                .filter(p => p.product.toLowerCase().includes(searchTerm.toLowerCase()) || p.supplier.toLowerCase().includes(searchTerm.toLowerCase()) || p.batch.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <tr key={item.id} className="hover:bg-[#143820]/40 transition">
                    <td className="p-4 font-mono text-blue-400 font-bold">{item.id}</td>
                    <td className="p-4 font-bold text-white">{item.supplier}</td>
                    <td className="p-4">
                      <div className="font-semibold text-gray-200">{item.product}</div>
                      <div className="text-xs text-gray-400 font-mono">Batch: {item.batch}</div>
                    </td>
                    <td className="p-4 font-bold text-white">{item.qty} units</td>
                    <td className="p-4 font-mono text-xs text-gray-300">{item.rma}</td>
                    <td className="p-4 font-extrabold text-blue-300">₹{item.refundAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${
                        item.status.includes('Approved')
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-gray-400">{item.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* TAB 3: DAMAGED STOCK */}
        {activeTab === 'damaged' && (
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Report ID</th>
                <th className="p-4">Product & Batch</th>
                <th className="p-4">Damaged Qty</th>
                <th className="p-4">Estimated Loss</th>
                <th className="p-4">Storage Location</th>
                <th className="p-4">Damage Description</th>
                <th className="p-4">Reported Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {damagedStock
                .filter(d => d.product.toLowerCase().includes(searchTerm.toLowerCase()) || d.batch.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <tr key={item.id} className="hover:bg-[#143820]/40 transition">
                    <td className="p-4 font-mono text-amber-400 font-bold">{item.id}</td>
                    <td className="p-4">
                      <div className="font-bold text-white">{item.product}</div>
                      <div className="text-xs text-gray-400 font-mono">Batch: {item.batch}</div>
                    </td>
                    <td className="p-4 font-bold text-white">{item.qty} units</td>
                    <td className="p-4 font-extrabold text-red-400">₹{item.costLoss.toLocaleString()}</td>
                    <td className="p-4 text-xs text-gray-300">{item.location}</td>
                    <td className="p-4 text-xs text-amber-200/90">{item.reason}</td>
                    <td className="p-4 text-xs text-gray-400">{item.reportedDate}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {/* TAB 4: EXPIRED STOCK */}
        {activeTab === 'expired' && (
          <table className="w-full text-left text-sm text-gray-200">
            <thead className="bg-[#0e2614] text-xs uppercase text-[#86efac]/80 border-b border-[#86efac]/10">
              <tr>
                <th className="p-4">Record ID</th>
                <th className="p-4">Product Name</th>
                <th className="p-4">Batch Lot</th>
                <th className="p-4">Affected Qty</th>
                <th className="p-4">Expiry Date</th>
                <th className="p-4">Quarantine Status</th>
                <th className="p-4">Risk Category</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#86efac]/10">
              {expiredStock
                .filter(e => e.product.toLowerCase().includes(searchTerm.toLowerCase()) || e.batch.toLowerCase().includes(searchTerm.toLowerCase()))
                .map(item => (
                  <tr key={item.id} className="hover:bg-[#143820]/40 transition">
                    <td className="p-4 font-mono text-red-400 font-bold">{item.id}</td>
                    <td className="p-4 font-bold text-white">{item.product}</td>
                    <td className="p-4 font-mono text-xs text-gray-400">{item.batch}</td>
                    <td className="p-4 font-bold text-white">{item.qty} units</td>
                    <td className="p-4 font-mono text-red-300 font-bold">{item.expiryDate}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-bold border ${
                        item.status === 'Quarantined'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-semibold text-gray-300">{item.risk}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Popup for Logging New Entries */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              style={{ background: '#0e2614', border: '1px solid rgba(134, 239, 172, 0.25)' }}
              className="w-full max-w-lg p-6 rounded-2xl shadow-2xl text-white space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[#86efac]/10 pb-3">
                <h3 className="text-xl font-extrabold font-['Outfit'] text-white flex items-center gap-2">
                  <Plus className="text-[#4ade80]" size={20} />
                  {activeTab === 'sales_returns' && 'Log Customer Sales Return'}
                  {activeTab === 'purchase_returns' && 'Log Supplier Purchase Return'}
                  {activeTab === 'damaged' && 'Report Damaged Inventory'}
                  {activeTab === 'expired' && 'Log Expired Batch Stock'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveEntry} className="space-y-4">
                {activeTab === 'sales_returns' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Customer Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ramesh Patel"
                        onChange={e => setFormData({ ...formData, customer: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Order ID</label>
                        <input
                          type="text"
                          placeholder="ORD-8821"
                          onChange={e => setFormData({ ...formData, orderId: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Return Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          onChange={e => setFormData({ ...formData, qty: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Hybrid Cotton Seed Mahyco 7351"
                        onChange={e => setFormData({ ...formData, product: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Return Value (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          onChange={e => setFormData({ ...formData, amount: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Stock Disposition</label>
                        <select
                          onChange={e => setFormData({ ...formData, action: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        >
                          <option value="restock">Approve & Restock</option>
                          <option value="damage">Mark as Damaged / Write off</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Return Reason</label>
                      <input
                        type="text"
                        placeholder="e.g. Wrong Seed Variety Delivered"
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'purchase_returns' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Supplier Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Mahyco Agri Seeds Ltd"
                        onChange={e => setFormData({ ...formData, supplier: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Batch Number</label>
                        <input
                          type="text"
                          placeholder="B-2026-90"
                          onChange={e => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Returned Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          onChange={e => setFormData({ ...formData, qty: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Organic NPK Bio-Fertilizer"
                        onChange={e => setFormData({ ...formData, product: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">RMA Tracking No</label>
                        <input
                          type="text"
                          placeholder="RMA-9921"
                          onChange={e => setFormData({ ...formData, rma: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Refund Claim (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="Amount"
                          onChange={e => setFormData({ ...formData, refundAmount: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'damaged' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Neem Spray 1L"
                        onChange={e => setFormData({ ...formData, product: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Batch Lot</label>
                        <input
                          type="text"
                          placeholder="B-2026-44"
                          onChange={e => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Damaged Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          onChange={e => setFormData({ ...formData, qty: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Cost Loss (₹)</label>
                        <input
                          type="number"
                          required
                          placeholder="Write-off Loss"
                          onChange={e => setFormData({ ...formData, costLoss: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Storage Location</label>
                        <input
                          type="text"
                          placeholder="Bay 3 / Storage Rack B"
                          onChange={e => setFormData({ ...formData, location: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Damage Description</label>
                      <input
                        type="text"
                        placeholder="e.g. Torn bag during forklift handling"
                        onChange={e => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  </>
                )}

                {activeTab === 'expired' && (
                  <>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Product Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bio-Fungicide Trichoderma"
                        onChange={e => setFormData({ ...formData, product: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Batch Lot</label>
                        <input
                          type="text"
                          placeholder="B-2024-88"
                          onChange={e => setFormData({ ...formData, batch: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-300 font-semibold mb-1 block">Affected Qty</label>
                        <input
                          type="number"
                          required
                          min="1"
                          placeholder="Qty"
                          onChange={e => setFormData({ ...formData, qty: e.target.value })}
                          className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-300 font-semibold mb-1 block">Expiry Date</label>
                      <input
                        type="date"
                        required
                        onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        className="w-full p-2.5 bg-[#08180c] border border-[#86efac]/20 rounded-xl text-sm text-white focus:outline-none focus:border-[#4ade80]"
                      />
                    </div>
                  </>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#86efac]/10">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-gray-800 text-gray-300 rounded-xl text-xs font-bold hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#4ade80] text-black font-bold rounded-xl text-xs hover:bg-[#22c55e]"
                  >
                    Save & Update Stock
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
