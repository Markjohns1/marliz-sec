from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app import models, schemas
from app.services.newsletter import newsletter_service
import logging

from app.auth import verify_api_key

router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=schemas.Subscriber)
async def subscribe(
    subscriber_data: schemas.SubscriberCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Subscribe to newsletter
    - Email validation
    - Duplicate check
    """
    
    # Check if already subscribed
    stmt = select(models.Subscriber).filter_by(email=subscriber_data.email)
    result = await db.execute(stmt)
    existing = result.scalars().first()
    
    if existing:
        if existing.unsubscribed_at:
            # Resubscribe
            existing.unsubscribed_at = None
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            raise HTTPException(
                status_code=400,
                detail="Email already subscribed"
            )
    
    # Create new subscriber
    subscriber = models.Subscriber(
        email=subscriber_data.email,
        is_verified=False  # Send verification email in production
    )
    
    db.add(subscriber)
    await db.commit()
    await db.refresh(subscriber)
    
    logger.info(f"New subscriber: {subscriber.email}")
    
    return subscriber

@router.delete("/{email}")
async def unsubscribe(email: str, db: AsyncSession = Depends(get_db)):
    """Unsubscribe from newsletter"""
    
    from datetime import datetime
    
    stmt = select(models.Subscriber).filter_by(email=email)
    result = await db.execute(stmt)
    subscriber = result.scalars().first()
    
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    subscriber.unsubscribed_at = datetime.now()
    await db.commit()
    
    return {"message": "Successfully unsubscribed"}

@router.get("/admin/list")
async def get_admin_subscribers(
    page: int = 1,
    limit: int = 50,
    api_key_obj = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only subscriber listing"""
    
    # Base query
    stmt = select(models.Subscriber).order_by(models.Subscriber.subscribed_at.desc())
    
    # Total count
    count_stmt = select(func.count()).select_from(models.Subscriber)
    count_result = await db.execute(count_stmt)
    total = count_result.scalar_one()
    
    # Paginate
    stmt = stmt.offset((page - 1) * limit).limit(limit)
    result = await db.execute(stmt)
    subscribers = result.scalars().all()
    
    return {
        "subscribers": subscribers,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.post("/admin/test-email")
async def send_test_email(
    email: str,
    api_key_obj = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Send a test newsletter to a specific email"""
    articles = await newsletter_service.get_top_articles(limit=3)
    if not articles:
        return {"status": "error", "message": "No articles found to send."}
        
    import resend
    html_content = newsletter_service._generate_html(articles)
    
    try:
        resend.Emails.send({
            "from": newsletter_service.from_email,
            "to": email,
            "subject": "[TEST] Marliz Intel Digest",
            "html": html_content
        })
        return {"status": "success", "message": f"Test email sent to {email}"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/admin/trigger-digest")
async def trigger_digest(
    trigger: schemas.ManualNewsletterTrigger,
    api_key_obj = Depends(verify_api_key)
):
    """Manually trigger the daily digest to all subscribers with specific articles"""
    success, message = await newsletter_service.send_daily_digest(
        article_ids=trigger.article_ids,
        custom_note=trigger.custom_note
    )
    if success:
        return {"status": "success", "message": f"Newsletter digest sent: {message}"}
    else:
        return {"status": "error", "message": f"Deployment failed: {message}"}

@router.get("/count")
async def get_subscriber_count(db: AsyncSession = Depends(get_db)):
    """Get total subscriber count (for dashboard)"""
    
    stmt = select(func.count()).select_from(models.Subscriber).filter(
        models.Subscriber.unsubscribed_at.is_(None)
    )
    result = await db.execute(stmt)
    active = result.scalar_one()
    
    return {"active_subscribers": active}