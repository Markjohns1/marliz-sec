
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
        
        for idx, article in enumerate(articles):
            # SMART RESUME: Check for signatures of the NEW high-value prompt
            word_count = 0
            has_new_format = False
            
            if article.simplified:
                summary = article.simplified.friendly_summary or ""
                word_count = len(summary.split()) + \
                             len((article.simplified.attack_vector or "").split()) + \
                             len((article.simplified.business_impact or "").split())
                
                # The new prompt strictly uses <h1> tags for sections
                has_new_format = "<h1>" in summary or "<h2>" in summary

            # Skip if it's long enough OR already in the new visual format
            if word_count > 500 or has_new_format:
                print(f"[{idx+1}/{len(articles)}] SKIP: '{article.title[:40]}...' (Found {word_count} words + New Format).")
                continue

            print(f"[{idx+1}/{len(articles)}] UPGRADING: {article.title}")
            
            success = False
            retries = 10 
            delay = 30 
            
            while not success and retries > 0:
                try:
                    success = await ai_simplifier._simplify_article(db, article)
                    if success:
                        print(f"  - SUCCESS: Content upgraded.")
                        await asyncio.sleep(45) 
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
