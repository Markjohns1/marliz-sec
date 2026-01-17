import sys
import os
import asyncio
import logging
import re

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import SimplifiedContent
from sqlalchemy import select

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Cleaner")

async def clean_content():
    """
    Surgically cleans up the database using isolated sessions.
    """
    CLEANED_COUNT = 0
    logger.info("🧹 Starting Content Cleanup (Isolated Mode)...")
    
    # 1. Get IDs
    async with AsyncSessionLocal() as db:
        stmt = select(SimplifiedContent.id).order_by(SimplifiedContent.id.desc()).limit(100)
        result = await db.execute(stmt)
        content_ids = result.scalars().all()

    # 2. Process each individually
    for cid in content_ids:
        async with AsyncSessionLocal() as db:
            try:
                c = await db.get(SimplifiedContent, cid)
                if not c: continue

                original_summary = c.friendly_summary or ""
                original_impact = c.business_impact or ""

                # --- CLEANUP ---
                new_summary = re.sub(r'\[Position: \d+\]', '', original_summary)
                new_summary = re.sub(r'\+ Conclusion', '', new_summary)
                
                header_str = "## Marliz Intel Strategic Assessment"
                if new_summary.count(header_str) > 1:
                    parts = new_summary.split(header_str)
                    new_summary = parts[0] + header_str + parts[1]

                new_impact = original_impact.replace("## Business & Operational Impact", "").strip()
                new_impact = new_impact.replace("Business & Operational Impact", "").strip()

                if new_summary != original_summary or new_impact != original_impact:
                    c.friendly_summary = new_summary.strip()
                    c.business_impact = new_impact.strip()
                    await db.commit()
                    CLEANED_COUNT += 1
            except Exception as e:
                logger.error(f"Error cleaning {cid}: {e}")
                await db.rollback()

    logger.info(f"🏁 CLEANUP DONE. Articles Cleaned: {CLEANED_COUNT}")

if __name__ == "__main__":
    asyncio.run(clean_content())
