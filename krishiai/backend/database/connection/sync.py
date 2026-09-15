"""
shared/database/sync.py — Unified Database Schema Sync & Migration Helper
--------------------------------------------------------------------------
Synchronizes tables and columns across all domains (Shared, Farmer, Vendor).
"""
import os
import sqlite3
try:
    from DATABASE.connection.connection import engine, Base
    import DATABASE.models  # noqa - registers all domain models
except ImportError:
    from database.connection.connection import engine, Base
    import database.models  # noqa - registers all domain models

def sync_database():
    """Verify and auto-sync schema across all registered models."""
    db_file = "krishiai.db"
    if not os.path.exists(db_file):
        print("[DB Sync] Creating fresh database tables...")
        Base.metadata.create_all(bind=engine)
        print("[DB Sync] Database created successfully!")
        return

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    for table_name, table in Base.metadata.tables.items():
        cursor.execute(f"PRAGMA table_info('{table_name}')")
        db_cols = {r[1] for r in cursor.fetchall()}
        if not db_cols:
            continue
        for col in table.columns:
            if col.name not in db_cols:
                col_type = str(col.type).upper()
                if any(t in col_type for t in ['VARCHAR', 'STRING', 'TEXT', 'ENUM', 'JSON']):
                    sql_type = 'TEXT'
                elif 'INT' in col_type:
                    sql_type = 'INTEGER'
                elif 'FLOAT' in col_type or 'REAL' in col_type or 'NUMERIC' in col_type:
                    sql_type = 'REAL'
                elif 'BOOL' in col_type:
                    sql_type = 'BOOLEAN'
                elif 'DATETIME' in col_type or 'DATE' in col_type:
                    sql_type = 'DATETIME'
                else:
                    sql_type = 'TEXT'
                
                alter_stmt = f"ALTER TABLE {table_name} ADD COLUMN {col.name} {sql_type}"
                try:
                    cursor.execute(alter_stmt)
                except Exception as e:
                    print(f"[DB Sync] Error adding column {col.name}: {e}")

    conn.commit()
    conn.close()

    Base.metadata.create_all(bind=engine)
    print("[DB Sync] Database schema verified & synced successfully.")

if __name__ == "__main__":
    sync_database()
