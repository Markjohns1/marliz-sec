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

print("\n📊 CONTENT HEALTH REPORT")
print(f"{'ID':<6} | {'WORDS':<8} | {'STATUS':<10} | {'TITLE'}")
print("-" * 100)

query = """
    SELECT id, title, content, status 
    FROM articles 
    WHERE status != 'deleted'
    ORDER BY length(content) ASC
"""

cursor.execute(query)
rows = cursor.fetchall()
word_counts = []
thin_count = 0
ok_count = 0
rich_count = 0

for row in rows:
    id, title, content, status = row
    word_count = len(content.split()) if content else 0
    word_counts.append(word_count)
    
    color = ""
    if word_count < 300:
        thin_count += 1
        color = "\033[91m" # RED
    elif word_count > 1000:
        rich_count += 1
        color = "\033[92m" # GREEN
    else:
        ok_count += 1
        
    print(f"{id:<6} | {color}{word_count:<8}\033[0m | {status:<10} | {title[:60]}")

print("-" * 100)
avg_words = sum(word_counts) / len(word_counts) if word_counts else 0

print(f"\n📈 STATISTICS:")
print(f"   Total Articles: {len(rows)}")
print(f"   Avg Word Count: {int(avg_words)}")
print(f"   🔴 Thin (<300): {thin_count}  (Action: EXPAND)")
print(f"   ⚪ OK (300-1k): {ok_count}   (Action: MAINTAIN)")
print(f"   🟢 Rich (>1k):  {rich_count}   (Action: PROMOTE)")

conn.close()
