import sys
import os
import asyncio
import logging

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db_context
from app.models import Article, ArticleStatus, SimplifiedContent
from app.services.ai_simplifier import ai_simplifier
from sqlalchemy import select, desc

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SmartRefiner")

async def smart_refine():
    """
    Intelligently re-process top articles to add 'Marliz Intel Strategic Assessment'.
    Skips articles that already have this section to save tokens.
    """
    TARGET_COUNT = 30
    PROCESSED_COUNT = 0
    SKIPPED_COUNT = 0
    FAILED_COUNT = 0
    
    logger.info(f"🚀 Starting Smart Refiner (Target: Top {TARGET_COUNT} Articles)")
    
    async with get_db_context() as db:
        # Get NEXT 30 PUBLISHED or READY articles, ordered by newest first
        # OFFSET 30 = Skip the first 30 (already done)
        stmt = select(Article).filter(
            Article.status.in_([ArticleStatus.PUBLISHED, ArticleStatus.READY])
        ).order_by(desc(Article.published_at)).offset(30).limit(TARGET_COUNT)
        
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        logger.info(f"📋 Found {len(articles)} candidate articles.")
        
        for article in articles:
            try:
                # 1. CHECK: Does it already have the assessment?
                # We need to fetch the simplified content to check.
                simp_stmt = select(SimplifiedContent).filter_by(article_id=article.id)
                simp_res = await db.execute(simp_stmt)
                content = simp_res.scalars().first()
                
                if content:
                    # Check for the specific header or signature phrase
                    full_text = (content.friendly_summary or "") + (content.business_impact or "")
                    
                    # LOGIC UPDATE: Even if it has the header, checking length!
                    # If length is < 2000 characters (approx 300 words), it's a BAD GENERATION.
                    # We must re-process it.
                    if "Marliz Intel Strategic Assessment" in full_text:
                        if len(full_text) > 6000:  # 6000 chars = ~1000 words minimum
                            logger.info(f"⏭️  SKIP: Article {article.id} has assessment AND good length. Saving tokens.")
                            SKIPPED_COUNT += 1
                            continue
                        else:
                            logger.warning(f"♻️  REDO: Article {article.id} has assessment but is TOO SHORT ({len(full_text)} chars). Fixing...")
                
                # 2. PREPARE: Temporarily mark as PROCESSING so specific logic isn't triggered if any
                # But actually, ai_simplifier handles the status update. 
                # We just need to pass the article object.
                
                logger.info(f"🔄 REFINING: Article {article.id} - {article.title[:40]}...")
                
                # 3. EXECUTE: Call the simplifier
                # The simplifier fetches raw content and overwrites with new prompt output
                status = await ai_simplifier._simplify_article(db, article)
                
                if status == "success":
                    logger.info(f"✅ SUCCESS: upgraded Article {article.id}.")
                    PROCESSED_COUNT += 1
                    
                    # 4. SLEEP: Wait 15 seconds to be kind to Groq API limits
                    # User requested we don't 'stop forever', but we must rate limit slightly
                    logger.info("⏳ Waiting 15s for rate limits...")
                    await asyncio.sleep(15)
                    
                elif status == "rate_limited":
                    logger.warning("⚠️ Rate Limit Triggered. Pausing for 60 seconds...")
                    await asyncio.sleep(60)
                    FAILED_COUNT += 1
                else:
                    logger.error(f"❌ FAILED: Status {status}")
                    FAILED_COUNT += 1
                    
            except Exception as e:
                logger.error(f"💥 ERROR processing article {article.id}: {e}")
                FAILED_COUNT += 1

    logger.info("="*50)
    logger.info("🏁 REFINER REPORT")
    logger.info(f"Total Scanned: {len(articles)}")
    logger.info(f"Refined (Upgraded): {PROCESSED_COUNT}")
    logger.info(f"Skipped (Already Good): {SKIPPED_COUNT}")
    logger.info(f"Failed: {FAILED_COUNT}")
    logger.info("="*50)

if __name__ == "__main__":
    asyncio.run(smart_refine())
