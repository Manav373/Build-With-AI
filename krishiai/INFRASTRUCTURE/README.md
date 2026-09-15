# 🌐 INFRASTRUCTURE — KrishiAI Deployment & Container Infrastructure

> **Containerization, Orchestration, and Reverse Proxy Configurations**

---

## 📁 Layout

```
INFRASTRUCTURE/
├── docker/                    # Dockerfiles & docker-compose.yml
│   ├── docker-compose.yml     # Multi-domain local/production stack
│   └── Dockerfile.backend     # Production FastAPI image definition
├── deployment/                # Nginx & reverse proxy configs
│   └── nginx.conf             # Subdomain routing (farmer, vendor, admin)
└── README.md
```

---

## 🐳 Running with Docker Compose

```bash
docker-compose -f INFRASTRUCTURE/docker/docker-compose.yml up --build
```
This boots:
- `backend`: FastAPI Python server on port 8000
- `postgres`: Master relational database on port 5432
- `nginx`: Reverse proxy serving static frontends and routing `/api/` traffic
