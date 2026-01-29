import sys
import os
import asyncio
from sqlalchemy import update

# Add parent directory to path so we can import app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import Subscriber

async def verify_all():
    print("Starting verification of all existing subscribers...")
    async with AsyncSessionLocal() as db:
        stmt = update(Subscriber).values(is_verified=True, verification_token=None)
        result = await db.execute(stmt)
        await db.commit()
        print(f"✓ Successfully verified {result.rowcount} subscribers.")

if __name__ == "__main__":
    asyncio.run(verify_all())
