import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Plus, Check, ExternalLink, Calendar, Users } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Modal, Input, Loader } from '@krishiai/ui';

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newScheme, setNewScheme] = useState({
    name: '',
    department: '',
    subsidyPercent: '50',
    targetCrops: 'All / Horticulture',
    link: '',
  });

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSchemes();
      const list = res.data?.data?.schemes || res.data?.schemes || res.data || [];
      setSchemes(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminSchemesPage] Error fetching schemes:', err);
      setSchemes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleAddScheme = async (e) => {
    e.preventDefault();
    try {
      await adminApi.createScheme(newScheme);
      setSchemes([...schemes, { ...newScheme, id: `SCH-${Date.now()}`, status: 'Active' }]);
    } catch {
      setSchemes([...schemes, { ...newScheme, id: `SCH-${Date.now()}`, status: 'Active' }]);
    } finally {
      setAddModalOpen(false);
      setNewScheme({ name: '', department: '', subsidyPercent: '50', targetCrops: 'All', link: '' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Government Schemes & Subsidies</h1>
          <p className="text-sm text-emerald-200/60">
            Maintain schemes dataset broadcasted to farmers for financial aid and input subsidies.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setAddModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white self-start"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Publish New Scheme
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading agricultural schemes..." />
        </div>
      ) : schemes.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#0a1a0d]/60 border border-emerald-500/15">
          <FileSpreadsheet className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No Schemes Configured</h3>
          <p className="text-xs text-emerald-200/60 mt-1">Publish new subsidy programs to make them active across the ecosystem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {schemes.map((s) => (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-[#0a1a0d]/80 border border-emerald-500/15 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[11px] font-semibold">
                    {s.status}
                  </span>
                  <span className="text-xs font-mono text-emerald-400/60">{s.id}</span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white">{s.name}</h3>
                  <p className="text-xs text-emerald-200/60 mt-1">{s.department}</p>
                </div>

                <div className="p-3 rounded-xl bg-[#061409] border border-emerald-500/15 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-emerald-200/60">Benefit:</span>
                    <span className="text-emerald-300 font-semibold">{s.subsidyPercent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200/60">Eligible:</span>
                    <span className="text-emerald-100/90">{s.beneficiaries || 'All Farmers'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-emerald-200/60">Valid Till:</span>
                    <span className="text-emerald-100/90">{s.deadline || 'Ongoing'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Scheme Modal */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Publish Government Scheme">
        <form onSubmit={handleAddScheme} className="space-y-4">
          <Input
            label="Scheme Title"
            required
            value={newScheme.name}
            onChange={(e) => setNewScheme({ ...newScheme, name: e.target.value })}
            placeholder="e.g. Sub-Mission on Agricultural Mechanization (SMAM)"
          />
          <Input
            label="Nodal Department"
            required
            value={newScheme.department}
            onChange={(e) => setNewScheme({ ...newScheme, department: e.target.value })}
            placeholder="e.g. Directorate of Agricultural Engineering"
          />
          <Input
            label="Subsidy / Grant Details"
            required
            value={newScheme.subsidyPercent}
            onChange={(e) => setNewScheme({ ...newScheme, subsidyPercent: e.target.value })}
            placeholder="e.g. 40% - 50% subsidy on tractor purchase"
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="ghost" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Publish Scheme
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
