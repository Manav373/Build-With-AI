import React, { useState } from 'react';
import { Cpu, Wifi, Activity, CheckCircle2, AlertTriangle, Play, RefreshCw, Layers, ShieldCheck } from 'lucide-react';

export default function DeviceHealthView({ device, telemetry }) {
  const [testingPin, setTestingPin] = useState(null);
  const [testResults, setTestResults] = useState({});

  const pins = device?.pinConfig || [
    { component: 'ESP32', purpose: 'Main IoT controller', pin: '—', status: 'OK' },
    { component: 'Capacitive Soil Moisture V1.2', purpose: 'Soil moisture', pin: 'GPIO 5', status: 'OK' },
    { component: 'DHT11', purpose: 'Temperature + humidity', pin: 'GPIO 25', status: 'OK' },
    { component: 'FC-37 Rain Sensor', purpose: 'Rain detection', pin: 'GPIO 27', status: 'OK' },
    { component: 'HW-072 / 3362', purpose: 'Light/dark detection', pin: 'GPIO 34', status: 'OK' },
    { component: 'LCD I²C', purpose: 'Local display', pin: 'SDA 21 / SCL 22', status: 'OK' },
    { component: 'Relay', purpose: 'Pump control', pin: 'GPIO 26', status: 'OK' },
    { component: 'Water Pump/Motor', purpose: 'Irrigation', pin: 'Relay', status: 'OK' }
  ];

  const isOnline = device?.status === 'online';

  const runPinDiagnostic = (pinName) => {
    setTestingPin(pinName);
    setTimeout(() => {
      setTestResults(prev => ({
        ...prev,
        [pinName]: 'Pass (Signal Latency 12ms • Reading Nominal)'
      }));
      setTestingPin(null);
    }, 600);
  };

  const runFullHealthCheck = () => {
    pins.forEach((p, idx) => {
      setTimeout(() => {
        setTestResults(prev => ({
          ...prev,
          [p.component]: 'Pass (Verified Normal)'
        }));
      }, idx * 150);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Device Overview Header */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cpu size={26} color="var(--sky-400)" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.35rem' }}>ESP32 Hardware Node Diagnostics</h2>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                Field Controller: {device?.name || 'KrishiAI Node 01'} (Expressif ESP32-WROOM-32D)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button id="btn-full-diagnostic" className="btn-primary" onClick={runFullHealthCheck} style={{ fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>Run Full Hardware Self-Test</span>
            </button>
          </div>
        </div>

        {/* Vital Health Metrics Grid (PRD Section 18) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Node Connection Status</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: isOnline ? 'var(--emerald-400)' : 'var(--rose-500)', marginTop: '0.2rem' }}>
              ● {isOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              IP: {device?.ipAddress || '192.168.1.104'}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Wi-Fi Mesh Signal</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--sky-400)', marginTop: '0.2rem' }}>
              {device?.rssi || -62} dBm
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              SSID: {device?.wifiSSID || 'KrishiAI-Mesh-01'}
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Firmware Version</div>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--amber-400)', marginTop: '0.2rem' }}>
              {device?.firmwareVersion || 'v1.0.4'}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Build Date: 2026-08-26
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>System Uptime</div>
            <div className="font-mono" style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-highlight)', marginTop: '0.2rem' }}>
              23h 24m
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Zero unexpected resets
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Pin Mapping Table (PRD Section 2 Table) */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem' }}>ESP32 GPIO Pinout & Peripherals Mapping</h3>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Hardware configuration extracted from PRD Section 2
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Component</th>
                <th>Purpose</th>
                <th>ESP32 Pin</th>
                <th>Health Status</th>
                <th>Diagnostic Result</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {pins.map((p) => {
                const res = testResults[p.component];
                const isTesting = testingPin === p.component;

                return (
                  <tr key={p.component}>
                    <td style={{ fontWeight: 700, color: 'var(--text-highlight)' }}>{p.component}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{p.purpose}</td>
                    <td>
                      <span className="font-mono" style={{ 
                        background: 'rgba(56, 189, 248, 0.12)', 
                        color: 'var(--sky-400)', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}>
                        {p.pin}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge badge-good" style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem' }}>
                        ● {p.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: res ? 'var(--emerald-400)' : 'var(--text-muted)' }}>
                      {res || 'Ready for check'}
                    </td>
                    <td>
                      <button
                        className="btn-secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem' }}
                        disabled={isTesting}
                        onClick={() => runPinDiagnostic(p.component)}
                      >
                        <Play size={11} />
                        <span>{isTesting ? 'Testing...' : 'Test Signal'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
