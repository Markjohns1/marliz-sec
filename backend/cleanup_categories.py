import asyncio
import os
import sys

# Add current directory to path so app can be imported
sys.path.append(os.getcwd())

from app.database import get_db_context
from app.models import Category
from sqlalchemy import select

async def check_categories():
    async with get_db_context() as db:
        stmt = select(Category)
        result = await db.execute(stmt)
        categories = result.scalars().all()
        
        print(f"DEBUG: Found {len(categories)} categories.")
        
        for cat in categories:
            print(f"ID: {cat.id} | Name: {cat.name} | Description: {cat.description}")
            if "AI-powered" in cat.description or "AI" in cat.description:
                new_desc = cat.description.replace("AI-powered ", "").replace("AI powered ", "").replace("AI ", "")
                # Ensure it still makes sense
                if not new_desc.strip():
                    new_desc = f"Latest {cat.name} security news and alerts."
                
                print(f"  -> Updating to: {new_desc}")
                cat.description = new_desc
                
        if categories:
            await db.commit()
            print("✓ Category cleanup complete.")

if __name__ == "__main__":
    asyncio.run(check_categories())
