import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, Download, Search, Lock } from 'lucide-react';
import { adminApi } from '@krishiai/api';
import { Button, Loader } from '@krishiai/ui';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs();
      const list = res.data?.data?.logs || res.data?.logs || res.data || [];
      setLogs(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('[AdminAuditLogsPage] Error fetching audit logs:', err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Security & Operation Audit Trail</h1>
          <p className="text-sm text-emerald-200/60">
            Immutable log of administrative authorizations, escrow movements, and moderation actions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => alert('Audit logs exported as CSV.')}
            className="border-emerald-500/25 bg-[#0a1a0d] text-emerald-300 hover:bg-[#0f2814]"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-12">
          <Loader text="Loading audit records..." />
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-500/15 bg-[#0a1a0d]/80 overflow-hidden font-mono text-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-emerald-100/90">
              <thead className="bg-[#061409]/90 text-emerald-300/70 border-b border-emerald-500/15 font-sans uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Event ID</th>
                  <th className="py-3.5 px-4 font-semibold">Action</th>
                  <th className="py-3.5 px-4 font-semibold">Operator / Actor</th>
                  <th className="py-3.5 px-4 font-semibold">Target Entity</th>
                  <th className="py-3.5 px-4 font-semibold">Source IP</th>
                  <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-500/10">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-emerald-200/50 font-sans text-xs">
                      No security audit records logged yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#07190c]/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-emerald-400">{log.id}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-[#061409] text-emerald-200 border border-emerald-500/20 font-sans font-semibold text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-emerald-100/80">{log.actor}</td>
                    <td className="py-3 px-4 text-white font-medium font-sans">{log.target}</td>
                    <td className="py-3 px-4 text-emerald-200/60">{log.ip}</td>
                    <td className="py-3 px-4 text-emerald-200/60">{log.timestamp}</td>
                  </tr>
                )))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
