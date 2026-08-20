import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Package, ShoppingCart, ClipboardList,
  Users, Star, CreditCard, AlertTriangle, CheckCircle2, Clock,
  ArrowRight, Wheat, Boxes, UserCheck, BarChart3, Bell, Plus,
  FileText, Truck, Sparkles
} from 'lucide-react';

function StatCard({ icon: Icon, label, value, subtitle, color, trend, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      style={{
        background: 'rgba(10, 26, 13, 0.75)',
        border: '1px solid rgba(134, 239, 172, 0.12)',
        borderRadius: '1.2rem',
        padding: '1.25rem',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{
        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
        borderRadius: '50%', background: `${color}08`, pointerEvents: 'none',
      }} />
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `${color}15`, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={20} style={{ color }} />
        </div>
        {trend && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 3,
            fontSize: '0.7rem', fontWeight: 700,
            color: trend > 0 ? '#4ade80' : '#ef4444',
          }}>
            {trend > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <p style={{
        fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)', fontWeight: 900,
        color: '#fff', fontFamily: "'Outfit', sans-serif", lineHeight: 1,
      }}>
        {value}
      </p>
      <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', fontWeight: 600, marginTop: 4 }}>
        {label}
      </p>
      {subtitle && (
        <p style={{ fontSize: '0.7rem', color: `${color}cc`, fontWeight: 600, marginTop: 2 }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, description, color, onClick, delay = 0 }) {
  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      style={{
        width: '100%', padding: '1rem',
        background: 'rgba(10, 26, 13, 0.75)',
        border: '1px solid rgba(134, 239, 172, 0.12)',
        borderRadius: '1rem', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: '0.85rem',
        textAlign: 'left', transition: 'all 0.2s',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
      }}
      id={`vendor-quick-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 12,
        background: `${color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{description}</p>
      </div>
      <ArrowRight size={16} style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }} />
    </motion.button>
  );
}

function AlertItem({ icon: Icon, message, type, delay = 0 }) {
  const colors = {
    warning: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', color: '#f59e0b', icon: AlertTriangle },
    success: { bg: 'rgba(74,222,128,0.08)', border: 'rgba(74,222,128,0.2)', color: '#4ade80', icon: CheckCircle2 },
    info: { bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.2)', color: '#60a5fa', icon: Bell },
  };
  const c = colors[type] || colors.info;
  const AlertIcon = Icon || c.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem', borderRadius: '0.75rem',
        background: c.bg, border: `1px solid ${c.border}`,
        marginBottom: '0.5rem',
      }}
    >
      <AlertIcon size={16} style={{ color: c.color, flexShrink: 0 }} />
      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{message}</span>
    </motion.div>
  );
}

