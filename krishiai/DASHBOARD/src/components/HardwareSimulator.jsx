import React, { useState } from 'react';
import { Sliders, X, Sparkles, Send, RefreshCw, Power, CloudRain, Sun, Moon, Wifi, WifiOff } from 'lucide-react';

export default function HardwareSimulator({
  isOpen,
  onClose,
  telemetry,
  device,
  onSendTelemetry,
  onToggleOnline
}) {
  const [soil, setSoil] = useState(telemetry?.soilMoisture || 34);
  const [temp, setTemp] = useState(telemetry?.temperature || 29.8);
  const [humidity, setHumidity] = useState(telemetry?.humidity || 61);
  const [rain, setRain] = useState(telemetry?.rain || false);
  const [light, setLight] = useState(telemetry?.light ?? true);
  const [syncing, setSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (overrides = {}) => {
    setSyncing(true);
    const payload = {
      soilMoisture: overrides.soil !== undefined ? overrides.soil : Number(soil),
      temperature: overrides.temp !== undefined ? overrides.temp : Number(temp),
      humidity: overrides.humidity !== undefined ? overrides.humidity : Number(humidity),
      rain: overrides.rain !== undefined ? overrides.rain : Boolean(rain),
      light: overrides.light !== undefined ? overrides.light : Boolean(light)
    };

    await onSendTelemetry(payload);
    setTimeout(() => setSyncing(false), 300);
  };

  // Presets
  const applyPreset = (presetName) => {
    if (presetName === 'dry') {
      setSoil(18);
      setRain(false);
      handleSend({ soil: 18, rain: false });
    } else if (presetName === 'rain') {
      setRain(true);
      handleSend({ rain: true });
    } else if (presetName === 'optimal') {
      setSoil(54);
      setRain(false);
      setTemp(28.5);
      setHumidity(62);
      handleSend({ soil: 54, rain: false, temp: 28.5, humidity: 62 });
    } else if (presetName === 'wet') {
      setSoil(82);
      setRain(false);
      handleSend({ soil: 82, rain: false });
    }
  };

  const isOnline = device?.status === 'online';

  return (
    <div className="sim-drawer-panel" id="simulator-drawer" role="dialog" aria-labelledby="sim-title">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(56, 189, 248, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Sliders size={18} color="var(--sky-400)" />
          </div>
          <div>
            <h3 id="sim-title" style={{ fontSize: '1.15rem' }}>ESP32 Node Simulator</h3>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Inject Live Hardware Signals</div>
          </div>
        </div>

        <button id="btn-close-sim" className="btn-secondary" onClick={onClose} style={{ padding: '0.35rem 0.5rem', border: 'none' }}>
          <X size={18} />
        </button>
      </div>

      {/* Quick Scenario Preset Triggers */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          ⚡ Test Scenarios:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button 
            id="btn-preset-dry"
            type="button" 
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', color: '#fb7185', borderColor: 'rgba(244,63,94,0.3)' }}
            onClick={() => applyPreset('dry')}
          >
            🚨 Dry Soil (18%)
          </button>
          <button 
            id="btn-preset-rain"
            type="button" 
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', color: '#60a5fa', borderColor: 'rgba(96,165,250,0.3)' }}
            onClick={() => applyPreset('rain')}
          >
            🌧️ Rain Active (FC-37)
          </button>
          <button 
            id="btn-preset-optimal"
            type="button" 
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', color: '#34d399', borderColor: 'rgba(52,211,153,0.3)' }}
            onClick={() => applyPreset('optimal')}
          >
            🌾 Optimal Field (54%)
          </button>
          <button 
            id="btn-preset-wet"
            type="button" 
            className="btn-secondary" 
            style={{ fontSize: '0.75rem', padding: '0.45rem 0.6rem', color: '#38bdf8', borderColor: 'rgba(56,189,248,0.3)' }}
            onClick={() => applyPreset('wet')}
          >
            💧 Saturated Soil (82%)
          </button>
        </div>
      </div>

      {/* Sliders */}
      {/* 1. Soil Moisture */}
      <div className="slider-group">
        <div className="slider-label">
          <span>🌱 Soil Moisture (Capacitive GPIO 5):</span>
          <strong style={{ color: 'var(--emerald-400)' }}>{soil}%</strong>
        </div>
        <input 
          id="sim-input-soil"
          type="range" 
          min="0" 
          max="100" 
          value={soil} 
          onChange={(e) => setSoil(e.target.value)}
          className="custom-range"
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          <span>0% (Critically Dry)</span>
          <span>100% (Wet)</span>
        </div>
      </div>

      {/* 2. Temperature */}
      <div className="slider-group">
        <div className="slider-label">
          <span>🌡️ Temperature (DHT11 GPIO 25):</span>
          <strong style={{ color: 'var(--amber-400)' }}>{temp}°C</strong>
        </div>
        <input 
          id="sim-input-temp"
          type="range" 
          min="15" 
          max="48" 
          step="0.5"
          value={temp} 
          onChange={(e) => setTemp(e.target.value)}
          className="custom-range"
        />
      </div>

      {/* 3. Humidity */}
      <div className="slider-group">
        <div className="slider-label">
          <span>💧 Humidity (DHT11 GPIO 25):</span>
          <strong style={{ color: 'var(--sky-400)' }}>{humidity}%</strong>
        </div>
        <input 
          id="sim-input-humidity"
          type="range" 
          min="20" 
          max="95" 
          value={humidity} 
          onChange={(e) => setHumidity(e.target.value)}
          className="custom-range"
        />
      </div>

      {/* Toggles */}
      {/* Rain Toggle */}
      <div 
        id="sim-toggle-rain"
        className="toggle-switch" 
        onClick={() => setRain(!rain)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          <CloudRain size={16} color={rain ? '#60a5fa' : 'var(--text-muted)'} />
          <span>FC-37 Rain Sensor (GPIO 27)</span>
        </div>
        <span className={`status-badge ${rain ? 'badge-rain-detected' : 'badge-no-rain'}`}>
          {rain ? 'RAIN DETECTED' : 'NO RAIN'}
        </span>
      </div>

      {/* Light Toggle */}
      <div 
        id="sim-toggle-light"
        className="toggle-switch" 
        onClick={() => setLight(!light)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          {light ? <Sun size={16} color="#facc15" /> : <Moon size={16} color="#a5b4fc" />}
          <span>HW-072 Light/Dark (GPIO 34)</span>
        </div>
        <span className={`status-badge ${light ? 'badge-light-day' : 'badge-light-dark'}`}>
          {light ? 'DAY / LIGHT' : 'NIGHT / DARK'}
        </span>
      </div>

      {/* Node Connection Toggle */}
      <div 
        id="sim-toggle-connection"
        className="toggle-switch" 
        onClick={onToggleOnline}
        style={{ borderColor: isOnline ? 'var(--border-subtle)' : 'rgba(244,63,94,0.4)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.82rem' }}>
          {isOnline ? <Wifi size={16} color="var(--emerald-400)" /> : <WifiOff size={16} color="var(--rose-500)" />}
          <span>ESP32 Wi-Fi Link</span>
        </div>
        <span className={`status-badge ${isOnline ? 'badge-good' : 'badge-very-dry'}`}>
          {isOnline ? 'CONNECTED' : 'DISCONNECTED'}
        </span>
      </div>

      {/* Push Telemetry Button */}
      <button 
        id="btn-sim-send-telemetry"
        className="btn-primary" 
        style={{ width: '100%', marginTop: '0.5rem' }}
        onClick={() => handleSend()}
        disabled={syncing}
      >
        <Send size={16} className={syncing ? 'spin' : ''} />
        <span>{syncing ? 'Broadcasting...' : 'Broadcast Telemetry to ESP32 Node'}</span>
      </button>
    </div>
  );
}
