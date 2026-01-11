
import sqlite3

db_path = 'c:/Users/johnm/Desktop/PROJECTS/cybersecurity-news/backend/cybersec_news.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Count Active
cur.execute("SELECT count(*) FROM articles WHERE status IN ('READY', 'EDITED', 'PUBLISHED')")
active_count = cur.fetchone()[0]

# Count Deleted (410)
cur.execute("SELECT count(*) FROM deleted_articles")
deleted_count = cur.fetchone()[0]

print(f"\n STATUS REPORT:")
print(f" ACTIVE Articles (Live on Site): {active_count}")
print(f" BURIED Articles (Returning 410): {deleted_count}")
print(f" Total Database Entries: {active_count + deleted_count}")

conn.close()