export default function VendorDashboardHome() {
  const context = useOutletContext() || {};
  const { vendor, stats = {}, vendorType = 'seller', config = {} } = context;
  const navigate = useNavigate();

  const isProcurement = vendorType === 'procurement' || vendorType === 'hybrid';
  const isSeller = vendorType === 'seller' || vendorType === 'hybrid';

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto' }}>
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '1.5rem' }}
      >
        <h1 style={{
          fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.8rem)',
          fontWeight: 900, color: '#fff', marginBottom: '0.25rem',
        }}>
          {greeting}, {vendor?.owner_name?.split(' ')[0] || 'Vendor'} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.88rem' }}>
          Here's what's happening with your business today.
        </p>

        {/* Verification Status Banner */}
        {vendor && !vendor.is_verified && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{
              marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '0.85rem',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)',
              display: 'flex', alignItems: 'center', gap: '0.75rem',
            }}
          >
            <Clock size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b' }}>
                Account Under Review
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                Your vendor application is being reviewed. You'll get full dashboard access once verified (24-48 hours).
              </p>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem',
      }}>
        {/* Common Stats */}
        <StatCard icon={Star} label="Rating" value={stats.rating || '0.0'} color="#facc15" delay={0.05}
          subtitle={`${stats.total_reviews || 0} reviews`}
        />

        {/* Seller Stats */}
        {isSeller && (
          <>
            <StatCard icon={Package} label="Active Products" value={stats.published_products || 0} color="#4ade80" delay={0.1}
              subtitle={`${stats.pending_products || 0} pending review`}
            />
            <StatCard icon={ShoppingCart} label="Customer Orders" value={stats.total_customer_orders || 0} color="#60a5fa" delay={0.15}
              subtitle={`${stats.pending_orders || 0} pending`} trend={12}
            />
            <StatCard icon={Boxes} label="Low Stock" value={stats.low_stock_products || 0} color="#ef4444" delay={0.2}
              subtitle="Products need restocking"
            />
          </>
        )}

        {/* Procurement Stats */}
        {isProcurement && (
          <>
            <StatCard icon={ClipboardList} label="Active Requirements" value={stats.active_requirements || 0} color="#f59e0b" delay={0.1}
              subtitle={`${stats.total_requirements || 0} total`}
            />
            <StatCard icon={UserCheck} label="Farmer Applications" value={stats.total_applications || 0} color="#a78bfa" delay={0.15}
              subtitle={`${stats.pending_applications || 0} awaiting response`} trend={8}
            />
            <StatCard icon={Wheat} label="Procurement Orders" value={stats.total_procurement_orders || 0} color="#4ade80" delay={0.2} />
          </>
        )}
      </div>

      {/* Quick Actions + Alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <h2 style={{
            fontSize: '1rem', fontWeight: 800, color: '#fff',
            fontFamily: "'Outfit', sans-serif", marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            ⚡ Quick Actions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {isSeller && (
              <>
                <QuickAction
                  icon={Plus} label="Add New Product" color="#4ade80"
                  description="Create a new product listing"
                  onClick={() => navigate('/vendor-dashboard/products')}
                  delay={0.3}
                />
                <QuickAction
                  icon={ShoppingCart} label="View Orders" color="#60a5fa"
                  description={`${stats.pending_orders || 0} orders pending`}
                  onClick={() => navigate('/vendor-dashboard/orders')}
                  delay={0.35}
                />
              </>
            )}
            {isProcurement && (
              <>
                <QuickAction
                  icon={ClipboardList} label="Create Buying Requirement" color="#f59e0b"
                  description="Post what crops you want to buy"
                  onClick={() => navigate('/vendor-dashboard/requirements')}
                  delay={0.3}
                />
                <QuickAction
                  icon={FileText} label="Bulk Tenders & Contracts" color="#facc15"
                  description="Launch bulk tenders or contract farming"
                  onClick={() => navigate('/vendor-dashboard/tenders')}
                  delay={0.32}
                />
                <QuickAction
                  icon={UserCheck} label="Review Applications" color="#a78bfa"
                  description={`${stats.pending_applications || 0} farmer offers waiting`}
                  onClick={() => navigate('/vendor-dashboard/applications')}
                  delay={0.35}
                />
                <QuickAction
                  icon={Truck} label="Logistics & Fleet Tracker" color="#3b82f6"
                  description="Dispatch pickup trucks & track e-Way bills"
                  onClick={() => navigate('/vendor-dashboard/logistics')}
                  delay={0.37}
                />
                <QuickAction
                  icon={Sparkles} label="AI Crop Quality Scanner" color="#c084fc"
                  description="Run computer vision moisture & grade scan"
                  onClick={() => navigate('/vendor-dashboard/ai-quality')}
                  delay={0.39}
                />
              </>
            )}
            <QuickAction
              icon={BarChart3} label="View Analytics" color="#f97316"
              description="Check your business & revenue performance"
              onClick={() => navigate('/vendor-dashboard/analytics')}
              delay={0.4}
            />
          </div>
        </motion.div>

        {/* Alerts & Activity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h2 style={{
            fontSize: '1rem', fontWeight: 800, color: '#fff',
            fontFamily: "'Outfit', sans-serif", marginBottom: '1rem',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            🔔 Alerts & Activity
          </h2>

          {vendor?.is_verified ? (
            <>
              {isSeller && stats.low_stock_products > 0 && (
                <AlertItem type="warning"
                  message={`${stats.low_stock_products} product(s) are running low on stock. Restock soon to avoid missed sales.`}
                  delay={0.35}
                />
              )}
              {isSeller && stats.pending_orders > 0 && (
                <AlertItem type="info"
                  message={`You have ${stats.pending_orders} pending order(s). Accept them within 24 hours.`}
                  delay={0.4}
                />
              )}
              {isProcurement && stats.pending_applications > 0 && (
                <AlertItem type="info"
                  message={`${stats.pending_applications} farmer(s) submitted crop offers. Review before they expire.`}
                  delay={0.35}
                />
              )}
              <AlertItem type="success"
                message="Your vendor account is verified and active. Happy selling!"
                delay={0.45}
              />
            </>
          ) : (
            <>
              <AlertItem type="warning"
                message="Your account is under review. Full features will be available once verified."
                delay={0.35}
              />
              <AlertItem type="info"
                message="While waiting, complete your profile to speed up verification."
                delay={0.4}
              />
            </>
          )}
        </motion.div>
      </div>

      {/* Tips Section */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: '2rem', padding: '1.25rem',
          background: 'rgba(250,204,21,0.04)', border: '1px solid rgba(250,204,21,0.12)',
          borderRadius: '1rem',
        }}
      >
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#facc15', marginBottom: '0.5rem', fontFamily: "'Outfit', sans-serif" }}>
          💡 Tips to Grow Your Business
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {[
            isSeller && 'Add high-quality product images to increase conversions by 3x',
            isSeller && 'Products with 5+ reviews sell 2x faster — encourage customers to rate',
            isProcurement && 'Post buying requirements early in the season for better farmer response',
            isProcurement && 'Vendors who provide transport get 40% more farmer applications',
            'Complete your profile to 100% for a trust badge boost',
            'Respond to queries within 2 hours — fast responders get priority placement',
          ].filter(Boolean).slice(0, 3).map((tip, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <CheckCircle2 size={14} style={{ color: '#facc15', flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>{tip}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
