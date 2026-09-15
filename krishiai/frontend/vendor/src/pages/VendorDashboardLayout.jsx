import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Store, ClipboardList, Package, Boxes,
  ShoppingCart, Users, MessageSquare, Star, CreditCard, BarChart3,
  FileText, Shield, Bell, Settings, Wheat, UserCheck, MessageCircle,
  Warehouse as WarehouseIcon, Truck, Calendar, ChevronLeft, ChevronRight,
  Menu, X, Factory, RefreshCw, LogOut, ExternalLink
} from 'lucide-react';

const TYPE_CONFIG = {
  procurement: {
    title: 'Procurement',
    emoji: '🏭',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #92400e, #f59e0b)',
  },
  seller: {
    title: 'Seller',
    emoji: '🏪',
    color: '#4ade80',
    gradient: 'linear-gradient(135deg, #14532d, #4ade80)',
  },
  hybrid: {
    title: 'Hybrid',
    emoji: '🔄',
    color: '#a78bfa',
    gradient: 'linear-gradient(135deg, #3b0764, #a78bfa)',
  },
};

function getMenuItems(vendorType, activeMode) {
  const items = [];

  // 1. Core Overview & Urgent Operations (Always top)
  items.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/vendor-dashboard' });

  // Hybrid mode switcher
  if (vendorType === 'hybrid') {
    items.push({ id: 'divider-mode', type: 'divider', label: 'Mode' });
  }

  const showProcurement = vendorType === 'procurement' || vendorType === 'hybrid';
  const showSeller = vendorType === 'seller' || vendorType === 'hybrid';

  // Procurement items (Daily operational deal flow priority order)
  if (showProcurement && (vendorType !== 'hybrid' || activeMode === 'procurement' || activeMode === 'all')) {
    if (vendorType === 'hybrid') items.push({ id: 'header-procurement', type: 'header', label: '🏭 Procurement' });
    // Core Sourcing & Active Negotiations
    items.push({ id: 'requirements', label: 'Buy Requirements', icon: ClipboardList, path: '/vendor-dashboard/requirements', badge: 'requirementsBadge' });
    items.push({ id: 'negotiation', label: 'Negotiation Center', icon: MessageCircle, path: '/vendor-dashboard/negotiation' });
    items.push({ id: 'procurement-orders', label: 'Procurement Orders', icon: ShoppingCart, path: '/vendor-dashboard/procurement-orders' });
    items.push({ id: 'tenders', label: 'Tenders & Contracts', icon: FileText, path: '/vendor-dashboard/tenders' });
    // Storage, Pickup & Logistics
    items.push({ id: 'warehouse', label: 'Warehouse', icon: WarehouseIcon, path: '/vendor-dashboard/warehouse' });
    items.push({ id: 'pickup', label: 'Pickup Scheduling', icon: Calendar, path: '/vendor-dashboard/pickup' });
    items.push({ id: 'logistics', label: 'Logistics Tracker', icon: Truck, path: '/vendor-dashboard/logistics' });
  }

  // Seller items (Daily operational priority order)
  if (showSeller && (vendorType !== 'hybrid' || activeMode === 'seller' || activeMode === 'all')) {
    if (vendorType === 'hybrid') items.push({ id: 'header-seller', type: 'header', label: '🏪 Store Operations' });
    // High-frequency daily operations first
    items.push({ id: 'orders', label: 'Customer Orders', icon: ShoppingCart, path: '/vendor-dashboard/orders', badge: 'ordersBadge' });
    items.push({ id: 'products', label: 'Products', icon: Package, path: '/vendor-dashboard/products', badge: 'productsBadge' });
    items.push({ id: 'inventory', label: 'Inventory', icon: Boxes, path: '/vendor-dashboard/inventory' });
    items.push({ id: 'customers', label: 'Customers', icon: Users, path: '/vendor-dashboard/customers' });
  }

  // Shared / Operations & Account Management (Bottom Section)
  items.push({ id: 'divider-shared', type: 'divider', label: 'Finance & Account' });
  items.push({ id: 'notifications', label: 'Notifications', icon: Bell, path: '/vendor-dashboard/notifications' });
  items.push({ id: 'payments', label: 'Payments', icon: CreditCard, path: '/vendor-dashboard/payments' });
  items.push({ id: 'analytics', label: 'Revenue Analytics', icon: BarChart3, path: '/vendor-dashboard/analytics' });
  items.push({ id: 'reviews', label: 'Reviews', icon: Star, path: '/vendor-dashboard/reviews' });
  if (showSeller && vendorType !== 'procurement') {
    items.push({ id: 'store-profile', label: 'Store Profile', icon: Store, path: '/vendor-dashboard/store-profile' });
  }
  items.push({ id: 'admin', label: 'Admin Approvals', icon: Shield, path: '/vendor-dashboard/admin' });
  items.push({ id: 'documents', label: 'Documents', icon: FileText, path: '/vendor-dashboard/documents' });
  items.push({ id: 'settings', label: 'Settings', icon: Settings, path: '/vendor-dashboard/settings' });

  return items;
}

