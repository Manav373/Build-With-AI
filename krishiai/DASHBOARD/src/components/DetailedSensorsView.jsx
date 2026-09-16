import React from 'react';
import { Gauge, Sprout, Thermometer, Droplet, CloudRain, Sun, Moon, Info, Cpu, CheckCircle2 } from 'lucide-react';

export default function DetailedSensorsView({ telemetry, device }) {
  if (!telemetry) return null;

  const {
    soilMoisture = 34,
    soilRaw = 2450,
    temperature = 29.8,
    humidity = 61,
    rain = false,
    light = true,
    timestamp
  } = telemetry;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Sensor Suite Header */}
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Gauge size={22} color="var(--emerald-400)" />
              Multi-Sensor Telemetry & Calibration Suite
            </h2>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
              Real-time hardware signal acquisition • Raw ADC vs Processed Agricultural Value (PRD Section 24)
            </div>
          </div>

          <div className="meta-pill font-mono">
            <span>Last Sync:</span>
            <strong style={{ color: 'var(--emerald-400)' }}>{new Date(timestamp).toLocaleTimeString()}</strong>
          </div>
        </div>
      </div>

      {/* 4 Sensor Detailed Deep-Dive Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* 1. Capacitive Soil Moisture */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="card-icon-box soil">
                <Sprout size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>Capacitive Soil Moisture V1.2</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to ESP32 Pin GPIO 5 (ADC1_CH6)</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Processed Moisture:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--emerald-400)' }}>{soilMoisture}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Raw ADC Voltage (0-4095):</span>
              <strong className="font-mono" style={{ color: 'var(--sky-400)' }}>{soilRaw} ADC</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Operating Voltage:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>3.3V Analog Out</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong>Calibration Formula:</strong> <br/>
            <code>Moisture% = ((3200 - RawADC) / (3200 - 1200)) × 100</code>
          </div>
        </div>

        {/* 2. DHT11 Temp & Humidity */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="card-icon-box temp">
                <Thermometer size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>DHT11 Micro-Climate Sensor</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to ESP32 Pin GPIO 25 (1-Wire Digital)</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Ambient Temperature:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--amber-400)' }}>{temperature.toFixed(1)}°C / {((temperature * 9/5) + 32).toFixed(1)}°F</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Relative Humidity:</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--sky-400)' }}>{humidity}% RH</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Dew Point Estimate:</span>
              <span style={{ color: 'var(--text-primary)', fontSize: '0.85rem' }}>{(temperature - ((100 - humidity) / 5)).toFixed(1)}°C</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            <strong>Sensor Specs:</strong> Temp Range: 0–50°C (±2°C) • Humidity Range: 20–90% RH (±5%).
          </div>
        </div>

        {/* 3. FC-37 Rain Sensor */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="card-icon-box rain">
                <CloudRain size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>FC-37 Rain Drop Sensor</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to ESP32 Pin GPIO 27 (Digital Input)</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Precipitation State:</span>
              <strong style={{ fontSize: '1.1rem', color: rain ? '#60a5fa' : 'var(--emerald-400)' }}>
                {rain ? '🌧 RAIN DETECTED' : '🌤 NO RAIN'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Digital Logic Pin State:</span>
              <strong className="font-mono" style={{ color: 'var(--sky-400)' }}>{rain ? 'LOW (0V)' : 'HIGH (3.3V)'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Irrigation Interlock:</span>
              <span style={{ color: rain ? '#fb7185' : 'var(--emerald-400)', fontWeight: 600 }}>{rain ? 'ACTIVE (PUMP PAUSED)' : 'NORMAL'}</span>
            </div>
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
            Nickel-coated grid board detects surface droplet conductivity via comparator potentiometer.
          </div>
        </div>

        {/* 4. HW-072 Light/Dark Sensor */}
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <div className="card-icon-box light">
                {light ? <Sun size={20} /> : <Moon size={20} />}
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>HW-072 / 3362 Light Sensor</h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected to ESP32 Pin GPIO 34 (Digital Input)</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Solar Illumination:</span>
              <strong style={{ fontSize: '1.1rem', color: light ? '#facc15' : '#a5b4fc' }}>
                {light ? '☀️ DAY / LIGHT' : '🌙 DARK CONDITION'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Digital Signal:</span>
              <strong className="font-mono" style={{ color: 'var(--sky-400)' }}>{light ? 'LOW (Triggered)' : 'HIGH (Dark)'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Sensor Architecture:</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Digital Photodiode / LDR</span>
            </div>
          </div>

          <div style={{ 
            background: 'rgba(234, 179, 8, 0.1)', 
            border: '1px solid rgba(234, 179, 8, 0.3)', 
            borderRadius: 'var(--radius-sm)', 
            padding: '0.45rem 0.65rem',
            fontSize: '0.75rem',
            color: '#fef08a'
          }}>
            ℹ️ <strong>Hardware Note:</strong> This sensor provides binary daylight detection. It does not measure Lux (PRD Section 11 & 37).
          </div>
        </div>
      </div>

      {/* Raw Data Model Table (PRD Section 24) */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.05rem', marginBottom: '0.85rem' }}>📡 Active Telemetry JSON Payload Model (PRD Section 24)</h3>
        <pre className="font-mono" style={{
          background: 'rgba(0, 0, 0, 0.45)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.82rem',
          color: '#34d399',
          overflowX: 'auto'
        }}>
{JSON.stringify(telemetry, null, 2)}
        </pre>
      </div>
    </div>
  );
}
