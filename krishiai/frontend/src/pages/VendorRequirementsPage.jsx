import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, ClipboardList, Wheat, MapPin, Calendar, IndianRupee,
  Truck, Clock, Users, Send, Eye, Edit3, X, Save, Loader2,
  CheckCircle2, AlertCircle, ChevronDown, ArrowRight, Pause, Play
} from 'lucide-react';

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Soybean', 'Maize',
  'Tomato', 'Onion', 'Potato', 'Groundnut', 'Jowar', 'Bajra',
  'Chilli', 'Turmeric', 'Ginger', 'Banana', 'Mango', 'Grapes',
];

const STATUS_STYLES = {
  draft: { bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', label: '📝 Draft' },
  active: { bg: 'rgba(74,222,128,0.15)', color: '#4ade80', label: '🟢 Active' },
  fulfilled: { bg: 'rgba(96,165,250,0.15)', color: '#60a5fa', label: '✅ Fulfilled' },
  expired: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444', label: '⏰ Expired' },
  cancelled: { bg: 'rgba(107,114,128,0.15)', color: '#6b7280', label: '❌ Cancelled' },
};

function RequirementFormModal({ isOpen, onClose, onSave, requirement = null }) {
  const today = new Date().toISOString().split('T')[0];
  const defaultEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const [form, setForm] = useState({
    crop_name: '', crop_variety: '', quantity_required: '',
    quantity_unit: 'quintal', quality_grade: '', max_moisture_percent: '',
    min_price: '', max_price: '', price_unit: 'per quintal',
    procurement_location: '', pickup_district: '', pickup_state: '',
    pickup_radius_km: 50, valid_from: today, valid_to: defaultEnd,
    payment_terms: 'on_pickup', transport_provided: false,
    special_instructions: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (requirement) {
      setForm({
        crop_name: requirement.crop_name || '',
        crop_variety: requirement.crop_variety || '',
        quantity_required: requirement.quantity_required || '',
        quantity_unit: requirement.quantity_unit || 'quintal',
        quality_grade: requirement.quality_grade || '',
        max_moisture_percent: requirement.max_moisture_percent || '',
        min_price: requirement.min_price || '',
        max_price: requirement.max_price || '',
        price_unit: requirement.price_unit || 'per quintal',
        procurement_location: requirement.procurement_location || '',
        pickup_district: requirement.pickup_district || '',
        pickup_state: requirement.pickup_state || '',
        pickup_radius_km: requirement.pickup_radius_km || 50,
        valid_from: requirement.valid_from?.split('T')[0] || today,
        valid_to: requirement.valid_to?.split('T')[0] || defaultEnd,
        payment_terms: requirement.payment_terms || 'on_pickup',
        transport_provided: requirement.transport_provided || false,
        special_instructions: requirement.special_instructions || '',
      });
    }
  }, [requirement, isOpen]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        quantity_required: parseFloat(form.quantity_required) || 0,
        min_price: parseFloat(form.min_price) || 0,
        max_price: parseFloat(form.max_price) || 0,
        max_moisture_percent: form.max_moisture_percent ? parseFloat(form.max_moisture_percent) : null,
        pickup_radius_km: parseInt(form.pickup_radius_km) || 50,
      });
      onClose();
    } catch (e) {
      alert(e.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
          style={{
            width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto',
            background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1.25rem', padding: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
              {requirement ? 'Edit Requirement' : '🌾 New Buying Requirement'}
            </h2>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          {/* Crop Info Section */}
          <div style={{
            padding: '0.75rem', borderRadius: '0.85rem',
            background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)',
            marginBottom: '1rem',
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', marginBottom: 4 }}>
              🌾 Crop Details
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Crop Name *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.crop_name} onChange={e => update('crop_name', e.target.value)}>
                  <option value="" style={{ background: '#0d1b2a' }}>Select Crop</option>
                  {CROP_OPTIONS.map(c => <option key={c} value={c} style={{ background: '#0d1b2a' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Variety (Optional)</label>
                <input style={inputStyle} placeholder="e.g., Sharbati, Bt"
                  value={form.crop_variety} onChange={e => update('crop_variety', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Quantity Required *</label>
                <input style={inputStyle} type="number" placeholder="e.g., 100"
                  value={form.quantity_required} onChange={e => update('quantity_required', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.quantity_unit} onChange={e => update('quantity_unit', e.target.value)}>
                  {['quintal', 'tonne', 'kg'].map(u =>
                    <option key={u} value={u} style={{ background: '#0d1b2a' }}>{u}</option>
                  )}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Quality Grade</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.quality_grade} onChange={e => update('quality_grade', e.target.value)}>
                  <option value="" style={{ background: '#0d1b2a' }}>Any</option>
                  {['A Grade', 'B Grade', 'FAQ', 'Standard', 'Premium'].map(g =>
                    <option key={g} value={g} style={{ background: '#0d1b2a' }}>{g}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Pricing */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Min Price (₹) *</label>
                <input style={inputStyle} type="number" placeholder="2000"
                  value={form.min_price} onChange={e => update('min_price', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Max Price (₹) *</label>
                <input style={inputStyle} type="number" placeholder="2500"
                  value={form.max_price} onChange={e => update('max_price', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Price Unit</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.price_unit} onChange={e => update('price_unit', e.target.value)}>
                  {['per quintal', 'per tonne', 'per kg'].map(u =>
                    <option key={u} value={u} style={{ background: '#0d1b2a' }}>{u}</option>
                  )}
                </select>
              </div>
            </div>

            {/* Location */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Pickup Location</label>
                <input style={inputStyle} placeholder="e.g., Pune"
                  value={form.procurement_location} onChange={e => update('procurement_location', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>District</label>
                <input style={inputStyle} placeholder="e.g., Pune"
                  value={form.pickup_district} onChange={e => update('pickup_district', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Pickup Radius (km)</label>
                <input style={inputStyle} type="number" placeholder="50"
                  value={form.pickup_radius_km} onChange={e => update('pickup_radius_km', e.target.value)} />
              </div>
            </div>

            {/* Validity */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Valid From *</label>
                <input style={inputStyle} type="date" value={form.valid_from}
                  onChange={e => update('valid_from', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Valid To *</label>
                <input style={inputStyle} type="date" value={form.valid_to}
                  onChange={e => update('valid_to', e.target.value)} />
              </div>
            </div>

            {/* Terms */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Payment Terms</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.payment_terms} onChange={e => update('payment_terms', e.target.value)}>
                  <option value="on_pickup" style={{ background: '#0d1b2a' }}>On Pickup (Instant)</option>
                  <option value="t_plus_1" style={{ background: '#0d1b2a' }}>T+1 (Next Day)</option>
                  <option value="t_plus_3" style={{ background: '#0d1b2a' }}>T+3 (3 Days)</option>
                  <option value="t_plus_7" style={{ background: '#0d1b2a' }}>T+7 (7 Days)</option>
                  <option value="advance_balance" style={{ background: '#0d1b2a' }}>Advance + Balance</option>
                </select>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.transport_provided}
                    onChange={e => update('transport_provided', e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: '#f59e0b' }}
                  />
                  <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                    <Truck size={13} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                    I provide transport
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Special Instructions</label>
              <textarea style={{ ...inputStyle, minHeight: 60, resize: 'vertical' }}
                placeholder="Any special requirements, quality preferences, packaging..."
                value={form.special_instructions} onChange={e => update('special_instructions', e.target.value)} />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
            }}>Cancel</button>
            <button type="button" onClick={handleSave}
              disabled={saving || !form.crop_name || !form.quantity_required || !form.min_price || !form.max_price}
              style={{
                padding: '0.65rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                background: 'linear-gradient(135deg, #92400e, #f59e0b)',
                color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: (!form.crop_name || !form.quantity_required || !form.min_price || !form.max_price) ? 0.5 : 1,
              }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {saving ? 'Saving...' : 'Save Requirement'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function VendorRequirementsPage() {
  const context = useOutletContext() || {};
  const { vendor, config = {} } = context;
  const [requirements, setRequirements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingReq, setEditingReq] = useState(null);

  const API = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/';

  const fetchRequirements = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const resp = await fetch(`${API}api/vendor/requirements?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        setRequirements(data.requirements || []);
      }
    } catch (e) {
      console.error('Failed to fetch requirements:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequirements(); }, [filterStatus]);

  const handleSave = async (data) => {
    const resp = await fetch(`${API}api/vendor/requirements`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.detail || 'Failed to save');
    }
    fetchRequirements();
  };

  const handlePublish = async (reqId) => {
    try {
      const resp = await fetch(`${API}api/vendor/requirements/${reqId}/publish`, { method: 'POST' });
      if (resp.ok) fetchRequirements();
      else {
        const err = await resp.json();
        alert(err.detail || 'Failed to publish.');
      }
    } catch (e) {
      alert('Network error.');
    }
  };

  const daysRemaining = (validTo) => {
    if (!validTo) return null;
    const end = new Date(validTo);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 3600 * 24));
    return diff;
  };

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            Buying Requirements
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            Post what crops you want to purchase. Nearby farmers will see your requirements and submit offers.
          </p>
        </div>
        <button type="button"
          onClick={() => { setEditingReq(null); setShowForm(true); }}
          style={{
            padding: '0.65rem 1.25rem', borderRadius: '0.85rem', border: 'none',
            background: 'linear-gradient(135deg, #92400e, #f59e0b)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 6px 20px rgba(245,158,11,0.2)',
          }}
          id="vendor-add-requirement-btn"
        >
          <Plus size={16} /> New Requirement
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {['all', 'draft', 'active', 'fulfilled', 'expired'].map(status => {
          const isActive = filterStatus === status;
          return (
            <button key={status} type="button" onClick={() => setFilterStatus(status)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
              border: `1px solid ${isActive ? 'rgba(245,158,11,0.5)' : 'rgba(255,255,255,0.1)'}`,
              background: isActive ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)',
              color: isActive ? '#f59e0b' : 'rgba(255,255,255,0.45)',
              cursor: 'pointer', transition: 'all 0.2s', textTransform: 'capitalize',
            }}>
              {status === 'all' ? 'All' : status}
            </button>
          );
        })}
      </div>

      {/* Requirements List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#f59e0b', margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading requirements...</p>
        </div>
      ) : requirements.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <ClipboardList size={48} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '0.5rem' }}>
            No buying requirements yet
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
            Create your first buying requirement to start receiving crop offers from farmers in your area.
          </p>
          <button type="button" onClick={() => { setEditingReq(null); setShowForm(true); }} style={{
            padding: '0.65rem 1.5rem', borderRadius: '0.85rem', border: 'none',
            background: 'linear-gradient(135deg, #92400e, #f59e0b)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
          }}>
            <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Create First Requirement
          </button>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {requirements.map((req, i) => {
            const statusInfo = STATUS_STYLES[req.status] || STATUS_STYLES.draft;
            const days = daysRemaining(req.valid_to);

            return (
              <motion.div key={req.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem', padding: '1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}
              >
                {/* Top Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12,
                      background: 'rgba(245,158,11,0.12)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem',
                    }}>
                      🌾
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
                        {req.crop_name} {req.crop_variety ? `(${req.crop_variety})` : ''}
                      </h3>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600 }}>
                        {req.requirement_code}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 700,
                    background: statusInfo.bg, color: statusInfo.color,
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Details Row */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Wheat size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      {req.quantity_required} {req.quantity_unit}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <IndianRupee size={14} style={{ color: '#4ade80' }} />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                      ₹{req.min_price} – ₹{req.max_price} {req.price_unit}
                    </span>
                  </div>
                  {req.procurement_location && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <MapPin size={14} style={{ color: '#60a5fa' }} />
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                        {req.procurement_location} ({req.pickup_radius_km}km)
                      </span>
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Users size={14} style={{ color: '#a78bfa' }} />
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)' }}>
                      {req.total_applications || 0} applications
                    </span>
                  </div>
                  {days !== null && req.status === 'active' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Clock size={14} style={{ color: days <= 3 ? '#ef4444' : '#facc15' }} />
                      <span style={{ fontSize: '0.82rem', color: days <= 3 ? '#ef4444' : 'rgba(255,255,255,0.6)', fontWeight: days <= 3 ? 700 : 400 }}>
                        {days <= 0 ? 'Expired' : `${days} days left`}
                      </span>
                    </div>
                  )}
                  {req.transport_provided && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Truck size={14} style={{ color: '#4ade80' }} />
                      <span style={{ fontSize: '0.78rem', color: '#4ade80', fontWeight: 600 }}>Transport provided</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.75rem' }}>
                  {req.status === 'draft' && (
                    <button type="button" onClick={() => handlePublish(req.id)} style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: 'rgba(74,222,128,0.15)', color: '#4ade80',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Send size={12} /> Publish
                    </button>
                  )}
                  {req.status === 'active' && (
                    <button type="button" onClick={() => alert('View applications for this requirement')} style={{
                      padding: '6px 14px', borderRadius: 8, border: 'none',
                      background: 'rgba(167,139,250,0.15)', color: '#a78bfa',
                      fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <Eye size={12} /> View {req.total_applications || 0} Applications
                    </button>
                  )}
                  <button type="button" onClick={() => { setEditingReq(req); setShowForm(true); }} style={{
                    padding: '6px 14px', borderRadius: 8,
                    border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                    color: 'rgba(255,255,255,0.5)', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    <Edit3 size={12} /> Edit
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Form Modal */}
      <RequirementFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingReq(null); }}
        onSave={handleSave}
        requirement={editingReq}
      />
    </div>
  );
}
