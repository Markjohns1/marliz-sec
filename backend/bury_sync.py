
import sqlite3
import os

db_path = 'cybersec_news.db'
slug = 'malicious-phantom-shuttle-chrome-extensions-steal-credentials-from-170-sites'

print(f"Burying slug (Sync): {slug}")

if not os.path.exists(db_path):
    print(f"Error: Database {db_path} not found.")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Check if it exists in articles
cursor.execute("SELECT id FROM articles WHERE slug = ?", (slug,))
row = cursor.fetchone()
if row:
    print(f"Found in articles (ID: {row[0]}). Deleting...")
    cursor.execute("DELETE FROM articles WHERE id = ?", (row[0],))
else:
    print("Not found in articles.")

# 2. Add to graveyard (fuzzy search for any existing variant first)
cursor.execute("SELECT id FROM deleted_articles WHERE slug LIKE ?", (f"%{slug}",))
buried = cursor.fetchone()

if not buried:
    cursor.execute("INSERT INTO deleted_articles (slug, reason) VALUES (?, ?)", 
                   (slug, "Manual burial via sync script"))
    print(f"Added to graveyard: {slug}")
else:
    print(f"Already in graveyard (ID: {buried[0]})")

conn.commit()
conn.close()
print("Execution Complete.")
