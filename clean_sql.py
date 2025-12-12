import sqlite3
import os

DB_PATH = os.path.join("backend", "cybersec_news.db")

def clean_db():
    if not os.path.exists(DB_PATH):
        print(f"Error: Database file {DB_PATH} not found!")
        return

    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check current icons
        cursor.execute("SELECT name, icon FROM categories WHERE icon != ''")
        rows = cursor.fetchall()
        print(f"Found {len(rows)} categories with emojis.")
        for row in rows:
            print(f" - {row[0]}: {row[1]}")
            
        # Update
        cursor.execute("UPDATE categories SET icon = ''")
        conn.commit()
        print("✓ Successfully cleared emojis from all categories.")
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    clean_db()
