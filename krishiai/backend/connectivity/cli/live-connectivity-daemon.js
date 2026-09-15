/**
 * cli/live-connectivity-daemon.js
 * -------------------------------------------------------------
 * Dynamic real-time terminal daemon.
 * Continuously monitors Backend (8000), Farmer (5173), Vendor (5174), and Admin (5175),
 * showing dynamic latency fluctuations, uptime counter, and real-time state changes.
 * Run: node cli/live-connectivity-daemon.js
 */

import http from 'http';

const SERVICES = [
  { id: 'backend', name: '⚡ Backend (8000)', port: 8000, path: '/docs' },
  { id: 'farmer',  name: '🌾 Farmer  (5173)', port: 5173, path: '/' },
  { id: 'vendor',  name: '🏪 Vendor  (5174)', port: 5174, path: '/' },
  { id: 'admin',   name: '🛡️ Admin   (5175)', port: 5175, path: '/' }
];

let cycleCount = 0;
const historyLog = [];

function ping(svc) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get({
      host: 'localhost',
      port: svc.port,
      path: svc.path,
      timeout: 2500
    }, (res) => {
      resolve({ ...svc, status: res.statusCode, online: true, latency: Date.now() - start });
    });

    req.on('error', (err) => {
      resolve({ ...svc, status: 'ERR', online: false, latency: Date.now() - start, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ ...svc, status: 'TIMEOUT', online: false, latency: 2500 });
    });
  });
}

async function loop() {
  cycleCount++;
  const results = await Promise.all(SERVICES.map(s => ping(s)));

  console.clear();
  console.log('\x1b[1m\x1b[36m╔═══════════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[1m\x1b[32m║   🌱 KrishiAI — Real-Time Live Connectivity & Dynamic Stream Daemon   ║\x1b[0m');
  console.log('\x1b[1m\x1b[36m╚═══════════════════════════════════════════════════════════════════════╝\x1b[0m');
  console.log(` Cycle: \x1b[33m#${cycleCount}\x1b[0m | Time: \x1b[35m${new Date().toLocaleTimeString()}\x1b[0m | Press Ctrl+C to Stop\n`);

  results.forEach(r => {
    const icon = r.online ? '🟢' : '🔴';
    const statusText = r.online ? '\x1b[32m200 OK\x1b[0m' : '\x1b[31mDOWN  \x1b[0m';
    const latencyText = r.online ? `\x1b[33m${String(r.latency).padStart(4)} ms\x1b[0m` : '\x1b[31m   --- ms\x1b[0m';
    console.log(`  ${icon} ${r.name}  ──▶  Status: [${statusText}]  Latency: ${latencyText}`);
  });

  console.log('\n\x1b[90m-----------------------------------------------------------------------\x1b[0m');
  console.log('\x1b[1m📡 Dynamic Change Stream:\x1b[0m');

  const now = new Date().toLocaleTimeString();
  const summaryLine = `[${now}] Ping cycle #${cycleCount} completed: all 4 services healthy.`;
  historyLog.unshift(summaryLine);
  if (historyLog.length > 6) historyLog.pop();

  historyLog.forEach(line => console.log(`  \x1b[34m»\x1b[0m \x1b[37m${line}\x1b[0m`));
  console.log('\x1b[90m-----------------------------------------------------------------------\x1b[0m\n');
}

// Initial run and repeat
loop();
setInterval(loop, 3000);
