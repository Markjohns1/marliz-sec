from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize scheduler
scheduler = AsyncIOScheduler()

async def fetch_news_job():
    """Background job to fetch news"""
    from app.services.news_fetcher import news_fetcher
    
    logger.info("🔄 Starting news fetch job...")
    try:
        result = await news_fetcher.fetch_news()
        logger.info(f"✓ News fetch completed: {result['total_new']} new articles")
        
        # Trigger simplification immediately after fetch if new articles found
        if result['total_new'] > 0:
            await simplify_articles_job()
            
    except Exception as e:
        logger.error(f"✗ News fetch failed: {str(e)}")

async def simplify_articles_job():
    """Background job to simplify articles with AI"""
    from app.services.ai_simplifier import ai_simplifier
    
    logger.info("🤖 Starting AI simplification job...")
    try:
        result = await ai_simplifier.process_pending_articles()
        logger.info(f"✓ AI processing completed: {result['processed']} articles simplified")
    except Exception as e:
        logger.error(f"✗ AI simplification failed: {str(e)}")

async def cleanup_job():
    """Background job to clean up old data"""
    from app.database import get_db_context
    from app.models import Article
    from datetime import datetime, timedelta
    
    logger.info("🧹 Starting daily retention cleanup...")
    try:
        with get_db_context() as db:
            # Delete ALL articles older than 30 days to keep content fresh
            cutoff_date = datetime.now() - timedelta(days=30)
            deleted = db.query(Article).filter(
                Article.published_at < cutoff_date
            ).delete()
            db.commit()
            if deleted > 0:
                logger.info(f"✓ Retention Policy: Removed {deleted} expired articles (>30 days)")
    except Exception as e:
        logger.error(f"✗ Cleanup failed: {str(e)}")

def start_scheduler():
    """Start all scheduled jobs"""
    
    # Fetch news twice daily: 7 AM and 7 PM UTC
    scheduler.add_job(
        fetch_news_job,
        trigger="cron",
        hour=7,
        minute=0,
        id="fetch_news_morning",
        name="Morning news fetch (7 AM)",
        replace_existing=True
    )
    
    scheduler.add_job(
        fetch_news_job,
        trigger="cron",
        hour=19,
        minute=0,
        id="fetch_news_evening",
        name="Evening news fetch (7 PM)",
        replace_existing=True
    )
    
    # Simplify articles every 30 minutes - DISABLED
    # Simplify articles every 30 minutes
    scheduler.add_job(
        simplify_articles_job,
        trigger=IntervalTrigger(minutes=30),
        id="simplify_articles",
        name="Simplify articles with AI",
        replace_existing=True
    )
    
    # Cleanup every 24 hours at 3 AM
    scheduler.add_job(
        cleanup_job,
        trigger="cron",
        hour=3,
        minute=0,
        id="cleanup",
        name="Cleanup old data",
        replace_existing=True
    )
    
    # Run jobs immediately on startup
    scheduler.add_job(
        fetch_news_job,
        id="startup_fetch",
        name="Initial news fetch"
    )
    # scheduler.add_job(
    #      simplify_articles_job,
    #      id="startup_simplify",
    #      name="Initial simplification"
    #  )
    scheduler.add_job(
        cleanup_job,
        id="startup_cleanup",
        name="Initial cleanup"
    )
    
    scheduler.start()
    logger.info("✓ Scheduler started: News fetch at 7 AM and 7 PM UTC")
    logger.info("✓ Jobs: fetch_news_morning, fetch_news_evening, cleanup, simplify_articles")

def stop_scheduler():
    """Stop scheduler gracefully"""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("✓ Scheduler stopped")