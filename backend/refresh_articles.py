
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
        
        processed_count = 0
        batch_size = 30
        cooldown_pause = 900 # 15 minutes rest for total API reset
        
        for idx, article in enumerate(articles):
            # SMART RESUME: Skip anything already high-value
            word_count = 0
            if article.simplified:
                summary = article.simplified.friendly_summary or ""
                word_count = len(summary.split()) + \
                             len((article.simplified.attack_vector or "").split()) + \
                             len((article.simplified.business_impact or "").split())
            
            # Threshold set to 800 as per user request
            if word_count >= 800:
                print(f"[{idx+1}/{len(articles)}] SKIP: '{article.title[:40]}...' already high-value ({word_count} words).")
                continue

            print(f"[{idx+1}/{len(articles)}] UPGRADING: {article.title} (Current: {word_count} words)")
            
            success = False
            retries = 12 # Increased retries
            delay = 30 
            
            while not success and retries > 0:
                try:
                    success = await ai_simplifier._simplify_article(db, article)
                    if success:
                        processed_count += 1
                        print(f"  - SUCCESS: Content upgraded to > 800 words. [Batch Progress: {processed_count}/{batch_size}]")
                        
                        # Batch Cooldown Logic
                        if processed_count >= batch_size:
                            print(f"\n[!!!] BATCH COMPLETE (30 Articles). Resting for 15 minutes to reset API limits...")
                            await asyncio.sleep(cooldown_pause)
                            processed_count = 0 # Reset batch counter
                            print("[!] Cooldown over. Resuming next batch...\n")
                        else:
                            await asyncio.sleep(75) # Ultra-safe 75s cooldown between articles
                    else:
                        print(f"  - WARNING: Rate limited or API error. Waiting {delay}s...")
                        await asyncio.sleep(delay)
                        retries -= 1
                        delay += 30 
                except Exception as e:
                    print(f"  - ERROR: {e}. Retrying...")
                    await asyncio.sleep(delay)
                    retries -= 1
            
            if not success:
                print(f"  - FAILED PERMANENTLY for: {article.title}")
                
    print("\nContent Refresh Process Complete.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
