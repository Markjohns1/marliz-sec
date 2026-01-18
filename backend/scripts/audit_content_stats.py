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

print("\n🚨 THIN CONTENT REPORT (< 300 Words) [LIVE ARTICLES ONLY]")
print(f"{'ID':<6} | {'WORDS':<8} | {'STATUS':<12} | {'SLUG'}")
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
"""

cursor.execute(query)
rows = cursor.fetchall()

thin_count = 0
for row in rows:
    id, slug, title, status, full_text = row
    word_count = len(full_text.split()) if full_text else 0
    
    if word_count < 300:
        thin_count += 1
        print(f"{id:<6} | \033[91m{word_count:<8}\033[0m | {status:<12} | https://marlizintel.com/article/{slug}")
        # print(f"       Title: {title}")
        # print("-" * 50)

print("-" * 100)
print(f"Total Thin Articles Found: {thin_count}")

conn.close()
