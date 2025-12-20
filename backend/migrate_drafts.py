import sqlite3
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_db():
    """
    Add draft, metrics, and tiered content columns to the 'articles' table.
    """
    logger.info("🚀 Starting Comprehensive Database Migration...")
    
    # Try finding the database in common locations
    possible_paths = [
        'backend/cybersec_news.db',
        'cybersec_news.db',
        'app.db'
    ]
    
    db_path = None
    for path in possible_paths:
        if os.path.exists(path):
            db_path = path
            break
            
    if not db_path:
        logger.error("❌ Database not found in current directory.")
        return
    
    logger.info(f"📂 Found database at: {db_path}")

    columns_to_add = [
        ("draft_title", "VARCHAR(500)"),
        ("draft_meta_description", "VARCHAR(160)"),
        ("draft_keywords", "TEXT"),
        ("has_draft", "BOOLEAN DEFAULT 0"),
        ("impressions", "INTEGER DEFAULT 0"),
        ("position", "FLOAT DEFAULT 0.0"),
        ("last_edited_at", "DATETIME"),
        ("last_edited_by", "VARCHAR(100)"),
        ("content_type", "VARCHAR(20) DEFAULT 'news'"),
        ("protected_from_deletion", "BOOLEAN DEFAULT 0")
    ]
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    for col_name, col_type in columns_to_add:
        try:
            # Check if column exists
            cursor.execute(f"SELECT {col_name} FROM articles LIMIT 1")
            logger.info(f"✅ '{col_name}' column already exists.")
        except sqlite3.OperationalError:
            logger.info(f"🛠 Adding '{col_name}' column...")
            try:
                cursor.execute(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}")
                conn.commit()
                logger.info(f"✅ Added '{col_name}' column.")
            except Exception as e:
                logger.error(f"Failed to add column '{col_name}': {e}")
                conn.rollback()

    conn.close()
    logger.info("🎉 Migration Complete!")

if __name__ == "__main__":
    migrate_db()
