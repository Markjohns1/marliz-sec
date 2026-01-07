import asyncio
from app.database import AsyncSessionLocal
from app.models import Article, SimplifiedContent
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

async def check():
    async with AsyncSessionLocal() as db:
        # Total Articles in DB
        total = await db.scalar(select(func.count(Article.id)))
        
        # Load all articles that have been "Simplified" by AI
        stmt = select(Article).options(selectinload(Article.simplified)).join(SimplifiedContent)
        res = await db.execute(stmt)
        articles = res.scalars().all()
        
        upgraded = 0
        pending = 0
        
        for a in articles:
            if not a.simplified:
                continue
            
            # Combine all sections to get the TRUE word count
            combined_content = (
                (a.simplified.friendly_summary or "") + " " +
                (a.simplified.business_impact or "") + " " +
                (a.simplified.attack_vector or "")
            )
            word_count = len(combined_content.split())
            
            # 800+ is our Senior Intel Threshold
            if word_count >= 800:
                upgraded += 1
            else:
                pending += 1
        
        # Raw news are articles without any SimplifiedContent entry yet
        raw = total - len(articles)
        
        print(f"\n" + "="*40)
        print(f"   MARLIZ INTEL PRODUCTION AUDIT")
        print(f"   {'-'*30}")
        print(f"   Total Database Items: {total}")
        print(f"   Senior Intel Ready:   {upgraded} (Full Report 800+ Words)")
        print(f"   Standard Reports:    {pending}")
        print(f"   Raw News Awaiting:    {raw}")
        print(f"   {'-'*30}")
        print(f"   PROGRESS: {((upgraded/total)*100 if total > 0 else 0):.1f}% High-Value Coverage")
        print("="*40 + "\n")

if __name__ == "__main__":
    asyncio.run(check())
