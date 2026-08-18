import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, ShoppingCart, ClipboardList, Truck, CreditCard, AlertTriangle,
  CheckCircle2, ShieldCheck, Filter, Check, Trash2, ArrowRight,
  Package, Sparkles, MessageSquare, Clock
} from 'lucide-react';

export default function VendorNotificationsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  // Pre-populated realistic agricultural vendor notifications
  const [notifications, setNotifications] = useState([
    {
      id: 'NOTIF-101',
      title: 'New Customer Order Received',
      message: 'Ramesh Pawar placed Order #ORD-903 for 5 packets of Hybrid Cotton Seed (Total: ₹2,250).',
      category: 'orders',
      type: 'order',
      timestamp: '10 minutes ago',
      read: false,
      actionText: 'Fulfill Order',
      actionPath: '/vendor-dashboard/orders',
      badgeColor: '#60a5fa',
      icon: ShoppingCart,
    },
    {
      id: 'NOTIF-102',
      title: 'Farmer Bid Submitted',
      message: 'Farmer Dnyaneshwar Patil submitted an offer of 40 MT Organic Soya Bean @ ₹2,400/quintal for requirement #REQ-1001.',
      category: 'procurement',
      type: 'procurement',
      timestamp: '45 minutes ago',
      read: false,
      actionText: 'View Applications',
      actionPath: '/vendor-dashboard/requirements',
      badgeColor: '#f59e0b',
      icon: ClipboardList,
    },
    {
      id: 'NOTIF-103',
      title: 'Farm-Gate Truck Dispatched',
      message: 'Driver Eknath Shinde (MH-12-VT-8819) has started pickup route to Baramati APMC Yard.',
      category: 'logistics',
      type: 'logistics',
      timestamp: '2 hours ago',
      read: false,
      actionText: 'Track Pickup',
      actionPath: '/vendor-dashboard/pickup',
      badgeColor: '#a78bfa',
      icon: Truck,
    },
    {
      id: 'NOTIF-104',
      title: 'Bank Payout Credited',
      message: 'Weekly vendor settlement payout of ₹45,800 credited to HDFC Bank A/c ending 8901 (Ref: TXN-908129).',
      category: 'payments',
      type: 'payment',
      timestamp: '5 hours ago',
      read: true,
      actionText: 'View Payouts',
      actionPath: '/vendor-dashboard/analytics',
      badgeColor: '#4ade80',
      icon: CreditCard,
    },
    {
      id: 'NOTIF-105',
      title: 'Low Stock Warning',
      message: 'Organic Bio-Fertilizer 50kg is running low (only 3 units left in Hadapsar Cold Storage).',
      category: 'inventory',
      type: 'warning',
      timestamp: '1 day ago',
      read: true,
      actionText: 'Update Stock',
      actionPath: '/vendor-dashboard/inventory',
      badgeColor: '#ef4444',
      icon: AlertTriangle,
    },
    {
      id: 'NOTIF-106',
      title: 'KYC & GST Profile Verified',
      message: 'Your vendor compliance documents & APMC trading license have been verified by KrishiAI Admin.',
      category: 'system',
      type: 'system',
      timestamp: '2 days ago',
      read: true,
      actionText: 'View Profile',
      actionPath: '/vendor-dashboard/company-profile',
      badgeColor: '#34d399',
      icon: ShieldCheck,
    },
  ]);

  const toggleReadStatus = (id) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const clearReadNotifications = () => {
    setNotifications(prev => prev.filter(n => !n.read));
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesCategory = activeCategory === 'all' || n.category === activeCategory;
    const matchesUnread = !unreadOnly || !n.read;
    return matchesCategory && matchesUnread;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#86efac]/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center relative">
              <Bell size={24} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white font-['Outfit']">Notification Center</h1>
              <p className="text-xs text-[#86efac]/70 mt-0.5">
                Real-time alerts for customer orders, farmer procurement bids, truck logistics, and payments.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/25 transition flex items-center gap-1.5"
            >
              <Check size={14} /> Mark All Read
            </button>
          )}

          <button
            onClick={clearReadNotifications}
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Clear Read
          </button>
        </div>
      </div>

      {/* Category Tabs & Unread Toggle */}
      <div style={cardStyle} className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Notifications' },
            { id: 'orders', label: 'Orders & Sales' },
            { id: 'procurement', label: 'Procurement Bids' },
            { id: 'logistics', label: 'Truck Pickup' },
            { id: 'inventory', label: 'Stock Alerts' },
            { id: 'payments', label: 'Payments' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                activeCategory === tab.id
                  ? 'bg-emerald-500/20 text-[#4ade80] border border-[#4ade80]/30 shadow-md'
                  : 'text-[#86efac]/60 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs text-[#86efac]/80 font-bold shrink-0 self-end sm:self-center">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={e => setUnreadOnly(e.target.checked)}
            className="w-4 h-4 accent-emerald-500 rounded"
          />
          Show Unread Only
        </label>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredNotifications.map((n) => {
            const Icon = n.icon;
            return (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                  ...cardStyle,
                  background: n.read ? 'rgba(6, 18, 9, 0.6)' : 'rgba(12, 36, 18, 0.95)',
                  border: n.read ? '1px solid rgba(134, 239, 172, 0.08)' : `1px solid ${n.badgeColor}50`,
                }}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition duration-200"
              >
                {/* Left Side: Icon & Content */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div
                    style={{
                      background: `${n.badgeColor}18`,
                      border: `1px solid ${n.badgeColor}35`,
                      color: n.badgeColor,
                    }}
                    className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                  >
                    <Icon size={22} />
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                      )}
                      <h3 className={`text-base font-bold font-['Outfit'] ${n.read ? 'text-gray-300' : 'text-white'}`}>
                        {n.title}
                      </h3>
                      <span className="text-[0.7rem] font-semibold text-gray-400 flex items-center gap-1 ml-auto sm:ml-0">
                        <Clock size={11} /> {n.timestamp}
                      </span>
                    </div>

                    <p className="text-xs text-[#86efac]/80 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                {/* Right Side: Action Button & Mark Read */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center border-t sm:border-t-0 border-[#86efac]/10 pt-3 sm:pt-0 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={() => toggleReadStatus(n.id)}
                    className="text-xs text-gray-400 hover:text-white transition px-2 py-1"
                    title={n.read ? 'Mark as unread' : 'Mark as read'}
                  >
                    {n.read ? 'Mark Unread' : 'Mark Read'}
                  </button>

                  {n.actionText && (
                    <button
                      onClick={() => {
                        toggleReadStatus(n.id);
                        navigate(n.actionPath);
                      }}
                      style={{ background: `${n.badgeColor}20`, border: `1px solid ${n.badgeColor}40`, color: n.badgeColor }}
                      className="px-4 py-2 rounded-xl text-xs font-bold hover:scale-105 transition flex items-center gap-1.5 shadow-md"
                    >
                      {n.actionText} <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredNotifications.length === 0 && (
          <div style={cardStyle} className="p-12 text-center space-y-3">
            <Bell size={48} className="mx-auto text-[#86efac]/30" />
            <h3 className="text-xl font-bold text-white">No Notifications Found</h3>
            <p className="text-xs text-[#86efac]/60">You are all caught up! There are no pending alerts in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
