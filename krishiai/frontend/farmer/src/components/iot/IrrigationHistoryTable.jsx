import React from 'react';
import { History, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function IrrigationHistoryTable({ history = [] }) {
  const exportCsv = () => {
    const headers = 'ID,Start Time,Duration (Mins),Mode,Triggered By,Start Moisture,End Moisture,Status\n';
    const rows = history.map(h => 
      `${h.id},${h.startTime},${h.durationMinutes},${h.mode},"${h.triggeredBy}",${h.startMoisture}%,${h.endMoisture || 'N/A'}%,${h.status}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `krishiai_irrigation_audit_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Irrigation Session Audit Trail</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Timestamped records of automated and manual watering sessions</p>
          </div>
        </div>

        <button
          onClick={exportCsv}
          className="py-1.5 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
        >
          <Download size={13} /> Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 dark:text-slate-400 font-mono uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Session</th>
              <th className="py-2.5 px-3">Start Time</th>
              <th className="py-2.5 px-3">Duration</th>
              <th className="py-2.5 px-3">Mode</th>
              <th className="py-2.5 px-3">Trigger Reason</th>
              <th className="py-2.5 px-3">Moisture Shift</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {history.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-6 text-center text-slate-400">
                  No irrigation sessions recorded yet today.
                </td>
              </tr>
            ) : (
              history.map((h) => (
                <tr key={h.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-500 dark:text-slate-400">{h.id}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">{h.startTime}</td>
                  <td className="py-2.5 px-3 font-mono">{h.durationMinutes} mins</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      h.mode === 'AUTO' 
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {h.mode}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 max-w-xs truncate">{h.triggeredBy}</td>
                  <td className="py-2.5 px-3 font-mono">
                    {h.startMoisture}% → {h.endMoisture || '...'}%
                  </td>
                  <td className="py-2.5 px-3">
                    <span className={`flex items-center gap-1 font-semibold ${
                      h.status === 'COMPLETED' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400 animate-pulse'
                    }`}>
                      {h.status === 'COMPLETED' ? <CheckCircle2 size={13} /> : <Clock size={13} />}
                      {h.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
