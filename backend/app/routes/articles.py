from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
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
from app.services.google_indexing import google_indexing
from app.config import settings

router = APIRouter(prefix="/api/articles", tags=["articles"])

# System Status Router
@router.get("/system/status")
async def get_system_status(db: AsyncSession = Depends(get_db)):
    """Get the status of automated systems (scheduler, etc)"""
    from app.models import SystemSettings
    stmt = select(SystemSettings).filter_by(key="scheduler_enabled")
    res = await db.execute(stmt)
    setting = res.scalars().first()
    
    return {
        "scheduler_enabled": setting.value.lower() == "true" if setting else True
    }

@router.post("/system/toggle-scheduler")
async def toggle_scheduler(enabled: bool, api_key = Depends(verify_api_key), db: AsyncSession = Depends(get_db)):
    """Enable or disable the background scheduler"""
    from app.models import SystemSettings
    stmt = select(SystemSettings).filter_by(key="scheduler_enabled")
    res = await db.execute(stmt)
    setting = res.scalars().first()
    
    val_str = "true" if enabled else "false"
    
    if setting:
        setting.value = val_str
    else:
        new_setting = SystemSettings(key="scheduler_enabled", value=val_str)
        db.add(new_setting)
        
    await db.commit()
    return {"status": "success", "scheduler_enabled": enabled}

def get_source_type(referer: str, user_agent: str = None, query_ref: str = None) -> str:
    # 0. Bot Identification (AI & Crawlers)
    if user_agent:
        ua = user_agent.lower()
        if any(bot in ua for bot in ["googlebot", "bingbot", "ahrefs", "semrush", "ia_archiver"]): return "Search Engine Bot"
        if any(ai in ua for ai in ["gpt", "claude", "gemini", "perplex", "commoncrawl"]): return "AI Intelligence Bot"
        if "whatsapp" in ua and not referer: return "WhatsApp Preview"

    # 1. Priority: Manual Parameter (The "Tattoo")
    # Using 's' or 'ref' for platform identification. 
    # Slim tags (s=f, s=w) are less likely to be flagged by social platform spam bots.
    if query_ref:
        qr = query_ref.lower()
        # Full labels or slim aliases
        if any(x in qr for x in ["wa", "whatsapp", "s=w"]): return "WhatsApp"
        if any(x in qr for x in ["fb", "facebook", "s=f"]): return "Facebook"
        if any(x in qr for x in ["li", "linkedin", "s=l"]): return "LinkedIn"
        if any(x in qr for x in ["tg", "telegram", "s=t"]): return "Telegram"
        if any(x in qr for x in ["dc", "discord", "s=d"]): return "Discord"
        if any(x in qr for x in ["tw", "x", "s=x"]): return "X (Twitter)"
        if "ig" in qr or "s=i" in qr: return "Instagram"
        if "intel_alert" in qr: return "Marliz Intel Alert"

    # 2. THE BIG TRICK: Aggressive User-Agent Fingerprinting
    # Even if referer is missing (Direct Access), the User-Agent often betrays the source
    if user_agent:
        ua = user_agent.lower()
        # Facebook & Instagram (Meta) often hide referer but send unique UA strings
        if any(x in ua for x in ["fbav", "fban", "fb_iab", "fb4a", "fbios"]): return "Facebook App"
        if "instagram" in ua: return "Instagram App"
        
        # WhatsApp (Very common for Direct Access)
        if "whatsapp" in ua: return "WhatsApp"
        
        # LinkedIn In-App Browser
        if "linkedinapp" in ua: return "LinkedIn App"
        
        # Twitter / X
        if any(x in ua for x in ["twitter", "twttr"]): return "X (Twitter) App"

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
    
    return "Other Referrals"

# In-memory deduplication (IP + ArticleID : Timestamp)
# Expire views from same IP within 1 hour to keep numbers "Professional"
view_dedup_cache = {}

