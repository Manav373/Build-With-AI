const http = require('http');

const endpoints = [
  { name: 'FastAPI Backend Swagger', url: 'http://localhost:8000/docs', domain: 'backend' },
  { name: 'Farmer Web Portal', url: 'http://localhost:5173/', domain: 'farmer' },
  { name: 'Vendor Web Portal', url: 'http://localhost:5174/', domain: 'vendor' },
  { name: 'Admin Master Console', url: 'http://localhost:5175/', domain: 'admin' },
];

console.log('\n🔍 ============================================================');
console.log('   KRISHIAI — END-TO-END CONNECTIVITY & HEALTH AUDIT');
console.log('============================================================\n');

let checked = 0;
let passed = 0;

endpoints.forEach((ep) => {
  const req = http.get(ep.url, (res) => {
    checked++;
    const isOk = res.statusCode >= 200 && res.statusCode < 400;
    if (isOk) passed++;
    const statusColor = isOk ? '\x1b[32m' : '\x1b[31m';
    console.log(`[${ep.domain.toUpperCase()}] ${ep.name.padEnd(28)} -> ${statusColor}HTTP ${res.statusCode}\x1b[0m (${ep.url})`);

    if (checked === endpoints.length) {
      printSummary();
    }
  });

  req.on('error', (err) => {
    checked++;
    console.log(`[${ep.domain.toUpperCase()}] ${ep.name.padEnd(28)} -> \x1b[31mFAIL (Connection Refused)\x1b[0m (${ep.url})`);
    if (checked === endpoints.length) {
      printSummary();
    }
  });

  req.setTimeout(5000, () => {
    req.destroy();
  });
});

function printSummary() {
  console.log('\n------------------------------------------------------------');
  console.log(`Total Services Probed: ${checked} | Healthy: ${passed} | Failures: ${checked - passed}`);
  console.log('------------------------------------------------------------\n');
  process.exit(passed === checked ? 0 : 1);
}
