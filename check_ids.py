import sqlite3
import os

db_paths = [
    os.path.abspath("backend/cybersec_news.db"),
    os.path.abspath("./backend/cybersec_news.db"),
    os.path.abspath("cybersec_news.db")
]

target_ids = (752, 741, 729)

for path in db_paths:
    if os.path.exists(path):
        print(f"Checking database at: {path}")
        try:
            conn = sqlite3.connect(path)
            cursor = conn.cursor()
            query = f"SELECT id, title, word_count FROM articles WHERE id IN {target_ids}"
            cursor.execute(query)
            rows = cursor.fetchall()
            if rows:
                for row in rows:
                    print(f"ID: {row[0]} | Title: {row[1]} | Words: {row[2]}")
            else:
                print("No matching articles found in this database.")
            conn.close()
        except Exception as e:
            print(f"Error: {e}")
        break
else:
    print("Database not found.")
