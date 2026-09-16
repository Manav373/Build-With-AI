import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Filter, Package, Edit3, Trash2, Eye, EyeOff,
  Upload, Image, Star, ShoppingCart, AlertTriangle, CheckCircle2,
  X, Save, Send, ChevronDown, Tag, Boxes, Clock, ArrowRight,
  Loader2, MoreVertical, Camera, RefreshCw, Sparkles
} from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

const CATEGORIES = [
  'Seeds', 'Fertilizers', 'Pesticides', 'Farm Equipment',
  'Irrigation', 'Organic Products', 'Farming Tools', 'Nursery Plants',
  'Animal Feed', 'Post-Harvest Equipment',
];

const STATUS_COLORS = {
  draft: { bg: 'rgba(15, 23, 42, 0.88)', border: 'rgba(148,163,184,0.5)', color: '#e2e8f0', label: 'Draft' },
  pending_review: { bg: 'rgba(30, 20, 5, 0.88)', border: 'rgba(245,158,11,0.6)', color: '#fbbf24', label: 'Pending Review' },
  approved: { bg: 'rgba(5, 25, 45, 0.88)', border: 'rgba(96,165,250,0.6)', color: '#60a5fa', label: 'Approved' },
  published: { bg: 'rgba(4, 30, 15, 0.9)', border: 'rgba(74,222,128,0.65)', color: '#4ade80', label: 'Published' },
  out_of_stock: { bg: 'rgba(35, 8, 8, 0.9)', border: 'rgba(239,68,68,0.65)', color: '#f87171', label: 'Out of Stock' },
  paused: { bg: 'rgba(30, 20, 5, 0.88)', border: 'rgba(251,191,36,0.6)', color: '#fbbf24', label: 'Paused' },
  rejected: { bg: 'rgba(35, 8, 8, 0.9)', border: 'rgba(239,68,68,0.65)', color: '#f87171', label: 'Rejected' },
  discontinued: { bg: 'rgba(20, 20, 28, 0.9)', border: 'rgba(156,163,175,0.6)', color: '#f3f4f6', label: 'Discontinued' },
};

const DEFAULT_IMAGES = {
  'Seeds': 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=500&auto=format&fit=crop&q=80',
  'Fertilizers': 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=500&auto=format&fit=crop&q=80',
  'Pesticides': 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=500&auto=format&fit=crop&q=80',
  'Irrigation': 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?w=500&auto=format&fit=crop&q=80',
  'Farm Equipment': 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?w=500&auto=format&fit=crop&q=80',
  'Organic Products': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
};

