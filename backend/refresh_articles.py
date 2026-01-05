
import asyncio
import os
import sys
from sqlalchemy import select

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.database import AsyncSessionLocal
from app.models import Article, ArticleStatus
from app.services.ai_simplifier import ai_simplifier

async def refresh_all_articles():
    async with AsyncSessionLocal() as db:
        # Fetch all articles that are in READY, EDITED, or PUBLISHED status
        stmt = select(Article).where(Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED]))
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        print(f"Found {len(articles)} articles to upgrade to high-value content.")
        
        # Load categories for the simplifier
        await ai_simplifier._load_categories(db)
        
        for idx, article in enumerate(articles):
            print(f"[{idx+1}/{len(articles)}] Upgrading depth for: {article.title}")
            
            success = False
            retries = 10 # More retries for 70b
            delay = 30 # Start with 30s delay
            
            while not success and retries > 0:
                try:
                    success = await ai_simplifier._simplify_article(db, article)
                    if success:
                        print(f"  - SUCCESS: Content upgraded.")
                        await asyncio.sleep(45) # 45s cooldown between successful long-form requests
                    else:
                        print(f"  - WARNING: Rate limited or API error. Waiting {delay}s...")
                        await asyncio.sleep(delay)
                        retries -= 1
                        delay += 30 # Progressive backoff
                except Exception as e:
                    print(f"  - ERROR: {e}. Retrying...")
                    await asyncio.sleep(delay)
                    retries -= 1
            
            if not success:
                print(f"  - FAILED PERMANENTLY for: {article.title}")
                
    print("\nContent Refresh Process Complete.")

if __name__ == "__main__":
    asyncio.run(refresh_all_articles())
