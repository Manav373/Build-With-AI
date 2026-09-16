const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const rootDir = path.resolve(__dirname, '..');

console.log('\n📦 Building all KrishiAI domains independently...\n');

const domains = ['FARMER', 'VENDOR', 'ADMIN'];

try {
  domains.forEach(domain => {
    console.log(`[BUILD] Compiling @krishiai/${domain.toLowerCase()}...`);
    execSync(`npm run build --workspace=@krishiai/${domain.toLowerCase()}`, {
      cwd: rootDir,
      stdio: 'inherit'
    });
    console.log(`✅ [BUILD] @krishiai/${domain.toLowerCase()} compiled successfully!\n`);
  });

  // Assemble unified root dist directory for Vercel deployment
  const outDir = path.resolve(rootDir, 'dist');
  if (fs.existsSync(outDir)) {
    fs.rmSync(outDir, { recursive: true, force: true });
  }
  fs.mkdirSync(outDir, { recursive: true });

  // 1. Copy farmer build to root
  const farmerDist = path.resolve(rootDir, 'frontend/farmer/dist');
  if (fs.existsSync(farmerDist)) {
    fs.cpSync(farmerDist, outDir, { recursive: true });
    console.log('📦 Linked @krishiai/farmer to root dist/');
  }

  // 2. Copy vendor build to dist/vendor
  const vendorDist = path.resolve(rootDir, 'frontend/vendor/dist');
  if (fs.existsSync(vendorDist)) {
    fs.cpSync(vendorDist, path.resolve(outDir, 'vendor'), { recursive: true });
    console.log('📦 Linked @krishiai/vendor to dist/vendor/');
  }

  // 3. Copy admin build to dist/admin
  const adminDist = path.resolve(rootDir, 'frontend/admin/dist');
  if (fs.existsSync(adminDist)) {
    fs.cpSync(adminDist, path.resolve(outDir, 'admin'), { recursive: true });
    console.log('📦 Linked @krishiai/admin to dist/admin/');
  }

  console.log('\n🎉 All KrishiAI domains built and unified in dist/ successfully!\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
