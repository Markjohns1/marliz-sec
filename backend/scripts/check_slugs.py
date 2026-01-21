import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import Article, DeletedArticle

SLUGS_TO_CHECK = [
    "700credit-data-breach-impacts-5-8-million-individuals",
    "thailand-shifts-focus-on-border-disputes-targeting-cybercrime-syndicates",
    "chinese-hackers-use-anthropics-claude-ai-to-automate-90-of-cyber-espionage",
    "passkeys-come-to-telegram-secure-messaging-app",
    "from-ai-to-cyber-risk-why-it-leaders-are-anxious-heading-into-2026"
]

async def check_truth():
    print("=" * 60)
    print(" 🛠️ DIAGNOSING GOOGLE'S 'CRAWLED BUT NOT INDEXED' LIST")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        for slug in SLUGS_TO_CHECK:
            # 1. Check in Active Articles
            res_active = await db.execute(select(Article).filter_by(slug=slug))
            active = res_active.scalars().first()
            
            # 2. Check in Graveyard
            res_dead = await db.execute(select(DeletedArticle).filter_by(slug=slug))
            dead = res_dead.scalars().first()
            
            status = "UNKNOWN"
            if active: status = "🟢 ACTIVE (Should be indexed)"
            if dead: status = "💀 BURIED (Returning 410)"
            if not active and not dead: status = "❓ MISSING (Returning 404)"
            
            print(f"Slug: {slug[:50]}...")
            print(f"Status: {status}")
            print("-" * 30)

if __name__ == "__main__":
    asyncio.run(check_truth())
