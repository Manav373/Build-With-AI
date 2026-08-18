import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard, ArrowUpRight, ArrowDownLeft, ShieldCheck, Clock,
  CheckCircle2, AlertTriangle, Download, Search, Filter, RefreshCw,
  Building2, Landmark, Wallet, Check, X, ArrowRight, DollarSign,
  ChevronRight, Sparkles, FileText, Lock
} from 'lucide-react';

const INITIAL_TRANSACTIONS = [
  {
    id: 'TXN-9842',
    type: 'procurement',
    title: 'Procurement Bid Settlement (500 MT Organic Wheat)',
    source: 'Green Harvest Farmer Collective',
    amount: 145000,
    direction: 'in',
    status: 'completed',
    date: '2026-08-18 14:30',
    method: 'NEFT Escrow Payout',
    reference: 'ESC-8849-WHEAT',
  },
  {
    id: 'TXN-9841',
    type: 'escrow',
    title: 'Escrow Locked Payment (200 Bags Bio-Fertilizer)',
    source: 'Rajesh Patel (Farmer #442)',
    amount: 82000,
    direction: 'in',
    status: 'in_escrow',
    date: '2026-08-17 11:15',
    method: 'KrishiAI Smart Escrow',
    reference: 'ESC-7721-FERT',
  },
  {
    id: 'TXN-9840',
    type: 'withdrawal',
    title: 'Withdrawal to Primary HDFC Bank Account',
    source: 'HDFC Bank (A/C ****4912)',
    amount: 100000,
    direction: 'out',
    status: 'completed',
    date: '2026-08-15 09:45',
    method: 'IMPS Direct Transfer',
    reference: 'UTR-9938102941',
  },
  {
    id: 'TXN-9839',
    type: 'customer_sale',
    title: 'Customer Order #ORD-901 Payout',
    source: 'Suresh Patil (Retail Customer)',
    amount: 18400,
    direction: 'in',
    status: 'completed',
    date: '2026-08-14 16:20',
    method: 'UPI Auto-Settlement',
    reference: 'UPI-7738210492',
  },
  {
    id: 'TXN-9838',
    type: 'procurement',
    title: 'Tender Contract Milestone #2 Release',
    source: 'State Seed Corp Procurement',
    amount: 250000,
    direction: 'in',
    status: 'completed',
    date: '2026-08-12 18:00',
    method: 'RTGS Contract Release',
    reference: 'ESC-4402-SEED',
  },
  {
    id: 'TXN-9837',
    type: 'escrow',
    title: 'Escrow Pending Quality Inspection',
    source: 'Aniket Deshmukh (Procurement #108)',
    amount: 42000,
    direction: 'in',
    status: 'in_escrow',
    date: '2026-08-10 10:10',
    method: 'KrishiAI Quality Escrow',
    reference: 'ESC-3310-SOYA',
  },
];

const STATUS_CONFIG = {
  completed: { label: 'Completed', bg: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: 'rgba(74, 222, 128, 0.3)' },
  in_escrow: { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: 'rgba(251, 191, 36, 0.3)', label: 'Locked in Escrow' },
  processing: { bg: 'rgba(96, 165, 250, 0.15)', color: '#60a5fa', border: 'rgba(96, 165, 250, 0.3)', label: 'Processing' },
  failed: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Failed' },
};

