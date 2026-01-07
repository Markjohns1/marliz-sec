import sqlite3
import os

db_path = r'c:\Users\johnm\Desktop\PROJECTS\cybersecurity-news\cybersec_news.db'
if not os.path.exists(db_path):
    print(f"Error: {db_path} not found")
else:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM articles")
    print(f"Total articles in ROOT: {cursor.fetchone()[0]}")
    conn.close()
