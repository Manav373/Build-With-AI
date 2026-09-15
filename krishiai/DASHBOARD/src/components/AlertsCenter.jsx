import React, { useState } from 'react';
import { Bell, AlertTriangle, AlertOctagon, Info, Check, Trash2, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

export default function AlertsCenter({ alerts = [], onAcknowledge, onClearAll, deviceId = 'krishiai-node-01' }) {
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const filteredAlerts = alerts.filter(a => severityFilter === 'ALL' || a.severity === severityFilter);

  const getAlertIcon = (severity) => {
    if (severity === 'critical') return <AlertOctagon size={18} color="#f43f5e" />;
    if (severity === 'warning') return <AlertTriangle size={18} color="#f59e0b" />;
    return <Info size={18} color="#38bdf8" />;
  };

  return (
    <div className="glass-card" id="alerts-management-panel">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={22} color="var(--amber-400)" />
            Real-Time Farm Alerts & Incident Management
          </h2>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
            PRD Section 17 Notification System • Critical Dry Soil, Rain Interruptions & Device Watchdog
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Sound Toggle */}
          <button 
            id="btn-toggle-sound"
            className="btn-secondary" 
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle audio tone on critical alert"
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
          >
            {soundEnabled ? <Volume2 size={15} color="var(--emerald-400)" /> : <VolumeX size={15} color="var(--text-muted)" />}
            <span>{soundEnabled ? 'Alert Tone: ON' : 'Muted'}</span>
          </button>

          {/* Severity Filter */}
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            style={{
              padding: '0.45rem 0.85rem',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-primary)',
              fontSize: '0.8rem'
            }}
          >
            <option value="ALL">All Severities</option>
            <option value="critical">Critical Only (🔴)</option>
            <option value="warning">Warning Only (⚠️)</option>
            <option value="info">Info Only (ℹ️)</option>
          </select>

          {/* Clear All */}
          <button 
            id="btn-clear-alerts"
            className="btn-secondary" 
            onClick={onClearAll}
            style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem', color: 'var(--rose-400)' }}
          >
            <Trash2 size={14} />
            <span>Clear All</span>
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredAlerts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '3rem 1rem', 
            background: 'rgba(0,0,0,0.2)', 
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-muted)'
          }}>
            <CheckCircle2 size={36} color="var(--emerald-400)" style={{ margin: '0 auto 0.75rem' }} />
            <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Field Conditions Normal</div>
            <div style={{ fontSize: '0.82rem' }}>No active safety warnings or sensor faults detected.</div>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div 
              key={alert.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem 1.25rem',
                background: alert.severity === 'critical' ? 'rgba(244, 63, 94, 0.08)' : alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(56, 189, 248, 0.06)',
                border: `1px solid ${alert.severity === 'critical' ? 'rgba(244, 63, 94, 0.35)' : alert.severity === 'warning' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(56, 189, 248, 0.25)'}`,
                borderRadius: 'var(--radius-md)',
                transition: 'var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.85rem' }}>
                <div style={{ marginTop: '2px' }}>{getAlertIcon(alert.severity)}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-highlight)' }}>
                      {alert.title}
                    </span>
                    <span className="status-badge" style={{ 
                      fontSize: '0.65rem', 
                      padding: '0.15rem 0.5rem',
                      background: alert.severity === 'critical' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                      color: alert.severity === 'critical' ? '#fb7185' : '#fbbf24'
                    }}>
                      {alert.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {alert.message}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Triggered: {new Date(alert.timestamp).toLocaleString()} • Node: {alert.deviceId}
                  </div>
                </div>
              </div>

              <div>
                {!alert.acknowledged ? (
                  <button 
                    className="btn-secondary" 
                    onClick={() => onAcknowledge(alert.id)}
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    <Check size={13} color="var(--emerald-400)" />
                    <span>Acknowledge</span>
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <CheckCircle2 size={13} /> Ack
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
