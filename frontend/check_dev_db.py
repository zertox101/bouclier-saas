import sqlite3
import os

db_path = 'dev.db'
if not os.path.exists(db_path):
    print(f"File {db_path} not found.")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = cursor.fetchall()
    for table_info in tables:
        table = table_info[0]
        print(f"--- Table: {table} ---")
        cursor.execute(f"SELECT * FROM {table}")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    conn.close()
