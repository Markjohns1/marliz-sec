import sys
import os
import asyncio
import logging
import re

# Add the parent directory to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import get_db_context
from app.models import Article, SimplifiedContent
from sqlalchemy import select

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("Cleaner")

async def clean_content():
    """
    Cleans up duplicate headers and AI ghosting artifacts from the database.
    """
    CLEANED_COUNT = 0
    
    logger.info("🧹 Starting Content Cleanup...")
    
    async with get_db_context() as db:
        # Get all articles that might be dirty (top 100)
        stmt = select(SimplifiedContent).order_by(SimplifiedContent.id.desc()).limit(100)
        result = await db.execute(stmt)
        contents = result.scalars().all()
        
        logger.info(f"📋 Checking {len(contents)} articles for dirt...")
        
        for c in contents:
            original_summary = c.friendly_summary or ""
            original_impact = c.business_impact or ""
            
            # --- CLEANUP LOGIC ---
            
            # 1. Remove AI Ghosting Artifacts like [Position: 0], [Position: 1], etc.
            new_summary = re.sub(r'\[Position: \d+\]', '', original_summary)
            new_summary = re.sub(r'\+ Conclusion', '', new_summary)
            
            # 2. Fix Double Headers (Case Insensitive)
            # Remove any occurrence of the header if it's accidentally repeated
            header_str = "## Marliz Intel Strategic Assessment"
            if new_summary.count(header_str) > 1:
                # Keep only the first occurrence and everything before the second
                parts = new_summary.split(header_str)
                # This assumes we want to keep the FIRST one correctly formatted
                new_summary = parts[0] + header_str + parts[1]
                logger.info(f"✂️  Fixed double Strategic Assessment header in Article ID {c.article_id}")

            # 3. Clean up generic H3 repetitions in Business Impact
            new_impact = original_impact.replace("## Business & Operational Impact", "").strip()
            new_impact = new_impact.replace("Business & Operational Impact", "").strip()
            
            # 4. Strip leading/trailing junk
            new_summary = new_summary.strip()
            new_impact = new_impact.strip()

            # --- SAVE IF CHANGED ---
            if new_summary != original_summary or new_impact != original_impact:
                c.friendly_summary = new_summary
                c.business_impact = new_impact
                CLEANED_COUNT += 1
                logger.debug(f"✨ Cleaned Article ID {c.article_id}")

        await db.commit()

    logger.info("="*50)
    logger.info("🏁 CLEANUP REPORT")
    logger.info(f"Total Articles Cleaned: {CLEANED_COUNT}")
    logger.info("="*50)

if __name__ == "__main__":
    asyncio.run(clean_content())
