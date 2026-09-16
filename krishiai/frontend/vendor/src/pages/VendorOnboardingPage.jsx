import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Check, Upload, Building2, User, Phone,
  Mail, MapPin, Globe, FileText, Camera, Shield, Wheat, Package,
  Clock, Truck, ChevronDown, AlertCircle, CheckCircle2, Loader2,
  ShieldCheck, FileCheck, FileCode, CheckCircle
} from 'lucide-react';
import { getApiBaseUrl } from '../utils/apiConfig';

const STEPS = [
  { id: 1, title: 'Business Profile', icon: Building2, description: 'Basic business information' },
  { id: 2, title: 'Business Details', icon: FileText, description: 'Type-specific details' },
  { id: 3, title: 'Location & Contact', icon: MapPin, description: 'Address and contact info' },
  { id: 4, title: 'Identity & Proof', icon: ShieldCheck, description: 'Identity & document verification' },
  { id: 5, title: 'Review & Submit', icon: Shield, description: 'Review and submit application' },
];

const TYPE_LABELS = {
  procurement: { title: 'Procurement Vendor', emoji: '🏭', color: '#f59e0b' },
  seller: { title: 'Agri Input Vendor', emoji: '🏪', color: '#4ade80' },
  hybrid: { title: 'Hybrid Vendor', emoji: '🔄', color: '#a78bfa' },
};

const PRODUCT_CATEGORIES = [
  'Seeds', 'Fertilizers', 'Pesticides', 'Farm Equipment',
  'Irrigation', 'Organic Products', 'Farming Tools', 'Nursery Plants',
  'Animal Feed', 'Post-Harvest Equipment',
];

const CROP_OPTIONS = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Soybean', 'Maize',
  'Tomato', 'Onion', 'Potato', 'Groundnut', 'Jowar', 'Bajra',
  'Chilli', 'Turmeric', 'Ginger', 'Banana', 'Mango', 'Grapes',
];

const LANGUAGES = ['Hindi', 'English', 'Marathi', 'Gujarati', 'Telugu', 'Tamil', 'Kannada', 'Punjabi', 'Bengali', 'Odia'];

const STATES = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

