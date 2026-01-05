
import asyncio
import os
import sys
from sqlalchemy import select
from sqlalchemy.orm import joinedload

# Add the current directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

from app.database import AsyncSessionLocal
from app.models import Article, SimplifiedContent

async def check_site_integrity():
    async with AsyncSessionLocal() as db:
        print("--- MARLIZ INTEL: INTEGRITY AUDIT START ---")
        
        # 1. Find articles with "undefined" in slug or title
        stmt = select(Article).where(
            (Article.slug.like('%undefined%')) | 
            (Article.title.like('%undefined%'))
        )
        result = await db.execute(stmt)
        broken_slugs = result.scalars().all()
        
        print(f"\n[!] Found {len(broken_slugs)} articles with 'undefined' in their identity.")
        for a in broken_slugs:
            print(f"    - ID: {a.id} | Slug: {a.slug} | Title: {a.title[:50]}...")

        # 2. Find articles with abnormally short titles (likely scraps)
        stmt = select(Article)
        result = await db.execute(stmt)
        all_articles = result.scalars().all()
        short_titles = [a for a in all_articles if len(a.title or "") < 15]
        
        print(f"\n[!] Found {len(short_titles)} articles with suspicious short titles.")
        for a in short_titles:
            print(f"    - ID: {a.id} | Title: '{a.title}'")

        # 3. Check for articles that failed the "High Value" word count check
        # (This identifies articles that weren't properly expanded)
        stmt = select(Article).options(joinedload(Article.simplified)).where(Article.simplified != None)
        result = await db.execute(stmt)
        simplified_articles = result.scalars().unique().all()
        
        thin_content = []
        for a in simplified_articles:
            if a.simplified:
                total_words = len((a.simplified.friendly_summary or "").split()) + \
                              len((a.simplified.attack_vector or "").split()) + \
                              len((a.simplified.business_impact or "").split())
                if total_words < 400: # Anything under 400 words is considered "Thin" by Google for news
                    thin_content.append((a, total_words))
        
        print(f"\n[!] Found {len(thin_content)} articles with 'Thin Content' (< 400 words).")
        for a, count in thin_content[:10]:
            print(f"    - ID: {a.id} | Words: {count} | Title: {a.title[:50]}...")
        if len(thin_content) > 10:
            print(f"    ... and {len(thin_content) - 10} more.")

        print("\n--- AUDIT COMPLETE ---")
        if broken_slugs or short_titles:
            print("\nSUGGESTED ACTION: Would you like me to DELETE these broken articles automatically?")
        else:
            print("\nYour internal database structure looks clean. No 'undefined' links found.")

if __name__ == "__main__":
    asyncio.run(check_site_integrity())
