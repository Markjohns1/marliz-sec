import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), "backend", "cybersec_news.db")
    if not os.path.exists(db_path):
        # Check current dir as well
        db_path = "backend/cybersec_news.db"
        if not os.path.exists(db_path):
            db_path = "cybersec_news.db"

    print(f"Connecting to database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(subscribers)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if "verification_token" not in columns:
            print("Adding verification_token column to subscribers table...")
            cursor.execute("ALTER TABLE subscribers ADD COLUMN verification_token VARCHAR(100)")
            print("✓ Column added successfully.")
        else:
            print("Column verification_token already exists.")

        conn.commit()
    except Exception as e:
        print(f"Error during migration: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
