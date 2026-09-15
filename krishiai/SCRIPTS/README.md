# 🛠️ SCRIPTS — KrishiAI Automation & Orchestration Suite

> **Development, Build, and Verification Utilities for the Monorepo**

---

## Available Scripts

### 1. `dev-all.js`
Launches the 3 frontend domains concurrently:
- Farmer (`http://localhost:5173`)
- Vendor (`http://localhost:5174`)
- Admin (`http://localhost:5175`)

**Run**:
```bash
node SCRIPTS/dev-all.js
# Or via npm
npm run dev:all
```

### 2. `audit-connectivity.js`
Probes all 4 platform engines (FastAPI backend + 3 frontend portals) over HTTP and validates status codes.

**Run**:
```bash
node SCRIPTS/audit-connectivity.js
# Or via npm
npm run audit
```

### 3. `build-all.js`
Executes isolated production builds for Farmer, Vendor, and Admin sequentially to verify 0 bundling errors.

**Run**:
```bash
node SCRIPTS/build-all.js
# Or via npm
npm run build:all
```
