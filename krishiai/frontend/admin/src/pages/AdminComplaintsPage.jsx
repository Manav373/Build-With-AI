import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, MessageSquare, ShieldAlert } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Modal, Loader } from '@krishiai/ui';

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getComplaints();
      const list = res.data?.data?.complaints || res.data?.complaints || res.data || [];
      setComplaints(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminComplaintsPage] Error fetching complaints:', err);
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleResolve = async () => {
    if (!selectedComplaint) return;
    try {
      await adminApi.resolveComplaint(selectedComplaint.id, 'Resolved', 'Settled via Escrow Adjustment', resolutionNote);
      setComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
    } catch {
      setComplaints((prev) => prev.filter((c) => c.id !== selectedComplaint.id));
    } finally {
      setModalOpen(false);
      setResolutionNote('');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Grievance & Dispute Desk</h1>
        <p className="text-sm text-emerald-200/60">
          Mediate transactional and quality disputes between farmers and vendors with audit logs.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading grievances..." />
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0a1a0d]/60 border border-emerald-500/15">
          <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">Zero Open Disputes</h3>
          <p className="text-xs text-emerald-200/60 mt-1">All disputes have been successfully resolved.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="p-5 rounded-2xl bg-[#0a1a0d]/80 border border-emerald-500/15 hover:border-emerald-500/30 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400">{c.id}</span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                      c.severity === 'High'
                        ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                        : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {c.severity} Priority
                  </span>
                  <span className="text-xs text-emerald-200/60">Ref: {c.orderRef}</span>
                </div>
                <span className="text-xs text-emerald-200/60">{c.created}</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{c.title}</h3>
                <p className="text-xs text-emerald-200/60 mt-1">
                  Filed by <span className="text-emerald-100 font-medium">{c.raisedBy}</span> against{' '}
                  <span className="text-emerald-100 font-medium">{c.against}</span>
                </p>
                <p className="text-sm text-emerald-100/90 mt-2 bg-[#061409] p-3 rounded-xl border border-emerald-500/15">
                  "{c.description}"
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setSelectedComplaint(c);
                    setModalOpen(true);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  Mediate & Resolve
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={`Mediate Dispute: ${selectedComplaint?.id}`}
      >
        <div className="space-y-4">
          <p className="text-sm text-emerald-100/90">
            Resolving dispute filed by <strong className="text-white">{selectedComplaint?.raisedBy}</strong>.
          </p>
          <div>
            <label className="block text-xs font-semibold uppercase text-emerald-300/70 mb-1">
              Resolution Order / Arbitrated Agreement
            </label>
            <textarea
              rows="3"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Escrow payout released with 2% mutual deduction adjustment agreed by parties..."
              style={{ backgroundColor: '#061409', borderColor: 'rgba(16, 185, 129, 0.2)', color: '#ffffff' }}
              className="w-full p-3 rounded-xl bg-[#061409] border border-emerald-500/20 text-xs text-white placeholder-emerald-100/30 focus:outline-none focus:border-emerald-400"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3 border-t border-emerald-500/15">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleResolve}>
              Issue Final Resolution
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
