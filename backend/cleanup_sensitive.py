import asyncio
import logging
from sqlalchemy import select, delete, or_
from app.database import get_db_context
from app.models import Article, SimplifiedContent

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Sensitive keywords as defined by Google's policy for the War in Ukraine + general sensitive conflicts
WAR_KEYWORDS = [
    "ukraine", "russia", "putin", "zelensky", "kremlin", "kyiv", "moscow",
    "invasion", "military conflict", "israel", "hamas", "gaza", "palestine",
    "battlefield", "frontline", "bombing", "missile", "airstrike"
]

async def cleanup_sensitive_content():
    async with get_db_context() as db:
        logger.info("Starting cleanup of sensitive war-related content for AdSense compliance...")
        
        # Build search filters
        filters = []
        for keyword in WAR_KEYWORDS:
            filters.append(Article.title.ilike(f"%{keyword}%"))
            filters.append(Article.meta_description.ilike(f"%{keyword}%"))
            filters.append(Article.raw_content.ilike(f"%{keyword}%"))

        # Find articles matching any filter
        stmt = select(Article).where(or_(*filters))
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        if not articles:
            logger.info("No sensitive content found. Your database is clean! ✅")
            return

        logger.info(f"Found {len(articles)} articles that may violate AdSense sensitive content policies.")
        
        for article in articles:
            logger.info(f"Deleting Article ID {article.id}: {article.title[:50]}...")
            
            # Delete related simplified content first due to foreign key
            await db.execute(delete(SimplifiedContent).where(SimplifiedContent.article_id == article.id))
            # Delete the article
            await db.delete(article)
            
        await db.commit()
        logger.info(f"Successfully removed {len(articles)} sensitive articles. 🛡️")

if __name__ == "__main__":
    asyncio.run(cleanup_sensitive_content())
