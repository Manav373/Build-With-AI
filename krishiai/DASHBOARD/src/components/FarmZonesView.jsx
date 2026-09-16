import React from 'react';
import { Layers, MapPin, CheckCircle, Clock, PlusCircle, ArrowUpRight, Cpu } from 'lucide-react';

export default function FarmZonesView({ telemetry, device, decision }) {
  const zoneA = {
    id: 'zone-a',
    name: 'Zone A — Main Field (Active)',
    crop: 'Wheat / Paddy (Plot 1)',
    nodeId: 'KrishiAI Node 01',
    status: device?.status || 'online',
    soil: telemetry?.soilMoisture || 34,
    temp: telemetry?.temperature || 29.8,
    humidity: telemetry?.humidity || 61,
    rain: telemetry?.rain ? 'RAIN DETECTED' : 'NO RAIN',
    light: telemetry?.light ? 'LIGHT' : 'DARK',
    pump: telemetry?.pump ? 'ON' : 'OFF',
    decision: decision?.title || 'MONITOR'
  };

  const futureZones = [
    {
      id: 'zone-b',
      name: 'Zone B — Polyhouse & Vegetables',
      crop: 'Tomatoes & Capsicum',
      nodeId: 'KrishiAI Node 02 (Planned)',
      status: 'standby',
      valve: 'Solenoid Valve B',
      notes: 'Ready for node deployment (DHT22 + Capacitive Soil Node)'
    },
    {
      id: 'zone-c',
      name: 'Zone C — Fruit Orchard',
      crop: 'Mango & Citrus Drip Line',
      nodeId: 'KrishiAI Node 03 (Planned)',
      status: 'standby',
      valve: 'Solenoid Valve C',
      notes: 'Future multi-valve expansion node'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Farm Header Overview */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-400)', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <MapPin size={15} /> Farm Hierarchy & Multi-Zone Topology
            </div>
            <h2 style={{ fontSize: '1.4rem', marginTop: '0.2rem' }}>Demo Farm — Agricultural Zones</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Scalable multi-node architecture (PRD Section 21 & 36). Current deployment: 1 active ESP32 node.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <div className="meta-pill">
              <span>Active Zones:</span>
              <strong style={{ color: 'var(--emerald-400)' }}>1 / 3</strong>
            </div>
            <div className="meta-pill">
              <span>Active IoT Nodes:</span>
              <strong style={{ color: 'var(--sky-400)' }}>1 Node</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Zone A (Active Prototype - PRD Section 22) */}
        <div className="glass-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'linear-gradient(135deg, rgba(16, 28, 48, 0.9) 0%, rgba(13, 38, 38, 0.75) 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="card-icon-box soil" style={{ width: '32px', height: '32px' }}>
                <Layers size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{zoneA.name}</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{zoneA.crop}</div>
              </div>
            </div>
            <span className="status-badge badge-good">● ACTIVE ONLINE</span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.65rem', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '1rem', 
            borderRadius: 'var(--radius-md)', 
            fontSize: '0.82rem',
            marginBottom: '1rem'
          }}>
            <div>Soil: <strong style={{ color: 'var(--emerald-400)' }}>{zoneA.soil}%</strong></div>
            <div>Temp: <strong style={{ color: 'var(--amber-400)' }}>{zoneA.temp}°C</strong></div>
            <div>Humidity: <strong style={{ color: 'var(--sky-400)' }}>{zoneA.humidity}%</strong></div>
            <div>Rain: <strong>{zoneA.rain}</strong></div>
            <div>Light: <strong>{zoneA.light}</strong></div>
            <div>Pump Relay: <strong style={{ color: zoneA.pump === 'ON' ? '#38bdf8' : 'var(--text-muted)' }}>{zoneA.pump}</strong></div>
          </div>

          <div style={{ 
            background: 'rgba(16, 185, 129, 0.1)', 
            border: '1px solid rgba(16, 185, 129, 0.3)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.6rem 0.85rem',
            fontSize: '0.8rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ color: 'var(--text-secondary)' }}>KrishiAI Decision:</span>
            <strong style={{ color: 'var(--emerald-400)' }}>{zoneA.decision}</strong>
          </div>
        </div>

        {/* Future Zones (B & C) */}
        {futureZones.map((fz) => (
          <div key={fz.id} className="glass-card" style={{ opacity: 0.85, borderStyle: 'dashed' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div className="card-icon-box" style={{ width: '32px', height: '32px' }}>
                  <Layers size={18} color="var(--text-muted)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)' }}>{fz.name}</h3>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{fz.crop}</div>
                </div>
              </div>
              <span className="status-badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)' }}>
                STANDBY
              </span>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: 'var(--radius-md)', fontSize: '0.82rem', marginBottom: '1rem' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Assigned Hardware: <strong>{fz.nodeId}</strong></div>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Control Actuator: <strong>{fz.valve}</strong></div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.5rem' }}>{fz.notes}</div>
            </div>

            <button className="btn-secondary" style={{ width: '100%', fontSize: '0.8rem', padding: '0.45rem' }}>
              <PlusCircle size={14} />
              <span>Configure Node for {fz.name.split('—')[0]}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Multi-Zone Architecture Diagram matching PRD Section 21 & 36 */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>🌳 Distributed Multi-Zone Farm Topology</h3>
        <pre className="font-mono" style={{ 
          background: 'rgba(0, 0, 0, 0.4)', 
          padding: '1.25rem', 
          borderRadius: 'var(--radius-md)', 
          border: '1px solid var(--border-subtle)',
          fontSize: '0.85rem',
          color: 'var(--emerald-400)',
          overflowX: 'auto',
          lineHeight: 1.5
        }}>
{`Demo Farm (Master Cloud Platform)
├── Zone A (Active) ─── ESP32 Node 01 ─── Sensors (Soil, DHT11, Rain, Light) ─── Relay GPIO 26 ─── Pump
├── Zone B (Ready)  ─── ESP32 Node 02 ─── Polyhouse Telemetry Node ────────────── Valve B
└── Zone C (Future) ─── ESP32 Node 03 ─── Orchard Micro-Climate Sensors ──────── Valve C`}
        </pre>
      </div>
    </div>
  );
}
