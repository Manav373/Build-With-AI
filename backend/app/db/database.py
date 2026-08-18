"""
app/db/database.py – SQLAlchemy engine and session factory
-----------------------------------------------------------
Uses SQLite locally (zero-config).
Set DATABASE_URL env var to a Postgres URL on Railway/production.
"""
import os
import socket
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import make_url

# Default: local SQLite file in the backend directory
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./krishiai.db")
FORCE_SQLITE = os.getenv("FORCE_SQLITE", "false").lower() == "true"

# Fallback Logic:
# 1. If FORCE_SQLITE is set, always use SQLite.
# 2. If it's an internal Render hostname (dpg-...) but we aren't on Render, it won't resolve.
# 3. External Render URLs MUST end in .render.com. If dpg- is present but .render.com is missing, it's internal.
is_internal_render = "dpg-" in DATABASE_URL and ".render.com" not in DATABASE_URL
if FORCE_SQLITE or (is_internal_render and not os.getenv("RENDER")):
    print("[DB] Force Local Mode or Internal Render URL detected. Using local SQLite.")
    DATABASE_URL = "sqlite:///./krishiai.db"

# Normalize postgres:// to postgresql:// (SQLAlchemy requirement)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# If using PostgreSQL (Supabase, etc.), force IPv4 to avoid IPv6 connectivity issues in containers,
# and ensure SSL mode is set to require (Supabase requirement).
if DATABASE_URL.startswith("postgresql://"):
    try:
        url = make_url(DATABASE_URL)
        hostname = url.host
        port = url.port or 5432

        # Resolve IPv4 address for the hostname (bypass IPv6)
        addrinfo = socket.getaddrinfo(hostname, port, family=socket.AF_INET, type=socket.SOCK_STREAM)
        if addrinfo:
            ipv4_addr = addrinfo[0][4][0]  # sockaddr tuple
            # Preserve existing query params and add hostaddr
            query_params = dict(url.query)
            query_params['hostaddr'] = ipv4_addr
            # Ensure sslmode=require (Supabase requires SSL)
            query_params.setdefault('sslmode', 'require')
            # Rebuild URL with hostaddr; keep host unchanged for SSL certificate validation
            new_url = url.set(query=query_params)
            DATABASE_URL = str(new_url)
            print(f"[DB] Forced IPv4 for {hostname}: {ipv4_addr}")
        else:
            print(f"[DB] No IPv4 address found for {hostname}, using original")
    except Exception as e:
        print(f"[DB] IPv4 forcing failed: {e}, continuing with original URL")

# SQLite needs check_same_thread=False; ignored for other DBs
connect_args = {"check_same_thread": False, "timeout": 20} if DATABASE_URL.startswith("sqlite") else {}

# For Supabase/Remote Postgres, add pooling optimizations
engine_args = {
    "connect_args": connect_args,
}

if not DATABASE_URL.startswith("sqlite"):
    # Supabase/Cloud DBs benefit from periodic pool recycling to prevent idle connection kills
    engine_args.update({
        "pool_size": 5,
        "max_overflow": 10,
        "pool_recycle": 300,
        "pool_pre_ping": True
    })

try:
    engine = create_engine(DATABASE_URL, **engine_args)
except Exception as e:
    print(f"[DB] Failed to create engine for {DATABASE_URL}: {e}")
    # Final safety fallback
    DATABASE_URL = "sqlite:///./krishiai.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