async def track_view(article_id: int, request: Request, db: AsyncSession):
    """
    Log a view and increment the article counter.
    Uses simple in-memory deduplication for IP (1 hour expiry).
    """
    client_ip = request.client.host if request.client else "unknown"
    cache_key = f"{client_ip}:{article_id}"
    now = datetime.now()
    
    # Check deduplication
    is_duplicate = False
    if cache_key in view_dedup_cache:
        last_view = view_dedup_cache[cache_key]
        if (now - last_view) < timedelta(hours=1):
            is_duplicate = True
            
    referer = request.headers.get("referer")
    user_agent = request.headers.get("user-agent")
    query_ref = request.query_params.get("ref") or request.query_params.get("s") or request.query_params.get("utm_source")
    
    source_type = get_source_type(referer, user_agent, query_ref)
    
    # 1. ALWAYS Log the hit in ViewLog (For granular analytics)
    view_log = models.ViewLog(
        article_id=article_id,
        referrer=referer,
        source_type=source_type
    )
    db.add(view_log)
    
    # 2. ONLY Increment the master counter if NOT a redundant refresh
    if not is_duplicate:
        stmt = select(models.Article).filter_by(id=article_id)
        res = await db.execute(stmt)
        article = res.scalars().first()
        if article:
            article.views += 1
            view_dedup_cache[cache_key] = now
            
    await db.commit()

    # Cleanup cache occasionally (primitive)
    if len(view_dedup_cache) > 10000:
        # Remove keys older than 1 hour
        expired_keys = [k for k, v in view_dedup_cache.items() if (now - v) > timedelta(hours=1)]
        for k in expired_keys: del view_dedup_cache[k]

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

    # Execute count queries
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
    avg_views = round(total_views / total_articles, 1) if total_articles > 0 else 0
    
    stmt = select(models.Article).order_by(desc(models.Article.views)).limit(5)
    top_articles_res = await db.execute(stmt)
    top_articles = top_articles_res.scalars().all()
    
    q_trending = select(models.Article).filter(
        models.Article.created_at >= two_days_ago,
        models.Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    ).order_by(desc(models.Article.views)).limit(5)
    trending_res = await db.execute(q_trending)
    trending_articles = trending_res.scalars().all()
    
    # === CATEGORIES BREAKDOWN ===
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
        
        top_articles_list = [{"id": a[0], "title": a[1], "views": a[2], "slug": a[3]} for a in top_art_rows]
        
        categories_performance.append({
            "id": cat_id,
            "name": cat_name,
            "count": count,
            "total_views": cat_views or 0,
            "total_impressions": cat_impressions or 0,
            "avg_position": float(avg_pos) if avg_pos else 0.0,
            "top_articles": top_articles_list
        })
    
    top_category = categories_performance[0]["name"] if categories_performance else "N/A"
    valid_positions = [c["avg_position"] for c in categories_performance if c["avg_position"] > 0]
    global_avg_position = round(sum(valid_positions) / len(valid_positions), 1) if valid_positions else 0.0
    
    q_sources = select(
        models.ViewLog.source_type,
        func.count(models.ViewLog.id).label("count")
    ).group_by(models.ViewLog.source_type).order_by(desc("count"))
    
    sources_res = await db.execute(q_sources)
    traffic_sources = [{"platform": row[0], "hits": row[1]} for row in sources_res.fetchall()]

    return {
        "total_articles": total_articles,
        "published": published,
        "pending": pending,
        "total_views": total_views,
        "articles_today": articles_today,
        "articles_this_week": articles_this_week,
        "growth_pct": growth_pct,
        "avg_views": avg_views,
        "top_category": top_category,
        "global_avg_position": global_avg_position,
        "traffic_sources": traffic_sources,
        "top_articles": [{"id": a.id, "title": a.title, "views": a.views, "protected": a.protected_from_deletion} for a in top_articles],
        "trending_articles": [{"id": a.id, "title": a.title, "views": a.views, "protected": a.protected_from_deletion} for a in trending_articles],
        "categories_performance": categories_performance
    }

