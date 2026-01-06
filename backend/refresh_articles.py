
import asyncio
import os
import sys
from sqlalchemy import select
from sqlalchemy.orm import selectinload

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.database import AsyncSessionLocal
from app.models import Article, ArticleStatus
from app.services.ai_simplifier import ai_simplifier

async def refresh_all_articles():
    async with AsyncSessionLocal() as db:
        # Fetch all articles with their simplified content eagerly loaded
        stmt = select(Article).options(selectinload(Article.simplified)).where(
            Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        )
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        print(f"Found {len(articles)} articles to upgrade to high-value content.")
        
        # Load categories for the simplifier
        await ai_simplifier._load_categories(db)
        
        # ULTRA-STEADY FLOW PROTOCOL: 
        # Goal: Complete 285 articles by 8:00 AM (approx 10 hours)
        # 120 seconds (2 mins) x 285 = 9.5 Hours. Perfect timing.
        
        delay_between_articles = 120 # Steady 2 minute breath
        
        for idx, article in enumerate(articles):
            # 1. SMART RESUME: Skip anything already high-value
            word_count = 0
            if article.simplified:
                summary = article.simplified.friendly_summary or ""
                word_count = len(summary.split()) + \
                             len((article.simplified.attack_vector or "").split()) + \
                             len((article.simplified.business_impact or "").split())
            
            if word_count >= 800:
                print(f"[{idx+1}/{len(articles)}] SKIP: '{article.title[:40]}...' already high-value ({word_count} words).")
                continue

            print(f"[{idx+1}/{len(articles)}] UPGRADING: {article.title} (Current: {word_count} words)")
            
            success = False
            retries = 20 # Extreme resilience
            retry_delay = 45 
            
            while not success and retries > 0:
                try:
                    success = await ai_simplifier._simplify_article(db, article)
                    if success:
                        print(f"  - SUCCESS: Content upgraded. Waiting {delay_between_articles}s for steady flow...")
                        await asyncio.sleep(delay_between_articles)
                    else:
                        print(f"  - WARNING: Rate limited. ENTERING HEAVY COOLDOWN (5 MINUTES)...")
                        await asyncio.sleep(300) # 5 minute sleep to clear tokens
                        retries -= 1
                except Exception as e:
                    print(f"  - ERROR: {e}. Retrying in 60s...")
                    await asyncio.sleep(60)
                    retries -= 1
            
            if not success:
                print(f"  - FAILED PERMANENTLY for: {article.title}")
                
    print("\nContent Refresh Process Complete.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
