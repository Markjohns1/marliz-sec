from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app import models, schemas
from app.auth import verify_api_key
from app.models import ArticleStatus
from typing import List, Optional
import json
from datetime import datetime
from slugify import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])

@router.get("/", response_model=schemas.ArticleList)
async def get_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(12, ge=1, le=50),
    category: Optional[str] = None,
    threat_level: Optional[str] = None,
    sort_by: Optional[str] = "date",
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get paginated list of published articles (Async)
    """
    
    # Base query
    query = select(models.Article).join(
        models.SimplifiedContent
    ).filter(
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).options(selectinload(models.Article.simplified), selectinload(models.Article.category))
    
    # Filter by category slug
    if category:
        query = query.join(models.Category).filter(models.Category.slug == category)
    
    # Filter by threat level
    if threat_level:
        query = query.filter(models.SimplifiedContent.threat_level == threat_level)
    
    # Search
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            or_(
                models.Article.title.ilike(search_term),
                models.Article.raw_content.ilike(search_term),
                models.Article.keywords.ilike(search_term),
                models.SimplifiedContent.friendly_summary.ilike(search_term),
                models.SimplifiedContent.attack_vector.ilike(search_term),
                models.SimplifiedContent.business_impact.ilike(search_term)
            )
        )
    
    # Sort results
    if sort_by == "severity":
        from sqlalchemy import case
        severity_order = case(
            {
                models.ThreatLevel.CRITICAL: 4,
                models.ThreatLevel.HIGH: 3,
                models.ThreatLevel.MEDIUM: 2,
                models.ThreatLevel.LOW: 1,
            },
            value=models.SimplifiedContent.threat_level,
        )
        query = query.order_by(desc(severity_order), desc(models.Article.published_at))
    else:
        query = query.order_by(desc(models.Article.published_at))
    
    # Execute count
    # Note: For strict total count in filtering, a separate query is cleanest
    # We clone the query but select count()
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar_one()

    # Paginate
    query = query.offset((page - 1) * limit).limit(limit)
    
    result = await db.execute(query)
    articles = result.scalars().all()
    
    # Calculate pages
    pages = (total + limit - 1) // limit
    
    return {
        "articles": articles,
        "total": total,
        "page": page,
        "pages": pages
    }

@router.get("/{slug}", response_model=schemas.ArticleWithContent)
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    """Get single article by slug (Async)"""
    
    stmt = select(models.Article).filter(
        models.Article.slug == slug,
        models.Article.status.in_([s.value for s in [ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED]])
    ).options(selectinload(models.Article.simplified), selectinload(models.Article.category))
    
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Increment views
    article.views += 1
    await db.commit()
    # Re-fetch with relationships to ensure everything is loaded for Pydantic
    # We reuse the logic from the initial query or just execute a new simple one with options
    stmt = select(models.Article).filter_by(id=article.id).options(
        selectinload(models.Article.simplified), 
        selectinload(models.Article.category)
    )
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    # Confirm object is fresh
    print(f"DEBUG: Refetched article {article.id}. Status: {article.status}")
    
    # Explicitly convert to Pydantic model to unhook from DB session
    return schemas.ArticleWithContent.model_validate(article)

@router.get("/related/{article_id}", response_model=List[schemas.Article])
async def get_related_articles(
    article_id: int,
    limit: int = Query(3, ge=1, le=10),
    db: AsyncSession = Depends(get_db)
):
    """Get related articles"""
    
    result = await db.execute(select(models.Article).filter_by(id=article_id))
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    stmt = select(models.Article).filter(
        models.Article.category_id == article.category_id,
        models.Article.id != article_id,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED])
    ).order_by(desc(models.Article.published_at)).limit(limit).options(selectinload(models.Article.category))
    
    result = await db.execute(stmt)
    related = result.scalars().all()
    
    return related

@router.post("/manual", response_model=schemas.Article)
async def create_manual_article(
    article_data: schemas.ManualArticleCreate,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Create article manually (Protected)"""
    
    base_slug = slugify(article_data.title)
    slug = base_slug
    counter = 1
    
    while True:
        res = await db.execute(select(models.Article).filter_by(slug=slug))
        if not res.scalars().first():
            break
        slug = f"{base_slug}-{counter}"
        counter += 1
    
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
    await db.flush()
    
    simplified = models.SimplifiedContent(
        article_id=article.id,
        friendly_summary=article_data.friendly_summary,
        business_impact=article_data.business_impact,
        action_steps=json.dumps(article_data.action_steps),
        threat_level=article_data.threat_level
    )
    db.add(simplified)
    await db.commit()
    await db.refresh(article)
    
    # Eager load for validation
    stmt = select(models.Article).filter_by(id=article.id).options(selectinload(models.Article.category))
    res = await db.execute(stmt)
    return res.scalars().first()

