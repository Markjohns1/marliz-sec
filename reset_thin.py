import sqlite3
import os

db_path = r'c:\Users\johnm\Desktop\PROJECTS\cybersecurity-news\backend\cybersec_news.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Find IDs of thin content
threshold_chars = 4800
cursor.execute("""
    SELECT a.id 
    FROM articles a 
    LEFT JOIN simplified_content s ON a.id = s.article_id 
    WHERE (length(COALESCE(s.friendly_summary, '')) + 
           length(COALESCE(s.attack_vector, '')) + 
           length(COALESCE(s.business_impact, ''))) < ?
    OR s.id IS NULL
""", (threshold_chars,))

ids = [row[0] for row in cursor.fetchall()]

if ids:
    cursor.execute(f"UPDATE articles SET status = 'RAW' WHERE id IN ({','.join(map(str, ids))})")
    conn.commit()
    print(f"SUCCESS: Reset {len(ids)} thin articles to RAW status.")
else:
    print("No thin articles found to reset.")

conn.close()