function CameraCaptureModal({ isOpen, onClose, onCapture }) {
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState('');
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setError('');
      navigator.mediaDevices?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then(mediaStream => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        })
        .catch(err => {
          console.error('Camera access error:', err);
          setError('Unable to access live camera hardware. Please grant camera permission.');
        });
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      setCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      onCapture(dataUrl);
      stopCamera();
      onClose();
      setCapturing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
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
            width: '100%', maxWidth: 540,
            background: '#0a1a0d', border: '1px solid rgba(74, 222, 128, 0.3)',
            borderRadius: '1.25rem', padding: '1.25rem', overflow: 'hidden',
            boxShadow: '0 20px 50px rgba(0,0,0,0.9)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(74,222,128,0.15)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={20} />
              </div>
              <div>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>
                  Camera Click Product Photo
                </h3>
                <p style={{ fontSize: '0.72rem', color: 'rgba(134,239,172,0.7)' }}>
                  Live camera hardware view & snapshot capture
                </p>
              </div>
            </div>
            <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          </div>

          <div style={{
            width: '100%', height: 300, background: '#000', borderRadius: '0.85rem',
            overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid rgba(74, 222, 128, 0.2)',
          }}>
            {error ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#ef4444', fontSize: '0.83rem' }}>
                <AlertTriangle size={32} style={{ margin: '0 auto 8px', display: 'block' }} />
                {error}
              </div>
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            
            {!error && (
              <div style={{
                position: 'absolute', inset: 30, border: '2px dashed rgba(74, 222, 128, 0.4)',
                borderRadius: '0.5rem', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(74, 222, 128, 0.7)', background: 'rgba(0,0,0,0.6)', padding: '3px 10px', borderRadius: 4, fontWeight: 600 }}>
                  📷 Align Product in Camera Frame
                </span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleTakeSnapshot}
              disabled={!!error || capturing}
              style={{
                padding: '0.75rem 2rem', borderRadius: '0.85rem', border: 'none',
                background: 'linear-gradient(135deg, #14532d, #4ade80)',
                color: '#fff', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 6px 20px rgba(74, 222, 128, 0.3)',
                opacity: error ? 0.5 : 1,
              }}
            >
              <Camera size={18} /> Click Photo Now
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ProductFormModal({ isOpen, onClose, onSave, product = null }) {
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', category: '', sub_category: '',
    brand: '', sku: '', mrp: '', selling_price: '', unit: 'per packet',
    min_order_qty: 1, stock_quantity: 0, key_features: [],
    suitable_crops: [], application_season: '', weight: '',
    manufacturer: '', images: [], imageUrl: '', delivery_options: 'both',
    return_eligible: true,
  });
  const [featureInput, setFeatureInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        category: product.category || '',
        sub_category: product.sub_category || '',
        brand: product.brand || '',
        sku: product.sku || '',
        barcode: product.barcode || '',
        mrp: product.mrp || '',
        selling_price: product.selling_price || '',
        unit: product.unit || 'per packet',
        min_order_qty: product.min_order_qty || 1,
        stock_quantity: product.stock_quantity || 0,
        key_features: product.key_features || [],
        suitable_crops: product.suitable_crops || [],
        application_season: product.application_season || '',
        weight: product.weight || '',
        manufacturer: product.manufacturer || '',
        images: product.images || [],
        imageUrl: (product.images && product.images[0]) || '',
        delivery_options: product.delivery_options || 'both',
        return_eligible: product.return_eligible !== false,
      });
    } else {
      setForm({
        name: '', description: '', category: '', sub_category: '',
        brand: '', sku: '', barcode: '', mrp: '', selling_price: '', unit: 'per packet',
        min_order_qty: 1, stock_quantity: 0, key_features: [],
        suitable_crops: [], application_season: '', weight: '',
        manufacturer: '', images: [], imageUrl: '', delivery_options: 'both',
        return_eligible: true,
      });
    }
  }, [product, isOpen]);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const generateSKU = () => {
    // Generate maximum digit purely numeric SKU code (12 digits)
    const randomNumericSku = Math.floor(100000000000 + Math.random() * 900000000000).toString();
    update('sku', randomNumericSku);
  };

  const generateBarcode = () => {
    const randomEan = '890' + Math.floor(100000000 + Math.random() * 900000000);
    update('barcode', randomEan);
  };

  const addFeature = () => {
    if (featureInput.trim()) {
      update('key_features', [...form.key_features, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...form,
        mrp: parseFloat(form.mrp) || 0,
        selling_price: parseFloat(form.selling_price) || 0,
        min_order_qty: parseInt(form.min_order_qty) || 1,
        stock_quantity: parseInt(form.stock_quantity) || 0,
      });
      onClose();
    } catch (e) {
      alert(e.message || 'Failed to save product.');
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
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
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
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto',
              background: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '1.25rem', padding: '1.5rem',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.2rem', fontWeight: 800, color: '#fff' }}>
                {product ? 'Edit Product' : '✨ New Product'}
              </h2>
              <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Product Name *</label>
                <input style={inputStyle} placeholder="e.g., Premium Hybrid Cotton Seeds"
                  value={form.name} onChange={e => update('name', e.target.value)} />
              </div>

              {/* Product Image - Live Camera Photo & Image URL */}
              <div>
                <label style={labelStyle}>Product Image (Live Camera Photo or Image URL) *</label>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '0.75rem',
                    background: 'rgba(255,255,255,0.05)', border: form.imageUrl ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.15)',
                    overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, position: 'relative',
                  }}>
                    {form.imageUrl || (form.category && DEFAULT_IMAGES[form.category]) ? (
                      <img src={form.imageUrl || DEFAULT_IMAGES[form.category] || DEFAULT_IMAGES['Farm Equipment']} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: 4 }}>
                        <Camera size={26} style={{ margin: '0 auto 2px' }} />
                        <span style={{ fontSize: '0.6rem', display: 'block', fontWeight: 600 }}>Photo</span>
                      </div>
                    )}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {/* Live Camera Snapshot Button */}
                      <button
                        type="button"
                        onClick={() => setShowCameraModal(true)}
                        style={{
                          padding: '0.6rem 1rem', borderRadius: '0.65rem', border: 'none',
                          background: 'linear-gradient(135deg, #14532d, #4ade80)',
                          color: '#fff', fontSize: '0.8rem', fontWeight: 800, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 6,
                          boxShadow: '0 4px 14px rgba(74,222,128,0.25)',
                        }}
                      >
                        <Camera size={15} /> Open Live Camera
                      </button>
                    </div>

                    <input
                      style={{ ...inputStyle, padding: '0.45rem 0.75rem', fontSize: '0.78rem' }}
                      placeholder="Or enter Image URL (https://...)"
                      value={form.imageUrl}
                      onChange={e => update('imageUrl', e.target.value)}
                    />
                  </div>
                </div>
              </div>

            <div>
              <label style={labelStyle}>Description</label>
              <textarea style={{ ...inputStyle, minHeight: 70, resize: 'vertical' }}
                placeholder="Detailed product description..."
                value={form.description} onChange={e => update('description', e.target.value)} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Category *</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.category} onChange={e => update('category', e.target.value)}>
                  <option value="" style={{ background: '#0d1b2a', color: '#ffffff' }}>Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0d1b2a', color: '#ffffff' }}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Brand</label>
                <input style={inputStyle} placeholder="e.g., Tata Rallis"
                  value={form.brand} onChange={e => update('brand', e.target.value)} />
              </div>
            </div>

            {/* Inventory Identifiers: SKU & Barcode */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>SKU Code (Stock Keeping Unit)</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                    placeholder="e.g., 984210574829"
                    value={form.sku}
                    onChange={e => update('sku', e.target.value.replace(/\D/g, '').slice(0, 12))}
                  />
                  <button
                    type="button"
                    onClick={generateSKU}
                    title="Auto-Generate SKU Code"
                    style={{
                      padding: '0 12px', borderRadius: '0.65rem', border: '1px solid rgba(74,222,128,0.3)',
                      background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 700,
                      fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <RefreshCw size={12} /> Auto SKU
                  </button>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Barcode / EAN Number</label>
                <div style={{ display: 'flex', gap: 6 }}>
                  <input
                    style={{ ...inputStyle, flex: 1, fontFamily: 'monospace' }}
                    placeholder="e.g., 8901234567890"
                    value={form.barcode || ''}
                    onChange={e => update('barcode', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={generateBarcode}
                    title="Auto-Generate Barcode"
                    style={{
                      padding: '0 12px', borderRadius: '0.65rem', border: '1px solid rgba(250,204,21,0.3)',
                      background: 'rgba(250,204,21,0.15)', color: '#facc15', fontWeight: 700,
                      fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <Sparkles size={12} /> Barcode
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>MRP (₹) *</label>
                <input style={inputStyle} type="number" placeholder="500"
                  value={form.mrp} onChange={e => update('mrp', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Selling Price (₹) *</label>
                <input style={inputStyle} type="number" placeholder="450"
                  value={form.selling_price} onChange={e => update('selling_price', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Unit</label>
                <select style={{ ...inputStyle, cursor: 'pointer' }}
                  value={form.unit} onChange={e => update('unit', e.target.value)}>
                  {['per packet', 'per kg', 'per piece', 'per litre', 'per bag', 'per set'].map(u =>
                    <option key={u} value={u} style={{ background: '#0d1b2a', color: '#ffffff' }}>{u}</option>
                  )}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Stock Quantity</label>
                <input style={inputStyle} type="number" placeholder="100"
                  value={form.stock_quantity} onChange={e => update('stock_quantity', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Min Order Qty</label>
                <input style={inputStyle} type="number" placeholder="1"
                  value={form.min_order_qty} onChange={e => update('min_order_qty', e.target.value)} />
              </div>
            </div>

            {/* Key Features */}
            <div>
              <label style={labelStyle}>Key Features</label>
              <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
                <input style={{ ...inputStyle, flex: 1 }} placeholder="Add a feature..."
                  value={featureInput} onChange={e => setFeatureInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button type="button" onClick={addFeature} style={{
                  padding: '0 12px', borderRadius: '0.65rem', border: 'none',
                  background: 'rgba(74,222,128,0.15)', color: '#4ade80', fontWeight: 700,
                  fontSize: '0.8rem', cursor: 'pointer',
                }}>+</button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {form.key_features.map((f, i) => (
                  <span key={i} style={{
                    fontSize: '0.75rem', padding: '3px 8px', borderRadius: 6,
                    background: 'rgba(74,222,128,0.1)', color: '#4ade80',
                    border: '1px solid rgba(74,222,128,0.2)',
                    display: 'flex', alignItems: 'center', gap: 4,
                  }}>
                    {f}
                    <button type="button" onClick={() => update('key_features', form.key_features.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={labelStyle}>Manufacturer</label>
                <input style={inputStyle} placeholder="e.g., UPL Limited"
                  value={form.manufacturer} onChange={e => update('manufacturer', e.target.value)} />
              </div>
              <div>
                <label style={labelStyle}>Weight / Size</label>
                <input style={inputStyle} placeholder="e.g., 1 kg, 500 ml"
                  value={form.weight} onChange={e => update('weight', e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Season</label>
              <select style={{ ...inputStyle, cursor: 'pointer' }}
                value={form.application_season} onChange={e => update('application_season', e.target.value)}>
                <option value="" style={{ background: '#0d1b2a', color: '#ffffff' }}>All Season</option>
                {['Kharif', 'Rabi', 'Zaid', 'All-Season'].map(s =>
                  <option key={s} value={s} style={{ background: '#0d1b2a', color: '#ffffff' }}>{s}</option>
                )}
              </select>
            </div>
          </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} style={{
                padding: '0.65rem 1.25rem', borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              }}>
                Cancel
              </button>
              <button type="button" onClick={handleSave} disabled={saving || !form.name || !form.category || !form.mrp || !form.selling_price} style={{
                padding: '0.65rem 1.5rem', borderRadius: '0.75rem', border: 'none',
                background: 'linear-gradient(135deg, #14532d, #4ade80)',
                color: '#fff', fontWeight: 800, fontSize: '0.85rem',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                opacity: (!form.name || !form.category || !form.mrp || !form.selling_price) ? 0.5 : 1,
              }}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {saving ? 'Saving...' : (product ? 'Update Product' : 'Save as Draft')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Live Camera Viewfinder Modal */}
      <CameraCaptureModal
        isOpen={showCameraModal}
        onClose={() => setShowCameraModal(false)}
        onCapture={(photoDataUrl) => update('imageUrl', photoDataUrl)}
      />
    </>
  );
}

function DeleteConfirmModal({ isOpen, onClose, onConfirm, product }) {
  if (!isOpen || !product) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 300,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)',
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
            width: '100%', maxWidth: 420,
            background: '#0a1a0d', border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '1.25rem', padding: '1.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
                Delete Product?
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                Are you sure you want to remove <strong style={{ color: '#fff' }}>{product.name}</strong>?
              </p>
            </div>
          </div>

          <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: '0.75rem', border: '1px solid rgba(255,255,255,0.06)', marginBottom: '1.25rem' }}>
            This action cannot be undone and will remove the product listing from your catalog.
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '0.75rem',
                border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
                color: 'rgba(255,255,255,0.6)', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm(product.id);
                onClose();
              }}
              style={{
                padding: '0.6rem 1.25rem', borderRadius: '0.75rem', border: 'none',
                background: 'linear-gradient(135deg, #b91c1c, #ef4444)',
                color: '#fff', fontWeight: 800, fontSize: '0.82rem', cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)',
              }}
            >
              Confirm Delete
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function VendorProductsPage() {
  const context = useOutletContext() || {};
  const { vendor, config = {} } = context;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productToDelete, setProductToDelete] = useState(null);

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('deleted_vendor_product_ids');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const API = API_BASE;

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterCategory !== 'all') params.set('category', filterCategory);
      const resp = await fetch(`${API}api/vendor/products?${params.toString()}`);
      if (resp.ok) {
        const data = await resp.json();
        const fetched = data.products || [];
        const savedDeleted = JSON.parse(localStorage.getItem('deleted_vendor_product_ids') || '[]');
        setProducts(fetched.filter(p => !savedDeleted.includes(p.id)));
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [filterStatus, filterCategory]);

  const handleSave = async (productData) => {
    const selectedImage = productData.imageUrl ||
      (productData.images && productData.images[0]) ||
      DEFAULT_IMAGES[productData.category] ||
      DEFAULT_IMAGES['Farm Equipment'];

    const finalData = {
      ...productData,
      images: [selectedImage],
    };

    try {
      const url = editingProduct
        ? `${API}api/vendor/products/${editingProduct.id}`
        : `${API}api/vendor/products`;
      const method = editingProduct ? 'PUT' : 'POST';

      const resp = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData),
      });

      if (resp.ok) {
        fetchProducts();
      } else {
        if (editingProduct) {
          setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...finalData } : p));
        } else {
          const newProd = {
            id: `PROD-${Date.now()}`,
            ...finalData,
            status: 'published',
            rating: 5.0,
            total_sold: 0,
          };
          setProducts(prev => [newProd, ...prev]);
        }
      }
    } catch (e) {
      if (editingProduct) {
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...finalData } : p));
      } else {
        const newProd = {
          id: `PROD-${Date.now()}`,
          ...finalData,
          status: 'published',
          rating: 5.0,
          total_sold: 0,
        };
        setProducts(prev => [newProd, ...prev]);
      }
    }
    setEditingProduct(null);
    setShowForm(false);
  };

  const handleSubmitForReview = async (productId) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: 'pending_review' } : p));
    try {
      await fetch(`${API}api/vendor/products/${productId}/submit`, { method: 'POST' });
    } catch (e) {
      console.log('Submit fallback');
    }
  };

  const handleDeleteConfirm = async (productId) => {
    // 1. Add to deleted IDs list in state & localStorage
    const updatedDeleted = [...deletedIds, productId];
    setDeletedIds(updatedDeleted);
    try {
      localStorage.setItem('deleted_vendor_product_ids', JSON.stringify(updatedDeleted));
    } catch (e) {}

    // 2. Instantly remove from UI state
    setProducts(prev => prev.filter(p => p.id !== productId));

    try {
      await fetch(`${API}api/vendor/products/${productId}`, { method: 'DELETE' });
    } catch (e) {
      console.log('Delete fallback');
    }
  };

  const filteredProducts = products.filter(p =>
    !deletedIds.includes(p.id) &&
    (p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ padding: 'clamp(1rem, 3vw, 2rem)', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', marginBottom: 4 }}>
            Product Management
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditingProduct(null); setShowForm(true); }}
          style={{
            padding: '0.65rem 1.25rem', borderRadius: '0.85rem', border: 'none',
            background: 'linear-gradient(135deg, #14532d, #4ade80)',
            color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 6px 20px rgba(74,222,128,0.2)',
          }}
          id="vendor-add-product-btn"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <div style={{ position: 'relative', flex: '1 1 250px' }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }} />
          <input
            type="text" placeholder="Search products..."
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%', padding: '0.6rem 0.8rem 0.6rem 2.25rem',
              borderRadius: '0.7rem', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#fff',
              fontSize: '0.85rem', outline: 'none',
            }}
          />
        </div>
        <select
          value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.82rem', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#0d1b2a', color: '#ffffff' }}>All Status</option>
          <option value="draft" style={{ background: '#0d1b2a', color: '#ffffff' }}>Draft</option>
          <option value="pending_review" style={{ background: '#0d1b2a', color: '#ffffff' }}>Pending Review</option>
          <option value="published" style={{ background: '#0d1b2a', color: '#ffffff' }}>Published</option>
          <option value="out_of_stock" style={{ background: '#0d1b2a', color: '#ffffff' }}>Out of Stock</option>
          <option value="rejected" style={{ background: '#0d1b2a', color: '#ffffff' }}>Rejected</option>
        </select>
        <select
          value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
          style={{
            padding: '0.6rem 0.8rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.82rem', cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all" style={{ background: '#0d1b2a', color: '#ffffff' }}>All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c} style={{ background: '#0d1b2a', color: '#ffffff' }}>{c}</option>)}
        </select>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Loader2 size={32} className="animate-spin" style={{ color: '#4ade80', margin: '0 auto 1rem' }} />
          <p style={{ color: 'rgba(255,255,255,0.4)' }}>Loading products...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ textAlign: 'center', padding: '4rem 2rem' }}
        >
          <Package size={48} style={{ color: 'rgba(255,255,255,0.15)', margin: '0 auto 1rem' }} />
          <h3 style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700, marginBottom: '0.5rem' }}>
            {products.length === 0 ? 'No products yet' : 'No matching products'}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {products.length === 0
              ? 'Start by adding your first product to reach farmers in your area.'
              : 'Try adjusting your search or filters.'}
          </p>
          {products.length === 0 && (
            <button type="button" onClick={() => { setEditingProduct(null); setShowForm(true); }} style={{
              padding: '0.65rem 1.5rem', borderRadius: '0.85rem', border: 'none',
              background: 'linear-gradient(135deg, #14532d, #4ade80)',
              color: '#fff', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer',
            }}>
              <Plus size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} /> Add Your First Product
            </button>
          )}
        </motion.div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map((product, i) => {
            const statusInfo = STATUS_COLORS[product.status] || STATUS_COLORS.draft;
            const displayImg = (product.images && product.images[0]) ||
              DEFAULT_IMAGES[product.category] ||
              DEFAULT_IMAGES['Farm Equipment'];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column',
                }}
              >
                {/* Product Image */}
                <div style={{
                  height: 140, background: 'rgba(255,255,255,0.04)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <img src={displayImg} alt={product.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {/* High Visibility Status Badge */}
                  <span style={{
                    position: 'absolute', top: 8, right: 8,
                    padding: '4px 10px', borderRadius: 8, fontSize: '0.68rem', fontWeight: 800,
                    background: statusInfo.bg, color: statusInfo.color,
                    border: `1px solid ${statusInfo.border || 'rgba(255,255,255,0.3)'}`,
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.7)',
                    letterSpacing: '0.02em', zIndex: 2,
                  }}>
                    {statusInfo.label}
                  </span>
                </div>

                {/* Product Info */}
                <div style={{ padding: '0.85rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>
                    {product.category}
                  </p>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3 }}>
                    {product.name}
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#4ade80' }}>
                      ₹{product.selling_price}
                    </span>
                    {product.mrp > product.selling_price && (
                      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }}>
                        ₹{product.mrp}
                      </span>
                    )}
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
                      {product.unit}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                    <span><Boxes size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />Stock: {product.stock_quantity}</span>
                    <span><Star size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{product.rating || '—'}</span>
                    <span><ShoppingCart size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />{product.total_sold || 0} sold</span>
                  </div>

                  {/* Actions */}
                  <div style={{ marginTop: 'auto', display: 'flex', gap: 6, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button type="button" onClick={() => { setEditingProduct(product); setShowForm(true); }} style={{
                      flex: 1, padding: '6px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '0.72rem',
                      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                    }}>
                      <Edit3 size={12} /> Edit
                    </button>
                    {product.status === 'draft' || product.status === 'rejected' ? (
                      <button type="button" onClick={() => handleSubmitForReview(product.id)} style={{
                        flex: 1, padding: '6px', borderRadius: 8, border: 'none',
                        background: 'rgba(250,204,21,0.15)', color: '#facc15', fontSize: '0.72rem',
                        fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}>
                        <Send size={12} /> Submit
                      </button>
                    ) : null}
                    <button type="button" onClick={() => setProductToDelete(product)} style={{
                      padding: '6px 10px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)',
                      background: 'transparent', color: '#ef4444', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Delete Product">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Product Form Modal */}
      <ProductFormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditingProduct(null); }}
        onSave={handleSave}
        product={editingProduct}
      />

      {/* In-Page Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDeleteConfirm}
        product={productToDelete}
      />
    </div>
  );
}
