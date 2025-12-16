from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app import models, schemas
from typing import List

router = APIRouter(prefix="/api/categories", tags=["categories"])

@router.get("/", response_model=List[schemas.Category])
async def get_categories(db: AsyncSession = Depends(get_db)):
    """
    Get all categories with article counts
    - For navigation menu
    - Ordered by priority
    """
    
    stmt = select(models.Category).order_by(models.Category.priority.desc())
    result = await db.execute(stmt)
    categories = result.scalars().all()
    
    return categories

@router.get("/{slug}", response_model=schemas.Category)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single category by slug"""
    
    stmt = select(models.Category).filter_by(slug=slug)
    result = await db.execute(stmt)
    category = result.scalars().first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    return category

@router.get("/{slug}/count")
async def get_category_article_count(slug: str, db: AsyncSession = Depends(get_db)):
    """Get article count for category"""
    
    stmt = select(models.Category).filter_by(slug=slug)
    result = await db.execute(stmt)
    category = result.scalars().first()
    
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    stmt_count = select(func.count()).select_from(models.Article).filter(
        models.Article.category_id == category.id,
        models.Article.status.in_(["ready", "edited", "published"])
    )
    count_res = await db.execute(stmt_count)
    count = count_res.scalar_one()
    
    return {"category": category.name, "count": count}