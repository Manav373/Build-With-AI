import React, { useState, useEffect } from 'react';
import { 
  Power, 
  ShieldAlert, 
  Clock, 
  CloudRain, 
  Zap, 
  Activity,
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

export default function ManualPumpControl({
  device,
  telemetry,
  onModeChange,
  onOpenPumpModal,
  onStopPump,
  onEmergencyStop,
  userRole = 'Admin'
}) {
  const [elapsedStr, setElapsedStr] = useState('0m 0s');

  const isPumpOn = telemetry?.pump || false;
  const isRain = telemetry?.rain || false;
  const mode = device?.mode || 'AUTO';

  useEffect(() => {
    let interval;
    if (isPumpOn && telemetry?.pumpStartedAt) {
      const updateTimer = () => {
        const diff = Math.max(0, Math.floor((Date.now() - new Date(telemetry.pumpStartedAt).getTime()) / 1000));
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        setElapsedStr(`${mins}m ${secs}s`);
      };
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedStr('0m 0s');
    }
    return () => clearInterval(interval);
  }, [isPumpOn, telemetry?.pumpStartedAt]);

  return (
    <div className="pump-control-card" id="pump-station-hub">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--text-highlight)' }}>
            <Zap size={16} color="var(--emerald-400)" />
            Irrigation Actuator Controller
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Relay Output: GPIO 26 · Active-LOW Isolated Switch · Interlock Safe
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mode-switcher" role="radiogroup" aria-label="Irrigation Mode">
          <button
            id="btn-mode-auto"
            type="button"
            className={`mode-btn ${mode === 'AUTO' ? 'active' : ''}`}
            onClick={() => onModeChange('AUTO')}
          >
            AUTO (LOGIC CONTROL)
          </button>
          <button
            id="btn-mode-manual"
            type="button"
            className={`mode-btn ${mode === 'MANUAL' ? 'active' : ''}`}
            onClick={() => onModeChange('MANUAL')}
          >
            MANUAL OVERRIDE
          </button>
        </div>
      </div>

      {/* Rain Alert Interlock Banner */}
      {isRain && (
        <div style={{ 
          background: 'rgba(2, 132, 199, 0.12)', 
          border: '1px solid rgba(2, 132, 199, 0.3)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          marginBottom: '1rem',
          color: '#93c5fd'
        }}>
          <CloudRain size={18} color="#38bdf8" />
          <div style={{ fontSize: '0.82rem' }}>
            <strong>Precipitation Interlock Active:</strong> Rain detected on FC-37 sensor. Pump activation is locked out by safety engine.
          </div>
        </div>
      )}

      {/* Main Status & Controls Panel */}
      <div style={{ 
        background: 'var(--bg-secondary)', 
        border: '1px solid var(--border-subtle)', 
        borderRadius: 'var(--radius-sm)', 
        padding: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ 
            width: '44px', 
            height: '44px', 
            borderRadius: 'var(--radius-sm)', 
            background: isPumpOn ? 'rgba(34, 197, 94, 0.15)' : 'var(--bg-surface)', 
            border: `1px solid ${isPumpOn ? 'var(--emerald-500)' : 'var(--border-medium)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Power size={20} color={isPumpOn ? 'var(--emerald-400)' : 'var(--text-muted)'} />
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Relay 1 Circuit State
            </div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: isPumpOn ? 'var(--emerald-400)' : 'var(--text-primary)' }}>
              {isPumpOn ? 'ENERGIZED / PUMP ACTIVE' : 'DE-ENERGIZED / STANDBY'}
            </div>
            {isPumpOn ? (
              <div style={{ fontSize: '0.78rem', color: 'var(--emerald-400)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.15rem' }}>
                <Clock size={12} /> Runtime: <strong className="font-mono">{elapsedStr}</strong> (Operator: {telemetry?.pumpStartedBy || 'Admin'})
              </div>
            ) : (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                Operating Mode: <strong>{mode}</strong> · Interlocks clear
              </div>
            )}
          </div>
        </div>

        {/* Action Button Set */}
        <div className="pump-actions">
          {isPumpOn ? (
            <button
              id="btn-hub-stop-pump"
              type="button"
              className="btn-danger"
              onClick={() => onStopPump('Manual Operator Stop')}
            >
              <Power size={15} />
              <span>De-energize Pump</span>
            </button>
          ) : (
            <button
              id="btn-hub-start-pump"
              type="button"
              className="btn-primary"
              disabled={isRain}
              onClick={onOpenPumpModal}
              title={isRain ? 'Blocked by Rain Interlock' : 'Start Manual Irrigation'}
              style={{ opacity: isRain ? 0.6 : 1, cursor: isRain ? 'not-allowed' : 'pointer' }}
            >
              <Power size={15} />
              <span>Start Pump (Manual)</span>
            </button>
          )}

          <button
            id="btn-hub-emergency-stop"
            type="button"
            className="btn-emergency"
            onClick={onEmergencyStop}
          >
            <ShieldAlert size={15} />
            <span>EMERGENCY STOP</span>
          </button>
        </div>
      </div>

      {/* Safety Interlocks Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '0.65rem', 
        marginTop: '1rem' 
      }}>
        <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-highlight)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Shield size={12} color="var(--emerald-400)" />
            Safe Boot State
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>Relay defaults to OPEN at power-up</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-highlight)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={12} color="var(--amber-400)" />
            Watchdog Cutoff
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>Auto limit: {device?.settings?.autoMaxDurationMinutes || 15}m · Manual limit: {device?.settings?.manualMaxDurationMinutes || 30}m</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-highlight)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <CloudRain size={12} color="var(--sky-400)" />
            Precipitation Guard
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>Instant pump cutoff on rain sensor detection</div>
        </div>

        <div style={{ background: 'var(--bg-secondary)', padding: '0.65rem 0.85rem', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: '0.75rem' }}>
          <div style={{ color: 'var(--text-highlight)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Activity size={12} color="var(--text-secondary)" />
            Audit Logging
          </div>
          <div style={{ color: 'var(--text-muted)', marginTop: '0.15rem' }}>Records duration, user ID, and trigger reason</div>
        </div>
      </div>
    </div>
  );
}
