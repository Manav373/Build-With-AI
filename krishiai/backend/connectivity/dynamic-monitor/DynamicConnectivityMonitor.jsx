import React, { useState, useEffect } from 'react';
import { KRISHI_DOMAINS } from '../cross-domain/portRegistry.js';
import { domainBridge } from '../cross-domain/domainBridge.js';
import { changeTracker } from './changeTracker.js';
import { healthChecker } from '../api/healthChecker.js';
import { networkTracker } from '../offline-sync/networkStatusTracker.js';
import { offlineQueue } from '../offline-sync/offlineActionQueue.js';
import { syncWorker } from '../offline-sync/syncWorker.js';

export default function DynamicConnectivityMonitor() {
  const [serviceStatus, setServiceStatus] = useState({});
  const [changes, setChanges] = useState([]);
  const [counts, setCounts] = useState({ TOTAL: 0 });
  const [networkInfo, setNetworkInfo] = useState(networkTracker.getStatus());
  const [queueCount, setQueueCount] = useState(offlineQueue.size());
  const [isPinging, setIsPinging] = useState(false);

  useEffect(() => {
    // 1. Initial snapshot of changes
    const snapshot = changeTracker.getSnapshot();
    setChanges(snapshot.changes);
    setCounts(snapshot.counts);

    // 2. Subscribe to live dynamic changes
    const unsubChanges = changeTracker.subscribe((entry, snap) => {
      setChanges([...snap.changes]);
      setCounts({ ...snap.counts });
    });

    // 3. Subscribe to network status
    const unsubNetwork = networkTracker.subscribe((status) => {
      setNetworkInfo(status);
    });

    // 4. Subscribe to health heartbeat
    const unsubHealth = domainBridge.subscribe('HEALTH_HEARTBEAT', (event) => {
      if (event.payload?.services) {
        setServiceStatus(event.payload.services);
      }
    });

    // 5. Subscribe to offline queue changes
    const unsubQueue = domainBridge.subscribe('OFFLINE_QUEUE_UPDATED', (event) => {
      setQueueCount(event.payload?.count || 0);
    });

    // 6. Start background pings
    healthChecker.startAutoPing();

    return () => {
      unsubChanges();
      unsubNetwork();
      unsubHealth();
      unsubQueue();
      healthChecker.stopAutoPing();
    };
  }, []);

  const handleManualPing = async () => {
    setIsPinging(true);
    try {
      const summary = await healthChecker.pingAll();
      setServiceStatus(summary.services);
      changeTracker.recordChange('MANUAL_PING_EXECUTED', { services: summary.services }, 'user-action');
    } finally {
      setIsPinging(false);
    }
  };

  const handleSimulateEvent = () => {
    const randomTypes = [
      'NEW_MANDI_PRICE_TICK',
      'AI_DIAGNOSIS_COMPLETED',
      'VENDOR_BID_RECEIVED',
      'SATELLITE_NDVI_STREAMED',
      'VAPI_VOICE_SESSION_START'
    ];
    const pickedType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
    domainBridge.broadcast(pickedType, {
      metric: (Math.random() * 100).toFixed(2),
      simulatedAt: new Date().toLocaleTimeString()
    }, 'simulation');
  };

  const handleReplayQueue = async () => {
    await syncWorker.processQueue();
  };

  const handleClearLog = () => {
    changeTracker.clear();
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl space-y-6 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌐</span>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                KrishiAI Dynamic Connectivity Hub
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold animate-pulse">
                  LIVE STREAM
                </span>
              </h2>
              <p className="text-xs md:text-sm text-slate-400">
                Real-time service discovery, cross-domain bus & telemetry for all 4 platform engines
              </p>
            </div>
          </div>
        </div>

        {/* Global Network Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-800">
          <div className={`w-3 h-3 rounded-full ${networkInfo.isOnline ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-ping' : 'bg-rose-500'}`} />
          <div className="text-left">
            <div className="text-xs text-slate-400 font-medium">Network Link</div>
            <div className="text-sm font-bold text-slate-200">
              {networkInfo.isOnline ? `Online (${networkInfo.connection?.effectiveType?.toUpperCase() || '4G'})` : 'Offline'}
              <span className="text-xs text-slate-400 ml-2 font-normal">{networkInfo.connection?.rtt || 0}ms RTT</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Core Domain Port Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.values(KRISHI_DOMAINS).map((dom) => {
          const status = serviceStatus[dom.id];
          const isOnline = status ? status.online : true;
          const latency = status?.latencyMs ?? 12;

          return (
            <div
              key={dom.id}
              className="relative p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{dom.icon}</span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100">{dom.name}</h3>
                    <span className="text-xs font-mono text-slate-400">Port {dom.port}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold border"
                  style={{
                    backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    borderColor: isOnline ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                    color: isOnline ? '#4ade80' : '#f87171'
                  }}
                >
                  <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                  {isOnline ? '200 OK' : 'DOWN'}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span>Latency</span>
                <span className="font-mono font-bold text-slate-200">{latency} ms</span>
              </div>

              <a
                href={dom.baseUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 block text-center py-1.5 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Open http://localhost:{dom.port} ↗
              </a>
            </div>
          );
        })}
      </div>

      {/* Control Actions & Real-Time Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/40 rounded-xl border border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleManualPing}
            disabled={isPinging}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>⚡</span> {isPinging ? 'Pinging...' : 'Ping All Services'}
          </button>

          <button
            onClick={handleSimulateEvent}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span>📡</span> Broadcast Event
          </button>

          {queueCount > 0 && (
            <button
              onClick={handleReplayQueue}
              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            >
              <span>🔄</span> Flush Offline Queue ({queueCount})
            </button>
          )}

          <button
            onClick={handleClearLog}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold transition"
          >
            Clear Log
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div>Dynamic Changes: <span className="text-emerald-400 font-bold">{counts.TOTAL}</span></div>
          <div>Offline Queue: <span className="text-amber-400 font-bold">{queueCount}</span></div>
        </div>
      </div>

      {/* Live Dynamic Changes Feed / Event Stream */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <span>🔴</span> Real-Time Dynamic Event Stream
            <span className="text-xs font-normal text-slate-500">({changes.length} recorded events)</span>
          </h4>
        </div>

        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 max-h-72 overflow-y-auto font-mono text-xs space-y-2">
          {changes.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No dynamic events recorded yet. Click "Ping All Services" or "Broadcast Event" above.
            </div>
          ) : (
            changes.map((chg) => (
              <div
                key={chg.id}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-2 hover:bg-slate-950 transition"
              >
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">[{chg.timestamp}]</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[10px]">
                    {chg.type}
                  </span>
                  <span className="text-slate-400 text-xs truncate max-w-md">
                    {typeof chg.details === 'object' ? JSON.stringify(chg.details) : chg.details}
                  </span>
                </div>

                <div className="text-right text-[11px] text-slate-500">
                  via <span className="text-slate-300 font-semibold">{chg.source}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