export default function VendorPaymentsPage() {
  const context = useOutletContext() || {};
  const { vendor, config = {} } = context;

  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('vendor_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch (e) {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [availableBalance, setAvailableBalance] = useState(() => {
    try {
      const saved = localStorage.getItem('vendor_available_balance');
      return saved ? parseFloat(saved) : 485250;
    } catch (e) {
      return 485250;
    }
  });

  const [escrowBalance, setEscrowBalance] = useState(124000);
  const [totalEarnings, setTotalEarnings] = useState(1850000);

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank');
  const [withdrawing, setWithdrawing] = useState(false);
  const [receiptModalTxn, setReceiptModalTxn] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem('vendor_transactions', JSON.stringify(transactions));
      localStorage.setItem('vendor_available_balance', availableBalance.toString());
    } catch (e) {}
  }, [transactions, availableBalance]);

  const handleWithdraw = (e) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount <= 0) {
      alert('Please enter a valid withdrawal amount.');
      return;
    }
    if (amount > availableBalance) {
      alert('Withdrawal amount exceeds your available payout balance.');
      return;
    }

    setWithdrawing(true);
    setTimeout(() => {
      const newTxn = {
        id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
        type: 'withdrawal',
        title: withdrawMethod === 'bank' ? 'Withdrawal to Primary HDFC Bank' : 'Instant UPI Payout Transfer',
        source: withdrawMethod === 'bank' ? 'HDFC Bank (A/C ****4912)' : 'UPI (vendor@okaxis)',
        amount: amount,
        direction: 'out',
        status: 'processing',
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        method: withdrawMethod === 'bank' ? 'IMPS Direct Payout' : 'UPI Instant Transfer',
        reference: `WDR-${Date.now().toString().slice(-8)}`,
      };

      setTransactions(prev => [newTxn, ...prev]);
      setAvailableBalance(prev => prev - amount);
      setWithdrawing(false);
      setShowWithdrawModal(false);
      setWithdrawAmount('');
    }, 800);
  };

  const filteredTransactions = transactions.filter(txn => {
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'procurement' && txn.type === 'procurement') ||
      (activeTab === 'customer_sale' && txn.type === 'customer_sale') ||
      (activeTab === 'escrow' && txn.type === 'escrow') ||
      (activeTab === 'withdrawal' && txn.type === 'withdrawal');

    const matchesSearch = txn.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Top Banner Header */}
      <div style={{
        background: 'rgba(8, 24, 12, 0.85)',
        border: '1px solid rgba(134, 239, 172, 0.15)',
        borderRadius: '1.25rem',
        padding: '1.5rem',
        marginBottom: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(74, 222, 128, 0.3)',
              }}>
                <Wallet size={22} />
              </div>
              <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff' }}>
                Financial Settlements & Payouts
              </h1>
            </div>
            <p style={{ color: 'rgba(134, 239, 172, 0.7)', fontSize: '0.85rem' }}>
              Real-time payment tracking, bank settlement withdrawal, and escrow transaction ledger
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowWithdrawModal(true)}
            style={{
              padding: '0.75rem 1.5rem', borderRadius: '0.85rem', border: 'none',
              background: 'linear-gradient(135deg, #14532d, #4ade80)',
              color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              boxShadow: '0 6px 20px rgba(74, 222, 128, 0.25)',
            }}
          >
            <ArrowUpRight size={18} /> Withdraw Funds
          </button>
        </div>
      </div>

      {/* 4 Financial Stat Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Available Balance */}
        <div style={{
          background: 'rgba(8, 24, 12, 0.85)',
          border: '1px solid rgba(74, 222, 128, 0.3)',
          borderRadius: '1.25rem', padding: '1.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(134, 239, 172, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Available Payout Balance
            </span>
            <ShieldCheck size={18} style={{ color: '#4ade80' }} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 900, color: '#4ade80', marginBottom: 4 }}>
            ₹{availableBalance.toLocaleString('en-IN')}
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
            Ready for instant bank or UPI withdrawal
          </p>
        </div>

        {/* Locked in Escrow */}
        <div style={{
          background: 'rgba(8, 24, 12, 0.85)',
          border: '1px solid rgba(251, 191, 36, 0.25)',
          borderRadius: '1.25rem', padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(251, 191, 36, 0.8)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              In Escrow (Locked)
            </span>
            <Lock size={18} style={{ color: '#fbbf24' }} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 900, color: '#fbbf24', marginBottom: 4 }}>
            ₹{escrowBalance.toLocaleString('en-IN')}
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
            Released upon delivery verification
          </p>
        </div>

        {/* Total Settled Payouts */}
        <div style={{
          background: 'rgba(8, 24, 12, 0.85)',
          border: '1px solid rgba(134, 239, 172, 0.15)',
          borderRadius: '1.25rem', padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total Earnings Settled
            </span>
            <Landmark size={18} style={{ color: '#60a5fa' }} />
          </div>
          <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.75rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            ₹{totalEarnings.toLocaleString('en-IN')}
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)' }}>
            Total lifetime completed settlements
          </p>
        </div>

        {/* Primary Bank Account */}
        <div style={{
          background: 'rgba(8, 24, 12, 0.85)',
          border: '1px solid rgba(134, 239, 172, 0.15)',
          borderRadius: '1.25rem', padding: '1.25rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Primary Payout Bank
            </span>
            <Building2 size={18} style={{ color: '#4ade80' }} />
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff', marginBottom: 2 }}>
            HDFC Bank Ltd
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'rgba(134, 239, 172, 0.8)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={13} /> Verified (A/C ****4912)
          </p>
        </div>
      </div>

      {/* Transaction History Section */}
      <div style={{
        background: 'rgba(8, 24, 12, 0.85)',
        border: '1px solid rgba(134, 239, 172, 0.15)',
        borderRadius: '1.25rem', padding: '1.5rem',
      }}>
        {/* Controls: Search & Tabs */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              Transaction Ledger & Escrow History
            </h2>
            <p style={{ color: 'rgba(134, 239, 172, 0.7)', fontSize: '0.8rem' }}>
              Showing {filteredTransactions.length} of {transactions.length} record{transactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div style={{ position: 'relative', width: 260 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
            <input
              type="text"
              placeholder="Search reference or party..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%', padding: '0.55rem 0.8rem 0.55rem 2.25rem',
                borderRadius: '0.7rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
                fontSize: '0.83rem', outline: 'none',
              }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: 6, marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: 4 }}>
          {[
            { id: 'all', label: 'All Transactions' },
            { id: 'procurement', label: 'Procurement Payouts' },
            { id: 'customer_sale', label: 'Customer Orders' },
            { id: 'escrow', label: 'Escrow Locked' },
            { id: 'withdrawal', label: 'Withdrawals' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '0.5rem 1rem', borderRadius: '0.65rem', border: 'none',
                background: activeTab === tab.id ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.04)',
                color: activeTab === tab.id ? '#4ade80' : 'rgba(255,255,255,0.6)',
                fontWeight: activeTab === tab.id ? 800 : 500, fontSize: '0.8rem',
                cursor: 'pointer', whiteSpace: 'nowrap',
                border: activeTab === tab.id ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredTransactions.length === 0 ? (
            <div style={{ padding: '3rem 1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
              No transactions match your search filter.
            </div>
          ) : (
            filteredTransactions.map(txn => {
              const status = STATUS_CONFIG[txn.status] || STATUS_CONFIG.completed;
              return (
                <div
                  key={txn.id}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '0.85rem', padding: '1rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: '0.75rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 260, flex: 1 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 12,
                      background: txn.direction === 'in' ? 'rgba(74, 222, 128, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      color: txn.direction === 'in' ? '#4ade80' : '#ef4444',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {txn.direction === 'in' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                        {txn.title}
                      </h4>
                      <p style={{ fontSize: '0.75rem', color: 'rgba(134, 239, 172, 0.7)' }}>
                        {txn.source} • <span style={{ color: 'rgba(255,255,255,0.4)' }}>Ref: {txn.reference}</span>
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: '1rem', fontWeight: 900,
                        color: txn.direction === 'in' ? '#4ade80' : '#ef4444',
                      }}>
                        {txn.direction === 'in' ? '+' : '-'}₹{txn.amount.toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                        {txn.date}
                      </p>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      padding: '4px 10px', borderRadius: 8, fontSize: '0.7rem', fontWeight: 700,
                      background: status.bg, color: status.color, border: `1px solid ${status.border}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {status.label}
                    </span>

                    {/* Download Receipt */}
                    <button
                      type="button"
                      onClick={() => setReceiptModalTxn(txn)}
                      style={{
                        padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'transparent', color: 'rgba(255,255,255,0.6)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                        fontSize: '0.75rem', fontWeight: 600,
                      }}
                      title="View Receipt"
                    >
                      <FileText size={13} /> Receipt
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowWithdrawModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 440,
                background: '#0a1a0d', border: '1px solid rgba(74, 222, 128, 0.3)',
                borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                  Withdraw Funds to Bank
                </h3>
                <button type="button" onClick={() => setShowWithdrawModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleWithdraw}>
                <div style={{ background: 'rgba(74, 222, 128, 0.1)', padding: '0.85rem', borderRadius: '0.85rem', border: '1px solid rgba(74, 222, 128, 0.2)', marginBottom: '1rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(134, 239, 172, 0.8)', fontWeight: 600 }}>Available for Withdrawal:</p>
                  <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#4ade80', marginTop: 2 }}>
                    ₹{availableBalance.toLocaleString('en-IN')}
                  </h2>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Withdrawal Amount (₹) *
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount (e.g. 50000)"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: '0.75rem',
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#fff', fontSize: '1rem', fontWeight: 700, outline: 'none',
                    }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Payout Destination
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('bank')}
                      style={{
                        padding: '0.65rem', borderRadius: '0.75rem',
                        border: withdrawMethod === 'bank' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                        background: withdrawMethod === 'bank' ? 'rgba(74,222,128,0.15)' : 'transparent',
                        color: withdrawMethod === 'bank' ? '#4ade80' : 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      HDFC Bank (****4912)
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawMethod('upi')}
                      style={{
                        padding: '0.65rem', borderRadius: '0.75rem',
                        border: withdrawMethod === 'upi' ? '1px solid #4ade80' : '1px solid rgba(255,255,255,0.1)',
                        background: withdrawMethod === 'upi' ? 'rgba(74,222,128,0.15)' : 'transparent',
                        color: withdrawMethod === 'upi' ? '#4ade80' : 'rgba(255,255,255,0.6)',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', textAlign: 'center',
                      }}
                    >
                      UPI (vendor@okaxis)
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowWithdrawModal(false)}
                    style={{
                      padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                      color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={withdrawing}
                    style={{
                      padding: '0.65rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                      background: 'linear-gradient(135deg, #14532d, #4ade80)',
                      color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                      boxShadow: '0 4px 14px rgba(74, 222, 128, 0.3)',
                    }}
                  >
                    {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Receipt Modal */}
      {receiptModalTxn && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setReceiptModalTxn(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 300,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '1rem',
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 440,
                background: '#0a1a0d', border: '1px solid rgba(134, 239, 172, 0.3)',
                borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '0.75rem' }}>
                <div>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                    Payment Receipt
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(134, 239, 172, 0.7)' }}>
                    KrishiAI Financial Settlement Record
                  </p>
                </div>
                <button type="button" onClick={() => setReceiptModalTxn(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.83rem', color: 'rgba(255,255,255,0.8)', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Transaction ID:</span>
                  <span style={{ fontWeight: 700, color: '#fff' }}>{receiptModalTxn.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Reference No:</span>
                  <span style={{ fontWeight: 700, color: '#4ade80' }}>{receiptModalTxn.reference}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Date & Time:</span>
                  <span>{receiptModalTxn.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Payment Method:</span>
                  <span>{receiptModalTxn.method}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>Party / Description:</span>
                  <span style={{ fontWeight: 600 }}>{receiptModalTxn.title}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8, borderTop: '1px dashed rgba(255,255,255,0.1)', fontSize: '1rem', fontWeight: 900 }}>
                  <span style={{ color: '#fff' }}>Settled Amount:</span>
                  <span style={{ color: receiptModalTxn.direction === 'in' ? '#4ade80' : '#ef4444' }}>
                    {receiptModalTxn.direction === 'in' ? '+' : '-'}₹{receiptModalTxn.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => alert('Downloading PDF receipt...')}
                  style={{
                    width: '100%', padding: '0.7rem', borderRadius: '0.75rem', border: 'none',
                    background: 'linear-gradient(135deg, #14532d, #4ade80)',
                    color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <Download size={16} /> Download PDF Receipt
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
