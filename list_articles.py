import sqlite3
import os

def list_articles():
    db_path = "backend/cybersec_news.db"
    if not os.path.exists(db_path):
        print("Database not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, title, slug, status FROM articles ORDER BY created_at DESC LIMIT 10")
    articles = cursor.fetchall()
    
    print("Recent Articles:")
    for art in articles:
        print(f"ID: {art[0]} | Title: {art[1]} | Slug: {art[2]} | Status: {art[3]}")
        
    conn.close()

if __name__ == "__main__":
    list_articles()
