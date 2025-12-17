import asyncio
import logging
from sqlalchemy import text
from app.database import get_db_context

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def migrate_db():
    """
    Manually add 'content_type' and 'protected_from_deletion' columns
    to the 'articles' table if they don't exist.
    """
    logger.info("🚀 Starting Database Migration...")
    
    async with get_db_context() as db:
        # Check if column exists
        try:
            # Attempt to select the column to see if it exists
            await db.execute(text("SELECT content_type FROM articles LIMIT 1"))
            logger.info("✅ 'content_type' column already exists.")
        except Exception:
            logger.info("🛠 Adding 'content_type' column...")
            try:
                await db.execute(text("ALTER TABLE articles ADD COLUMN content_type VARCHAR(20) DEFAULT 'news'"))
                await db.commit()
                logger.info("✅ Added 'content_type' column.")
            except Exception as e:
                logger.error(f"Failed to add column: {e}")

        try:
            # Check for protected_from_deletion
            await db.execute(text("SELECT protected_from_deletion FROM articles LIMIT 1"))
            logger.info("✅ 'protected_from_deletion' column already exists.")
        except Exception:
            logger.info("🛠 Adding 'protected_from_deletion' column...")
            try:
                await db.execute(text("ALTER TABLE articles ADD COLUMN protected_from_deletion BOOLEAN DEFAULT FALSE"))
                await db.commit()
                logger.info("✅ Added 'protected_from_deletion' column.")
            except Exception as e:
                logger.error(f"Failed to add column: {e}")

    logger.info("🎉 Migration Complete!")

if __name__ == "__main__":
    asyncio.run(migrate_db())
