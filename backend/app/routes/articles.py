from fastapi import APIRouter, Depends, HTTPException, Query, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, func
from sqlalchemy.orm import selectinload
from app.database import get_db
from app import models, schemas
from app.auth import verify_api_key
from app.models import ArticleStatus
from typing import List, Optional
import json
import asyncio
from datetime import datetime, timedelta
from slugify import slugify

router = APIRouter(prefix="/api/articles", tags=["articles"])

def get_source_type(referer: str, user_agent: str = None, query_ref: str = None) -> str:
    # 1. Priority: Manual Parameter (The "Tattoo")
    if query_ref:
        qr = query_ref.lower()
        if "wa" in qr or "whatsapp" in qr: return "WhatsApp"
        if "fb" in qr or "facebook" in qr: return "Facebook"
        if "li" in qr or "linkedin" in qr: return "LinkedIn"
        if "tg" in qr or "telegram" in qr: return "Telegram"
        if "dc" in qr or "discord" in qr: return "Discord"
        if "tw" in qr or "x" in qr: return "X (Twitter)"

    # 2. Secondary: User-Agent Fingerprinting (For mobile apps that hide headers)
    if user_agent:
        ua = user_agent.lower()
        if "whatsapp" in ua: return "WhatsApp"
        if "fbav" in ua or "fb_iab" in ua: return "Facebook" # Facebook In-App Browser
        if "linkedin" in ua: return "LinkedIn"
        if "telegram" in ua: return "Telegram"
        if "discord" in ua: return "Discord"

    # 3. Third: Referer Header (Standard web clicks)
    if not referer:
        return "Direct Access"
    
    ref = referer.lower()
    if "google" in ref: return "Google Search"
    if "bing" in ref: return "Bing Search"
    if "duckduckgo" in ref: return "DuckDuckGo"
    
    if any(x in ref for x in ["facebook", "fb.me", "facebook.com"]): return "Facebook"
    if "linkedin" in ref: return "LinkedIn"
    if "discord" in ref: return "Discord"
    if any(x in ref for x in ["whatsapp", "wa.me", "com.whatsapp"]): return "WhatsApp"
    if "telegram" in ref: return "Telegram"
    if any(x in ref for x in ["t.co", "twitter", "x.com"]): return "X (Twitter)"
    
    # 4. Old Data Merging (Legacy support)
    if ref in ["other", "other referrals"]: return "Other Referrals"
    if ref == "social": return "Social Platforms"
    if ref == "search": return "Search Engines"
    if ref == "direct": return "Direct Access"
    
    return "Other Referrals"

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

