import sqlite3
import os

db_path = r'c:\Users\johnm\Desktop\PROJECTS\cybersecurity-news\backend\cybersec_news.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Count total
cursor.execute("SELECT COUNT(*) FROM articles")
total = cursor.fetchone()[0]
print(f"Total articles: {total}")

# Count READY/PUBLISHED
cursor.execute("SELECT COUNT(*) FROM articles WHERE status IN ('READY', 'PUBLISHED', 'EDITED')")
ready = cursor.fetchone()[0]
print(f"Total processed: {ready}")

# Count RAW
cursor.execute("SELECT COUNT(*) FROM articles WHERE status = 'RAW'")
raw = cursor.fetchone()[0]
print(f"Total pending (RAW): {raw}")

# Check length of summaries
threshold_chars = 4800 # Approx 800 words
cursor.execute(f"""
    SELECT a.id, length(s.friendly_summary) + length(s.attack_vector) + length(s.business_impact) as total_len
    FROM articles a 
    LEFT JOIN simplified_content s ON a.id = s.article_id 
    WHERE a.status IN ('READY', 'PUBLISHED', 'EDITED')
""")
results = cursor.fetchall()
thin_count = 0
for row in results:
    if (row[1] or 0) < threshold_chars:
        thin_count += 1

print(f"\n--- THIN CONTENT AUDIT ---")
print(f"Total processed articles: {len(results)}")
print(f"Articles BELOW 800 words: {thin_count}")
print(f"Articles ABOVE 800 words: {len(results) - thin_count}")

print("\nSample Top 5 detailed lengths (characters):")
sorted_results = sorted(results, key=lambda x: (x[1] or 0), reverse=True)
for row in sorted_results[:5]:
    print(f"ID {row[0]}: {row[1]} chars (~{row[1]//6} words)")

conn.close()
