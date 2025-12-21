import sqlite3
import os

def check_data():
    paths = ["backend/cybersec_news.db", "cybersec_news.db", "backend/app.db"]
    for db_path in paths:
        if os.path.exists(db_path):
            print(f"\nChecking {db_path}...")
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
                tables = cursor.fetchall()
                print(f"Tables: {[t[0] for t in tables]}")
                
                if ('articles',) in tables:
                    cursor.execute("SELECT COUNT(*) FROM articles")
                    count = cursor.fetchone()[0]
                    print(f"Articles count: {count}")
                    
                    if count > 0:
                        cursor.execute("PRAGMA table_info(articles)")
                        cols = [c[1] for c in cursor.fetchall()]
                        print(f"Columns in articles: {cols[:10]}... (Total: {len(cols)})")
                
                conn.close()
            except Exception as e:
                print(f"Error checking {db_path}: {e}")
        else:
            print(f"Path {db_path} does not exist.")

if __name__ == "__main__":
    check_data()
