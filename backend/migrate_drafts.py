import asyncio
import logging
from sqlalchemy import text
from app.database import get_db_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def migrate_db():
    """
    Add draft and metrics columns to the 'articles' table.
    """
    logger.info("🚀 Starting Database Migration (Drafts & Metrics)...")
    
    columns_to_add = [
        ("draft_title", "VARCHAR(500)"),
        ("draft_meta_description", "VARCHAR(160)"),
        ("draft_keywords", "TEXT"),
        ("has_draft", "BOOLEAN DEFAULT FALSE"),
        ("impressions", "INTEGER DEFAULT 0"),
        ("position", "FLOAT DEFAULT 0.0"),
        ("last_edited_at", "DATETIME"),
        ("last_edited_by", "VARCHAR(100)")
    ]
    
    async with get_db_context() as db:
        for col_name, col_type in columns_to_add:
            try:
                # Check if column exists
                await db.execute(text(f"SELECT {col_name} FROM articles LIMIT 1"))
                logger.info(f"✅ '{col_name}' column already exists.")
            except Exception:
                logger.info(f"🛠 Adding '{col_name}' column...")
                try:
                    await db.execute(text(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}"))
                    await db.commit()
                    logger.info(f"✅ Added '{col_name}' column.")
                except Exception as e:
                    logger.error(f"Failed to add column '{col_name}': {e}")
                    await db.rollback()

    logger.info("🎉 Migration Complete!")

if __name__ == "__main__":
    asyncio.run(migrate_db())
