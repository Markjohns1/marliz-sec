
import sqlite3
import os

db_path = 'c:/Users/johnm/Desktop/PROJECTS/cybersecurity-news/backend/cybersec_news.db'
output_path = 'c:/Users/johnm/Desktop/PROJECTS/cybersecurity-news/backend/scripts/populate_deleted.sql'

conn = sqlite3.connect(db_path)
cur = conn.cursor()

cur.execute('SELECT slug FROM deleted_articles')
rows = cur.fetchall()

if not rows:
    print("No deleted articles found using local DB.")
    exit()

with open(output_path, 'w', encoding='utf-8') as f:
    f.write("-- Bulk insert of deleted slugs for production\n")
    f.write("INSERT OR IGNORE INTO deleted_articles (slug, reason, deleted_at) VALUES\n")
    
    values = []
    for r in rows:
        slug = r[0]
        # Valid SQL string escaping
        slug_safe = slug.replace("'", "''") 
        values.append(f"('{slug_safe}', 'Migration', CURRENT_TIMESTAMP)")
    
    f.write(",\n".join(values))
    f.write(";\n")

print(f"Successfully generated SQL migration for {len(rows)} slugs at: {output_path}")
conn.close()