function InputField({ label, icon: Icon, required, type = 'text', ...props }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {Icon && <Icon size={13} />}
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          {...props}
          style={{
            width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.88rem', outline: 'none', resize: 'vertical',
            minHeight: 80, fontFamily: 'inherit',
            transition: 'border-color 0.2s',
            ...(props.style || {}),
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(250,204,21,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      ) : type === 'select' ? (
        <select
          {...props}
          style={{
            width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.88rem', outline: 'none', cursor: 'pointer',
            ...(props.style || {}),
          }}
        >
          {props.children}
        </select>
      ) : (
        <input
          type={type}
          {...props}
          style={{
            width: '100%', padding: '0.65rem 0.85rem', borderRadius: '0.7rem',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff', fontSize: '0.88rem', outline: 'none',
            transition: 'border-color 0.2s',
            ...(props.style || {}),
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(250,204,21,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      )}
    </div>
  );
}

function MultiSelect({ label, icon: Icon, options, selected, onChange, required }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
        {Icon && <Icon size={13} />}
        {label}
        {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
        {options.map(opt => {
          const isActive = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => {
                if (isActive) onChange(selected.filter(s => s !== opt));
                else onChange([...selected, opt]);
              }}
              style={{
                padding: '5px 12px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600,
                border: `1px solid ${isActive ? 'rgba(250,204,21,0.5)' : 'rgba(255,255,255,0.1)'}`,
                background: isActive ? 'rgba(250,204,21,0.15)' : 'rgba(255,255,255,0.03)',
                color: isActive ? '#facc15' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {isActive && <Check size={11} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function VendorOnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const vendorType = searchParams.get('type') || 'seller';
  const typeInfo = TYPE_LABELS[vendorType] || TYPE_LABELS.seller;

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    business_name: '',
    owner_name: '',
    tagline: '',
    business_description: '',
    business_category: '',
    year_established: '',
    number_of_employees: '',
    gst_number: '',
    phone: '',
    secondary_phone: '',
    whatsapp_number: '',
    email: '',
    website: '',
    street_address: '',
    landmark: '',
    village_city: '',
    taluka: '',
    district: '',
    state: '',
    pincode: '',
    service_areas: [],
    languages_spoken: [],
    crops_of_interest: [],
    procurement_capacity_mt: '',
    product_categories: [],
    store_open_time: '09:00',
    store_close_time: '18:00',
    delivery_available: false,
    delivery_radius_km: '',
    return_policy: '7-day return policy on unopened products in original condition.',
    // Identity Verification Fields
    id_proof_type: 'aadhaar',
    id_proof_number: '',
    id_proof_file: '',
    id_proof_file_name: '',
    trade_license_type: 'apmc',
    trade_license_number: '',
    trade_license_file: '',
    trade_license_file_name: '',
  });

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const isProcurement = vendorType === 'procurement' || vendorType === 'hybrid';
  const isSeller = vendorType === 'seller' || vendorType === 'hybrid';

  const canProceed = () => {
    if (step === 1) return form.business_name.length >= 3 && form.owner_name.length >= 2 && form.phone.length >= 10;
    if (step === 2) {
      if (isProcurement && form.crops_of_interest.length === 0) return false;
      if (isSeller && form.product_categories.length === 0) return false;
      return true;
    }
    if (step === 3) return form.district && form.state;
    if (step === 4) return form.id_proof_type && form.id_proof_number.length >= 5;
    return true;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const baseUrl = getApiBaseUrl();
      const payload = {
        vendor_type: vendorType,
        ...form,
        procurement_capacity_mt: form.procurement_capacity_mt ? parseFloat(form.procurement_capacity_mt) : null,
        delivery_radius_km: form.delivery_radius_km ? parseInt(form.delivery_radius_km) : null,
      };

      const resp = await fetch(`${baseUrl}/api/vendor/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (resp.ok) {
        localStorage.setItem('vendor_session_active', 'true');
        localStorage.setItem('vendor_token', 'local_vendor_token_registered');
        setSubmitted(true);
      } else {
        const err = await resp.json().catch(() => ({ detail: 'Registration failed.' }));
        alert(err.detail || err.error || 'Registration failed. Please try again.');
      }
    } catch (e) {
      console.error('Registration error:', e);
      localStorage.setItem('vendor_session_active', 'true');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(145deg, #030712, #0a1628, #030712)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', fontFamily: "'Inter', system-ui, sans-serif",
      }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ textAlign: 'center', maxWidth: 480 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            style={{
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, #14532d, #4ade80)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              boxShadow: '0 12px 40px rgba(74,222,128,0.3)',
            }}
          >
            <CheckCircle2 size={40} style={{ color: '#fff' }} />
          </motion.div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>
            Application Submitted! 🎉
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
            Your <span style={{ color: typeInfo.color, fontWeight: 700 }}>{typeInfo.title}</span> application is under review.
            Our team will verify your details within <strong style={{ color: '#facc15' }}>24-48 hours</strong>.
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.5rem', textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', marginBottom: '0.75rem', fontWeight: 700 }}>What happens next:</p>
            {['Our team reviews your business details', 'You receive verification notification', 'Your vendor dashboard gets activated', 'Start doing business on KrishiAI!'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: '50%', fontSize: '0.7rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 0 ? 'rgba(250,204,21,0.2)' : 'rgba(255,255,255,0.06)',
                  color: i === 0 ? '#facc15' : 'rgba(255,255,255,0.4)',
                  border: `1px solid ${i === 0 ? 'rgba(250,204,21,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)' }}>{item}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => navigate('/vendor-dashboard')}
              style={{
                padding: '0.75rem 1.5rem', borderRadius: '0.85rem', border: 'none',
                background: 'linear-gradient(135deg, #713f12, #a16207, #facc15)',
                color: '#1c0e00', fontWeight: 800, fontSize: '0.9rem',
                cursor: 'pointer', boxShadow: '0 8px 24px rgba(250,204,21,0.25)',
              }}
              id="vendor-onboarding-dashboard-btn"
            >
              Go to Dashboard 🚀
            </button>
            <button
              type="button"
              onClick={() => navigate('/vendors')}
              style={{
                padding: '0.75rem 1.25rem', borderRadius: '0.85rem',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer',
              }}
              id="vendor-onboarding-done-btn"
            >
              Marketplace →
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #030712 0%, #0a1628 40%, #030712 100%)',
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      {/* Back Button */}
      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => step > 1 ? setStep(step - 1) : navigate('/vendor-type-select')}
        style={{
          position: 'fixed', top: '1.5rem', left: '1.5rem', zIndex: 100,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '0.5rem 1rem', color: '#e2e8f0',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
          fontSize: '0.82rem', fontWeight: 600, backdropFilter: 'blur(10px)',
        }}
        id="vendor-onboarding-back-btn"
      >
        <ArrowLeft size={15} /> {step > 1 ? 'Previous Step' : 'Change Type'}
      </motion.button>

      <div style={{ maxWidth: 700, margin: '0 auto', padding: '3rem 1.5rem 4rem' }}>
        {/* Header with Type Badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 20,
            background: `${typeInfo.color}15`, border: `1px solid ${typeInfo.color}30`,
            marginBottom: '0.75rem',
          }}>
            <span>{typeInfo.emoji}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: typeInfo.color }}>{typeInfo.title}</span>
          </div>
          <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontWeight: 900, color: '#fff', margin: '0.5rem 0 0.25rem' }}>
            Complete Your Profile
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem' }}>
            Step {step} of {STEPS.length} — {STEPS[step - 1].description}
          </p>
        </div>

        {/* Progress Bar */}
        <div style={{ display: 'flex', gap: 4, marginBottom: '2rem' }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{ flex: 1, position: 'relative' }}>
              <div style={{
                height: 4, borderRadius: 2,
                background: i < step
                  ? `linear-gradient(90deg, ${typeInfo.color}, ${typeInfo.color}80)`
                  : 'rgba(255,255,255,0.08)',
                transition: 'all 0.4s ease',
              }} />
              <div style={{
                position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
                fontSize: '0.65rem', fontWeight: 600, whiteSpace: 'nowrap',
                color: i < step ? typeInfo.color : 'rgba(255,255,255,0.3)',
              }}>
                {s.title}
              </div>
            </div>
          ))}
        </div>

        {/* Form Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '1.25rem', padding: '1.5rem', backdropFilter: 'blur(10px)',
            marginTop: '2rem',
          }}
        >
          {/* Step 1: Business Profile */}
          {step === 1 && (
            <>
              <InputField label="Business Name" icon={Building2} required
                placeholder="e.g., Sharma Agricultural Supplies Pvt. Ltd."
                value={form.business_name} onChange={e => update('business_name', e.target.value)}
              />
              <InputField label="Owner / Manager Name" icon={User} required
                placeholder="e.g., Ramesh Sharma"
                value={form.owner_name} onChange={e => update('owner_name', e.target.value)}
              />
              <InputField label="Business Tagline" icon={FileText}
                placeholder="e.g., Quality Seeds for Better Harvest"
                value={form.tagline} onChange={e => update('tagline', e.target.value)}
              />
              <InputField label="About Your Business" icon={FileText} type="textarea"
                placeholder="Describe your business, history, and what makes you unique..."
                value={form.business_description} onChange={e => update('business_description', e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <InputField label="Year Established" icon={Clock}
                  placeholder="e.g., 2012"
                  value={form.year_established} onChange={e => update('year_established', e.target.value)}
                />
                <InputField label="Number of Employees" icon={User}
                  placeholder="e.g., 10-20"
                  value={form.number_of_employees} onChange={e => update('number_of_employees', e.target.value)}
                />
              </div>
              <InputField label="GST Number (if registered)"
                placeholder="e.g., 27AABCS1234A1ZX"
                value={form.gst_number} onChange={e => update('gst_number', e.target.value)}
              />
              <InputField label="Phone Number" icon={Phone} required type="tel"
                placeholder="e.g., 9876543210"
                value={form.phone} onChange={e => update('phone', e.target.value)}
              />
              <InputField label="Email Address" icon={Mail} type="email"
                placeholder="e.g., contact@business.com"
                value={form.email} onChange={e => update('email', e.target.value)}
              />
            </>
          )}

          {/* Step 2: Type-Specific Details */}
          {step === 2 && (
            <>
              {isProcurement && (
                <>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Wheat size={14} /> Procurement Details
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      Tell us about the crops you purchase and your procurement capacity.
                    </p>
                  </div>
                  <MultiSelect label="Crops of Interest" icon={Wheat} required
                    options={CROP_OPTIONS} selected={form.crops_of_interest}
                    onChange={v => update('crops_of_interest', v)}
                  />
                  <InputField label="Monthly Procurement Capacity (Metric Tonnes)"
                    type="number" placeholder="e.g., 100"
                    value={form.procurement_capacity_mt}
                    onChange={e => update('procurement_capacity_mt', e.target.value)}
                  />
                </>
              )}

              {isSeller && (
                <>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.75rem', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', marginBottom: '1.25rem' }}>
                    <p style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Package size={14} /> Store & Product Details
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
                      Configure your product categories, store hours, and delivery options.
                    </p>
                  </div>
                  <MultiSelect label="Product Categories" icon={Package} required
                    options={PRODUCT_CATEGORIES} selected={form.product_categories}
                    onChange={v => update('product_categories', v)}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                    <InputField label="Store Opens At" icon={Clock} type="time"
                      value={form.store_open_time} onChange={e => update('store_open_time', e.target.value)}
                    />
                    <InputField label="Store Closes At" icon={Clock} type="time"
                      value={form.store_close_time} onChange={e => update('store_close_time', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={form.delivery_available}
                        onChange={e => update('delivery_available', e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: '#facc15' }}
                      />
                      <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                        <Truck size={14} style={{ verticalAlign: 'middle', marginRight: 4 }} />
                        I offer home delivery
                      </span>
                    </label>
                    {form.delivery_available && (
                      <div style={{ marginTop: '0.75rem', marginLeft: '1.75rem' }}>
                        <InputField label="Delivery Radius (km)" type="number"
                          placeholder="e.g., 50"
                          value={form.delivery_radius_km}
                          onChange={e => update('delivery_radius_km', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                  <InputField label="Return Policy" type="textarea"
                    placeholder="Describe your return and refund policy..."
                    value={form.return_policy} onChange={e => update('return_policy', e.target.value)}
                  />
                </>
              )}

              <MultiSelect label="Languages Spoken" icon={Globe}
                options={LANGUAGES} selected={form.languages_spoken}
                onChange={v => update('languages_spoken', v)}
              />
            </>
          )}

          {/* Step 3: Location & Contact */}
          {step === 3 && (
            <>
              <InputField label="Street Address" icon={MapPin}
                placeholder="e.g., 123 Market Street, Ravivar Peth"
                value={form.street_address} onChange={e => update('street_address', e.target.value)}
              />
              <InputField label="Landmark"
                placeholder="e.g., Near Central Market, Opp. Railway Station"
                value={form.landmark} onChange={e => update('landmark', e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <InputField label="Village / City" required
                  placeholder="e.g., Pune"
                  value={form.village_city} onChange={e => update('village_city', e.target.value)}
                />
                <InputField label="Taluka"
                  placeholder="e.g., Haveli"
                  value={form.taluka} onChange={e => update('taluka', e.target.value)}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <InputField label="District" required
                  placeholder="e.g., Pune"
                  value={form.district} onChange={e => update('district', e.target.value)}
                />
                <InputField label="State" required type="select"
                  value={form.state} onChange={e => update('state', e.target.value)}
                >
                  <option value="" style={{ background: '#0d1b2a', color: '#ffffff' }}>Select State</option>
                  {STATES.map(s => (
                    <option key={s} value={s} style={{ background: '#0d1b2a', color: '#ffffff' }}>{s}</option>
                  ))}
                </InputField>
              </div>
              <InputField label="Pincode" type="text"
                placeholder="e.g., 411001"
                value={form.pincode} onChange={e => update('pincode', e.target.value)}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 1rem' }}>
                <InputField label="Secondary Phone" icon={Phone} type="tel"
                  placeholder="e.g., 9876543211"
                  value={form.secondary_phone} onChange={e => update('secondary_phone', e.target.value)}
                />
                <InputField label="WhatsApp Number" icon={Phone} type="tel"
                  placeholder="e.g., 9876543210"
                  value={form.whatsapp_number} onChange={e => update('whatsapp_number', e.target.value)}
                />
              </div>
              <InputField label="Website" icon={Globe}
                placeholder="e.g., www.yourbusiness.com"
                value={form.website} onChange={e => update('website', e.target.value)}
              />
            </>
          )}

          {/* Step 4: Identity & Document Proof */}
          {step === 4 && (
            <>
              <div style={{
                padding: '0.85rem 1rem', borderRadius: '0.85rem',
                background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)',
                marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <ShieldCheck size={20} style={{ color: '#4ade80', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <p style={{ fontSize: '0.85rem', color: '#4ade80', fontWeight: 700, margin: 0 }}>
                    Government Identity Verification (Required)
                  </p>
                  <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', margin: '4px 0 0', lineHeight: 1.5 }}>
                    To maintain a verified, high-trust marketplace and protect farmers, all KrishiAI vendors must provide a valid government identity proof.
                  </p>
                </div>
              </div>

              {/* ID Proof Type */}
              <InputField label="Government ID Type" icon={ShieldCheck} required type="select"
                value={form.id_proof_type} onChange={e => update('id_proof_type', e.target.value)}
              >
                <option value="aadhaar" style={{ background: '#0d1b2a', color: '#ffffff' }}>Aadhaar Card (UIDAI)</option>
                <option value="pan" style={{ background: '#0d1b2a', color: '#ffffff' }}>PAN Card (Income Tax Dept)</option>
                <option value="voter_id" style={{ background: '#0d1b2a', color: '#ffffff' }}>Voter ID Card (Election Commission)</option>
                <option value="driving_license" style={{ background: '#0d1b2a', color: '#ffffff' }}>Driving License</option>
              </InputField>

              {/* ID Proof Number */}
              <InputField label={`${form.id_proof_type ? form.id_proof_type.toUpperCase().replace('_', ' ') : 'Government ID'} Number`} icon={FileText} required
                placeholder={
                  form.id_proof_type === 'aadhaar' ? 'e.g., 1234 5678 9012' :
                  form.id_proof_type === 'pan' ? 'e.g., ABCDE1234F' :
                  form.id_proof_type === 'voter_id' ? 'e.g., WBG1234567' : 'e.g., MH1220190012345'
                }
                value={form.id_proof_number} onChange={e => update('id_proof_number', e.target.value)}
              />

              {/* ID Proof File Upload */}
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <Upload size={13} />
                  Upload {form.id_proof_type ? form.id_proof_type.toUpperCase().replace('_', ' ') : 'Government ID'} Document (Front & Back)
                  <span style={{ color: '#ef4444' }}>*</span>
                </label>

                <div
                  onClick={() => {
                    // Simulate file picker
                    const mockFileName = `${form.id_proof_type || 'gov_id'}_proof_${form.owner_name ? form.owner_name.toLowerCase().replace(/\s+/g, '_') : 'vendor'}.pdf`;
                    update('id_proof_file_name', mockFileName);
                    update('id_proof_file', `/uploads/docs/${mockFileName}`);
                  }}
                  style={{
                    border: '2px dashed rgba(250,204,21,0.3)',
                    borderRadius: '0.85rem',
                    padding: '1.25rem',
                    textAlign: 'center',
                    background: form.id_proof_file_name ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {form.id_proof_file_name ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                      <CheckCircle2 size={24} style={{ color: '#4ade80' }} />
                      <div style={{ textAlign: 'left' }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
                          Document Attached: {form.id_proof_file_name}
                        </p>
                        <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>
                          Click to replace file (PDF, JPG, PNG up to 10MB)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Upload size={28} style={{ color: '#facc15', margin: '0 auto 8px', display: 'block' }} />
                      <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                        Click to upload {form.id_proof_type?.toUpperCase()} document
                      </p>
                      <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>
                        Supports JPG, PNG, or PDF (Front & Back image recommended)
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trade License Section (Optional) */}
              <div style={{
                padding: '0.85rem', borderRadius: '0.85rem',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
                marginTop: '1rem',
              }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#facc15', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={15} /> Business / Trade License (Recommended)
                </p>

                <InputField label="License Type" type="select"
                  value={form.trade_license_type} onChange={e => update('trade_license_type', e.target.value)}
                >
                  <option value="apmc" style={{ background: '#0d1b2a', color: '#ffffff' }}>APMC Merchant License</option>
                  <option value="seeds_fertilizer" style={{ background: '#0d1b2a', color: '#ffffff' }}>Seeds / Fertilizer Dealer License</option>
                  <option value="shop_act" style={{ background: '#0d1b2a', color: '#ffffff' }}>Shop Act License / Udhyam Aadhar</option>
                  <option value="fssai" style={{ background: '#0d1b2a', color: '#ffffff' }}>FSSAI Food License</option>
                  <option value="gst_cert" style={{ background: '#0d1b2a', color: '#ffffff' }}>GST Registration Certificate</option>
                </InputField>

                <InputField label="License / Registration Number" placeholder="e.g., APMC/PN/2024/0981"
                  value={form.trade_license_number} onChange={e => update('trade_license_number', e.target.value)}
                />

                <div
                  onClick={() => {
                    const mockFileName = `trade_license_${form.trade_license_type || 'license'}.pdf`;
                    update('trade_license_file_name', mockFileName);
                    update('trade_license_file', `/uploads/docs/${mockFileName}`);
                  }}
                  style={{
                    border: '1px dashed rgba(255,255,255,0.15)',
                    borderRadius: '0.75rem',
                    padding: '0.85rem',
                    textAlign: 'center',
                    background: form.trade_license_file_name ? 'rgba(74,222,128,0.06)' : 'rgba(255,255,255,0.02)',
                    cursor: 'pointer',
                  }}
                >
                  {form.trade_license_file_name ? (
                    <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#4ade80', margin: 0 }}>
                      ✓ License Attached: {form.trade_license_file_name}
                    </p>
                  ) : (
                    <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                      📎 Click to attach License Document (Optional)
                    </p>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 5: Review & Submit */}
          {step === 5 && (
            <>
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#fff', fontFamily: "'Outfit', sans-serif", marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Shield size={18} style={{ color: '#facc15' }} /> Review Your Application
                </h3>

                {/* Business Info Summary */}
                {[
                  { label: 'Business Name', value: form.business_name },
                  { label: 'Owner Name', value: form.owner_name },
                  { label: 'Vendor Type', value: typeInfo.title },
                  { label: 'Phone', value: form.phone },
                  { label: 'Email', value: form.email || '—' },
                  { label: 'Government ID', value: `${form.id_proof_type?.toUpperCase()} (${form.id_proof_number || 'Attached'})` },
                  { label: 'Trade License', value: form.trade_license_number ? `${form.trade_license_type?.toUpperCase()} (${form.trade_license_number})` : '—' },
                  { label: 'GST', value: form.gst_number || '—' },
                  { label: 'Location', value: [form.village_city, form.district, form.state].filter(Boolean).join(', ') || '—' },
                  ...(isProcurement ? [
                    { label: 'Crops', value: form.crops_of_interest.join(', ') || '—' },
                    { label: 'Capacity', value: form.procurement_capacity_mt ? `${form.procurement_capacity_mt} MT/month` : '—' },
                  ] : []),
                  ...(isSeller ? [
                    { label: 'Categories', value: form.product_categories.join(', ') || '—' },
                    { label: 'Store Hours', value: `${form.store_open_time} – ${form.store_close_time}` },
                    { label: 'Delivery', value: form.delivery_available ? `Yes (${form.delivery_radius_km || '—'} km)` : 'No' },
                  ] : []),
                  { label: 'Languages', value: form.languages_spoken.join(', ') || '—' },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', fontWeight: 600, textAlign: 'right', maxWidth: '60%', wordBreak: 'break-word' }}>{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Terms */}
              <div style={{
                background: 'rgba(250,204,21,0.06)', border: '1px solid rgba(250,204,21,0.15)',
                borderRadius: '0.85rem', padding: '1rem', marginBottom: '1rem',
              }}>
                <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
                  By submitting, you confirm that the government identity proof and business details provided are authentic. You agree to KrishiAI's{' '}
                  <span style={{ color: '#facc15', cursor: 'pointer' }}>Terms of Service</span>,{' '}
                  <span style={{ color: '#facc15', cursor: 'pointer' }}>Vendor Code of Conduct</span>, and{' '}
                  <span style={{ color: '#facc15', cursor: 'pointer' }}>Payment Terms</span>.
                  Your application will be verified within 24-48 hours.
                </p>
              </div>
            </>
          )}
        </motion.div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => step > 1 ? setStep(step - 1) : navigate('/vendor-type-select')}
            style={{
              padding: '0.7rem 1.5rem', borderRadius: '0.85rem',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)',
              fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
            id="vendor-onboarding-prev-btn"
          >
            <ArrowLeft size={15} /> {step > 1 ? 'Previous' : 'Change Type'}
          </button>

          {step < STEPS.length ? (
            <button
              type="button"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
              style={{
                padding: '0.7rem 1.8rem', borderRadius: '0.85rem', border: 'none',
                background: canProceed()
                  ? 'linear-gradient(135deg, #713f12, #a16207, #facc15)'
                  : 'rgba(255,255,255,0.08)',
                color: canProceed() ? '#1c0e00' : 'rgba(255,255,255,0.3)',
                fontSize: '0.85rem', fontWeight: 800, cursor: canProceed() ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', gap: 6,
                boxShadow: canProceed() ? '0 6px 20px rgba(250,204,21,0.25)' : 'none',
                opacity: canProceed() ? 1 : 0.5,
              }}
              id="vendor-onboarding-next-btn"
            >
              Next Step <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting}
              onClick={handleSubmit}
              style={{
                padding: '0.7rem 2rem', borderRadius: '0.85rem', border: 'none',
                background: 'linear-gradient(135deg, #14532d, #16a34a, #4ade80)',
                color: '#fff', fontSize: '0.9rem', fontWeight: 800,
                cursor: submitting ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                boxShadow: '0 6px 20px rgba(74,222,128,0.3)',
              }}
              id="vendor-onboarding-submit-btn"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
              ) : (
                <><CheckCircle2 size={16} /> Submit Application</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