@router.get("/admin/list", response_model=schemas.ArticleList)
async def get_admin_articles(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    status: Optional[str] = None,
    sort_by: Optional[str] = "date", # date, views, impressions, position
    search: Optional[str] = None,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Admin-only article listing with metrics and private statuses"""
    query = select(models.Article).options(
        selectinload(models.Article.simplified), 
        selectinload(models.Article.category)
    )
    
    if category:
        query = query.join(models.Category).filter(models.Category.slug == category)
    if status:
        query = query.filter(models.Article.status == status)
    if search:
        search_term = f"%{search}%"
        query = query.filter(models.Article.title.ilike(search_term))
        
    # Sorting
    if sort_by == "views":
        query = query.order_by(desc(models.Article.views))
    elif sort_by == "impressions":
        query = query.order_by(desc(models.Article.impressions))
    elif sort_by == "position":
        query = query.order_by(models.Article.position.asc())
    else:
        query = query.order_by(desc(models.Article.created_at))
        
    # Count & Paginate
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar_one()
    
    query = query.offset((page - 1) * limit).limit(limit)
    result = await db.execute(query)
    articles = result.scalars().all()
    
    return {
        "articles": articles,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }

@router.get("/{slug}", response_model=schemas.ArticleWithContent)
async def get_article(slug: str, request: Request, db: AsyncSession = Depends(get_db)):
    """Get single article by slug (Async) and log view source"""
    
    stmt = select(models.Article).filter(
        models.Article.slug == slug,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).options(selectinload(models.Article.simplified), selectinload(models.Article.category))
    
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
    
    # Track View Source (Stage 2: Multi-Factor Recognition)
    referer = request.headers.get("referer")
    user_agent = request.headers.get("user-agent")
    query_ref = request.query_params.get("ref") or request.query_params.get("s")
    
    source_type = get_source_type(referer, user_agent, query_ref)
    
    view_log = models.ViewLog(
        article_id=article.id,
        referrer=referer,
        source_type=source_type
    )
    db.add(view_log)
    
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
    
    # We explicitly convert to Pydantic model here to ensure all data is eagerly loaded 
    # before the session closes, preventing 'MissingGreenlet' errors in the response serialization.
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
    
    # Update fields (Article Level)
    if updates.category_id: article.category_id = updates.category_id
    if updates.content_type: article.content_type = updates.content_type
    if updates.protected_from_deletion is not None: article.protected_from_deletion = updates.protected_from_deletion

    # Update fields (Simplified Level - Optional)
    if simplified:
        if updates.friendly_summary: simplified.friendly_summary = updates.friendly_summary
        if updates.business_impact: simplified.business_impact = updates.business_impact
        if updates.action_steps: simplified.action_steps = updates.action_steps
        if updates.threat_level: simplified.threat_level = updates.threat_level
    
    # Draft Logic (Article Level)
    if updates.draft_title is not None: article.draft_title = updates.draft_title
    if updates.draft_meta_description is not None: article.draft_meta_description = updates.draft_meta_description
    if updates.draft_keywords is not None: article.draft_keywords = updates.draft_keywords
    
    if any([updates.draft_title, updates.draft_meta_description, updates.draft_keywords]):
        article.has_draft = True
        article.last_edited_at = datetime.now()
        article.last_edited_by = updates.edited_by

    # Publish Logic
    if updates.publish_now:
        if article.draft_title: article.title = article.draft_title
        if article.draft_meta_description: article.meta_description = article.draft_meta_description
        if article.draft_keywords: article.keywords = article.draft_keywords
        
        article.has_draft = False
        article.is_edited = True
        article.edited_by = updates.edited_by
        article.edited_at = datetime.now()
        article.status = ArticleStatus.PUBLISHED # Move to published
    
    await db.commit()
    
    # Reload with relationships
    stmt = select(models.Article).filter_by(id=article.id).options(
        selectinload(models.Article.category),
        selectinload(models.Article.simplified)
    )
    res = await db.execute(stmt)
    return res.scalars().first()

@router.post("/{article_id}/publish")
async def publish_article(
    article_id: int,
    api_key_obj = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Move draft to live immediately"""
    stmt = select(models.Article).filter_by(id=article_id)
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")
        
    if article.has_draft:
        if article.draft_title: article.title = article.draft_title
        if article.draft_meta_description: article.meta_description = article.draft_meta_description
        if article.draft_keywords: article.keywords = article.draft_keywords
        
        article.has_draft = False
        article.is_edited = True
        article.edited_at = datetime.now()
        article.status = ArticleStatus.PUBLISHED
        
        await db.commit()
        
    return {"status": "published", "article_id": article_id}

@router.get("/stats/dashboard")
async def get_dashboard_stats(
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get stats for admin dashboard (Async) - Advanced Analytics"""
    
    now = datetime.utcnow()
    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)
    two_days_ago = now - timedelta(hours=48)
    
    # === BASIC COUNTS & TIME-BASED METRICS (PARALLEL) ===
    q_total = select(func.count()).select_from(models.Article)
    q_pub = select(func.count()).select_from(models.Article).filter(
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    )
    q_pend = select(func.count()).select_from(models.Article).filter_by(status=ArticleStatus.RAW)
    q_views = select(func.sum(models.Article.views))
    q_today = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= today_start
    )
    q_week = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= week_ago
    )
    q_last_week = select(func.count()).select_from(models.Article).filter(
        models.Article.created_at >= two_weeks_ago,
        models.Article.created_at < week_ago
    )

    # Execute count queries sequentially (SQLite doesn't support parallel session access)
    total_articles = (await db.execute(q_total)).scalar_one()
    published = (await db.execute(q_pub)).scalar_one()
    pending = (await db.execute(q_pend)).scalar_one()
    total_views = (await db.execute(q_views)).scalar_one() or 0
    articles_today = (await db.execute(q_today)).scalar_one()
    articles_this_week = (await db.execute(q_week)).scalar_one()
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
    
    # === CATEGORIES BREAKDOWN (ENHANCED) ===
    q_cats_base = select(
        models.Category.id,
        models.Category.name,
        func.count(models.Article.id).label("count"),
        func.sum(models.Article.views).label("total_views"),
        func.sum(models.Article.impressions).label("total_impressions"),
        func.avg(models.Article.position).label("avg_position")
    ).join(models.Article, models.Article.category_id == models.Category.id
    ).group_by(models.Category.id, models.Category.name
    ).order_by(desc("total_views"))
    
    cats_res = await db.execute(q_cats_base)
    rows = cats_res.fetchall()
    
    categories_performance = []
    for row in rows:
        cat_id, cat_name, count, cat_views, cat_impressions, avg_pos = row
        
        # Get top 5 articles for this specific category
        stmt_top = select(
            models.Article.id,
            models.Article.title,
            models.Article.views,
            models.Article.slug,
            models.Article.draft_title,
            models.Article.draft_meta_description,
            models.Article.draft_keywords
        ).filter(
            models.Article.category_id == cat_id
        ).order_by(desc(models.Article.views)).limit(5)
        top_res = await db.execute(stmt_top)
        top_art_rows = top_res.fetchall()
        
        top_articles_list = []
        for art in top_art_rows:
            top_articles_list.append({
                "id": art[0],
                "title": art[1],
                "views": art[2],
                "slug": art[3],
                "draft_title": art[4],
                "draft_meta_description": art[5],
                "draft_keywords": art[6]
            })
        
        categories_performance.append({
            "name": cat_name,
            "count": count,
            "total_views": cat_views or 0,
            "total_impressions": cat_impressions or 0,
            "avg_position": float(avg_pos) if avg_pos else 0.0,
            "top_articles": top_articles_list
        })
    
    # Top category by views
    top_category = categories_performance[0]["name"] if categories_performance else "N/A"
    
    # Global average position (of categories that have articles)
    valid_positions = [c["avg_position"] for c in categories_performance if c["avg_position"] > 0]
    global_avg_position = round(sum(valid_positions) / len(valid_positions), 1) if valid_positions else 0.0
    
    # === TRAFFIC SOURCES (GRANULAR) ===
    q_sources = select(
        models.ViewLog.source_type,
        func.count(models.ViewLog.id).label("count")
    ).group_by(models.ViewLog.source_type).order_by(desc("count"))
    
    sources_res = await db.execute(q_sources)
    traffic_sources = [{"platform": row[0], "hits": row[1]} for row in sources_res.fetchall()]

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
        "global_avg_position": global_avg_position,
        "traffic_sources": traffic_sources,
        "top_articles": [{"id": a.id, "title": a.title, "views": a.views, "protected": a.protected_from_deletion} for a in top_articles],
        "trending_articles": [{"id": a.id, "title": a.title, "views": a.views, "protected": a.protected_from_deletion} for a in trending_articles],
        
        # Categories
        "categories_performance": categories_performance
    }