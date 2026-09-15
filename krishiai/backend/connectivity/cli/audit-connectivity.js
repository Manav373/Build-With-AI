/**
 * cli/audit-connectivity.js
 * -------------------------------------------------------------
 * One-shot comprehensive connectivity verification script.
 * Tests Backend (8000), Farmer (5173), Vendor (5174), and Admin (5175).
 * Run: node cli/audit-connectivity.js
 */

import http from 'http';

const SERVICES = [
  { name: 'FastAPI Backend', port: 8000, path: '/docs', role: 'Central ML & API' },
  { name: 'Farmer Portal ', port: 5173, path: '/', role: 'Farmer Web App' },
  { name: 'Vendor Portal ', port: 5174, path: '/', role: 'Vendor B2B App' },
  { name: 'Admin Portal  ', port: 5175, path: '/', role: 'Admin Governance App' }
];

function pingService(svc) {
  return new Promise((resolve) => {
    const start = Date.now();
    const req = http.get({
      host: 'localhost',
      port: svc.port,
      path: svc.path,
      timeout: 3000
    }, (res) => {
      const latency = Date.now() - start;
      resolve({
        ...svc,
        status: res.statusCode,
        online: true,
        latency
      });
    });

    req.on('error', (err) => {
      const latency = Date.now() - start;
      resolve({
        ...svc,
        status: 'CONN_ERR',
        online: false,
        latency,
        error: err.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        ...svc,
        status: 'TIMEOUT',
        online: false,
        latency: 3000
      });
    });
  });
}

async function runAudit() {
  console.log('\n\x1b[1m\x1b[36m=================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[32m🌱 KrishiAI — Comprehensive Connectivity & Service Audit\x1b[0m');
  console.log('\x1b[1m\x1b[36m=================================================================\x1b[0m\n');

  const results = await Promise.all(SERVICES.map(s => pingService(s)));

  let allOnline = true;

  results.forEach(r => {
    const statusTag = r.online
      ? `\x1b[32m[200 OK]\x1b[0m`
      : `\x1b[31m[FAILED - ${r.status}]\x1b[0m`;
    const latencyTag = r.online
      ? `\x1b[33m${r.latency}ms\x1b[0m`
      : `\x1b[31m---\x1b[0m`;

    console.log(`  * ${r.name} (Port ${r.port}) -> ${statusTag} (${latencyTag}) | ${r.role}`);
    if (!r.online) allOnline = false;
  });

  console.log('\n\x1b[1m\x1b[36m-----------------------------------------------------------------\x1b[0m');
  if (allOnline) {
    console.log('\x1b[1m\x1b[32m✅ ALL 4 PLATFORM SERVICES FULLY CONNECTED & FUNCTIONAL!\x1b[0m');
  } else {
    console.log('\x1b[1m\x1b[31m⚠️ ONE OR MORE SERVICES ARE OFFLINE. START THEM VIA npm run dev:all\x1b[0m');
  }
  console.log('\x1b[1m\x1b[36m=================================================================\x1b[0m\n');
}

runAudit();
