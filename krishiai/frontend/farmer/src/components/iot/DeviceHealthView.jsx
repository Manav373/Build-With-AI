import React from 'react';
import { Cpu, Wifi, Shield, Zap, Server, Activity } from 'lucide-react';

export default function DeviceHealthView({ device, telemetry, isFirebaseConnected }) {
  const pinouts = [
    { component: 'Capacitive Moisture V1.2', pin: 'GPIO 5', type: 'Analog (ADC1_CH6)', note: '0–4095 ADC (1400 wet, 3200 dry)' },
    { component: 'DHT11 Temp & Humidity', pin: 'GPIO 25', type: '1-Wire Digital', note: 'Single-bus microclimate telemetry' },
    { component: 'FC-37 Rain Detector', pin: 'GPIO 27', type: 'Digital Input', note: 'Active LOW raindrop conductivity' },
    { component: 'HW-072 Daylight Sensor', pin: 'GPIO 34', type: 'Digital Input', note: 'Active LOW day/night threshold' },
    { component: 'LCD I2C Display (16x2)', pin: 'SDA 21 / SCL 22', type: 'I2C Bus (0x27)', note: 'Field-side live status display' },
    { component: 'Relay Pump Actuator', pin: 'GPIO 26', type: 'Digital Output', note: 'Active LOW 10A 250VAC switched' },
  ];

  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-6 shadow-sm dark:shadow-xl backdrop-blur-sm space-y-6">
      {/* Node status card */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Controller Node</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
            <Cpu size={15} className="text-emerald-600 dark:text-emerald-400" />
            ESP32 DevKit V1
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Wi-Fi & Cloud RSSI</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-mono">
            <Wifi size={15} />
            {device?.rssi || -64} dBm (Good)
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Node Uptime</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
            {Math.floor((device?.uptimeMinutes || 412) / 60)}h {(device?.uptimeMinutes || 412) % 60}m
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Data Channel</span>
          <span className="text-sm font-bold text-orange-600 dark:text-orange-400 font-mono">
            {isFirebaseConnected ? 'Firebase RTDB' : 'FastAPI REST / WS'}
          </span>
        </div>
      </div>

      {/* Pinout Table */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">
          ESP32 Hardware Pin Mapping (PRD Section 2)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 font-mono text-[10px] uppercase border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-2 px-3">Component</th>
                <th className="py-2 px-3">ESP32 Pin</th>
                <th className="py-2 px-3">Logic Signal</th>
                <th className="py-2 px-3">Specification / Range</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
              {pinouts.map((p, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                  <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{p.component}</td>
                  <td className="py-2 px-3 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{p.pin}</td>
                  <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{p.type}</td>
                  <td className="py-2 px-3 text-slate-500 dark:text-slate-400 text-[11px]">{p.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
