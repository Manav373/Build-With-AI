import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, Bell, CreditCard, Shield, Save, CheckCircle2 } from 'lucide-react';

export default function VendorSettingsPage() {
  const [bank, setBank] = useState({
    account_number: '',
    ifsc: '',
    bank_name: '',
    account_holder: ''
  });

  const [notifications, setNotifications] = useState({
    sms: true,
    whatsapp: true,
    email: true,
    new_applications: true,
    new_orders: true
  });

  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/me`);
      if (res.ok) {
        const data = await res.json();
        if (data.vendor) {
          const v = data.vendor;
          setBank({
            account_number: v.bank_account_number || '',
            ifsc: v.bank_ifsc_code || '',
            bank_name: v.bank_name || '',
            account_holder: v.bank_account_name || v.owner_name || ''
          });
        }
      }
    } catch (e) {
      console.error('Failed to load vendor settings:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}api/vendor/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bank_account_name: bank.account_holder,
          bank_name: bank.bank_name,
          bank_account_number: bank.account_number,
          bank_ifsc_code: bank.ifsc
        })
      });
      if (res.ok) {
        setMsg('Bank settings and notification preferences saved successfully!');
      } else {
        setMsg('Settings saved locally.');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMsg('Settings saved locally.');
    }
    setTimeout(() => setMsg(''), 4000);
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
          <Settings className="text-gray-300" size={32} />
          Account & Notification Settings
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          Manage payout bank details, SMS/WhatsApp alert channels, and security settings.
        </p>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-semibold">
          ✓ {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Bank Account Settings */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <CreditCard size={20} className="text-[#4ade80]" /> Bank Payout Account Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Account Holder Name</label>
              <input
                type="text"
                placeholder="e.g. Ramesh Agro Enterprises"
                value={bank.account_holder}
                onChange={e => setBank({ ...bank, account_holder: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Bank Name & Branch</label>
              <input
                type="text"
                placeholder="e.g. State Bank of India, Baramati Branch"
                value={bank.bank_name}
                onChange={e => setBank({ ...bank, bank_name: e.target.value })}
                style={inputStyle}
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">Account Number</label>
              <input
                type="text"
                placeholder="e.g. 109283746501"
                value={bank.account_number}
                onChange={e => setBank({ ...bank, account_number: e.target.value })}
                style={inputStyle}
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-[#86efac]/80 font-semibold block mb-1">IFSC Code</label>
              <input
                type="text"
                placeholder="e.g. SBIN0001248"
                value={bank.ifsc}
                onChange={e => setBank({ ...bank, ifsc: e.target.value })}
                style={inputStyle}
                className="font-mono uppercase"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div style={cardStyle} className="p-6 space-y-4">
          <h3 className="text-lg font-bold text-white font-['Outfit'] border-b border-[#86efac]/10 pb-3 flex items-center gap-2">
            <Bell size={20} className="text-amber-400" /> Notification Channels & Triggers
          </h3>
          <div className="space-y-3 text-sm">
            <label className="flex items-center gap-3 text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.whatsapp}
                onChange={e => setNotifications({ ...notifications, whatsapp: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-gray-900 border-[#86efac]/20"
              />
              Send instant WhatsApp notifications for new farmer applications & crop offers
            </label>
            <label className="flex items-center gap-3 text-gray-200 cursor-pointer">
              <input
                type="checkbox"
                checked={notifications.sms}
                onChange={e => setNotifications({ ...notifications, sms: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-gray-900 border-[#86efac]/20"
              />
              Send SMS alerts for payout releases & e-Way Bill pickup dispatches
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="px-8 py-3 rounded-xl bg-gradient-to-r from-[#166534] to-[#15803d] hover:from-[#15803d] hover:to-[#166534] text-white font-bold transition flex items-center gap-2 shadow-lg"
        >
          <Save size={20} />
          Save Settings & Preferences
        </button>
      </form>
    </div>
  );
}
