"""
backend/shared/database/connection.py
-------------------------------------
Re-exports unified database connection from backend.database.connection.connection
"""
try:
    from database.connection.connection import Base, engine, SessionLocal, get_db, DATABASE_URL
except ImportError:
    from app.db.database import Base, engine, SessionLocal, get_db, DATABASE_URL

__all__ = ["Base", "engine", "SessionLocal", "get_db", "DATABASE_URL"]
