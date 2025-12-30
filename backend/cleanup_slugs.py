import asyncio
import os
import sys

# Add current directory to path so app can be imported
sys.path.append(os.getcwd())

from app.database import get_db_context
from app.models import Article
from sqlalchemy import select

async def check_slugs():
    async with get_db_context() as db:
        # Search for any slug containing 'undefined'
        stmt = select(Article).filter(Article.slug.like('%undefined%'))
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        print(f"DEBUG: Found {len(articles)} articles with 'undefined' in slug.")
        
        for article in articles:
            print(f"ID: {article.id} | Slug: {article.slug} | Title: {article.title[:50]}")
            
            # Fix: Replace 'undefined' with a proper string or regen slug
            # For now, let's just make it unique
            new_slug = article.slug.replace('undefined', f"report-{article.id}")
            print(f"  -> Fixing to: {new_slug}")
            article.slug = new_slug
            
        if articles:
            await db.commit()
            print("✓ Database cleanup complete.")
        else:
            print("No action needed.")

if __name__ == "__main__":
    asyncio.run(check_slugs())
