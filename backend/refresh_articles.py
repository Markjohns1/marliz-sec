
import asyncio
import os
import sys
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

# FORCE LOGGING TO CONTAINER STDOUT for detached mode monitoring
try:
    if os.path.exists('/proc/1/fd/1'):
        sys.stdout = open('/proc/1/fd/1', 'w', buffering=1)
        sys.stderr = open('/proc/1/fd/2', 'w', buffering=1)
except Exception:
    pass

from app.database import AsyncSessionLocal
from app.models import Article, ArticleStatus, SimplifiedContent
from app.services.ai_simplifier import ai_simplifier

async def upgrade_single_article(article_id):
    """Process a single article with its own isolated session to prevent race conditions."""
    async with AsyncSessionLocal() as db:
        # Fetch the article inside the session
        stmt = select(Article).options(selectinload(Article.simplified)).where(Article.id == article_id)
        result = await db.execute(stmt)
        article = result.scalars().first()
        
        if not article:
            return "not_found"
            
        # Check word count again to be safe
        word_count = 0
        if article.simplified:
            summary = article.simplified.friendly_summary or ""
            word_count = len(summary.split()) + \
                         len((article.simplified.attack_vector or "").split()) + \
                         len((article.simplified.business_impact or "").split())
        
        if word_count >= 800:
            return "already_upgraded"

        # Initialize simplifier categories if needed
        if not ai_simplifier.category_map:
            await ai_simplifier._load_categories(db)
            
        # Run the simplification
        return await ai_simplifier._simplify_article(db, article)

async def refresh_all_articles():
    """Main loop to drive the bulk upgrade process."""
    print("Marliz Intel Bulk Upgrade Engine v2.1 (Aggressive Mode) Starting...")
    
    # 1. Get all eligible article IDs first
    async with AsyncSessionLocal() as db:
        stmt = select(Article.id).where(
            Article.status.in_([ArticleStatus.RAW, ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        ).order_by(Article.id)
        result = await db.execute(stmt)
        article_ids = result.scalars().all()
    
    total = len(article_ids)
    print(f"Found {total} articles to verify/upgrade.")
    
    batch_size = 1 # Sequential processing to prevent 429s
    processed_in_batch = 0
    
    PER_ARTICLE_REST = 10   # Wait 10s between each article
    BATCH_COOLDOWN = 5      # Short cooldown since batch is 1
    RATE_LIMIT_REST = 60    # Wait 60s if we hit a limit

    for i, aid in enumerate(article_ids):
        # We don't print immediately to avoid cluttering if we are just skipping
        retries = 3
        success = False
        was_skipped = False
        
        while retries > 0 and not success:
            try:
                status = await upgrade_single_article(aid)
                
                if status == "success":
                    print(f"[{i+1}/{total}] ID: {aid} -> SUCCESS: Content upgraded.")
                    success = True
                    processed_in_batch += 1
                elif status == "already_upgraded":
                    # Instant skip - no print unless debugging, or very quiet print
                    # print(f"[{i+1}/{total}] ID: {aid} -> SKIP")
                    success = True
                    was_skipped = True
                elif status == "rate_limited":
                    print(f"[{i+1}/{total}] ID: {aid} -> WARNING: Rate limited. Cooldown {RATE_LIMIT_REST}s...")
                    await asyncio.sleep(RATE_LIMIT_REST)
                    retries -= 1
                else:
                    print(f"[{i+1}/{total}] ID: {aid} -> API ERROR ({status}). Retrying...")
                    await asyncio.sleep(20)
                    retries -= 1
            except Exception as e:
                print(f"[{i+1}/{total}] ID: {aid} -> SYSTEM ERROR: {e}")
                await asyncio.sleep(20)
                retries -= 1
        
        if was_skipped:
            continue # MOVE TO NEXT IMMEDIATELY - NO DELAY

        # If we reached here, we actually processed an article
        if processed_in_batch >= batch_size:
            print(f"--- BATCH COMPLETE. Resting {BATCH_COOLDOWN}s ---")
            await asyncio.sleep(BATCH_COOLDOWN)
            processed_in_batch = 0
        else:
            await asyncio.sleep(PER_ARTICLE_REST)

    print("\nBulk Upgrade Engine finished all tasks.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
