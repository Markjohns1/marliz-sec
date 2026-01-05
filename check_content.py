
import sqlite3
import os

db_path = r'c:\Users\johnm\Desktop\PROJECTS\cybersecurity-news\backend\cybersec_news.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("""
    SELECT a.title, s.friendly_summary, s.business_impact, s.action_steps 
    FROM articles a 
    JOIN simplified_content s ON a.id = s.article_id 
    WHERE a.status = 'READY' 
    LIMIT 1;
""")
row = cursor.fetchone()
if row:
    print(f"Title: {row[0]}")
    print(f"Summary: {row[1]}")
    print(f"Impact: {row[2]}")
    print(f"Actions: {row[3]}")
conn.close()