@router.put("/{article_id}", response_model=schemas.Article)
async def update_article(
    article_id: int,
    updates: schemas.ArticleUpdate,
    api_key_obj = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Edit article content (Protected)"""
    
    stmt = select(models.Article).filter_by(id=article_id)
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    stmt_simp = select(models.SimplifiedContent).filter_by(article_id=article_id)
    res_simp = await db.execute(stmt_simp)
    simplified = res_simp.scalars().first()
    
    if not simplified:
        raise HTTPException(status_code=404, detail="Simplified content not found")
    
    # Update fields
    if updates.title:
        article.title = updates.title
        article.slug = slugify(updates.title)
    
    if updates.friendly_summary: simplified.friendly_summary = updates.friendly_summary
    if updates.business_impact: simplified.business_impact = updates.business_impact
    if updates.action_steps: simplified.action_steps = updates.action_steps
    if updates.threat_level: simplified.threat_level = updates.threat_level
    if updates.category_id: article.category_id = updates.category_id
    
    article.is_edited = True
    article.edited_by = updates.edited_by
    article.edited_at = datetime.now()
    article.status = ArticleStatus.EDITED
    
    await db.commit()
    
    # Reload with relationships
    stmt = select(models.Article).filter_by(id=article.id).options(selectinload(models.Article.category))
    res = await db.execute(stmt)
    return res.scalars().first()

@router.get("/stats/dashboard")
async def get_dashboard_stats(
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get stats for admin dashboard (Async) - Advanced Analytics"""
    from datetime import datetime, timedelta
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    two_days_ago = now - timedelta(hours=48)
    
    # === BASIC COUNTS ===
    q_total = select(func.count()).select_from(models.Article)
    total_articles = (await db.execute(q_total)).scalar_one()

    q_pub = select(func.count()).select_from(models.Article).filter(
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    )
    published = (await db.execute(q_pub)).scalar_one()

    q_pend = select(func.count()).select_from(models.Article).filter_by(status=ArticleStatus.RAW)
    pending = (await db.execute(q_pend)).scalar_one()

    q_views = select(func.sum(models.Article.views))
    total_views = (await db.execute(q_views)).scalar_one() or 0
    
    # === TIME-BASED METRICS ===
    # Articles today
    q_today = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= today_start
    )
    articles_today = (await db.execute(q_today)).scalar_one()
    
    # Articles this week
    q_week = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= week_ago
    )
    articles_this_week = (await db.execute(q_week)).scalar_one()
    
    # Articles last week (for comparison)
    q_last_week = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= two_weeks_ago,
        models.Article.created_at < week_ago
    )
    articles_last_week = (await db.execute(q_last_week)).scalar_one()
    
    # Growth percentage
    if articles_last_week > 0:
        growth_pct = round(((articles_this_week - articles_last_week) / articles_last_week) * 100, 1)
    else:
        growth_pct = 100 if articles_this_week > 0 else 0
    
    # === CONTENT INSIGHTS ===
    # Average views per article
    avg_views = round(total_views / total_articles, 1) if total_articles > 0 else 0
    
    # Top articles (all time)
    stmt = select(models.Article).order_by(desc(models.Article.views)).limit(5)
    top_articles_res = await db.execute(stmt)
    top_articles = top_articles_res.scalars().all()
    
    # Trending articles (last 48 hours, sorted by views)
    q_trending = select(models.Article).filter(
        models.Article.created_at >= two_days_ago,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).order_by(desc(models.Article.views)).limit(5)
    trending_res = await db.execute(q_trending)
    trending_articles = trending_res.scalars().all()
    
    # === CATEGORIES BREAKDOWN ===
    q_cats = select(
        models.Category.name,
        func.count(models.Article.id).label("count")
    ).join(models.Article, models.Article.category_id == models.Category.id
    ).group_by(models.Category.name
    ).order_by(desc("count"))
    cats_res = await db.execute(q_cats)
    categories_breakdown = [{"name": r[0], "count": r[1]} for r in cats_res.fetchall()]
    
    # Top category
    top_category = categories_breakdown[0]["name"] if categories_breakdown else "N/A"
    
    return {
        # Basic
        "total_articles": total_articles,
        "published": published,
        "pending": pending,
        "total_views": total_views,
        
        # Time-based
        "articles_today": articles_today,
        "articles_this_week": articles_this_week,
        "growth_pct": growth_pct,
        
        # Content
        "avg_views": avg_views,
        "top_category": top_category,
        "top_articles": [{"id": a.id, "title": a.title, "views": a.views} for a in top_articles],
        "trending_articles": [{"id": a.id, "title": a.title, "views": a.views} for a in trending_articles],
        
        # Categories
        "categories_breakdown": categories_breakdown
    }