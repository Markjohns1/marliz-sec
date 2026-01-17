import asyncio
import logging
from sqlalchemy import select, delete
from app.database import init_db, get_db_context
from app.models import Article, DeletedArticle, ArticleStatus

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def fix_conflicts():
    """
    Finds and resolves conflicts where a slug exists in BOTH
    the 'articles' table (Active) and 'deleted_articles' table (410 Gone).
    
    Resolution: Remove from 'articles' (Active) to honor the 410 Buried status.
    If it's in the graveyard, it should stay dead.
    """
    async with get_db_context() as db:
        print("🔍 Scanning for 410/Active conflicts...")
        
        # 1. Get all deleted slugs (The Authority)
        stmt_deleted = select(DeletedArticle.slug)
        res_deleted = await db.execute(stmt_deleted)
        deleted_slugs = set(res_deleted.scalars().all())
        
        if not deleted_slugs:
            print("✅ Graveyard is empty. No conflicts possible.")
            return

        # 2. Find any Active articles that match these deleted slugs
        stmt_conflicts = select(Article).filter(
            Article.slug.in_(deleted_slugs),
            Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        )
        res_conflicts = await db.execute(stmt_conflicts)
        conflict_articles = res_conflicts.scalars().all()
        
        if not conflict_articles:
            print("✅ No conflicts found. System is clean.")
            return

        print(f"⚠️ Found {len(conflict_articles)} conflicts (Active articles that SHOULD meet 410 status):")
        conflict_ids = []
        for art in conflict_articles:
            print(f"   - [ID: {art.id}] {art.slug}")
            conflict_ids.append(art.id)
        
        print("\n🛠️  Resolving conflicts: Burying these articles permanently...")
        
        # 3. Delete from 'articles' to enforce the 410 status
        if conflict_ids:
            stmt_fix = delete(Article).where(Article.id.in_(conflict_ids))
            await db.execute(stmt_fix)
            await db.commit()
        
        print(f"✅ Successfully buried {len(conflict_ids)} zombie articles.")
        print("   These slugs will now correctly return '410 Gone' to Google.")

if __name__ == "__main__":
    asyncio.run(fix_conflicts())
