import sqlite3
import os

def migrate():
    db_path = "backend/cybersec_news.db"
    if not os.path.exists(db_path):
        # Try root if not in backend
        db_path = "cybersec_news.db"
        
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    print(f"Found database at: {db_path}")
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # List of columns to add to 'articles' table
    # format: (column_name, type, default)
    new_article_columns = [
        ("draft_title", "VARCHAR(500)", "NULL"),
        ("draft_meta_description", "VARCHAR(160)", "NULL"),
        ("draft_keywords", "TEXT", "NULL"),
        ("has_draft", "BOOLEAN", "0"),
        ("impressions", "INTEGER", "0"),
        ("position", "FLOAT", "0.0"),
        ("content_type", "VARCHAR(20)", "'news'"),
        ("protected_from_deletion", "BOOLEAN", "0"),
        ("last_edited_at", "DATETIME", "NULL"),
        ("last_edited_by", "VARCHAR(100)", "NULL")
    ]

    for col_name, col_type, default in new_article_columns:
        try:
            print(f"Adding column {col_name}...")
            cursor.execute(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type} DEFAULT {default}")
        except sqlite3.OperationalError:
            print(f"Column {col_name} already exists or error occurred.")

    conn.commit()
    conn.close()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
