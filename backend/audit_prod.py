
import asyncio
from app.database import AsyncSessionLocal
from app.models import Article, SimplifiedContent
from sqlalchemy import select, func

async def check():
    async with AsyncSessionLocal() as db:
        total = await db.scalar(select(func.count(Article.id)))
        stmt = select(Article).join(SimplifiedContent)
        res = await db.execute(stmt)
        articles = res.scalars().all()
        
        # Calculate stats
        upgraded = sum(1 for a in articles if len((a.simplified.friendly_summary or "").split()) >= 800)
        pending = len(articles) - upgraded
        raw = total - len(articles)
        
        print(f"\n" + "="*40)
        print(f"   MARLIZ INTEL PRODUCTION AUDIT")
        print(f"   {'-'*30}")
        print(f"   Total Articles:      {total}")
        print(f"   Senior Intel Ready:  {upgraded} (800+ words)")
        print(f"   Short Summaries:     {pending}")
        print(f"   Raw News Awaiting:   {raw}")
        print(f"   {'-'*30}")
        print("   STATUS: " + ("OPTIMIZED" if pending == 0 else "UPGRADE IN PROGRESS"))
        print("="*40 + "\n")

if __name__ == "__main__":
    asyncio.run(check())
