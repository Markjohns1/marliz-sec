from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app import models, schemas
import logging

router = APIRouter(prefix="/api/subscribers", tags=["subscribers"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=schemas.Subscriber)
def subscribe(
    subscriber_data: schemas.SubscriberCreate,
    db: Session = Depends(get_db)
):
    """
    Subscribe to newsletter
    - Email validation
    - Duplicate check
    """
    
    # Check if already subscribed
    existing = db.query(models.Subscriber).filter_by(
        email=subscriber_data.email
    ).first()
    
    if existing:
        if existing.unsubscribed_at:
            # Resubscribe
            existing.unsubscribed_at = None
            db.commit()
            db.refresh(existing)
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
    db.commit()
    db.refresh(subscriber)
    
    logger.info(f"New subscriber: {subscriber.email}")
    
    return subscriber

@router.delete("/{email}")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter"""
    
    from datetime import datetime
    
    subscriber = db.query(models.Subscriber).filter_by(email=email).first()
    if not subscriber:
        raise HTTPException(status_code=404, detail="Subscriber not found")
    
    subscriber.unsubscribed_at = datetime.now()
    db.commit()
    
    return {"message": "Successfully unsubscribed"}

@router.get("/count")
def get_subscriber_count(db: Session = Depends(get_db)):
    """Get total subscriber count (for dashboard)"""
    
    active = db.query(models.Subscriber).filter(
        models.Subscriber.unsubscribed_at.is_(None)
    ).count()
    
    return {"active_subscribers": active}