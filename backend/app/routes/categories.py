from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.Category])
def get_categories(db: Session = Depends(get_db)):
    """
    Get all categories with article counts
    - For navigation menu
    - Ordered by priority
    """
    
    categories = db.query(models.Category).order_by(
        models.Category.priority.desc()
    ).all()
    
    return categories

@router.get("/{slug}", response_model=schemas.Category)
def get_category(slug: str, db: Session = Depends(get_db)):
    """Get single category by slug"""
    
    category = db.query(models.Category).filter_by(slug=slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return category

@router.get("/{slug}/count")
def get_category_article_count(slug: str, db: Session = Depends(get_db)):
    """Get article count for category"""
    
    category = db.query(models.Category).filter_by(slug=slug).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    count = db.query(models.Article).filter(
        models.Article.category_id == category.id,
        models.Article.status.in_(["ready", "edited", "published"])
    ).count()
    
    return {"category": category.name, "count": count}