import React from 'react';
import { 
  Droplets, 
  Thermometer, 
  Wind, 
  CloudRain, 
  Sun, 
  Moon, 
  Power,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers
} from 'lucide-react';

export default function SensorCards({ telemetry, device, onOpenPumpModal, userRole }) {
  if (!telemetry) {
    return (
      <div className="sensors-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="glass-card" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Acquiring telemetry channel {i}...</span>
          </div>
        ))}
      </div>
    );
  }

  // 1. Soil Moisture Assessment
  const soil = Number(telemetry.soilMoisture ?? 0);
  const soilRaw = telemetry.soilRaw ?? 2450;
  let soilStatusClass = 'badge-good';
  let soilStatusText = 'OPTIMAL MOISTURE';
  if (soil < 25) {
    soilStatusClass = 'badge-very-dry';
    soilStatusText = 'CRITICALLY DRY';
  } else if (soil < 40) {
    soilStatusClass = 'badge-dry';
    soilStatusText = 'DRY (IRRIGATE)';
  } else if (soil > 80) {
    soilStatusClass = 'badge-wet';
    soilStatusText = 'SATURATED';
  }

  // 2. Temperature Assessment & Trend
  const temp = Number(telemetry.temperature ?? 0);
  const prevTemp = Number(telemetry.tempPrev ?? temp);
  const tempDiff = temp - prevTemp;
  let TrendIcon = Minus;
  let trendClass = 'trend-stable';
  let trendText = 'Stable';
  if (tempDiff > 0.3) {
    TrendIcon = TrendingUp;
    trendClass = 'trend-up';
    trendText = `+${tempDiff.toFixed(1)}°C/hr`;
  } else if (tempDiff < -0.3) {
    TrendIcon = TrendingDown;
    trendClass = 'trend-down';
    trendText = `${tempDiff.toFixed(1)}°C/hr`;
  }

  // 3. Humidity
  const hum = Number(telemetry.humidity ?? 0);

  // 4. Rain Sensor (FC-37)
  const isRain = Boolean(telemetry.rain);

  // 5. Light Sensor (HW-072)
  const isDay = Boolean(telemetry.light);

  // 6. Pump Status
  const isPumpActive = Boolean(telemetry.pump);

  return (
    <div className="sensors-grid">
      {/* 1. SOIL MOISTURE */}
      <div className="glass-card" id="card-soil-moisture">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
              <Droplets size={22} color="var(--emerald-400)" />
            </div>
            <div>
              <div className="card-title">Soil Moisture</div>
              <div className="card-subtitle">GPIO 5 · Capacitive V1.2</div>
            </div>
          </div>
          <span className={`status-badge ${soilStatusClass}`}>{soilStatusText}</span>
        </div>

        <div className="metric-row">
          <div className="metric-value">
            {soil}
            <span className="metric-unit">%</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>Target: 40% – 70%</div>
            <div className="font-mono" style={{ color: 'var(--emerald-400)', fontWeight: 600 }}>ADC: {soilRaw}</div>
          </div>
        </div>

        <div className="meter-bar-container">
          <div className="meter-fill soil" style={{ width: `${Math.min(100, Math.max(5, soil))}%` }}></div>
        </div>

        <div className="card-footer-info">
          <span>Dry Threshold: 35%</span>
          <span>Calibrated: 1200 – 3200</span>
        </div>
      </div>

      {/* 2. AMBIENT TEMPERATURE */}
      <div className="glass-card" id="card-temperature">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              <Thermometer size={22} color="var(--amber-400)" />
            </div>
            <div>
              <div className="card-title">Ambient Temperature</div>
              <div className="card-subtitle">GPIO 25 · DHT11 Sensor</div>
            </div>
          </div>
          <div className={`trend-indicator ${trendClass}`} style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', fontWeight: 700 }}>
            <TrendIcon size={16} />
            <span>{trendText}</span>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric-value">
            {temp.toFixed(1)}
            <span className="metric-unit">°C</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>Thermal Balance</div>
            <div style={{ color: temp > 35 ? 'var(--amber-400)' : 'var(--emerald-400)', fontWeight: 700 }}>
              {temp > 35 ? 'HIGH EVAPORATION' : 'OPTIMAL'}
            </div>
          </div>
        </div>

        <div className="meter-bar-container">
          <div className="meter-fill temp" style={{ width: `${Math.min(100, Math.max(10, (temp / 50) * 100))}%` }}></div>
        </div>

        <div className="card-footer-info">
          <span>Heat Stress Alert: &gt; 35°C</span>
          <span>Optimal: 20°C – 30°C</span>
        </div>
      </div>

      {/* 3. RELATIVE HUMIDITY */}
      <div className="glass-card" id="card-humidity">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
              <Wind size={22} color="var(--sky-400)" />
            </div>
            <div>
              <div className="card-title">Relative Humidity</div>
              <div className="card-subtitle">GPIO 25 · DHT11 Sensor</div>
            </div>
          </div>
          <span className="status-badge" style={{ background: 'var(--bg-surface)', color: 'var(--text-secondary)' }}>
            {hum < 40 ? 'LOW' : hum > 80 ? 'HIGH' : 'MODERATE'}
          </span>
        </div>

        <div className="metric-row">
          <div className="metric-value">
            {Math.round(hum)}
            <span className="metric-unit">%</span>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>Vapor Saturation</div>
            <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{hum > 75 ? 'Low Transpiration' : 'Normal'}</div>
          </div>
        </div>

        <div className="meter-bar-container">
          <div className="meter-fill hum" style={{ width: `${Math.min(100, Math.max(10, hum))}%` }}></div>
        </div>

        <div className="card-footer-info">
          <span>Dew Point Margin: 85%</span>
          <span>Accuracy: ±5% RH</span>
        </div>
      </div>

      {/* 4. PRECIPITATION SENSOR */}
      <div className="glass-card" id="card-rain">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: 'rgba(14, 165, 233, 0.15)', borderColor: 'rgba(14, 165, 233, 0.3)' }}>
              <CloudRain size={22} color="var(--sky-400)" />
            </div>
            <div>
              <div className="card-title">Precipitation</div>
              <div className="card-subtitle">GPIO 27 · FC-37 Active LOW</div>
            </div>
          </div>
          <span className={`status-badge ${isRain ? 'badge-rain-detected' : 'badge-no-rain'}`}>
            {isRain ? 'RAIN DETECTED' : 'DRY SURFACE'}
          </span>
        </div>

        <div className="metric-row">
          <div className="metric-value" style={{ fontSize: '2.1rem', marginTop: '0.2rem' }}>
            {isRain ? 'PRECIPITATION' : 'NO RAIN'}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
            <div style={{ color: isRain ? 'var(--sky-400)' : 'var(--emerald-400)', fontWeight: 700 }}>
              {isRain ? 'SAFETY LOCKOUT' : 'CIRCUIT CLEAR'}
            </div>
            <div className="font-mono" style={{ color: 'var(--text-muted)' }}>PIN: {isRain ? 'LOW' : 'HIGH'}</div>
          </div>
        </div>

        <div className="card-footer-info" style={{ marginTop: '1.5rem' }}>
          <span>Safety Interlock: Active Cutoff</span>
          <span>Auto-Override: Enabled</span>
        </div>
      </div>

      {/* 5. SOLAR ILLUMINATION */}
      <div className="glass-card" id="card-light">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: isDay ? 'rgba(245, 158, 11, 0.15)' : 'rgba(100, 116, 139, 0.15)', borderColor: isDay ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)' }}>
              {isDay ? <Sun size={22} color="var(--amber-400)" /> : <Moon size={22} color="var(--sky-400)" />}
            </div>
            <div>
              <div className="card-title">Solar Illumination</div>
              <div className="card-subtitle">GPIO 34 · HW-072 Digital</div>
            </div>
          </div>
          <span className={`status-badge ${isDay ? 'badge-light-day' : 'badge-light-dark'}`}>
            {isDay ? 'DAYLIGHT' : 'DARK / NIGHT'}
          </span>
        </div>

        <div className="metric-row">
          <div className="metric-value" style={{ fontSize: '2.1rem', marginTop: '0.2rem' }}>
            {isDay ? 'DAYLIGHT' : 'NIGHT'}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <div>Photoperiod Mode</div>
            <div className="font-mono" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>PIN: {isDay ? 'LOW' : 'HIGH'}</div>
          </div>
        </div>

        <div className="card-footer-info" style={{ marginTop: '1.5rem' }}>
          <span>Optoelectronic Comparator</span>
          <span>Adaptive Scaling: ON</span>
        </div>
      </div>

      {/* 6. IRRIGATION PUMP RELAY */}
      <div className="glass-card" id="card-pump-status">
        <div className="card-header">
          <div className="card-title-group">
            <div className="card-icon-box" style={{ background: isPumpActive ? 'rgba(16, 185, 129, 0.2)' : 'var(--bg-surface)', borderColor: isPumpActive ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-subtle)' }}>
              <Power size={22} color={isPumpActive ? 'var(--emerald-400)' : 'var(--text-muted)'} />
            </div>
            <div>
              <div className="card-title">Irrigation Pump</div>
              <div className="card-subtitle">GPIO 26 · Isolated 5V Relay</div>
            </div>
          </div>
          <span className={`status-badge ${isPumpActive ? 'badge-pump-on' : 'badge-pump-off'}`}>
            {isPumpActive ? 'RELAY CLOSED (ON)' : 'RELAY OPEN (OFF)'}
          </span>
        </div>

        <div className="metric-row">
          <div className="metric-value" style={{ fontSize: '2.1rem', marginTop: '0.2rem', color: isPumpActive ? 'var(--emerald-400)' : 'var(--text-secondary)' }}>
            {isPumpActive ? 'IRRIGATING' : 'STANDBY'}
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.82rem' }}>
            <div style={{ color: 'var(--text-muted)' }}>Mode: <strong style={{ color: 'var(--text-highlight)' }}>{device?.mode || 'AUTO'}</strong></div>
            <div style={{ color: 'var(--text-muted)' }}>Max Run: 15 min</div>
          </div>
        </div>

        <div className="card-footer-info" style={{ marginTop: '1.5rem' }}>
          <span>Boot Failsafe: Guaranteed OFF</span>
          <span>Watchdog: Armed</span>
        </div>
      </div>
    </div>
  );
}
