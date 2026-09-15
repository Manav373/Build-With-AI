# 🚀 KrishiAI — Deployment & Multi-Domain Routing Architecture

> **Production Deployment Topography for 3 Frontend Domains and 1 Central Backend**

---

## 1. Multi-Domain Routing Topography

In production, each domain operates on a dedicated subdomain routed via a central Reverse Proxy (Nginx, Caddy, or Cloudflare):

```text
                                INCOMING TRAFFIC
                                       │
                                       ▼
                             ┌───────────────────┐
                             │   REVERSE PROXY   │ (Nginx / Cloudflare)
                             └─────────┬─────────┘
                                       │
     ┌─────────────────────────────────┼─────────────────────────────────┐
     │                                 │                                 │
     ▼                                 ▼                                 ▼
farmer.krishiai.com             vendor.krishiai.com               admin.krishiai.com
  (Farmer Static SPA)             (Vendor Static SPA)              (Admin Static SPA)
  Served from /FARMER/dist        Served from /VENDOR/dist         Served from /ADMIN/dist
     │                                 │                                 │
     └─────────────────────────────────┼─────────────────────────────────┘
                                       │
                                       ▼ (Proxy Pass /api/*)
                             ┌───────────────────┐
                             │  CENTRAL BACKEND  │ (FastAPI: Port 8000)
                             └─────────┬─────────┘
                                       │
                                       ▼
                             ┌───────────────────┐
                             │  MASTER DATABASE  │ (PostgreSQL: Port 5432)
                             └───────────────────┘
```

---

## 2. Port Allocation (Local Development)

| Engine | Port | URL | Description |
|---|---|---|---|
| **🌾 FARMER** | `5173` | `http://localhost:5173` | Farmer Portal |
| **🏪 VENDOR** | `5174` | `http://localhost:5174` | Vendor Portal |
| **🛡️ ADMIN** | `5175` | `http://localhost:5175` | Admin Master Console |
| **🔒 BACKEND** | `8000` | `http://localhost:8000` | Central FastAPI Server & Swagger UI (`/docs`) |

---

## 3. Sample Nginx Virtual Host Configuration

```nginx
# 1. FARMER SUBDOMAIN
server {
    listen 80;
    server_name farmer.krishiai.com;
    root /var/www/krishiai/FARMER/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Krishi-Domain "farmer";
    }
}

# 2. VENDOR SUBDOMAIN
server {
    listen 80;
    server_name vendor.krishiai.com;
    root /var/www/krishiai/VENDOR/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Krishi-Domain "vendor";
    }
}

# 3. ADMIN SUBDOMAIN
server {
    listen 80;
    server_name admin.krishiai.com;
    root /var/www/krishiai/ADMIN/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Krishi-Domain "admin";
    }
}
```
