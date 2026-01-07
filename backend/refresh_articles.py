
import asyncio
import os
import sys
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload

# Add the current directory to sys.path to allow importing 'app'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), ".")))

# FORCE LOGGING TO CONTAINER STDOUT for detached mode monitoring
try:
    if os.path.exists('/proc/1/fd/1'):
        sys.stdout = open('/proc/1/fd/1', 'w', buffering=1)
        sys.stderr = open('/proc/1/fd/2', 'w', buffering=1)
except Exception:
    pass

from app.database import AsyncSessionLocal
from app.models import Article, ArticleStatus, SimplifiedContent
from app.services.ai_simplifier import ai_simplifier

async def upgrade_single_article(article_id):
    """Process a single article with its own isolated session to prevent race conditions."""
    async with AsyncSessionLocal() as db:
        # Fetch the article inside the session
        stmt = select(Article).options(selectinload(Article.simplified)).where(Article.id == article_id)
        result = await db.execute(stmt)
        article = result.scalars().first()
        
        if not article:
            return "not_found"
            
        # Check word count again to be safe
        word_count = 0
        if article.simplified:
            summary = article.simplified.friendly_summary or ""
            word_count = len(summary.split()) + \
                         len((article.simplified.attack_vector or "").split()) + \
                         len((article.simplified.business_impact or "").split())
        
        if word_count >= 800:
            return "already_upgraded"

        # Initialize simplifier categories if needed
        if not ai_simplifier.category_map:
            await ai_simplifier._load_categories(db)
            
        # Run the simplification
        return await ai_simplifier._simplify_article(db, article)

