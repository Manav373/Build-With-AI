const { spawn } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '../..');

const services = [
  { name: 'Farmer', port: 5173, cmd: 'npm', args: ['run', 'dev', '--workspace=FARMER'], color: '\x1b[32m' },
  { name: 'Vendor', port: 5174, cmd: 'npm', args: ['run', 'dev', '--workspace=VENDOR'], color: '\x1b[36m' },
  { name: 'Admin ', port: 5175, cmd: 'npm', args: ['run', 'dev', '--workspace=ADMIN'], color: '\x1b[35m' }
];

console.log('\x1b[1m\x1b[33m%s\x1b[0m', '🌱 Starting KrishiAI Portals (Farmer: 5173, Vendor: 5174, Admin: 5175)...');

const children = [];

services.forEach(svc => {
  const isWindows = process.platform === 'win32';
  const executable = isWindows ? `${svc.cmd}.cmd` : svc.cmd;
  
  const child = spawn(executable, svc.args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true
  });

  child.on('error', (err) => {
    console.error(`${svc.color}[${svc.name}]\x1b[0m Error:`, err);
  });

  children.push(child);
});

function cleanup() {
  console.log('\n\x1b[33mShutting down KrishiAI dev servers...\x1b[0m');
  children.forEach(child => {
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', child.pid, '/f', '/t']);
      } else {
        child.kill('SIGTERM');
      }
    } catch (e) {
      // Ignore cleanup error
    }
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
