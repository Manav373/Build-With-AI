import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, UserCheck, UserX, MessageCircle, CheckCircle2, XCircle,
  Clock, Wheat, MapPin, IndianRupee, Phone, Eye, Filter, Search,
  ChevronDown, ArrowRight, Loader2, Star, Image, AlertCircle
} from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

const STATUS_STYLES = {
  pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', label: '⏳ Pending', icon: Clock },
  shortlisted: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', label: '⭐ Shortlisted', icon: Star },
  under_negotiation: { bg: 'rgba(167,139,250,0.15)', color: '#a78bfa', label: '💬 Negotiating', icon: MessageCircle },
  accepted: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: '✅ Accepted', icon: CheckCircle2 },
  rejected: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '❌ Rejected', icon: XCircle },
  expired: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: '⏰ Expired', icon: Clock },
};

function CounterOfferModal({ isOpen, onClose, onSubmit, application }) {
  const [price, setPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !application) return null;

  const handleSubmit = async () => {
    if (!price) return;
    setSubmitting(true);
    await onSubmit(application.id, 'counter_offer', parseFloat(price));
    setSubmitting(false);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.95 }} animate={{ scale: 1 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 420,
          background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.25rem', padding: '1.5rem',
        }}
      >
        <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>
          💬 Counter Offer
        </h3>
        <div style={{
          padding: '0.85rem', borderRadius: '0.85rem',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: '1rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Farmer's Offer</span>
            <span style={{ color: '#f59e0b', fontWeight: 700 }}>₹{application.offered_price} / quintal</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Quantity</span>
            <span style={{ color: '#fff', fontWeight: 600 }}>{application.offered_quantity} quintal</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Negotiation Round</span>
            <span style={{ color: '#a78bfa', fontWeight: 600 }}>{(application.negotiation_rounds || 0) + 1} / 5</span>
          </div>
        </div>

        <label style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6, display: 'block' }}>
          Your Counter Price (₹ per quintal) *
        </label>
        <input
          type="number" placeholder="e.g., 2200"
          value={price} onChange={e => setPrice(e.target.value)}
          style={{
            width: '100%', padding: '0.65rem 0.8rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.9rem', outline: 'none', marginBottom: '1rem',
          }}
        />

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{
            padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
            border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
            color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
          }}>Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={!price || submitting} style={{
            padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
            background: 'linear-gradient(135deg, #3b0764, #a78bfa)',
            color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
            opacity: (!price || submitting) ? 0.5 : 1,
          }}>
            {submitting ? 'Sending...' : 'Send Counter Offer'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VendorApplicationsPage() {
  const context = useOutletContext() || {};
  const { vendor, config = {} } = context;
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [counterOfferApp, setCounterOfferApp] = useState(null);

  const API = API_BASE;

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const resp = await fetch(`${API}api/vendor/applications?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setApplications(data.applications || []);
      }
    } catch (e) {
      console.error('Failed to fetch applications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, [filterStatus]);

  const handleAction = async (appId, action, counterPrice = null) => {
    try {
      const params = new URLSearchParams({ action });
      if (counterPrice) params.set('counter_price', counterPrice);
      const resp = await fetch(`${API}api/vendor/applications/${appId}/respond?${params.toString()}`, { method: 'POST' });
      if (resp.ok) {
        fetchApplications();
      } else {
        const err = await resp.json();
        alert(err.detail || 'Action failed.');
      }
    } catch (e) {
      alert('Network error.');
    }
  };

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
          Farmer Applications
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
          Review crop offers from farmers responding to your buying requirements.
        </p>
      </div>

      {/* Status Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'shortlisted', 'under_negotiation', 'accepted', 'rejected'].map(status => {
          const isActive = filterStatus === status;
          return (
            <button key={status} type="button" onClick={() => setFilterStatus(status)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
              border: `1px solid ${isActive ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: isActive ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.03)',
              color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', textTransform: 'capitalize',
            }}>
              {status === 'all' ? 'All' : status.replace(/_/g, ' ')}
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#a78bfa', margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading applications...</p>
        </div>
      ) : applications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <Users size={48} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '0.5rem' }}>
            No applications yet
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', maxWidth: 400, margin: '0 auto' }}>
            When farmers submit crop offers for your buying requirements, they'll appear here.
          </p>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {applications.map((app, i) => {
            const statusInfo = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
            const StatusIcon = statusInfo.icon;

            return (
              <motion.div key={app.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem', padding: '1.25rem',
                }}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(167,139,250,0.12)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, color: '#a78bfa', fontSize: '1rem',
                    }}>
                      {app.farmer_name?.charAt(0) || '👨‍🌾'}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff' }}>
                        {app.farmer_name || 'Anonymous Farmer'}
                      </h3>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {app.farmer_phone && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Phone size={10} /> {app.farmer_phone}
                          </span>
                        )}
                        {app.farmer_location && (
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 3 }}>
                            <MapPin size={10} /> {app.farmer_location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                    background: statusInfo.bg, color: statusInfo.color,
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <StatusIcon size={12} /> {statusInfo.label}
                  </span>
                </div>

                {/* Offer Details */}
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '0.75rem', marginBottom: '0.75rem',
                  padding: '0.75rem', borderRadius: '0.75rem',
                  background: 'rgba(255,255,255,0.02)',
                }}>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Quantity</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f59e0b' }}>{app.offered_quantity} quintal</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Offered Price</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>₹{app.offered_price} / quintal</p>
                  </div>
                  {app.crop_quality_self_assessment && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Quality</p>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{app.crop_quality_self_assessment}</p>
                    </div>
                  )}
                  {app.counter_offer_price && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Your Counter</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#a78bfa' }}>₹{app.counter_offer_price}</p>
                    </div>
                  )}
                  {app.final_agreed_price && (
                    <div>
                      <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Agreed Price</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#4ade80' }}>₹{app.final_agreed_price}</p>
                    </div>
                  )}
                </div>

                {/* Notes */}
                {app.notes && (
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.5 }}>
                    "{app.notes}"
                  </p>
                )}

                {/* Crop Images */}
                {app.crop_images?.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: '0.75rem' }}>
                    {app.crop_images.map((img, j) => (
                      <div key={j} style={{
                        width: 60, height: 60, borderRadius: 8,
                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                        overflow: 'hidden',
                      }}>
                        <img src={img} alt="crop" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                {['pending', 'shortlisted', 'under_negotiation'].includes(app.status) && (
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                    {app.status === 'pending' && (
                      <button type="button" onClick={() => handleAction(app.id, 'shortlist')} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: 'rgba(96,165,250,0.15)', color: '#60a5fa',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <Star size={12} /> Shortlist
                      </button>
                    )}
                    <button type="button" onClick={() => handleAction(app.id, 'accept', app.offered_price)} style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <CheckCircle2 size={12} /> Accept Offer
                    </button>
                    {(app.negotiation_rounds || 0) < 5 && (
                      <button type="button" onClick={() => setCounterOfferApp(app)} style={{
                        padding: '6px 14px', borderRadius: 8, border: 'none',
                        background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                        fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <MessageCircle size={12} /> Counter Offer
                      </button>
                    )}
                    <button type="button" onClick={() => handleAction(app.id, 'reject')} style={{
                      padding: '6px 14px', borderRadius: 8,
                      border: '1px solid rgba(239,68,68,0.2)', background: 'transparent',
                      color: '#ef4444', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Counter Offer Modal */}
      <CounterOfferModal
        isOpen={!!counterOfferApp}
        onClose={() => setCounterOfferApp(null)}
        onSubmit={handleAction}
        application={counterOfferApp}
      />
    </div>
  );
}
