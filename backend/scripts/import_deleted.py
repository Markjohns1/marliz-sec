
import asyncio
import sys
import os

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import DeletedArticle, Article
from sqlalchemy import select

async def import_deleted_slugs(file_path):
    if not os.path.exists(file_path):
        print(f"Error: File {file_path} not found.")
        return

    async with AsyncSessionLocal() as db:
        with open(file_path, 'r', encoding='utf-8') as f:
            slugs = [line.strip() for line in f if line.strip()]

        print(f"Found {len(slugs)} slugs to process.")
        added = 0
        skipped_existing = 0
        skipped_active = 0

        for slug in slugs:
            # 1. Check if it's already in deleted_articles
            res = await db.execute(select(DeletedArticle).filter_by(slug=slug))
            if res.scalars().first():
                skipped_existing += 1
                continue

            # 2. Safety check: Is it currently an ACTIVE article?
            res_active = await db.execute(select(Article).filter_by(slug=slug))
            if res_active.scalars().first():
                print(f"⚠️ WARNING: Slug '{slug}' is currently an active article! SKIPPING.")
                skipped_active += 1
                continue

            # 3. Add to deleted_articles
            db.add(DeletedArticle(slug=slug, reason="Bulk Import"))
            added += 1
            if added % 50 == 0:
                print(f"Processed {added}...")
        
        await db.commit()
        print(f"\n--- Summary ---")
        print(f"Total Slugs in File: {len(slugs)}")
        print(f"Added to Permanent Delete (410): {added}")
        print(f"Skipped (Already in 410 list): {skipped_existing}")
        print(f"Skipped (Currently Active Article): {skipped_active}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/import_deleted.py <path_to_slug_list.txt>")
        sys.exit(1)
    
    file_path = sys.argv[1]
    asyncio.run(import_deleted_slugs(file_path))
