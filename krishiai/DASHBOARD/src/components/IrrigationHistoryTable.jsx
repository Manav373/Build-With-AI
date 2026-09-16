import React, { useState } from 'react';
import { History, Download, Filter, Search, Info, CheckCircle2, AlertOctagon, CloudRain } from 'lucide-react';

export default function IrrigationHistoryTable({ history = [] }) {
  const [filterMode, setFilterMode] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = history.filter((item) => {
    const matchesMode = filterMode === 'ALL' || item.mode?.toUpperCase() === filterMode;
    const matchesSearch = !searchQuery || 
      item.reason?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesSearch;
  });

  const exportCSV = () => {
    const headers = ['ID', 'Date', 'Start Time', 'End Time', 'Duration', 'Mode', 'Reason', 'Operator/Engine', 'Status'];
    const rows = filteredHistory.map((h) => [
      h.id,
      h.date,
      h.startTime,
      h.endTime,
      h.duration,
      h.mode,
      `"${h.reason || ''}"`,
      `"${h.user || ''}"`,
      h.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KrishiAI_Irrigation_Log_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card" id="irrigation-history-section">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <History size={20} color="var(--sky-400)" />
            Irrigation Session Audit & History Log
          </h3>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            Conforming to PRD Section 20 • Complete execution trail & decision accountability
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Search Box */}
          <div style={{ position: 'relative' }}>
            <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '0.45rem 0.85rem 0.45rem 2rem',
                background: 'rgba(0,0,0,0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: '0.8rem',
                width: '180px'
              }}
            />
          </div>

          {/* Mode Filter */}
          <select 
            value={filterMode} 
            onChange={(e) => setFilterMode(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem'
            }}
          >
            <option value="ALL">All Modes</option>
            <option value="AUTO">Auto Mode Only</option>
            <option value="MANUAL">Manual Mode Only</option>
          </select>

          {/* Export CSV Button */}
          <button 
            id="btn-export-csv"
            className="btn-secondary" 
            onClick={exportCSV}
            title="Download CSV report"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Hardware Note Alert (PRD Section 20 / 37) */}
      <div style={{ 
        background: 'rgba(16, 185, 129, 0.08)', 
        border: '1px solid rgba(16, 185, 129, 0.25)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '0.65rem 0.85rem',
        fontSize: '0.78rem',
        color: '#6ee7b7',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <Info size={16} color="var(--emerald-400)" style={{ flexShrink: 0 }} />
        <span>
          <strong>Hardware Specification Note:</strong> Without a flow meter sensor installed on ESP32 GPIO, exact water volume (litres) is strictly omitted. Durations reflect precise electrical relay runtime.
        </span>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Start</th>
              <th>End</th>
              <th>Duration</th>
              <th>Mode</th>
              <th>Reason</th>
              <th>Triggered By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No irrigation sessions match current filters.
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.date}</td>
                  <td className="font-mono">{item.startTime}</td>
                  <td className="font-mono">{item.endTime}</td>
                  <td style={{ color: 'var(--sky-400)', fontWeight: 700 }}>
                    {item.duration}
                  </td>
                  <td>
                    <span 
                      className="status-badge" 
                      style={{ 
                        padding: '0.2rem 0.55rem', 
                        fontSize: '0.7rem',
                        background: item.mode?.toLowerCase() === 'auto' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: item.mode?.toLowerCase() === 'auto' ? '#34d399' : '#fbbf24'
                      }}
                    >
                      {item.mode}
                    </span>
                  </td>
                  <td style={{ maxWidth: '240px', color: 'var(--text-secondary)' }}>
                    {item.reason}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {item.user}
                  </td>
                  <td>
                    {item.status === 'Completed' ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--emerald-400)', fontSize: '0.8rem' }}>
                        <CheckCircle2 size={13} /> Completed
                      </span>
                    ) : item.status?.includes('Rain') ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#60a5fa', fontSize: '0.8rem' }}>
                        <CloudRain size={13} /> Paused (Rain)
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--rose-400)', fontSize: '0.8rem' }}>
                        <AlertOctagon size={13} /> {item.status}
                      </span>
                    )}
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
