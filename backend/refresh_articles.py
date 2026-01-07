
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
    print("Marliz Intel Bulk Upgrade Engine v2.0 Starting...")
    
    # 1. Get all eligible article IDs first
    async with AsyncSessionLocal() as db:
        stmt = select(Article.id).where(
            Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        ).order_by(Article.id)
        result = await db.execute(stmt)
        article_ids = result.scalars().all()
    
    total = len(article_ids)
    print(f"Found {total} articles to verify/upgrade.")
    
    batch_size = 5
    processed_in_batch = 0
    
    # NEW OPTIMIZED DELAYS: Faster default, respect 429 errors
    PER_ARTICLE_REST = 15   # 15 seconds instead of 120
    BATCH_COOLDOWN = 120    # 2 minutes instead of 900
    RATE_LIMIT_REST = 300   # 5 minutes (Heavy cooldown for 429)

    for i, aid in enumerate(article_ids):
        print(f"[{i+1}/{total}] Processing ID: {aid}...")
        
        retries = 3
        success = False
        
        while retries > 0 and not success:
            try:
                status = await upgrade_single_article(aid)
                
                if status == "success":
                    print(f"  - SUCCESS: Content upgraded to premium.")
                    success = True
                    processed_in_batch += 1
                elif status == "already_upgraded":
                    print(f"  - SKIP: Already high-value (800+ words).")
                    success = True
                elif status == "rate_limited":
                    print(f"  - WARNING: Rate limited (429). Entering HEAVY COOLDOWN ({RATE_LIMIT_REST}s)...")
                    await asyncio.sleep(RATE_LIMIT_REST)
                    retries -= 1
                elif status == "parse_error":
                    print(f"  - ERROR: AI Output malformed. Retrying (15s)...")
                    await asyncio.sleep(15)
                    retries -= 1
                else:
                    print(f"  - API ERROR ({status}). Retrying in 30s...")
                    await asyncio.sleep(30)
                    retries -= 1
            except Exception as e:
                print(f"  - SYSTEM ERROR: {e}. Retrying in 30s...")
                await asyncio.sleep(30)
                retries -= 1
        
        if not success:
            print(f"  - FAILED after retries for ID: {aid}. Moving to next.")

        # Delay Logic
        if processed_in_batch >= batch_size:
            print(f"  - BATCH COMPLETE. Resting for {BATCH_COOLDOWN}s for safety...")
            await asyncio.sleep(BATCH_COOLDOWN)
            processed_in_batch = 0
        else:
            await asyncio.sleep(PER_ARTICLE_REST)

    print("\nBulk Upgrade Engine finished all tasks.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