async def refresh_all_articles():
    """Main loop to drive the bulk upgrade process."""
    print("Marliz Intel Bulk Upgrade Engine v2.1 (Aggressive Mode) Starting...")
    
    # 1. Get all eligible article IDs first
    async with AsyncSessionLocal() as db:
        stmt = select(Article.id).where(
            Article.status.in_([ArticleStatus.RAW, ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
        ).order_by(Article.id)
        result = await db.execute(stmt)
        article_ids = result.scalars().all()
    
    total = len(article_ids)
    print(f"Found {total} articles to verify/upgrade.")
    
    batch_size = 1 # Sequential processing to prevent 429s
    processed_in_batch = 0
    
    PER_ARTICLE_REST = 10   # Wait 10s between each article
    BATCH_COOLDOWN = 5      # Short cooldown since batch is 1
    RATE_LIMIT_REST = 60    # Wait 60s if we hit a limit

    for i, aid in enumerate(article_ids):
        # We don't print immediately to avoid cluttering if we are just skipping
        retries = 3
        success = False
        was_skipped = False
        
        while retries > 0 and not success:
            try:
                status = await upgrade_single_article(aid)
                
                if status == "success":
                    print(f"[{i+1}/{total}] ID: {aid} -> SUCCESS: Content upgraded.")
                    success = True
                    processed_in_batch += 1
                elif status == "already_upgraded":
                    # Instant skip - no print unless debugging, or very quiet print
                    # print(f"[{i+1}/{total}] ID: {aid} -> SKIP")
                    success = True
                    was_skipped = True
                elif status == "rate_limited":
                    print(f"[{i+1}/{total}] ID: {aid} -> WARNING: Rate limited. Cooldown {RATE_LIMIT_REST}s...")
                    await asyncio.sleep(RATE_LIMIT_REST)
                    retries -= 1
                else:
                    print(f"[{i+1}/{total}] ID: {aid} -> API ERROR ({status}). Retrying...")
                    await asyncio.sleep(20)
                    retries -= 1
            except Exception as e:
                print(f"[{i+1}/{total}] ID: {aid} -> SYSTEM ERROR: {e}")
                await asyncio.sleep(20)
                retries -= 1
        
        if was_skipped:
            continue # MOVE TO NEXT IMMEDIATELY - NO DELAY

        # If we reached here, we actually processed an article
        if processed_in_batch >= batch_size:
            print(f"--- BATCH COMPLETE. Resting {BATCH_COOLDOWN}s ---")
            await asyncio.sleep(BATCH_COOLDOWN)
            processed_in_batch = 0
        else:
            await asyncio.sleep(PER_ARTICLE_REST)

    print("\nBulk Upgrade Engine finished all tasks.")
    
    # Run diagnosis after completion
    await diagnose_thin_articles()

async def diagnose_thin_articles():
    """Show all articles with less than 800 words."""
    print("\n" + "=" * 60)
    print("DIAGNOSTIC REPORT: Articles Below 800 Words")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        stmt = select(Article).options(selectinload(Article.simplified))
        result = await db.execute(stmt)
        articles = result.scalars().all()
        
        total = len(articles)
        thin_articles = []
        
        for article in articles:
            word_count = 0
            if article.simplified:
                summary = article.simplified.friendly_summary or ""
                attack = article.simplified.attack_vector or ""
                impact = article.simplified.business_impact or ""
                word_count = len(summary.split()) + len(attack.split()) + len(impact.split())
            
            if word_count < 800:
                thin_articles.append({
                    'id': article.id,
                    'title': article.title[:40] + "..." if len(article.title) > 40 else article.title,
                    'status': article.status.value if article.status else "UNKNOWN",
                    'words': word_count,
                    'has_simplified': article.simplified is not None
                })
        
        # Sort by word count
        thin_articles.sort(key=lambda x: x['words'])
        
        print(f"\nTOTAL ARTICLES: {total}")
        print(f"ARTICLES WITH < 800 WORDS: {len(thin_articles)}")
        print(f"ARTICLES WITH 0 WORDS: {len([a for a in thin_articles if a['words'] == 0])}")
        
        # Group by status
        by_status = {}
        for a in thin_articles:
            status = a['status']
            if status not in by_status:
                by_status[status] = []
            by_status[status].append(a)
        
        print("\n" + "-" * 60)
        for status, items in by_status.items():
            print(f"\n[{status}] - {len(items)} articles:")
            for item in items[:15]:  # Show first 15 per status
                flag = "✓" if item['has_simplified'] else "✗"
                print(f"  ID: {item['id']:4} | {item['words']:4} words | Simp: {flag} | {item['title']}")
            if len(items) > 15:
                print(f"  ... and {len(items) - 15} more")
        
        # Show zero-word IDs for quick targeting
        zero_ids = [a['id'] for a in thin_articles if a['words'] == 0]
        if zero_ids:
            print("\n" + "-" * 60)
            print(f"ZERO-WORD IDs ({len(zero_ids)}): {zero_ids[:30]}")
            if len(zero_ids) > 30:
                print(f"  ... and {len(zero_ids) - 30} more")
        
        print("\n" + "=" * 60)

async def cleanup_thin_articles():
    """Delete all articles with less than 300 words."""
    print("=" * 60)
    print("CLEANUP: Deleting articles with < 300 words")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Article).options(selectinload(Article.simplified)))
        articles = result.scalars().all()
        deleted = 0
        
        for a in articles:
            wc = 0
            if a.simplified:
                wc = len((a.simplified.friendly_summary or '').split()) + \
                     len((a.simplified.attack_vector or '').split()) + \
                     len((a.simplified.business_impact or '').split())
            
            if wc < 300:
                print(f"Deleting ID {a.id}: {wc} words | {a.title[:40]}...")
                await db.delete(a)
                deleted += 1
        
        await db.commit()
        print("-" * 60)
        print(f"DONE. Deleted {deleted} articles with < 300 words.")
        print("=" * 60)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--diagnose":
        print("Running diagnostic only...")
        asyncio.run(diagnose_thin_articles())
    elif len(sys.argv) > 1 and sys.argv[1] == "--cleanup":
        print("Running cleanup...")
        asyncio.run(cleanup_thin_articles())
    else:
        asyncio.run(refresh_all_articles())