@router.get("/stats/{article_id}")
async def get_article_stats(
    article_id: int,
    api_key_obj = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Get traffic source breakdown for a specific article"""
    q_sources = select(
        models.ViewLog.source_type,
        func.count(models.ViewLog.id).label("count")
    ).filter(models.ViewLog.article_id == article_id).group_by(models.ViewLog.source_type).order_by(desc("count"))
    
    res = await db.execute(q_sources)
    sources = [{"platform": row[0], "hits": row[1]} for row in res.fetchall()]
    
    return sources

# === EXISTING GLOBAL STATS ===
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
        models.Article.status == ArticleStatus.PUBLISHED
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
    sort_by: Optional[str] = "date", # date, views, impressions, position, words
    order: str = Query("desc"), # desc, asc
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
        
    # Sorting logic with stable secondary sort
    # GSC Paradigm: 'desc' (Arrow Down) always means "Best/Most Important First"
    is_desc = order.lower() == "desc"
    
    if sort_by == "views":
        primary_sort = desc(models.Article.views) if is_desc else models.Article.views.asc()
    elif sort_by == "impressions":
        primary_sort = desc(models.Article.impressions) if is_desc else models.Article.impressions.asc()
    elif sort_by == "position":
        # GSC Standard: Arrow Down (DESC) on Rank means 1.0, 2.0, 3.0...
        # We also filter out 0.0 (unranked) to the bottom
        from sqlalchemy import case
        is_ranked = case((models.Article.position > 0, 1), else_=0)
        
        if is_desc:
            # Best first: Ranked articles (1) then Ascending position (1.0, 1.1...)
            query = query.order_by(desc(is_ranked), models.Article.position.asc(), models.Article.id.desc())
        else:
            # Worst first: Ranked articles (1) then Descending position (99.0, 98.0...)
            query = query.order_by(desc(is_ranked), models.Article.position.desc(), models.Article.id.desc())
        
        # Primary sort is already applied above
        primary_sort = None 
    elif sort_by == "words":
        from sqlalchemy import case
        content_len = case(
            (models.Article.has_draft == True, func.length(func.coalesce(models.Article.draft_content_markdown, ''))),
            else_=func.length(func.coalesce(models.Article.content_markdown, ''))
        )
        word_sort = content_len + \
                    func.length(func.coalesce(models.SimplifiedContent.friendly_summary, '')) + \
                    func.length(func.coalesce(models.SimplifiedContent.attack_vector, '')) + \
                    func.length(func.coalesce(models.SimplifiedContent.business_impact, ''))
        primary_sort = desc(word_sort) if is_desc else word_sort.asc()
        query = query.join(models.SimplifiedContent, isouter=True)
    else:
        # Default to date: Newest first for 'desc'
        primary_sort = desc(models.Article.created_at) if is_desc else models.Article.created_at.asc()
    
    # Apply primary and secondary (stable) sort if not already applied by custom logic
    if primary_sort is not None:
        query = query.order_by(primary_sort, models.Article.id.desc())
    
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
        models.Article.status == ArticleStatus.PUBLISHED
    ).options(selectinload(models.Article.simplified), selectinload(models.Article.category))
    
    result = await db.execute(stmt)
    article = result.scalars().first()
    
    # SMART FALLBACK: If exact slug not found, try fuzzy matching (Fixes 404s for broken shared links)
    if not article:
        # Search for any article where the new slug 'contains' the requested old slug
        fallback_stmt = select(models.Article).filter(
            or_(
                models.Article.slug.ilike(f"%{slug}%"),
                models.Article.title.ilike(f"%{slug.replace('-', ' ')}%")
            ),
            models.Article.status == ArticleStatus.PUBLISHED
        ).order_by(desc(models.Article.published_at)).options(
            selectinload(models.Article.simplified), 
            selectinload(models.Article.category)
        ).limit(1)
        
        fallback_result = await db.execute(fallback_stmt)
        article = fallback_result.scalars().first()

    if not article:
        # Check if it was permanently deleted (410 Gone) - Be aggressive
        # Check for exact slug AND check if it was buried as an 'undefined' variant
        stmt_deleted = select(models.DeletedArticle).filter(
            or_(
                models.DeletedArticle.slug == slug,
                models.DeletedArticle.slug.ilike(f"%{slug}")
            )
        )
        res_deleted = await db.execute(stmt_deleted)
        if res_deleted.scalars().first():
            raise HTTPException(
                status_code=410, 
                detail="Gone: This page has been permanently removed."
            )

        raise HTTPException(status_code=404, detail="Article not found")
    
    # Track View Source
    await track_view(article.id, request, db)
    
    # Reload with all relationships to avoid MissingGreenlet error during Pydantic validation
    stmt = select(models.Article).filter_by(id=article.id).options(
        selectinload(models.Article.simplified),
        selectinload(models.Article.category)
    )
    res = await db.execute(stmt)
    article = res.scalars().first()
    
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
    
    # Try getting articles from the same category first
    stmt = select(models.Article).filter(
        models.Article.category_id == article.category_id,
        models.Article.id != article_id,
        models.Article.status == ArticleStatus.PUBLISHED
    ).order_by(desc(models.Article.published_at)).limit(limit).options(selectinload(models.Article.category))
    
    result = await db.execute(stmt)
    related = result.scalars().all()
    
    # Fallback: if we don't have enough related articles in this category,
    # get the most recent ones from ANY category
    if len(related) < limit:
        needed = limit - len(related)
        exclude_ids = [article_id] + [a.id for a in related]
        
        fallback_stmt = select(models.Article).filter(
            models.Article.id.notin_(exclude_ids),
            models.Article.status == ArticleStatus.PUBLISHED
        ).order_by(desc(models.Article.published_at)).limit(needed).options(selectinload(models.Article.category))
        
        fallback_result = await db.execute(fallback_stmt)
        related.extend(fallback_result.scalars().all())
    
    return related

@router.post("/manual", response_model=schemas.Article)
async def create_manual_article(
    article_data: schemas.ManualArticleCreate,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Create article manually (Protected)"""
    
    # Use provided slug or generate from title
    base_slug = article_data.slug or slugify(article_data.title)
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
        original_url=article_data.original_url or f"https://marlizintel.com/article/{slug}",
        source_name=article_data.source_name,
        published_at=datetime.now(),
        image_url=article_data.image_url,
        category_id=article_data.category_id,
        status=ArticleStatus.PUBLISHED,
        meta_description=article_data.meta_description,
        keywords=article_data.keywords,
        is_edited=True,
        edited_by="admin",
        edited_at=datetime.now(),
        content_markdown=article_data.content_markdown
    )
    db.add(article)
    await db.flush()
    
    simplified = models.SimplifiedContent(
        article_id=article.id,
        friendly_summary=article_data.friendly_summary or (article_data.content_markdown[:300] if article_data.content_markdown else article_data.title),
        attack_vector=article_data.attack_vector,
        business_impact=article_data.business_impact or "See full intelligence report for details.",
        action_steps=json.dumps(article_data.action_steps or ["Review the full intelligence report", "Apply recommended mitigations"]),
        threat_level=article_data.threat_level
    )
    db.add(simplified)
    await db.commit()
    await db.refresh(article)
    
    # Eager load for validation
    stmt = select(models.Article).filter_by(id=article.id).options(selectinload(models.Article.category))
    res = await db.execute(stmt)
    final_article = res.scalars().first()

    # Auto-Index on Creation if Published
    try:
        url = f"{settings.BASE_URL}/article/{final_article.slug}"
        print(f"Auto-Indexing Manual Article: {url}")
        await google_indexing.notify_url_update(url)
    except Exception as e:
        print(f"Failed to auto-index manual article: {e}")

    return final_article

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
    if updates.title: article.title = updates.title
    if updates.category_id: article.category_id = updates.category_id
    if updates.content_type: article.content_type = updates.content_type
    if updates.image_url: article.image_url = updates.image_url
    if updates.protected_from_deletion is not None: article.protected_from_deletion = updates.protected_from_deletion

    # Update fields (Simplified Level - Optional)
    if simplified:
        if updates.friendly_summary: simplified.friendly_summary = updates.friendly_summary
        if updates.attack_vector: simplified.attack_vector = updates.attack_vector
        if updates.business_impact: simplified.business_impact = updates.business_impact
        if updates.action_steps: simplified.action_steps = updates.action_steps
        if updates.threat_level: simplified.threat_level = updates.threat_level
    
    # Draft Logic (Article Level)
    if updates.draft_title is not None: article.draft_title = updates.draft_title
    if updates.draft_meta_description is not None: article.draft_meta_description = updates.draft_meta_description
    if updates.draft_keywords is not None: article.draft_keywords = updates.draft_keywords
    if updates.content_markdown is not None: article.content_markdown = updates.content_markdown
    if updates.draft_content_markdown is not None: article.draft_content_markdown = updates.draft_content_markdown
    
    if any([updates.draft_title, updates.draft_meta_description, updates.draft_keywords, updates.draft_content_markdown]):
        article.has_draft = True
        article.last_edited_at = datetime.now()
        article.last_edited_by = updates.edited_by

    # Publish Logic
    if updates.publish_now:
        if article.draft_title: article.title = article.draft_title
        if article.draft_meta_description: article.meta_description = article.draft_meta_description
        if article.draft_keywords: article.keywords = article.draft_keywords
        if article.draft_content_markdown: article.content_markdown = article.draft_content_markdown
        
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
        
        # Auto-Index on Publish
        try:
            url = f"{settings.BASE_URL}/article/{article.slug}"
            print(f"Auto-Indexing Published Article: {url}")
            await google_indexing.notify_url_update(url)
        except Exception as e:
            print(f"Failed to auto-index published article: {e}")
        
    return {"status": "published", "article_id": article_id}

