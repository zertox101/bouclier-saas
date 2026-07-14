import sqlite3
import os

db_path = 'shield.db'
if not os.path.exists(db_path):
    print(f"File {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("[*] Applying indexes to telemetry_events...")
    try:
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at);")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_telemetry_org_id ON telemetry_events(org_id);")
        print("[+] Indexes applied successfully.")
    except Exception as e:
        print(f"[-] Error applying indexes: {e}")

    print("[*] Initializing telemetry_counters...")
    try:
        # Check if counter exists for 'default'
        cursor.execute("SELECT id FROM telemetry_counters WHERE org_id IS NOT NULL LIMIT 1")
        if not cursor.fetchone():
            cursor.execute("SELECT COUNT(*) FROM telemetry_events")
            count = cursor.fetchone()[0]
            cursor.execute("INSERT INTO telemetry_counters (org_id, events_count, alerts_count, incidents_count) VALUES (NULL, ?, 0, 0)", (count,))
            print(f"[+] Initialized counters with {count} events.")
        else:
            print("[!] Counters already initialized.")
    except Exception as e:
        print(f"[-] Error initializing counters: {e}")

    conn.commit()
    conn.close()
    print("[*] Database optimization complete.")
