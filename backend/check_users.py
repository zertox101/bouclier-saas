import sqlite3
conn = sqlite3.connect('shield.db')
cursor = conn.cursor()
cursor.execute("SELECT email, org_id FROM users")
print("Users in shield.db:")
for row in cursor.fetchall():
    print(f"- Email: {row[0]}, OrgID: {row[1]}")
conn.close()
