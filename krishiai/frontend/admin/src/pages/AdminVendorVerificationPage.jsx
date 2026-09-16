import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, X, FileText, Building2, MapPin, AlertCircle, Eye } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Modal, Loader } from '@krishiai/ui';

export default function AdminVendorVerificationPage() {
  const [pendingVendors, setPendingVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingVendors();
      const list = res.data?.data?.vendors || res.data?.vendors || res.data || [];
      setPendingVendors(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminVendorVerification] Error fetching pending vendors:', err);
      setPendingVendors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleAction = async (action) => {
    if (!selectedVendor) return;
    setSubmitting(true);
    try {
      await adminApi.verifyVendor(selectedVendor.id, action, 'Verified by SuperAdmin', rejectionReason);
      setPendingVendors((prev) => prev.filter((v) => v.id !== selectedVendor.id));
    } catch {
      setPendingVendors((prev) => prev.filter((v) => v.id !== selectedVendor.id));
    } finally {
      setSubmitting(false);
      setModalOpen(false);
      setRejectionReason('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Vendor KYC & Compliance</h1>
          <p className="text-sm text-emerald-200/60">
            Verify statutory licenses, GSTIN, and identity before granting vendor portal permissions.
          </p>
        </div>
        <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold self-start">
          {pendingVendors.length} Pending Review
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading vendor KYC applications..." />
        </div>
      ) : pendingVendors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0a1a0d]/60 border border-emerald-500/15">
          <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">All Clear!</h3>
          <p className="text-xs text-emerald-200/60 mt-1">No pending vendor verification requests at this time.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingVendors.map((vendor) => (
            <div
              key={vendor.id}
              className="p-5 rounded-2xl bg-[#0a1a0d]/80 border border-emerald-500/15 hover:border-emerald-500/30 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{vendor.name}</h3>
                    <p className="text-xs text-emerald-200/60">
                      Proprietor: <span className="text-emerald-100 font-medium">{vendor.owner}</span> • {vendor.type}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-emerald-100/90 pt-1">
                  <div>
                    <span className="text-emerald-200/60 block text-[11px]">GSTIN</span>
                    <span className="font-mono text-emerald-400 font-semibold">{vendor.gstNumber}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200/60 block text-[11px]">Seed License</span>
                    <span className="font-mono">{vendor.seedLicense}</span>
                  </div>
                  <div>
                    <span className="text-emerald-200/60 block text-[11px]">Location</span>
                    <span>{vendor.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end lg:self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    setModalOpen(true);
                  }}
                  className="border-emerald-500/25 bg-[#061409] hover:bg-[#0f2814] text-emerald-200"
                >
                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                  Inspect Documents
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedVendor(vendor);
                    handleAction('approve');
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Check className="w-3.5 h-3.5 mr-1.5" />
                  Quick Approve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* KYC Inspection Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`KYC Inspection: ${selectedVendor?.name}`}
      >
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#061409] border border-emerald-500/20 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-emerald-200/60">Firm Name:</span>
              <span className="text-white font-semibold">{selectedVendor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70">Owner / Representative:</span>
              <span className="text-emerald-100">{selectedVendor?.owner}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70">GST Registration:</span>
              <span className="font-mono text-emerald-400">{selectedVendor?.gstNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-emerald-300/70">Fungicide/Seed License:</span>
              <span className="font-mono text-emerald-100">{selectedVendor?.seedLicense}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase text-emerald-300/80 mb-2">Attached Documents</h4>
            <div className="space-y-2">
              {selectedVendor?.documents?.map((doc, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#061409] border border-emerald-500/20 text-xs"
                >
                  <div className="flex items-center gap-2 text-emerald-100">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    {doc.title}
                  </div>
                  <span className="text-emerald-400 hover:underline cursor-pointer">Preview PDF</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-emerald-300/80 mb-1.5">
              Rejection Reason (If declining)
            </label>
            <input
              type="text"
              placeholder="e.g. Expired fertilizer license, blur GST document..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 rounded-xl bg-[#061409] border border-emerald-500/20 text-xs text-white placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-emerald-500/15">
            <Button
              variant="danger"
              size="sm"
              disabled={submitting}
              onClick={() => handleAction('reject')}
            >
              Reject Application
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={submitting}
              onClick={() => handleAction('approve')}
            >
              Verify & Activate Vendor
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
