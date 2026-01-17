import sys
import os
import asyncio
import logging

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import Article, ArticleStatus, SimplifiedContent
from app.services.ai_simplifier import ai_simplifier
from sqlalchemy import select, desc

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartRefiner")

async def process_single_article(article_id):
    """Processes a single article with its own fresh session to avoid Greenlet/Session errors."""
    async with AsyncSessionLocal() as db:
        try:
            # Re-fetch article in this session
            stmt = select(Article).filter_by(id=article_id)
            result = await db.execute(stmt)
            article = result.scalar_one_or_none()
            
            if not article:
                return "not_found"

            # Check existing content for skip logic
            simp_stmt = select(SimplifiedContent).filter_by(article_id=article.id)
            simp_res = await db.execute(simp_stmt)
            content = simp_res.scalars().first()
            
            if content:
                full_text = (content.friendly_summary or "") + (content.business_impact or "")
                # Threshold check: 6000 chars and Assessment header
                if "Marliz Intel Strategic Assessment" in full_text and len(full_text) > 6000:
                    return "skipped"

            # Execute refinement
            logger.info(f"🔄 REFINING: Article {article.id} - {article.title[:40]}...")
            status = await ai_simplifier.refine_article(db, article)
            return status
            
        except Exception as e:
            logger.error(f"💥 Error in article {article_id}: {str(e)}")
            return "error"

async def smart_refine():
    TARGET_COUNT = 30
    OFFSET = 30
    PROCESSED = 0
    
    logger.info(f"🚀 Starting Smart Refiner (Batch: {OFFSET}-{OFFSET+TARGET_COUNT})")
    
    # 1. Get the list of IDs first (to avoid keeping the session open)
    async with AsyncSessionLocal() as db:
        stmt = select(Article.id).filter(
            Article.status.in_([ArticleStatus.PUBLISHED, ArticleStatus.READY])
        ).order_by(desc(Article.published_at)).offset(OFFSET).limit(TARGET_COUNT)
        
        result = await db.execute(stmt)
        article_ids = result.scalars().all()

    logger.info(f"📋 Found {len(article_ids)} IDs to check.")

    for aid in article_ids:
        status = await process_single_article(aid)
        
        if status == "success":
            PROCESSED += 1
            logger.info(f"✅ Article {aid} upgraded. Waiting 10s...")
            await asyncio.sleep(10)
        elif status == "rate_limited":
            logger.warning("🛑 RATE LIMITED. Stopping now. Run again in 5 minutes.")
            break
        elif status == "skipped":
            logger.info(f"⏭️  Article {aid} already good. Skipping.")
        else:
            logger.error(f"❌ Article {aid} failed with status: {status}")

    logger.info(f"🏁 DONE. Processed {PROCESSED} articles.")

if __name__ == "__main__":
    asyncio.run(smart_refine())
