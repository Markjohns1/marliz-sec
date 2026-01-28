
import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from app.models import DeletedArticle, Article
from sqlalchemy import select, delete

async def bury():
    slug = 'malicious-phantom-shuttle-chrome-extensions-steal-credentials-from-170-sites'
    print(f"Burying slug: {slug}")
    
    async with AsyncSessionLocal() as db:
        # 1. Remove from articles table if it exists
        stmt_del_art = delete(Article).where(Article.slug == slug)
        await db.execute(stmt_del_art)
        
        # 2. Add to graveyard if not already there
        res_deleted = await db.execute(select(DeletedArticle).filter_by(slug=slug))
        item = res_deleted.scalars().first()
        if not item:
            db.add(DeletedArticle(slug=slug, reason="Manual burial via agent"))
            print(f"Added to graveyard: {slug}")
        else:
            print("Already in graveyard.")
            
        await db.commit()
    print("Done.")

if __name__ == '__main__':
    asyncio.run(bury())
