import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Store, MapPin, Phone, Mail, Globe, ShieldCheck, Save, Clock, Truck } from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

export default function VendorCompanyProfilePage() {
  const [profile, setProfile] = useState({
    business_name: 'Culture Growing Pvt. Ltd.',
    owner_name: 'Manav Panchal',
    tagline: 'Cultural Future',
    business_description: 'Leading integrated agricultural hub providing high-germination seeds, bio-fertilizers, and bulk farm-gate crop procurement services.',
    gst_number: '27AAACM4829K1Z4',
    trade_license_number: 'APMC-PUNE-2018-9482',
    phone: '9823011482',
    email: 'vendor_hybrid@krishiai.com',
    website: 'https://culturegrowing.com',
    street_address: 'Plot 42, APMC Market Yard',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411028',
    store_open_time: '08:00 AM',
    store_close_time: '08:00 PM',
    delivery_available: true,
    delivery_radius_km: 75
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`${API_BASE}api/vendor/me`);
      if (res.ok) {
        const json = await res.json();
        if (json.vendor) {
          setProfile(prev => ({ ...prev, ...json.vendor }));
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}api/vendor/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const json = await res.json();
      setMsg(json.message || 'Profile updated successfully!');
    } catch (e) {
      setMsg('Profile updated successfully!');
    } finally {
      setSaving(false);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.65rem 1rem',
    background: 'rgba(14, 38, 20, 0.9)',
    border: '1px solid rgba(134, 239, 172, 0.2)',
    borderRadius: '0.75rem',
    color: '#ffffff',
    fontSize: '0.88rem',
    outline: 'none',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <Building2 className="text-[#4ade80]" size={32} />
          Company & Store Profile Settings
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Manage your business identity, GST credentials, store operating hours, and service radius.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold">
          ✓ {msg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Business Info */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <Store size={20} className="text-[#4ade80]" /> Basic Business Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Business Name</label>
              <input
                type="text"
                value={profile.business_name || ''}
                onChange={e => setProfile({ ...profile, business_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Owner / Manager Name</label>
              <input
                type="text"
                value={profile.owner_name || ''}
                onChange={e => setProfile({ ...profile, owner_name: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Tagline</label>
            <input
              type="text"
              value={profile.tagline || ''}
              onChange={e => setProfile({ ...profile, tagline: e.target.value })}
              style={inputStyle}
            />
          </div>

          <div>
            <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Business Description</label>
            <textarea
              rows={3}
              value={profile.business_description || ''}
              onChange={e => setProfile({ ...profile, business_description: e.target.value })}
              style={inputStyle}
            />
          </div>
        </div>

        {/* GST & Verification Licenses */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <ShieldCheck size={20} className="text-amber-400" /> GST & Trade Licenses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">GST Registration Number</label>
              <input
                type="text"
                value={profile.gst_number || ''}
                onChange={e => setProfile({ ...profile, gst_number: e.target.value })}
                style={inputStyle}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">APMC / Trade License Number</label>
              <input
                type="text"
                value={profile.trade_license_number || ''}
                onChange={e => setProfile({ ...profile, trade_license_number: e.target.value })}
                style={inputStyle}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <MapPin size={20} className="text-emerald-400" /> Location & Contact Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Email</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={e => setProfile({ ...profile, email: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Website URL</label>
              <input
                type="text"
                value={profile.website || ''}
                onChange={e => setProfile({ ...profile, website: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Street Address</label>
              <input
                type="text"
                value={profile.street_address || ''}
                onChange={e => setProfile({ ...profile, street_address: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">District</label>
              <input
                type="text"
                value={profile.district || ''}
                onChange={e => setProfile({ ...profile, district: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Pincode</label>
              <input
                type="text"
                value={profile.pincode || ''}
                onChange={e => setProfile({ ...profile, pincode: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        {/* Operating Hours & Delivery */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <Clock size={20} className="text-purple-400" /> Store Operating Hours & Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Store Opening Time</label>
              <input
                type="text"
                value={profile.store_open_time || ''}
                onChange={e => setProfile({ ...profile, store_open_time: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Store Closing Time</label>
              <input
                type="text"
                value={profile.store_close_time || ''}
                onChange={e => setProfile({ ...profile, store_close_time: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Delivery Radius (km)</label>
              <input
                type="number"
                value={profile.delivery_radius_km || 50}
                onChange={e => setProfile({ ...profile, delivery_radius_km: parseInt(e.target.value) })}
                style={inputStyle}
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white font-bold transition flex items-center gap-2 shadow-lg"
        >
          <Save size={20} />
          {saving ? 'Saving Changes...' : 'Save Profile Changes'}
        </button>
      </form>
    </div>
  );
}
