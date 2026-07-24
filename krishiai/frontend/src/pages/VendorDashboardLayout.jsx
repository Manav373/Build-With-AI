import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Building2, Store, ClipboardList, Package, Boxes,
  ShoppingCart, Users, MessageSquare, Star, Tag, CreditCard, BarChart3,
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

  // Dashboard (always)
  items.push({ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/vendor-dashboard' });

  // Hybrid mode switcher
  if (vendorType === 'hybrid') {
    items.push({ id: 'divider-mode', type: 'divider', label: 'Mode' });
  }

  // Procurement items
  const showProcurement = vendorType === 'procurement' || vendorType === 'hybrid';
  const showSeller = vendorType === 'seller' || vendorType === 'hybrid';

  if (showProcurement && (vendorType !== 'hybrid' || activeMode === 'procurement' || activeMode === 'all')) {
    if (vendorType === 'hybrid') items.push({ id: 'header-procurement', type: 'header', label: '🏭 Procurement' });
    items.push({ id: 'company-profile', label: 'Company Profile', icon: Building2, path: '/vendor-dashboard/company-profile' });
    items.push({ id: 'requirements', label: 'Buy Requirements', icon: ClipboardList, path: '/vendor-dashboard/requirements', badge: 'requirementsBadge' });
    items.push({ id: 'applications', label: 'Farmer Applications', icon: UserCheck, path: '/vendor-dashboard/applications', badge: 'applicationsBadge' });
    items.push({ id: 'negotiation', label: 'Negotiation Center', icon: MessageCircle, path: '/vendor-dashboard/negotiation' });
    items.push({ id: 'procurement-orders', label: 'Procurement Orders', icon: ShoppingCart, path: '/vendor-dashboard/procurement-orders' });
    items.push({ id: 'warehouse', label: 'Warehouse', icon: WarehouseIcon, path: '/vendor-dashboard/warehouse' });
    items.push({ id: 'pickup', label: 'Pickup Scheduling', icon: Calendar, path: '/vendor-dashboard/pickup' });
    items.push({ id: 'logistics', label: 'Logistics', icon: Truck, path: '/vendor-dashboard/logistics' });
  }

  if (showSeller && (vendorType !== 'hybrid' || activeMode === 'seller' || activeMode === 'all')) {
    if (vendorType === 'hybrid') items.push({ id: 'header-seller', type: 'header', label: '🏪 Selling' });
    if (vendorType !== 'procurement') items.push({ id: 'store-profile', label: 'Store Profile', icon: Store, path: '/vendor-dashboard/store-profile' });
    items.push({ id: 'products', label: 'Products', icon: Package, path: '/vendor-dashboard/products', badge: 'productsBadge' });
    items.push({ id: 'inventory', label: 'Inventory', icon: Boxes, path: '/vendor-dashboard/inventory' });
    items.push({ id: 'orders', label: 'Customer Orders', icon: ShoppingCart, path: '/vendor-dashboard/orders', badge: 'ordersBadge' });
    items.push({ id: 'customers', label: 'Customers', icon: Users, path: '/vendor-dashboard/customers' });
    items.push({ id: 'promotions', label: 'Promotions', icon: Tag, path: '/vendor-dashboard/promotions' });
  }

  // Shared
  items.push({ id: 'divider-shared', type: 'divider', label: 'Shared' });
  items.push({ id: 'reviews', label: 'Reviews', icon: Star, path: '/vendor-dashboard/reviews' });
  items.push({ id: 'payments', label: 'Payments', icon: CreditCard, path: '/vendor-dashboard/payments' });
  items.push({ id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/vendor-dashboard/analytics' });
  items.push({ id: 'notifications', label: 'Notifications', icon: Bell, path: '/vendor-dashboard/notifications' });
  items.push({ id: 'documents', label: 'Documents', icon: FileText, path: '/vendor-dashboard/documents' });
  items.push({ id: 'settings', label: 'Settings', icon: Settings, path: '/vendor-dashboard/settings' });

  return items;
}

export default function VendorDashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In production, fetch from API. For now, use mock or localStorage.
  const [vendor, setVendor] = useState(null);
  const [activeMode, setActiveMode] = useState('all'); // 'procurement', 'seller', 'all'
  const [stats, setStats] = useState({});

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
        width: isMobile ? '100%' : (sidebarOpen ? 260 : 68),
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #060d15 0%, #0a1628 100%)',
        borderRight: isMobile ? 'none' : '1px solid rgba(255,255,255,0.06)',
        transition: 'width 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: 0,
        zIndex: isMobile ? 200 : 10,
        overflowY: 'auto',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div style={{
        padding: sidebarOpen || isMobile ? '1.25rem 1rem' : '1.25rem 0.5rem',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {(sidebarOpen || isMobile) ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: config.gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', flexShrink: 0,
            }}>
              {config.emoji}
            </div>
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1.2 }}>
                Krishi<span style={{ color: '#4ade80' }}>AI</span>
              </p>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: config.color }}>{config.title} Dashboard</p>
            </div>
          </div>
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: config.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', margin: '0 auto',
          }}>
            {config.emoji}
          </div>
        )}

        {isMobile && (
          <button type="button" onClick={() => setMobileMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Hybrid Mode Switcher */}
      {vendorType === 'hybrid' && (sidebarOpen || isMobile) && (
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
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
                  flex: 1, padding: '5px 0', borderRadius: 8, border: 'none',
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
      <div style={{ flex: 1, padding: '0.5rem', overflowY: 'auto' }}>
        {menuItems.map(item => {
          if (item.type === 'divider') {
            if (!sidebarOpen && !isMobile) return <div key={item.id} style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 4px' }} />;
            return (
              <div key={item.id} style={{ padding: '12px 12px 4px', margin: '4px 0 0' }}>
                <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  {item.label}
                </p>
              </div>
            );
          }
          if (item.type === 'header') {
            if (!sidebarOpen && !isMobile) return null;
            return (
              <div key={item.id} style={{ padding: '10px 12px 4px' }}>
                <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)' }}>{item.label}</p>
              </div>
            );
          }

          const Icon = item.icon;
          const isActive = currentPath === item.path || (item.path === '/vendor-dashboard' && currentPath === '/vendor-dashboard');

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileMenuOpen(false);
              }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center',
                gap: sidebarOpen || isMobile ? 10 : 0,
                padding: sidebarOpen || isMobile ? '8px 12px' : '10px 0',
                borderRadius: 10, border: 'none', cursor: 'pointer',
                justifyContent: sidebarOpen || isMobile ? 'flex-start' : 'center',
                background: isActive ? `${config.color}15` : 'transparent',
                color: isActive ? config.color : 'rgba(255,255,255,0.55)',
                transition: 'all 0.2s',
                marginBottom: 2,
                position: 'relative',
              }}
              title={!sidebarOpen && !isMobile ? item.label : undefined}
              id={`vendor-nav-${item.id}`}
            >
              {isActive && (
                <div style={{
                  position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: 2, background: config.color,
                }} />
              )}
              <Icon size={17} style={{ flexShrink: 0 }} />
              {(sidebarOpen || isMobile) && (
                <span style={{ fontSize: '0.8rem', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      {(sidebarOpen || isMobile) && (
        <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {vendor && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '0.6rem 0.75rem', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)',
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: config.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: 800, color: '#fff',
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
          <button
            type="button"
            onClick={() => navigate('/vendors')}
            style={{
              width: '100%', marginTop: 8, padding: '6px', borderRadius: 8,
              background: 'none', border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.35)', fontSize: '0.7rem', fontWeight: 600,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
            }}
          >
            <ExternalLink size={12} /> View Marketplace
          </button>
        </div>
      )}

      {/* Collapse Toggle (desktop only) */}
      {!isMobile && (
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            position: 'absolute', top: 20, right: -14,
            width: 28, height: 28, borderRadius: '50%',
            background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 20,
          }}
          id="vendor-sidebar-toggle"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'linear-gradient(145deg, #030712, #0a1628)', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Desktop Sidebar */}
      <div className="hidden md:block" style={{ position: 'relative' }}>
        {renderSidebar(false)}
      </div>

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setMobileMenuOpen(true)}
        className="md:hidden"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 150,
          width: 40, height: 40, borderRadius: 10,
          background: 'rgba(13,27,42,0.95)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(10px)',
        }}
        id="vendor-mobile-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 190,
                background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
              }}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              style={{ position: 'fixed', top: 0, left: 0, zIndex: 200, width: 280 }}
            >
              {renderSidebar(true)}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <Outlet context={{ vendor, stats, vendorType, config, activeMode }} />
      </div>
    </div>
  );
}
