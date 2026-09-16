import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Droplet, 
  CloudRain, 
  Sun, 
  ShieldCheck, 
  Activity,
  Cpu,
  FileText
} from 'lucide-react';

export default function DecisionEngineCard({ decision, telemetry, device }) {
  if (!decision) {
    return (
      <div className="decision-card">
        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Evaluating agronomic rule matrix...</div>
      </div>
    );
  }

  const {
    status,
    headline,
    color,
    reasoning,
    explanation,
    confidence,
    recommendedAction,
    waterRequirementScore,
    evapoTranspirationRate,
    ruleFired
  } = decision;

  const borderLeftColor = color === 'rose' ? '#f87171' : color === 'amber' ? '#fbbf24' : color === 'sky' ? '#38bdf8' : '#34d399';
  const headlineColor = color === 'rose' ? '#fca5a5' : color === 'amber' ? '#fde68a' : color === 'sky' ? '#7dd3fc' : '#86efac';

  return (
    <div className="decision-card" id="card-decision-engine" style={{ borderLeftColor }}>
      {/* Top Banner */}
      <div className="decision-top">
        <div className="decision-banner">
          <div className="ai-brain-icon" style={{ borderColor: borderLeftColor, color: borderLeftColor }}>
            <Cpu size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 700 }}>
              Agronomic Decision Controller · Rule Matrix v1.4
            </div>
            <div className="decision-headline" style={{ color: headlineColor, fontSize: '1.35rem', fontWeight: 800, marginTop: '2px' }}>
              {headline}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="meta-pill" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Confidence:</span>
            <strong style={{ color: '#ffffff' }}>{confidence}%</strong>
          </div>
          <div className="meta-pill" style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Rule:</span>
            <strong className="font-mono" style={{ color: borderLeftColor }}>{ruleFired || 'DEFAULT_THRESHOLD'}</strong>
          </div>
        </div>
      </div>

      {/* Structured Reasoning Box */}
      <div className="decision-reason-box">
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <Activity size={16} color="var(--emerald-400)" style={{ marginTop: '2px', flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--text-highlight)' }}>Agronomic Assessment: </strong>
            <span>{reasoning}</span>
          </div>
        </div>
      </div>

      {/* 5-Step Logic Pipeline */}
      <div className="pipeline-grid">
        {/* Step 1: Telemetry Acquisition */}
        <div className="pipeline-step">
          <div className="step-label">
            <Droplet size={12} />
            <span>1. Sensor Input</span>
          </div>
          <div className="step-content">
            Soil: <strong style={{ color: 'var(--text-highlight)' }}>{telemetry?.soilMoisture}%</strong> (Raw: {telemetry?.soilRaw})
            <br />
            Temp: {telemetry?.temperature}°C · Hum: {telemetry?.humidity}%
          </div>
        </div>

        {/* Step 2: Threshold Analysis */}
        <div className="pipeline-step">
          <div className="step-label">
            <Sun size={12} />
            <span>2. Climate Factor</span>
          </div>
          <div className="step-content">
            Daylight: <strong style={{ color: 'var(--text-highlight)' }}>{telemetry?.light ? 'Active Solar' : 'Night Cycle'}</strong>
            <br />
            ET Estimate: {evapoTranspirationRate || 'Moderate'}
          </div>
        </div>

        {/* Step 3: Safety & Weather Interlock */}
        <div className="pipeline-step">
          <div className="step-label">
            <CloudRain size={12} />
            <span>3. Rain Interlock</span>
          </div>
          <div className="step-content">
            Precipitation: <strong style={{ color: telemetry?.rain ? 'var(--sky-400)' : 'var(--text-secondary)' }}>{telemetry?.rain ? 'DETECTED' : 'CLEAR'}</strong>
            <br />
            Safety Override: {telemetry?.rain ? 'BLOCKED' : 'PASS'}
          </div>
        </div>

        {/* Step 4: Actuator Command */}
        <div className="pipeline-step">
          <div className="step-label">
            <ShieldCheck size={12} />
            <span>4. Actuator Output</span>
          </div>
          <div className="step-content">
            Recommended Action:
            <br />
            <strong style={{ color: 'var(--text-highlight)' }}>{recommendedAction}</strong>
          </div>
        </div>

        {/* Step 5: System Logging */}
        <div className="pipeline-step">
          <div className="step-label">
            <FileText size={12} />
            <span>5. Audit Record</span>
          </div>
          <div className="step-content">
            Water Need Index: <strong style={{ color: 'var(--text-highlight)' }}>{waterRequirementScore}/100</strong>
            <br />
            Controller State: Synced
          </div>
        </div>
      </div>
    </div>
  );
}
