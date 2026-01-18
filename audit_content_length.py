import sqlite3
import os

# Try to find the DB
DB_PATH = None
for p in ["backend/cybersec_news.db", "cybersec_news.db", "../cybersec_news.db"]:
    if os.path.exists(p):
        DB_PATH = p
        break

if not DB_PATH:
    print("❌ No Database Found locally.")
    exit(1)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

print(f"📊 Auditing Content Length in: {DB_PATH}")
print("-" * 80)
print(f"{'ID':<5} | {'WORDS':<8} | {'STATUS':<10} | {'TITLE'}")
print("-" * 80)

query = """
    SELECT id, title, content, status 
    FROM articles 
    WHERE status IN ('published', 'ready', 'edited')
    ORDER BY length(content) ASC
"""

cursor.execute(query)
rows = cursor.fetchall()
thin_count = 0

for row in rows:
    id, title, content, status = row
    # HTML stripping approx logic (very rough, just counting spaces)
    # A better way is to strip tags, but raw length is a good proxy for now.
    word_count = len(content.split()) if content else 0
    
    if word_count < 300:
        thin_count += 1
        print(f"{id:<5} | \033[91m{word_count:<8}\033[0m | {status:<10} | {title[:50]}...")
    else:
        # Print only the first few healthy ones to save space, or print all if requested
        pass # Only showing THIN ones for now to highlight the problem

print("-" * 80)
print(f"Total Live Articles: {len(rows)}")
print(f"⚠️  THIN Articles (< 300 words): {thin_count}")

conn.close()
