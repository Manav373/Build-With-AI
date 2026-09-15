# ⚙️ KrishiAI — Database Configuration & Connection Specifications

> **Engine Configuration, Connection Pooling, and Environment Profiles**

---

## 1. Connection Configurations

The backend automatically connects to the unified database based on the `DATABASE_URL` environment variable:

### Local Development (Default)
```python
DATABASE_URL = "sqlite:///./krishiai.db"
connect_args = {"check_same_thread": False}
```

### Production / PostgreSQL
```python
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://krishi_admin:secure_pass@db:5432/krishiai_master")
```

---

## 2. Pooling Specifications (Production)

| Setting | Recommended Value | Purpose |
|---|---|---|
| `pool_size` | `20` | Base persistent connection pool |
| `max_overflow` | `10` | Max burst connections during peak mandi trading hours |
| `pool_timeout` | `30` | Max seconds to wait before timing out connection request |
| `pool_recycle` | `1800` | Prevent stale connection drops from firewalls (30 mins) |
| `echo` | `False` | Disable raw SQL logging in production |

---

## 3. Environment Variables Reference

```env
# Backend Database Configuration (NEVER expose to frontend)
DATABASE_URL=postgresql://user:password@localhost:5432/krishiai
DB_POOL_SIZE=20
DB_MAX_OVERFLOW=10
```
