import sqlite3
import os

db_path = 'shield.db'
if not os.path.exists(db_path):
    print(f"File {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    print("Tables in shield.db:")
    for table in tables:
        print(f"- {table[0]}")
        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table[0]}")
        count = cursor.fetchone()[0]
        print(f"  Rows: {count}")
    conn.close()
