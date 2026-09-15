# 🚀 KrishiAI — Deployment Architecture

## 1. Multi-Domain Hosting Model

All three frontend applications live within the same repository but deploy as separate static site artifacts (e.g. on Vercel, Netlify, Cloudflare Pages, or AWS S3/CloudFront):

```text
                        KrishiAI Repository
                                 │
           ┌─────────────────────┼─────────────────────┐
           │                     │                     │
      apps/farmer           apps/vendor           apps/admin
           │                     │                     │
    npm run build:farmer   npm run build:vendor   npm run build:admin
           │                     │                     │
       dist/ (Farmer)        dist/ (Vendor)        dist/ (Admin)
           │                     │                     │
           ▼                     ▼                     ▼
   farmer.krishiai.com   vendor.krishiai.com    admin.krishiai.com
           │                     │                     │
           └─────────────────────┼─────────────────────┘
                                 │
                                 ▼
                     https://api.krishiai.com
                        (FastAPI on Port 8000)
```

---

## 2. Vercel Configuration (Example)

For Vercel or similar monorepo-aware hosts, configure each Project's **Root Directory**:

| Project Name | Root Directory | Build Command | Output Directory |
|---|---|---|---|
| `krishiai-farmer` | `apps/farmer` | `npm run build` | `dist` |
| `krishiai-vendor` | `apps/vendor` | `npm run build` | `dist` |
| `krishiai-admin` | `apps/admin` | `npm run build` | `dist` |

---

## 3. Local Development

```powershell
# From the repository root:

# Run Farmer App (Port 5173)
npm run dev:farmer

# Run Vendor App (Port 5174)
npm run dev:vendor

# Run Admin App (Port 5175)
npm run dev:admin

# Build all applications
npm run build:all
```
