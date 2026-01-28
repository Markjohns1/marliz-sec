
import asyncio
import os
import sys

# Add current dir to path
sys.path.append(os.getcwd())

from app.database import AsyncSessionLocal
from app.models import DeletedArticle, Article
from sqlalchemy import select

async def check():
    slug = 'malicious-phantom-shuttle-chrome-extensions-steal-credentials-from-170-sites'
    print(f"Checking for slug: {slug}")
    
    async with AsyncSessionLocal() as db:
        # Check active
        res_active = await db.execute(select(Article).filter_by(slug=slug))
        article = res_active.scalars().first()
        if article:
            print(f"ACTIVE: Found in articles table (ID: {article.id}, Status: {article.status})")
        else:
            print("ACTIVE: Not found in articles table.")
            
        # Check graveyard
        res_deleted = await db.execute(select(DeletedArticle).filter_by(slug=slug))
        item = res_deleted.scalars().first()
        if item:
            print(f"GRAVEYARD: Found in deleted_articles table (ID: {item.id})")
        else:
            print("GRAVEYARD: Not found in deleted_articles table.")

if __name__ == '__main__':
    asyncio.run(check())
