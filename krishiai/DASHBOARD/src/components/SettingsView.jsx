import React, { useState } from 'react';
import { Settings, Shield, Sliders, Save, CheckCircle2, History, UserCheck, AlertTriangle } from 'lucide-react';

export default function SettingsView({ device, onUpdateSettings, auditLogs = [], userRole = 'Admin' }) {
  const currentSettings = device?.settings || {
    veryDryThreshold: 24,
    dryThreshold: 39,
    goodThreshold: 69,
    autoMaxDurationMinutes: 15,
    manualMaxDurationMinutes: 30,
    soilCalibrationDryRaw: 3200,
    soilCalibrationWetRaw: 1200,
    alertDrySoil: true,
    alertRain: true,
    alertPumpState: true
  };

  const [form, setForm] = useState({ ...currentSettings });
  const [savedMessage, setSavedMessage] = useState(false);

  const handleChange = (field, val) => {
    setForm(prev => ({
      ...prev,
      [field]: typeof val === 'boolean' ? val : Number(val)
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await onUpdateSettings(form);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Settings Form */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={22} color="var(--emerald-400)" />
              Threshold Configuration & Calibration
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Fine-tune decision engine moisture limits, safety cutoffs & capacitive ADC spans
            </div>
          </div>

          {savedMessage && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-400)', fontSize: '0.85rem', fontWeight: 600 }}>
              <CheckCircle2 size={16} />
              <span>Settings saved & synced to ESP32!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            {/* Moisture Thresholds */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--emerald-400)', marginBottom: '0.85rem' }}>
                🌱 Moisture State Bands (PRD Section 7)
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Critical Very Dry Cutoff (0 – X%):
                </label>
                <input 
                  type="number" 
                  min="5" 
                  max="35"
                  value={form.veryDryThreshold}
                  onChange={(e) => handleChange('veryDryThreshold', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default: 24% (Triggers immediate irrigation)</span>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Dry Moisture Threshold (X – 39%):
                </label>
                <input 
                  type="number" 
                  min="25" 
                  max="50"
                  value={form.dryThreshold}
                  onChange={(e) => handleChange('dryThreshold', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default: 39%</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Optimal Good Moisture Ceiling (X – 69%):
                </label>
                <input 
                  type="number" 
                  min="50" 
                  max="85"
                  value={form.goodThreshold}
                  onChange={(e) => handleChange('goodThreshold', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Default: 69%</span>
              </div>
            </div>

            {/* Safety Timers */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--amber-400)', marginBottom: '0.85rem' }}>
                ⏱️ Safety Limits (PRD Section 30)
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Auto Mode Max Runtime (Minutes):
                </label>
                <input 
                  type="number" 
                  min="2" 
                  max="30"
                  value={form.autoMaxDurationMinutes}
                  onChange={(e) => handleChange('autoMaxDurationMinutes', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Failsafe auto-cutoff for decision engine cycles</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Manual Mode Max Runtime (Minutes):
                </label>
                <input 
                  type="number" 
                  min="5" 
                  max="60"
                  value={form.manualMaxDurationMinutes}
                  onChange={(e) => handleChange('manualMaxDurationMinutes', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Maximum allowable manual pump duration</span>
              </div>
            </div>

            {/* ADC Sensor Calibration */}
            <div style={{ background: 'rgba(0,0,0,0.25)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--sky-400)', marginBottom: '0.85rem' }}>
                📐 Capacitive ADC Calibration (PRD Section 24)
              </h3>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Air Value ADC (0% Moisture):
                </label>
                <input 
                  type="number" 
                  min="2000" 
                  max="4095"
                  value={form.soilCalibrationDryRaw}
                  onChange={(e) => handleChange('soilCalibrationDryRaw', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical ESP32 ADC: 3200</span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                  Water Value ADC (100% Moisture):
                </label>
                <input 
                  type="number" 
                  min="500" 
                  max="2000"
                  value={form.soilCalibrationWetRaw}
                  onChange={(e) => handleChange('soilCalibrationWetRaw', e.target.value)}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: 'white' }}
                />
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Typical ESP32 ADC: 1200</span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button id="btn-save-settings" type="submit" className="btn-primary">
              <Save size={16} />
              <span>Save & Apply Settings</span>
            </button>
          </div>
        </form>
      </div>

      {/* Audit Trail Log (PRD Section 29 Security & Audit Logging) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Shield size={18} color="var(--emerald-400)" />
          <h3 style={{ fontSize: '1.1rem' }}>Security Audit Log Trail (PRD Section 29)</h3>
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
          Immutable record of authorized operator actions, pump triggers, and system configuration updates.
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Operator</th>
                <th>Action</th>
                <th>Details</th>
                <th>Device ID</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id}>
                  <td className="font-mono" style={{ fontSize: '0.75rem' }}>{new Date(log.timestamp).toLocaleString()}</td>
                  <td style={{ color: 'var(--sky-400)', fontWeight: 600 }}>{log.user}</td>
                  <td style={{ fontWeight: 700 }}>{log.action}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{log.details}</td>
                  <td className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.deviceId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
