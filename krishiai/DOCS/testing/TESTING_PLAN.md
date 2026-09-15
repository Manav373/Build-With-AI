# 🧪 KrishiAI — Master Testing & Verification Plan

> **Quality Assurance, Independent Build Checks, and Cross-Domain Verification Matrix**

---

## 1. Multi-Tier Verification Matrix

| Tier | Objective | Methodology | Success Criteria |
|---|---|---|---|
| **Tier 1: Domain Build Independence** | Confirm FARMER, VENDOR, and ADMIN bundle with zero cross-leakage | Vite production bundler (`npm run build`) | Output written to `/dist` with 0 unresolved imports |
| **Tier 2: API Contract Compliance** | Verify endpoints respond with expected schema and status | Automated Node.js HTTP probe | HTTP 200 on all primary public and auth-protected routes |
| **Tier 3: Domain Isolation** | Ensure domain frontends do not import other domains | Static AST and import grep | 0 instances of cross-domain imports |
| **Tier 4: Cross-Domain Workflow Synchronization** | Validate that state changes in one domain propagate to others | End-to-end database record tracing | Harvest posted in Farmer ➔ Visible in Vendor ➔ Tracked in Admin |

---

## 2. Automated Test Commands

### 1. Independent Domain Production Builds
```bash
# Verify Farmer bundle
npm run build:farmer

# Verify Vendor bundle
npm run build:vendor

# Verify Admin bundle
npm run build:admin

# Unified build runner
npm run build:all
```

### 2. Live Runtime Connectivity Audit
```bash
node SCRIPTS/audit-connectivity.js
```
Expected output:
- `[Backend] http://localhost:8000/docs -> HTTP 200 OK`
- `[Farmer ] http://localhost:5173/     -> HTTP 200 OK`
- `[Vendor ] http://localhost:5174/     -> HTTP 200 OK`
- `[Admin  ] http://localhost:5175/     -> HTTP 200 OK`

---

## 3. Manual Functional Verification Checklist

### Farmer Domain (`http://localhost:5173`)
- [ ] Landing page loads without errors
- [ ] AI Agronomist Chat sends prompt and renders response
- [ ] Mandi Price trend chart displays live price series
- [ ] Satellite vegetative map initializes and renders Leaflet layer
- [ ] Crop yield predictor accepts inputs and calculates estimate
- [ ] Navigation header contains strictly Farmer tools (no vendor tenders or admin logs)

### Vendor Domain (`http://localhost:5174`)
- [ ] Dashboard overview displays active counts and fulfillment status
- [ ] Marketplace requirements list farmer crop postings
- [ ] Tenders page allows creating and viewing contract farming tenders
- [ ] Warehouse slot manager displays storage grid
- [ ] Navigation sidebar contains strictly commercial procurement features

### Admin Domain (`http://localhost:5175`)
- [ ] Master dashboard displays platform telemetry (active users, GMV, latency)
- [ ] Vendor KYC verification queue displays statutory documents
- [ ] Product moderation desk allows filtering catalog items
- [ ] Audit logs table updates on system actions with IP addresses
