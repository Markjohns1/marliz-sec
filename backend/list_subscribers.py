import asyncio
from app.database import AsyncSessionLocal
from app.models import Subscriber
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(Subscriber).order_by(Subscriber.subscribed_at.desc()))
        subs = res.scalars().all()
        
        print(f"\n" + "="*50)
        print(f"   MARLIZ INTEL SUBSCRIBER AUDIT")
        print(f"   {'-'*40}")
        
        if not subs:
            print("   No subscribers found.")
        else:
            for s in subs:
                status = "ACTIVE" if not s.unsubscribed_at else "UNSUB"
                premium = " ⭐" if s.is_premium else ""
                print(f"   [{s.subscribed_at.strftime('%Y-%m-%d %H:%M')}] {s.email:<30} | {status}{premium}")
        
        print(f"   {'-'*40}")
        print(f"   Total: {len(subs)}")
        print("="*50 + "\n")

if __name__ == "__main__":
    asyncio.run(check())
