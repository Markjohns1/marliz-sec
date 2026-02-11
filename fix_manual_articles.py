"""
Fix manually published articles that have NULL content_markdown.
Builds content_markdown from the simplified_content fields so 
the Full Intel Editor can load and edit them.

Run once after deploying the QuickPublish fix.
Usage: python backend/fix_manual_articles.py
"""
import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session_maker
from app import models


async def fix_manual_articles():
    async with async_session_maker() as db:
        # Find all published articles with NULL or empty content_markdown
        stmt = select(models.Article).filter(
            models.Article.status == models.ArticleStatus.PUBLISHED,
            (models.Article.content_markdown == None) | (models.Article.content_markdown == '')
        )
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        if not articles:
            print("✅ No articles with empty content_markdown found. All good!")
            return
        
        print(f"Found {len(articles)} articles with empty content_markdown. Fixing...")
        
        fixed = 0
        for article in articles:
            # Get the simplified content for this article
            simp_stmt = select(models.SimplifiedContent).filter_by(article_id=article.id)
            simp_result = await db.execute(simp_stmt)
            simplified = simp_result.scalars().first()
            
            if not simplified:
                print(f"  ⚠️  Article #{article.id} '{article.title[:50]}...' has no simplified content. Skipping.")
                continue
            
            # Build markdown from existing fields
            action_steps = ""
            try:
                steps = json.loads(simplified.action_steps) if simplified.action_steps else []
                for i, step in enumerate(steps, 1):
                    action_steps += f"{i}. {step}\n"
            except:
                action_steps = "1. Review the full report\n2. Apply recommended mitigations\n"
            
            markdown = f"""## What Happened

{simplified.friendly_summary}

## Technical Analysis

{simplified.attack_vector or 'See detailed report.'}

## Business Impact

{simplified.business_impact}

## What You Should Do Now

{action_steps}"""
            
            article.content_markdown = markdown
            fixed += 1
            print(f"  ✅ Fixed Article #{article.id}: '{article.title[:60]}...' ({len(markdown)} chars)")
        
        await db.commit()
        print(f"\n🎯 Done! Fixed {fixed}/{len(articles)} articles.")


if __name__ == "__main__":
    asyncio.run(fix_manual_articles())
