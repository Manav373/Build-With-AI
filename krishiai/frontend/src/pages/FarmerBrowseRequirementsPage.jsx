import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wheat, MapPin, IndianRupee, Clock, Truck, Users, Search,
  Filter, ArrowLeft, ChevronDown, Star, Shield, CheckCircle2,
  Send, Calendar, ArrowRight, Loader2, X, Building2
} from 'lucide-react';

const CROP_FILTERS = ['All', 'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Soybean', 'Maize', 'Tomato', 'Onion', 'Potato'];

function SubmitOfferModal({ isOpen, onClose, requirement }) {
  const [form, setForm] = useState({
    farmer_name: '', farmer_phone: '', farmer_location: '',
    offered_quantity: '', offered_price: '',
    crop_quality_self_assessment: '', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';
      const resp = await fetch(`${API}api/vendor/requirements/${requirement.id}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          offered_quantity: parseFloat(form.offered_quantity) || 0,
          offered_price: parseFloat(form.offered_price) || 0,
        }),
      });
      if (resp.ok) {
        setSubmitted(true);
      } else {
        const err = await resp.json();
        alert(err.detail || 'Failed to submit offer.');
      }
    } catch (e) {
      alert('Network error.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !requirement) return null;

  const inputStyle = {
    width: '100%', padding: '0.6rem 0.8rem', borderRadius: '0.65rem',
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit',
  };
  const labelStyle = {
    fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 5, display: 'block',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto',
          background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '1.25rem', padding: '1.5rem',
        }}
      >
        {submitted ? (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
              style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #14532d, #4ade80)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
              }}>
              <CheckCircle2 size={32} style={{ color: '#fff' }} />
            </motion.div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.5rem' }}>Offer Submitted! 🎉</h3>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', marginBottom: '1rem', lineHeight: 1.5 }}>
              Your crop offer has been sent to <strong style={{ color: '#f59e0b' }}>{requirement.vendor?.business_name || 'the vendor'}</strong>.
              They will review and respond soon.
            </p>
            <button type="button" onClick={onClose} style={{
              padding: '0.65rem 2rem', borderRadius: '0.85rem', border: 'none',
              background: 'linear-gradient(135deg, #14532d, #4ade80)',
              color: '#fff', fontWeight: 800, cursor: 'pointer',
            }}>Done</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                🌾 Submit Your Crop Offer
              </h3>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Requirement Summary */}
            <div style={{
              padding: '0.75rem', borderRadius: '0.75rem',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
              marginBottom: '1rem',
            }}>
              <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
                {requirement.crop_name} — {requirement.quantity_required} {requirement.quantity_unit}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
                ₹{requirement.min_price} – ₹{requirement.max_price} {requirement.price_unit}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Your Name *</label>
                  <input style={inputStyle} placeholder="e.g., Rajesh Kumar"
                    value={form.farmer_name} onChange={e => update('farmer_name', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number *</label>
                  <input style={inputStyle} type="tel" placeholder="9876543210"
                    value={form.farmer_phone} onChange={e => update('farmer_phone', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Your Village / Location</label>
                <input style={inputStyle} placeholder="e.g., Chincholi, Solapur"
                  value={form.farmer_location} onChange={e => update('farmer_location', e.target.value)} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={labelStyle}>Quantity You Can Sell ({requirement.quantity_unit}) *</label>
                  <input style={inputStyle} type="number" placeholder="e.g., 50"
                    value={form.offered_quantity} onChange={e => update('offered_quantity', e.target.value)} />
                </div>
                <div>
                  <label style={labelStyle}>Your Expected Price (₹) *</label>
                  <input style={inputStyle} type="number" placeholder="e.g., 2300"
                    value={form.offered_price} onChange={e => update('offered_price', e.target.value)} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Crop Quality</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.crop_quality_self_assessment}
                  onChange={e => update('crop_quality_self_assessment', e.target.value)}>
                  <option value="" style={{ background: '#0d1b2a' }}>Select Quality</option>
                  {['A Grade - Excellent', 'B Grade - Good', 'FAQ - Fair Average', 'Standard'].map(q =>
                    <option key={q} value={q} style={{ background: '#0d1b2a' }}>{q}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Additional Notes</label>
                <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                  placeholder="Any details about your crop, harvest time, etc."
                  value={form.notes} onChange={e => update('notes', e.target.value)} />
              </div>
            </div>

            <button type="button" onClick={handleSubmit}
              disabled={submitting || !form.farmer_name || !form.offered_quantity || !form.offered_price}
              style={{
                width: '100%', marginTop: '1.25rem', padding: '0.75rem', borderRadius: '0.85rem',
                border: 'none',
                background: 'linear-gradient(135deg, #14532d, #16a34a, #4ade80)',
                color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: (!form.farmer_name || !form.offered_quantity || !form.offered_price) ? 0.5 : 1,
              }}>
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><Send size={16} /> Submit Crop Offer</>
              )}
            </button>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function FarmerBrowseRequirementsPage() {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCrop, setSearchCrop] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedReq, setSelectedReq] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort_by: sortBy });
      if (selectedCrop !== 'All') params.set('crop', selectedCrop);
      if (searchCrop) params.set('crop', searchCrop);
      const resp = await fetch(`${API}api/vendor/marketplace/requirements?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setRequirements(data.requirements || []);
      }
    } catch (e) {
      console.error('Failed to fetch:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequirements(); }, [selectedCrop, sortBy]);

  const daysLeft = (validTo) => {
    if (!validTo) return null;
    return Math.max(0, Math.ceil((new Date(validTo) - new Date()) / (1000 * 3600 * 24)));
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #030712, #0a1628, #030712)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Hero Header */}
      <div style={{
        position: 'relative', padding: '3rem 1.5rem 2rem',
        background: 'linear-gradient(180deg, rgba(245,158,11,0.08) 0%, transparent 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 50, padding: '0.5rem 1rem', color: '#e2e8f0',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            fontSize: '0.82rem', fontWeight: 600, marginBottom: '1.5rem',
          }}>
            <ArrowLeft size={15} /> Back
          </button>

          <h1 style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)',
            fontWeight: 900, color: '#fff', marginBottom: '0.5rem',
          }}>
            🌾 Sell Your <span style={{ color: '#f59e0b' }}>Crops</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.92rem', maxWidth: 550, lineHeight: 1.6 }}>
            Browse buying requirements from verified procurement vendors. Find the best prices and submit your crop offer directly.
          </p>

          {/* Search */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: '1 1 300px' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
              <input type="text" placeholder="Search by crop name..."
                value={searchCrop}
                onChange={e => setSearchCrop(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchRequirements()}
                style={{
                  width: '100%', padding: '0.7rem 0.8rem 0.7rem 2.5rem',
                  borderRadius: '0.85rem', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', color: '#fff',
                  fontSize: '0.88rem', outline: 'none',
                }}
              />
            </div>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
              padding: '0.7rem 1rem', borderRadius: '0.85rem',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              color: '#fff', fontSize: '0.82rem', cursor: 'pointer', outline: 'none',
            }}>
              <option value="newest" style={{ background: '#0d1b2a' }}>Newest First</option>
              <option value="price_high" style={{ background: '#0d1b2a' }}>Highest Price</option>
              <option value="quantity" style={{ background: '#0d1b2a' }}>Most Quantity</option>
            </select>
          </div>

          {/* Crop Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '1rem', flexWrap: 'wrap' }}>
            {CROP_FILTERS.map(crop => (
              <button key={crop} type="button" onClick={() => setSelectedCrop(crop)} style={{
                padding: '5px 12px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                border: `1px solid ${selectedCrop === crop ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: selectedCrop === crop ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
                color: selectedCrop === crop ? '#f59e0b' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
              }}>
                {crop}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requirements List */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>Finding buying requirements near you...</p>
          </div>
        ) : requirements.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <Wheat size={48} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 1rem' }} />
            <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '0.5rem' }}>
              No active buying requirements found
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>
              Check back later — vendors post new crop buying requirements regularly.
            </p>
          </motion.div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1rem' }}>
            {requirements.map((req, i) => {
              const days = daysLeft(req.valid_to);
              return (
                <motion.div key={req.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '1rem', padding: '1.25rem',
                    display: 'flex', flexDirection: 'column',
                  }}
                >
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
                        🌾 {req.crop_name}
                        {req.crop_variety && <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>({req.crop_variety})</span>}
                      </h3>
                      {days !== null && (
                        <span style={{
                          fontSize: '0.68rem', fontWeight: 700,
                          color: days <= 3 ? '#ef4444' : days <= 7 ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                        }}>
                          <Clock size={10} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                          {days === 0 ? 'Expires today' : `${days} days left`}
                        </span>
                      )}
                    </div>
                    {req.quality_grade && (
                      <span style={{
                        padding: '3px 8px', borderRadius: 6, fontSize: '0.68rem', fontWeight: 700,
                        background: 'rgba(250,204,21,0.12)', color: '#facc15',
                      }}>
                        {req.quality_grade}
                      </span>
                    )}
                  </div>

                  {/* Price & Quantity */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem', marginBottom: '0.85rem',
                    padding: '0.75rem', borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.02)',
                  }}>
                    <div>
                      <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Price Range</p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#4ade80' }}>
                        ₹{req.min_price} – ₹{req.max_price}
                      </p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{req.price_unit}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.62rem', fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 3 }}>Quantity Needed</p>
                      <p style={{ fontSize: '1rem', fontWeight: 800, color: '#f59e0b' }}>
                        {req.quantity_required} {req.quantity_unit}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.85rem' }}>
                    {req.procurement_location && (
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <MapPin size={12} style={{ color: '#60a5fa' }} /> {req.procurement_location} ({req.pickup_radius_km}km)
                      </span>
                    )}
                    {req.transport_provided && (
                      <span style={{ fontSize: '0.78rem', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                        <Truck size={12} /> Transport provided
                      </span>
                    )}
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> {req.total_applications || 0} offers
                    </span>
                  </div>

                  {/* Vendor Info */}
                  {req.vendor && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.6rem', borderRadius: '0.65rem',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                      marginBottom: '0.85rem',
                    }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: 'rgba(245,158,11,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 800, color: '#f59e0b', fontSize: '0.8rem', flexShrink: 0,
                      }}>
                        {req.vendor.business_name?.charAt(0) || '🏭'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>
                          {req.vendor.business_name}
                          {req.vendor.is_verified && (
                            <Shield size={11} style={{ color: '#4ade80', marginLeft: 4, verticalAlign: 'middle' }} />
                          )}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>
                          {req.vendor.district} · ⭐ {req.vendor.rating || '—'} · {req.vendor.farmers_served || 0} farmers served
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <button type="button" onClick={() => setSelectedReq(req)} style={{
                    width: '100%', padding: '0.7rem', borderRadius: '0.85rem', border: 'none',
                    background: 'linear-gradient(135deg, #14532d, #16a34a, #4ade80)',
                    color: '#fff', fontWeight: 800, fontSize: '0.88rem', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    boxShadow: '0 4px 16px rgba(74,222,128,0.2)',
                    marginTop: 'auto',
                  }}>
                    <Send size={15} /> Submit Your Offer
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Submit Offer Modal */}
      <SubmitOfferModal
        isOpen={!!selectedReq}
        onClose={() => setSelectedReq(null)}
        requirement={selectedReq}
      />
    </div>
  );
}
