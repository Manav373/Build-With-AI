import React from 'react';
import { 
  Activity, 
  Clock, 
  ShieldAlert, 
  User, 
  Sun, 
  Moon, 
  Sliders, 
  Cpu,
  Layers,
  Radio,
  Menu
} from 'lucide-react';

export default function Header({
  device,
  telemetry,
  timeAgo,
  userRole,
  setUserRole,
  theme,
  setTheme,
  onEmergencyStop,
  onOpenSimulator,
  onOpenConnectHardware,
  activeAlertsCount,
  firebaseStatus = 'connected',
  onOpenMobileMenu
}) {
  const isOnline = device?.status === 'online';
  const isFirebaseLive = firebaseStatus === 'connected';

  return (
    <header className="site-header">
      <div className="header-inner">
        {/* Brand */}
        <div className="brand-section">
          {onOpenMobileMenu && (
            <button
              type="button"
              onClick={onOpenMobileMenu}
              className="md:hidden flex items-center justify-center p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 mr-1"
              title="Open navigation menu"
            >
              <Menu size={18} />
            </button>
          )}
          <div className="brand-logo-icon" title="Krishi IoT Telemetry Hub">
            <Layers size={18} />
          </div>
          <div className="brand-info">
            <h1>
              <span>KRISHI IOT</span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'var(--font-mono)' }}>NODE-01</span>
            </h1>
            <div className="brand-tagline">Precision Irrigation & Agronomic Telemetry</div>
          </div>
        </div>

        {/* Node & Field Telemetry Bar */}
        <div className="header-meta">
          <div className="meta-pill" title="Assigned Field Zone">
            <span style={{ color: 'var(--text-muted)' }}>Location:</span>
            <strong>{device?.farm || 'Block A - Main'}</strong>
          </div>

          <div className="meta-pill" title="Realtime Cloud Backend">
            <span className={`status-dot ${isFirebaseLive ? 'online' : 'offline'}`}></span>
            <span>Firebase: <strong>{isFirebaseLive ? 'Realtime RTDB' : 'Connecting...'}</strong></span>
          </div>

          <div className="meta-pill" title={`ESP32 Hardware State: ${isOnline ? 'Online (status/online=true)' : 'Offline'}`}>
            <span className={`status-dot ${isOnline ? 'online' : 'offline'}`}></span>
            <strong>{isOnline ? 'ESP32 Online' : 'ESP32 Disconnected'}</strong>
          </div>

          <div className="meta-pill" title="Last Sensor Packet Received">
            <Clock size={12} color="var(--emerald-400)" />
            <span>Updated: <strong>{timeAgo}</strong></span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="header-actions">
          {/* Emergency Safety Cutoff */}
          <button 
            id="btn-emergency-stop"
            className="btn-emergency"
            onClick={onEmergencyStop}
            title="Immediate Safety Cutoff: De-energize Pump Relay"
          >
            <ShieldAlert size={14} />
            <span>EMERGENCY CUTOFF</span>
          </button>

          {/* Connect Hardware Button */}
          <button 
            id="btn-connect-hardware"
            className="btn-primary"
            onClick={onOpenConnectHardware}
            title="Configure Serial COM Port or Wi-Fi Telemetry Sync"
          >
            <Cpu size={14} />
            <span>Connect Hardware</span>
          </button>

          {/* User Role Switcher */}
          <button 
            id="btn-user-role"
            className="btn-secondary" 
            onClick={() => setUserRole(userRole === 'Admin' ? 'Operator' : 'Admin')}
            title="Switch User Permission Level"
          >
            <User size={13} color="var(--text-secondary)" />
            <span>{userRole}</span>
          </button>

          {/* Theme Toggle */}
          <button 
            id="btn-theme-toggle"
            className="btn-secondary" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title="Toggle Interface Theme"
            style={{ padding: '0.45rem 0.6rem' }}
          >
            {theme === 'dark' ? <Sun size={14} color="var(--amber-400)" /> : <Moon size={14} color="var(--sky-400)" />}
          </button>

          {/* Diagnostics / Node Simulation Drawer */}
          <button 
            id="btn-open-sim"
            className="btn-secondary" 
            onClick={onOpenSimulator}
            title="Open Test Signal Generator"
          >
            <Sliders size={13} color="var(--text-secondary)" />
            <span>Diagnostics</span>
          </button>
        </div>
      </div>
    </header>
  );
}
