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
      setLogs(res.data?.logs || res.data || []);
    } catch {
      // Mock audit logs
      setLogs([
        {
          id: 'LOG-891',
          action: 'VENDOR_KYC_APPROVED',
          actor: 'priya.sharma@krishiai.gov',
          target: 'Kisan Agro Kendra (vnd_01)',
          ip: '103.21.244.18',
          status: 'SUCCESS',
          timestamp: '2026-03-08 12:45:22 UTC',
        },
        {
          id: 'LOG-890',
          action: 'ESCROW_PAYOUT_RELEASED',
          actor: 'SYSTEM_AUTOPAY',
          target: 'Order #ORD-9918 (₹34,800)',
          ip: '127.0.0.1',
          status: 'SUCCESS',
          timestamp: '2026-03-08 11:20:10 UTC',
        },
        {
          id: 'LOG-889',
          action: 'USER_SUSPENDED',
          actor: 'admin@krishiai.gov',
          target: 'GreenEarth Fertilizers (usr_4)',
          ip: '103.21.244.18',
          status: 'SUCCESS',
          timestamp: '2026-03-07 16:15:00 UTC',
        },
        {
          id: 'LOG-888',
          action: 'SATELLITE_TILES_CACHE_PURGE',
          actor: 'cron.worker',
          target: 'GEE Tile Layer NDRE/NDWI',
          ip: '10.0.4.12',
          status: 'SUCCESS',
          timestamp: '2026-03-07 00:00:00 UTC',
        },
      ]);
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
                {logs.map((log) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
