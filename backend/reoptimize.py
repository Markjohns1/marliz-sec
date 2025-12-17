import asyncio
import logging
from app.database import init_db, get_db_context
from app.models import Article, ArticleStatus, SimplifiedContent
from sqlalchemy import select
from app.services.ai_simplifier import ai_simplifier

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def reoptimize_all():
    """
    Reset all articles to RAW status and trigger AI reprocessing 
    to apply new SEO titles and keywords.
    """
    logger.info("🚀 Starting Content Re-Optimization...")
    
    # 1. Reset all articles to RAW
    async with get_db_context() as db:
        logger.info("🔄 Resetting article statuses...")
        stmt = select(Article)
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        count = 0
        for article in articles:
            # Skip if already RAW (unlikely if site is live)
            # We enforce reprocessing even if it was READY
            article.status = ArticleStatus.RAW
            count += 1
            
        await db.commit()
        logger.info(f"✅ Reset {count} articles to RAW status.")

    # 2. Trigger the processor
    logger.info("🧠 invoking AI Simplifier (This may take time)...")
    results = await ai_simplifier.process_pending_articles()
    
    logger.info("🎉 Re-optimization Complete!")
    logger.info(f"Stats: {results}")

if __name__ == "__main__":
    asyncio.run(reoptimize_all())
