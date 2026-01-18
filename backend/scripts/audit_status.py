import sqlite3
import os

# --- FIND DATABASE ---
DB_PATHS = ["backend/cybersec_news.db", "cybersec_news.db", "../cybersec_news.db"]
db_path = None
for p in DB_PATHS:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        break

if not db_path:
    print("❌ Critical: No database found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print(f"📊 CHECKING STATUS VALUES in {db_path}")
print("-" * 50)

# Check unique statuses
cursor.execute("SELECT status, count(*) FROM articles GROUP BY status")
rows = cursor.fetchall()

for row in rows:
    status, count = row
    print(f"Status: '{status}' | Count: {count}")

print("-" * 50)
conn.close()
