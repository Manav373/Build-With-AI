const { execSync } = require('child_process');
const path = require('path');

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

  console.log('🎉 All KrishiAI domains built successfully with 0 errors!\n');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}
