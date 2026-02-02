
import asyncio
import os
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Article, DeletedArticle

async def purge_from_file():
    # 1. Read slugs/URLs from the text file
    file_path = "purge_list.txt"
    if not os.path.exists(file_path):
        print(f"❌ Error: {file_path} not found.")
        return

    with open(file_path, "r") as f:
        items = [line.strip() for line in f if line.strip() and not line.strip().startswith("#")]

    if not items:
        print("⚠️ No slugs found in purge_list.txt")
        return

    print(f"📡 Processing {len(items)} items...")

    async with AsyncSessionLocal() as db:
        new_buried = 0
        removed_live = 0
        already_buried = 0
        
        for item in items:
            # Extract slug: handle full URLs by taking the last part
            slug = item.rstrip('/').split('/')[-1]
            if not slug:
                continue

            try:
                # Step A: Check Graveyard
                res_grave = await db.execute(select(DeletedArticle).filter_by(slug=slug))
                if res_grave.scalars().first():
                    already_buried += 1
                    continue

                # Step B: Check and remove from Live Articles
                res_live = await db.execute(select(Article).filter_by(slug=slug))
                live_art = res_live.scalars().first()
                if live_art:
                    await db.delete(live_art)
                    removed_live += 1

                # Step C: Add to Graveyard
                new_grave = DeletedArticle(slug=slug, reason="Manual Purge / GSC")
                db.add(new_grave)
                new_buried += 1
                
            except Exception as e:
                print(f"🚨 Error processing {slug}: {e}")

        await db.commit()
        
        print("\n" + "="*30)
        print("✅ PURGE COMPLETE")
        print("="*30)
        print(f"🪦 Added to Graveyard:  {new_buried}")
        print(f"✂️ Removed from Live:    {removed_live}")
        print(f"📦 Already in Graveyard: {already_buried}")
        print("="*30)

if __name__ == "__main__":
    asyncio.run(purge_from_file())
