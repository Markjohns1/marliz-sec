import sqlite3
import os
import sys

# --- FIND DATABASE ---
DB_PATHS = ["backend/cybersec_news.db", "cybersec_news.db", "../cybersec_news.db"]
db_path = None
for p in DB_PATHS:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        break

if not db_path:
    print("❌ Critical: No database found.")
    sys.exit(1)

print(f"✅ Target Database: {db_path}")

# --- AUDIT ---
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

print("\n✅ LIVE CONTENT AUDIT (ALL ACTIVE ARTICLES)")
print(f"{'ID':<6} | {'WORDS':<8} | {'STATUS':<12} | {'TITLE'}")
print("-" * 110)

query = """
    SELECT 
        a.id, 
        a.slug,
        a.title,
        a.status,
        COALESCE(sc.friendly_summary, '') || ' ' || 
        COALESCE(sc.attack_vector, '') || ' ' || 
        COALESCE(sc.business_impact, '') as full_text
    FROM articles a
    LEFT JOIN simplified_content sc ON a.id = sc.article_id
    WHERE a.status IN ('published', 'ready', 'edited')
    ORDER BY length(
        COALESCE(sc.friendly_summary, '') || 
        COALESCE(sc.attack_vector, '') || 
        COALESCE(sc.business_impact, '')
    ) ASC
"""

cursor.execute(query)
rows = cursor.fetchall()

for row in rows:
    id, slug, title, status, full_text = row
    word_count = len(full_text.split()) if full_text else 0
    
    color = "\033[92m" # GREEN
    if word_count < 500: color = "\033[93m" # YELLOW
    if word_count < 300: color = "\033[91m" # RED
    
    print(f"{id:<6} | {color}{word_count:<8}\033[0m | {status:<12} | {title[:60]}")

print("-" * 110)
print(f"Total Live Articles: {len(rows)}")
        # print(f"       Title: {title}")
        # print("-" * 50)

print("-" * 100)
print(f"Total Thin Articles Found: {thin_count}")

conn.close()
