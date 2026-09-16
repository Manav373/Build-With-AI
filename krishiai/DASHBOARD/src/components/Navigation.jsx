import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Gauge, 
  Droplets, 
  LineChart, 
  History, 
  Bell, 
  Cpu, 
  Code2, 
  SlidersHorizontal 
} from 'lucide-react';

export default function Navigation({ activeTab, setActiveTab, unreadAlertsCount = 0 }) {
  const tabs = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'farm', label: 'Field Zones', icon: Layers },
    { id: 'sensors', label: 'Telemetry Details', icon: Gauge },
    { id: 'irrigation', label: 'Irrigation Controller', icon: Droplets },
    { id: 'analytics', label: 'Trend Analytics', icon: LineChart },
    { id: 'history', label: 'Session Logs', icon: History },
    { id: 'alerts', label: 'Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'hardware', label: 'Hardware Pinout', icon: Cpu },
    { id: 'firmware', label: 'Firmware (.ino)', icon: Code2 },
    { id: 'settings', label: 'Thresholds', icon: SlidersHorizontal }
  ];

  return (
    <nav className="nav-tab-bar" aria-label="System Navigation">
      <div className="nav-inner">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-btn-${tab.id}`}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="badge-count">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
