
import sqlite3
import os

db_path = r'c:\Users\johnm\Desktop\PROJECTS\cybersecurity-news\backend\cybersec_news.db'
if not os.path.exists(db_path):
    print(f"DB not found at {db_path}")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT status, count(*) FROM articles GROUP BY status;")
    results = cursor.fetchall()
    print("Article Counts by Status:")
    for row in results:
        print(f"  {row[0]}: {row[1]}")
    
    cursor.execute("SELECT count(*) FROM subscribers;")
    subs = cursor.fetchone()[0]
    print(f"Total Subscribers: {subs}")
    conn.close()
