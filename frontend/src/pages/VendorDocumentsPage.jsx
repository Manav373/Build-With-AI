import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ShieldCheck, Upload, CheckCircle2, Clock } from 'lucide-react';

export default function VendorDocumentsPage() {
  const documents = [
    { title: 'GST Registration Certificate', number: '27AAACM4829K1Z4', status: 'verified', updated: '2026-01-15' },
    { title: 'APMC Market Mandi License', number: 'APMC-PUNE-2018-9482', status: 'verified', updated: '2026-02-10' },
    { title: 'FSSAI Food & Agriculture Permit', number: '11521034000982', status: 'verified', updated: '2026-03-01' },
    { title: 'Aadhaar / Owner ID Verification', number: 'XXXX-XXXX-9482', status: 'verified', updated: '2026-01-10' }
  ];

  const cardStyle = {
    background: 'rgba(8, 24, 12, 0.85)',
    border: '1px solid rgba(134, 239, 172, 0.15)',
    borderRadius: '1.25rem',
    boxShadow: '0 12px 36px rgba(0,0,0,0.5)',
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white font-['Outfit'] flex items-center gap-3">
          <FileText className="text-[#4ade80]" size={32} />
          Compliance & Document Vault
        </h1>
        <p className="text-[#86efac]/70 mt-1 text-sm">
          View verified business licenses, trade permits, and tax compliance certificates.
        </p>
      </div>

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
              <span className="px-3 py-1 text-xs rounded-full bg-emerald-500/20 text-[#4ade80] font-bold flex items-center gap-1 border border-emerald-500/30">
                <CheckCircle2 size={12} /> Verified
              </span>
            </div>

            <div className="flex justify-between items-center text-xs border-t border-[#86efac]/10 pt-3">
              <span className="text-[#86efac]/50">Last updated: {doc.updated}</span>
              <button className="text-[#4ade80] hover:text-[#86efac] font-bold flex items-center gap-1">
                <Upload size={14} /> Update Document
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
