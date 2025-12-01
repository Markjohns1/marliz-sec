from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from app.database import get_db
from app import models, schemas
from app.models import ArticleStatus
from typing import List, Optional
import json
from datetime import datetime
from slugify import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=schemas.ArticleList)
def get_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    threat_level: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get paginated list of published articles
    - SEO-friendly with filters
    - Returns only READY articles with simplified content
    """
    
    # Base query: only published articles with simplified content
    query = db.query(models.Article).join(
        models.SimplifiedContent
    ).filter(
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    )
    
    # Filter by category slug
    if category:
        query = query.join(models.Category).filter(models.Category.slug == category)
    
    # Filter by threat level
    if threat_level:
        query = query.filter(models.SimplifiedContent.threat_level == threat_level)
    
    # Search in title and summary
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Article.title.ilike(search_term),
                models.SimplifiedContent.friendly_summary.ilike(search_term)
            )
        )
    
    # Get total count
    total = query.count()
    
    # Paginate and sort by date
    articles = query.order_by(desc(models.Article.published_at)).offset(
        (page - 1) * limit
    ).limit(limit).all()
    
    # Calculate pages
    pages = (total + limit - 1) // limit
    
    return {
        "articles": articles,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/{slug}", response_model=schemas.ArticleWithContent)
def get_article(slug: str, db: Session = Depends(get_db)):
    """
    Get single article by slug
    - Increments view count
    - Returns full content with SEO meta
    """
    
    article = db.query(models.Article).filter(
        models.Article.slug == slug,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    article.views += 1
    db.commit()
    
    return article

@router.get("/related/{article_id}", response_model=List[schemas.Article])
def get_related_articles(
    article_id: int,
    limit: int = Query(3, ge=1, le=10),
    db: Session = Depends(get_db)
):
    """Get related articles from same category"""
    
    article = db.query(models.Article).filter_by(id=article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    related = db.query(models.Article).filter(
        models.Article.category_id == article.category_id,
        models.Article.id != article_id,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED])
    ).order_by(desc(models.Article.published_at)).limit(limit).all()
    
    return related

@router.post("/manual", response_model=schemas.Article)
def create_manual_article(
    article_data: schemas.ManualArticleCreate,
    db: Session = Depends(get_db)
):
    """
    Create article manually (admin only)
    - For posting custom content
    - Bypasses AI processing
    """
    
    import os
    if article_data.admin_secret != os.getenv("ADMIN_SECRET"):
        raise HTTPException(status_code=403, detail="Invalid admin secret")
    
    # Generate slug
    base_slug = slugify(article_data.title)
    slug = base_slug
    counter = 1
    while db.query(models.Article).filter_by(slug=slug).first():
        slug = f"{base_slug}-{counter}"
        counter += 1
    
    # Create article
    article = models.Article(
        title=article_data.title,
        slug=slug,
        original_url=article_data.original_url or f"https://yourdomain.com/article/{slug}",
        source_name=article_data.source_name,
        published_at=datetime.now(),
        image_url=article_data.image_url,
        category_id=article_data.category_id,
        status=ArticleStatus.PUBLISHED,
        is_edited=True,
        edited_by="admin",
        edited_at=datetime.now()
    )
    db.add(article)
    db.flush()  # Get article.id
    
    # Create simplified content
    simplified = models.SimplifiedContent(
        article_id=article.id,
        friendly_summary=article_data.friendly_summary,
        business_impact=article_data.business_impact,
        action_steps=json.dumps(article_data.action_steps),
        threat_level=article_data.threat_level
    )
    db.add(simplified)
    db.commit()
    db.refresh(article)
    
    return article

@router.put("/{article_id}", response_model=schemas.Article)
def update_article(
    article_id: int,
    updates: schemas.ArticleUpdate,
    db: Session = Depends(get_db)
):
    """
    Edit article content
    - Updates simplified content
    - Marks as edited with timestamp
    """
    
    import os
    # Simple auth check - in production use proper JWT
    from fastapi import Header
    
    article = db.query(models.Article).filter_by(id=article_id).first()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    simplified = db.query(models.SimplifiedContent).filter_by(
        article_id=article_id
    ).first()
    if not simplified:
        raise HTTPException(status_code=404, detail="Simplified content not found")
    
    # Update fields
    if updates.title:
        article.title = updates.title
        # Regenerate slug
        article.slug = slugify(updates.title)
    
    if updates.friendly_summary:
        simplified.friendly_summary = updates.friendly_summary
    
    if updates.business_impact:
        simplified.business_impact = updates.business_impact
    
    if updates.action_steps:
        simplified.action_steps = updates.action_steps
    
    if updates.threat_level:
        simplified.threat_level = updates.threat_level
    
    if updates.category_id:
        article.category_id = updates.category_id
    
    # Mark as edited
    article.is_edited = True
    article.edited_by = updates.edited_by
    article.edited_at = datetime.now()
    article.status = ArticleStatus.EDITED
    
    db.commit()
    db.refresh(article)
    
    return article

@router.get("/stats/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    """Get stats for admin dashboard"""
    
    total_articles = db.query(models.Article).count()
    published = db.query(models.Article).filter(
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).count()
    pending = db.query(models.Article).filter_by(status=ArticleStatus.RAW).count()
    total_views = db.query(models.Article).with_entities(
        db.func.sum(models.Article.views)
    ).scalar() or 0
    
    # Top articles by views
    top_articles = db.query(models.Article).order_by(
        desc(models.Article.views)
    ).limit(5).all()
    
    return {
        "total_articles": total_articles,
        "published": published,
        "pending": pending,
        "total_views": total_views,
        "top_articles": [{"id": a.id, "title": a.title, "views": a.views} for a in top_articles]
    }