
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
        # Fetch all articles with their simplified content eagerly loaded (Ordered by ID for stability)
        stmt = select(Article).options(selectinload(Article.simplified)).where(
            Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        ).order_by(Article.id)
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        print(f"Found {len(articles)} articles to upgrade to high-value content.")
        
        # Load categories for the simplifier
        await ai_simplifier._load_categories(db)
        
        processed_count = 0
        batch_size = 5
        batch_cooldown = 900 # 15 minutes rest after 5 articles (Deep breath for 2800-word articles)
        per_article_delay = 120 # 2 minute breath between articles
        
        for idx, article in enumerate(articles):
            # 1. SMART RESUME: Skip anything already high-value (>800 words)
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
            
            status = "idle"
            retries = 15 
            
            while status != "success" and retries > 0:
                try:
                    status = await ai_simplifier._simplify_article(db, article)
                    if status == "success":
                        processed_count += 1
                        print(f"  - SUCCESS: Content upgraded. [Batch Progress: {processed_count}/{batch_size}]")
                        
                        # Batch Cooldown Logic
                        if processed_count >= batch_size:
                            print(f"\n[!!!] BATCH COMPLETE ({batch_size} Articles). Resting for 10 minutes for safety...")
                            await asyncio.sleep(batch_cooldown)
                            processed_count = 0 
                            print("[!] Cooldown over. Resuming next batch...\n")
                        else:
                            await asyncio.sleep(per_article_delay)
                    elif status == "rate_limited":
                        print(f"  - WARNING: Rate limited. ENTERING HEAVY COOLDOWN (5 MINUTES)...")
                        await asyncio.sleep(300) 
                        retries -= 1
                    elif status == "parse_error":
                        print(f"  - ERROR: AI Output was malformed. Retrying once (10s delay)...")
                        await asyncio.sleep(10)
                        retries -= 1
                        if retries == 0:
                            print(f"  - SKIPPING: AI failed to produce valid JSON 15 times.")
                    else:
                        print(f"  - API ERROR: {status}. Retrying in 30s...")
                        await asyncio.sleep(30)
                        retries -= 1
                except Exception as e:
                    print(f"  - SYSTEM ERROR: {e}. Retrying in 30s...")
                    await asyncio.sleep(30)
                    retries -= 1
            
            if status != "success":
                print(f"  - FAILED PERMANENTLY for: {article.title}")
                
    print("\nContent Refresh Process Complete.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
