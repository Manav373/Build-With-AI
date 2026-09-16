import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function VendorDocumentsPage() {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  const rawApi = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
  const API_BASE = (rawApi.startsWith('http') ? rawApi : `https://${rawApi}`).replace(/\/+$/, '') + '/';

  useEffect(() => {
    fetchVendorProfile();
  }, []);

  const fetchVendorProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}api/vendor/me`);
      if (res.ok) {
        const json = await res.json();
        setVendor(json.vendor || null);
      }
    } catch (e) {
      console.error('Failed to fetch vendor documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  // Construct real document items from vendor database fields
  const documents = [];
  if (vendor?.gst_number) {
    documents.push({
      title: 'GST Registration Certificate',
      number: vendor.gst_number,
      status: vendor.is_verified ? 'verified' : 'under_review',
      type: 'Tax & Compliance',
      file: vendor.gst_cert_file || null
    });
  }
  if (vendor?.trade_license_number || vendor?.trade_license_type) {
    documents.push({
      title: `${(vendor.trade_license_type || 'Trade Mandi').replace(/_/g, ' ').toUpperCase()} License`,
      number: vendor.trade_license_number || 'Registered',
      status: vendor.is_verified ? 'verified' : 'under_review',
      type: 'Commercial Trade Permit',
      file: vendor.trade_license_file || null
    });
  }
  if (vendor?.id_proof_number || vendor?.id_proof_type) {
    documents.push({
      title: `${(vendor.id_proof_type || 'Government ID').toUpperCase()} Identity Proof`,
      number: vendor.id_proof_number || 'Attached in Vault',
      status: vendor.is_verified ? 'verified' : 'under_review',
      type: 'Owner Identification',
      file: vendor.id_proof_file || null
    });
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <FileText className="text-[#4ade80]" size={32} />
          Compliance & Document Vault
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          View verified business licenses, trade permits, and tax compliance certificates linked to your vendor account.
        </p>
      </div>

      {documents.length === 0 ? (
        <div style={cardStyle} className="p-12 text-center space-y-3">
          <FileText size={40} className="mx-auto text-[#86efac]/30" />
          <h3 className="text-lg font-bold text-white font-['Outfit']">No Documents Uploaded Yet</h3>
          <p className="text-xs text-[#86efac]/60 max-w-sm mx-auto">
            You have not uploaded any trade licenses or GST certificates yet. Update your business profile or onboarding form to attach verified compliance files.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {documents.map((doc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              style={cardStyle}
              className="p-6 space-y-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">{doc.title}</h3>
                  <p className="text-xs text-[#86efac]/70 font-mono mt-1">Ref: {doc.number}</p>
                </div>
                <span className={`px-3 py-1 text-xs rounded-full font-bold flex items-center gap-1 border ${
                  doc.status === 'verified'
                    ? 'bg-emerald-500/20 text-[#4ade80] border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {doc.status === 'verified' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {doc.status === 'verified' ? 'Verified' : 'Under Review'}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs border-t border-[#86efac]/10 pt-3">
                <span className="text-[#86efac]/50">Category: {doc.type}</span>
                <span className="text-xs font-mono text-[#86efac]/80">Status: Active</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
