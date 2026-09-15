import React, { useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, Power, X } from 'lucide-react';

export default function PumpControlModal({ isOpen, onClose, onConfirm, userRole = 'Admin' }) {
  const [duration, setDuration] = useState(5);
  const [customReason, setCustomReason] = useState('Manual irrigation cycle');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm({
      durationMinutes: Number(duration),
      reason: customReason,
      user: `${userRole} (Manual Override)`
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-pump-title">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Power size={18} color="var(--emerald-400)" />
            </div>
            <h3 id="modal-pump-title" style={{ fontSize: '1.15rem' }}>Confirm Pump Activation</h3>
          </div>
          <button 
            id="btn-close-modal"
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '0.35rem 0.5rem', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
          Are you sure you want to start field irrigation? The ESP32 will energize Relay GPIO 26 to power the water pump.
        </p>

        {/* Duration Selection (Safety Enforced) */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Select Run Duration (Safety Cutoff):
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
            {[2, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                className={`btn-secondary ${duration === mins ? 'active' : ''}`}
                style={{ 
                  padding: '0.5rem 0.25rem',
                  fontSize: '0.85rem',
                  borderColor: duration === mins ? 'var(--emerald-500)' : 'var(--border-subtle)',
                  background: duration === mins ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                  color: duration === mins ? 'var(--emerald-400)' : 'var(--text-primary)',
                  fontWeight: 700
                }}
                onClick={() => setDuration(mins)}
              >
                {mins} min
              </button>
            ))}
          </div>
        </div>

        {/* Reason / Operator note */}
        <div style={{ marginBottom: '1.25rem' }}>
          <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
            Operator Reason:
          </label>
          <input 
            type="text" 
            value={customReason} 
            onChange={(e) => setCustomReason(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '0.65rem 0.85rem', 
              background: 'rgba(0, 0, 0, 0.4)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: 'var(--radius-md)', 
              color: 'var(--text-primary)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        {/* Operator Badge */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)', 
          border: '1px solid var(--border-subtle)', 
          borderRadius: 'var(--radius-sm)', 
          padding: '0.6rem 0.85rem',
          fontSize: '0.8rem',
          marginBottom: '1.5rem'
        }}>
          <span style={{ color: 'var(--text-muted)' }}>Authorized Operator:</span>
          <strong style={{ color: 'var(--sky-400)' }}>{userRole}</strong>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button id="btn-modal-cancel" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button id="btn-modal-start-pump" className="btn-primary" onClick={handleConfirm}>
            <Power size={16} />
            <span>Start Pump ({duration} min)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