export default function VendorDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Vendor state & notification dot state
  const [vendor, setVendor] = useState(null);
  const [activeMode, setActiveMode] = useState('all'); // 'procurement', 'seller', 'all'
  const [stats, setStats] = useState({});
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState(true);

  useEffect(() => {
    // Fetch vendor profile
    const fetchVendor = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';
        const resp = await fetch(`${API}api/vendor/me`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.success && data.vendor) {
            setVendor(data.vendor);
          }
        }
      } catch (e) {
        console.error('Failed to fetch vendor:', e);
      }
    };

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';
        const resp = await fetch(`${API}api/vendor/dashboard/stats`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.success) setStats(data.stats || {});
        }
      } catch (e) {
        console.error('Failed to fetch stats:', e);
      }
    };

    fetchVendor();
    fetchStats();
  }, []);

  const vendorType = vendor?.vendor_type || 'seller';
  const config = TYPE_CONFIG[vendorType] || TYPE_CONFIG.seller;
  const menuItems = getMenuItems(vendorType, activeMode);

  const currentPath = location.pathname;

  const renderSidebar = (isMobile = false) => (
    <div
      style={{
        width: isMobile ? 280 : 260,
        height: '100vh',
        background: 'linear-gradient(180deg, #060e08 0%, #091a0e 100%)',
        borderRight: '1px solid rgba(134,239,172,0.1)',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'relative',
        top: 0,
        left: 0,
        zIndex: isMobile ? 200 : 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '1.25rem 1rem',
        borderBottom: '1px solid rgba(134,239,172,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: config.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', flexShrink: 0,
            boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
          }}>
            {config.emoji}
          </div>
          <div>
            <p style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
              Krishi<span style={{ color: '#4ade80' }}>AI</span>
            </p>
            <p style={{ fontSize: '0.68rem', fontWeight: 700, color: config.color }}>{config.title} Dashboard</p>
          </div>
        </div>

        {isMobile && (
          <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 8, padding: 4, color: '#fff', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Hybrid Mode Switcher */}
      {vendorType === 'hybrid' && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(134,239,172,0.08)', flexShrink: 0 }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(134,239,172,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            Business Mode
          </p>
          <div style={{ display: 'flex', gap: 4 }}>
            {[
              { id: 'all', label: '📊 All', color: '#a78bfa' },
              { id: 'procurement', label: '🏭 Buy', color: '#f59e0b' },
              { id: 'seller', label: '🏪 Sell', color: '#4ade80' },
            ].map(mode => (
              <button
                key={mode.id}
                type="button"
                onClick={() => setActiveMode(mode.id)}
                style={{
                  flex: 1, padding: '6px 0', borderRadius: 8,
                  fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                  background: activeMode === mode.id ? `${mode.color}20` : 'rgba(255,255,255,0.03)',
                  color: activeMode === mode.id ? mode.color : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${activeMode === mode.id ? mode.color + '40' : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items */}
      <div
        style={{
          flex: 1,
          padding: '0.6rem',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
        }}
        className="custom-scrollbar"
      >
        {menuItems.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.id} style={{ padding: '12px 12px 4px', margin: '4px 0 0' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 800, color: 'rgba(134,239,172,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {item.label}
                </p>
              </div>
            );
          }
          if (item.type === 'header') {
            return (
              <div key={item.id} style={{ padding: '10px 12px 4px' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 800, color: 'rgba(134,239,172,0.45)' }}>{item.label}</p>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/vendor-dashboard' && currentPath === '/vendor-dashboard');
          const isNotificationsPage = location.pathname === '/vendor-dashboard/notifications';

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.id === 'notifications') setHasUnreadNotifs(false);
                navigate(item.path);
                if (isMobile) setMobileMenuOpen(false);
              }}
              className={`vendor-nav-btn ${isActive ? 'active' : ''}`}
              style={{
                background: isActive ? 'rgba(20, 83, 45, 0.45)' : 'transparent',
                border: isActive ? '1px solid rgba(74, 222, 128, 0.45)' : '1px solid transparent',
                color: isActive ? '#4ade80' : 'rgba(134, 239, 172, 0.75)',
              }}
              id={`vendor-nav-${item.id}`}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: 2, background: config.color,
                }} />
              )}

              {/* Icon with overlapping Notification Dot */}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Icon size={18} style={{ flexShrink: 0 }} />
                {item.id === 'notifications' && hasUnreadNotifs && (
                  <span
                    className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse pointer-events-none"
                    title="Unread Notifications"
                  />
                )}
              </div>

              <span style={{ fontSize: '0.83rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', flex: 1, textAlign: 'left' }}>
                {item.label}
              </span>

              {item.id === 'orders' && (
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0 ml-auto">
                  {stats.pending_orders ?? stats.total_customer_orders ?? 3}
                </span>
              )}
              {item.id === 'requirements' && (
                <span className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 ml-auto">
                  {stats.active_requirements ?? 2}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div style={{ padding: '1rem', borderTop: '1px solid rgba(134,239,172,0.08)', flexShrink: 0 }}>
        {vendor && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '0.6rem 0.75rem', borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: config.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.85rem', fontWeight: 800, color: '#fff',
              flexShrink: 0,
            }}>
              {vendor.business_name?.charAt(0) || 'V'}
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {vendor.business_name || 'Vendor'}
              </p>
              <p style={{ fontSize: '0.65rem', color: vendor.is_verified ? '#4ade80' : '#f59e0b', fontWeight: 600 }}>
                {vendor.is_verified ? '✅ Verified' : '⏳ Pending'}
              </p>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            style={{
              flex: 1, padding: '7px', borderRadius: 8,
              background: 'none', border: '1px solid rgba(134,239,172,0.15)',
              color: 'rgba(134,239,172,0.7)', fontSize: '0.72rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
          >
            <ExternalLink size={12} /> Marketplace
          </button>
          <button
            type="button"
            onClick={() => navigate('/chat')}
            style={{
              flex: 1, padding: '7px', borderRadius: 8,
              background: 'rgba(22,101,52,0.25)', border: '1px solid rgba(74,222,128,0.3)',
              color: '#4ade80', fontSize: '0.72rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              transition: 'all 0.2s',
            }}
          >
            🌾 Farmer Portal
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dark" style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#050e07', color: '#e2f0e4', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Desktop Sidebar (hidden on mobile) */}
      <div className="hidden lg:block" style={{ width: 260, height: '100vh', flexShrink: 0, zIndex: 10 }}>
        {renderSidebar(false)}
      </div>

      {/* Mobile Top Header (only on screens < lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#060e08]/90 backdrop-blur-md border-b border-[#86efac]/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-emerald-700 to-green-500 flex items-center justify-center text-sm">
            {config.emoji}
          </div>
          <span className="font-['Outfit'] font-extrabold text-white text-sm">
            Krishi<span className="text-emerald-400">AI</span> {config.title}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center gap-1.5"
        >
          <Menu size={16} />
          Menu
        </button>
      </div>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{ position: 'fixed', inset: 0, zIndex: 190, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 200 }}
            >
              {renderSidebar(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area (Independent Scroll Container with GPU Acceleration) */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: '100vh',
          overflowY: 'auto',
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
        }}
        className="lg:pt-0 pt-16 custom-scrollbar"
      >
        <Outlet context={{ vendor, stats, vendorType, config, activeMode }} />
      </div>
    </div>
  );
}
