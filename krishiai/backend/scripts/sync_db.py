"""
DB Migration Helper — KrishiAI
Checks for missing columns in existing SQLite tables and adds them automatically.
"""
import sys
import os
import sqlite3

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.db.database import engine, Base
import app.models.location  # noqa
import app.models.market    # noqa
import app.models.vapi_model # noqa
import app.models.community_model # noqa
import app.models.vendor  # noqa

def sync_database():
    db_file = "krishiai.db"
    if not os.path.exists(db_file):
        print("[DB Sync] No existing krishiai.db file found. Creating fresh database...")
        Base.metadata.create_all(bind=engine)
        print("[DB Sync] Database created successfully!")
        return

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    for table_name, table in Base.metadata.tables.items():
        cursor.execute(f"PRAGMA table_info('{table_name}')")
        db_cols = {r[1] for r in cursor.fetchall()}
        if not db_cols:
            print(f"[DB Sync] Table '{table_name}' does not exist yet.")
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
                print(f"[DB Sync] Adding column: {alter_stmt}")
                try:
                    cursor.execute(alter_stmt)
                except Exception as e:
                    print(f"[DB Sync] Error adding column {col.name}: {e}")

    conn.commit()
    conn.close()

    Base.metadata.create_all(bind=engine)
    print("[DB Sync] Database schema sync completed successfully!")

if __name__ == "__main__":
    sync_database()
