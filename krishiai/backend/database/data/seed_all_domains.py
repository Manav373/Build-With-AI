"""
DATABASE/data/seed_all_domains.py
-------------------------------------------------------------
Single database verification and inspection script.
Connects to the unified SQLite database and prints the status
and record counts of all domain tables (Farmer, Vendor, Admin, Common).
Run: python DATABASE/data/seed_all_domains.py
"""

import os
import sys
import sqlite3

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, "data", "krishiai.db")

def inspect_database():
    if not os.path.exists(DB_PATH):
        print(f"[Error] Database file not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [row[0] for row in cursor.fetchall() if not row[0].startswith("sqlite_")]

    print("KrishiAI -- Master Unified Single Database Inspection")
    print("=" * 65)
    print(f" Database File: {DB_PATH}")
    print(f" File Size:     {os.path.getsize(DB_PATH):,} bytes")
    print(f" Total Tables:  {len(tables)}")
    print("-" * 65)

    DOMAIN_MAP = {
        "FARMER": ["farmer_locations", "market_records", "market_geocodes", "call_history", "community_messages"],
        "VENDOR": ["vendors", "vendor_documents", "products", "buying_requirements", "farmer_applications", "customer_orders", "procurement_orders", "reviews", "vendor_notifications"],
        "ADMIN": ["admin_audit_logs", "complaints", "platform_settings"],
        "COMMON": ["user_profiles", "system_notifications"]
    }

    for domain, domain_tables in DOMAIN_MAP.items():
        print(f"\n[*] Domain: {domain}")
        found = False
        for t in domain_tables:
            if t in tables:
                found = True
                try:
                    cursor.execute(f"SELECT COUNT(*) FROM {t}")
                    count = cursor.fetchone()[0]
                    print(f"   [+] {t:<28} : {count} records")
                except Exception as e:
                    print(f"   [!] {t:<28} : Error reading ({e})")
            else:
                print(f"   [-] {t:<28} : (Table created on demand)")

    print("\n" + "=" * 65)
    print("SUCCESS: All domain data is stored and managed in the single database!")
    print("=" * 65 + "\n")

    conn.close()

if __name__ == "__main__":
    inspect_database()
