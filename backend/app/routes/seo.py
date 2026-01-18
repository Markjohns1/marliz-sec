from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Article, ArticleStatus
from app.config import settings
from app.services.google_indexing import google_indexing
from app.auth import verify_api_key

router = APIRouter()

@router.api_route("/sitemap.xml", methods=["GET", "HEAD"])
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    """Generate dynamic sitemap for all published articles"""
    stmt = select(Article).filter(Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED]))
    result = await db.execute(stmt)
    articles = result.scalars().all()
    
    # Base URL - use centralized settings
    base_url = settings.BASE_URL
    
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add static pages
    static_pages = ["/", "/about", "/subscribe", "/all-threats", "/privacy", "/contact", "/glossary", "/search"]
    for page in static_pages:
        xml_content.append(f"""
    <url>
        <loc>{base_url}{page}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
    </url>""")
    
    # Add Categories
    from app.models import Category
    stmt_cat = select(Category)
    res_cat = await db.execute(stmt_cat)
    categories = res_cat.scalars().all()
    for cat in categories:
        xml_content.append(f"""
    <url>
        <loc>{base_url}/category/{cat.slug}</loc>
        <changefreq>daily</changefreq>
        <priority>0.7</priority>
    </url>""")
        
    # Add articles
    for article in articles:
        last_mod = article.updated_at.strftime("%Y-%m-%d") if article.updated_at else article.published_at.strftime("%Y-%m-%d") if article.published_at else ""
        xml_content.append(f"""
    <url>
        <loc>{base_url}/article/{article.slug}</loc>
        <lastmod>{last_mod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.6</priority>
    </url>""")
        
    xml_content.append('</urlset>')
    
    return Response(content="".join(xml_content), media_type="application/xml")

@router.api_route("/sitemap-deleted.xml", methods=["GET", "HEAD"])
async def get_deleted_sitemap(db: AsyncSession = Depends(get_db)):
    """
    Graveyard Sitemap: Lists all articles marked as 410 Gone.
    Submitting this to Google Search Console forces them to crawl these links 
    and remove them from the index much faster.
    """
    from app.models import DeletedArticle
    stmt = select(DeletedArticle)
    result = await db.execute(stmt)
    deleted_articles = result.scalars().all()
    
    base_url = settings.BASE_URL
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    for item in deleted_articles:
        # Use the article path format - strictly from the 'deleted' table
        xml_content.append(f"""
    <url>
        <loc>{base_url}/article/{item.slug}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.1</priority>
    </url>""")
        
    xml_content.append('</urlset>')
    return Response(content="".join(xml_content), media_type="application/xml")

@router.api_route("/robots.txt", methods=["GET", "HEAD"])
def get_robots():
    """Serve robots.txt"""
    content = f"""User-agent: *
Allow: /

Sitemap: {settings.BASE_URL}/sitemap.xml"""
    return Response(content=content, media_type="text/plain")

@router.api_route("/ads.txt", methods=["GET", "HEAD"])
def get_ads_txt():
    """Serve ads.txt for AdSense"""
    # Hardcoded or from a file - let's try to read it from the public folder first for flexibility
    # but fallback to a known value if needed to prevent 404
    import os
    public_path = os.path.join(os.path.dirname(__file__), "../../../frontend/public/ads.txt")
    
    try:
        if os.path.exists(public_path):
            with open(public_path, "r") as f:
                content = f.read()
            return Response(content=content, media_type="text/plain")
    except Exception:
        pass
    
    # Fallback to the known valid content if the file can't be read
    # This prevents the "Not Found" error that breaks AdSense verification
    content = "google.com, pub-5581330887172926, DIRECT, f08c47fec0942fa0"
    return Response(content=content, media_type="text/plain")

@router.get("/api/seo/health-check")
async def check_seo_health(db: AsyncSession = Depends(get_db)):
    """
    Admin Diagnostic: Uses RAW SQL for guaranteed accuracy.
    """
    from sqlalchemy import text
    from fastapi.responses import JSONResponse
    
    # RAW SQL - Same as terminal scripts (100% accurate)
    # 1. Count Active
    res_active = await db.execute(text("SELECT count(*) FROM articles WHERE status IN ('READY', 'EDITED', 'PUBLISHED')"))
    total_active = res_active.scalar()
    
    # 2. Count Buried
    res_buried = await db.execute(text("SELECT count(*) FROM deleted_articles"))
    total_buried = res_buried.scalar()
    
    # 3. Count Conflicts (slugs in BOTH tables)
    res_conflicts = await db.execute(text("""
        SELECT count(*) FROM deleted_articles 
        WHERE slug IN (SELECT slug FROM articles WHERE status IN ('READY', 'EDITED', 'PUBLISHED'))
    """))
    conflict_count = res_conflicts.scalar()
    
    # 4. Get Conflict Details (if any)
    conflicts_list = []
    if conflict_count > 0:
        res_details = await db.execute(text("""
            SELECT a.slug, a.title FROM articles a
            INNER JOIN deleted_articles d ON a.slug = d.slug
            WHERE a.status IN ('READY', 'EDITED', 'PUBLISHED')
            LIMIT 10
        """))
        for row in res_details.all():
            conflicts_list.append({
                "slug": row[0],
                "title": row[1],
                "error": "Slug is marked ACTIVE but also exists in DELETED (410) table. This causes a conflict."
            })
    
    data = {
        "summary": {
            "total_active": total_active,
            "total_buried": total_buried,
            "healthy_count": total_active - conflict_count,
            "conflicts": conflict_count,
            "status": "HEALTHY" if conflict_count == 0 else "WARNING"
        },
        "conflicts": conflicts_list
    }
    
    # Return with NO-CACHE headers
    return JSONResponse(
        content=data,
        headers={"Cache-Control": "no-store, no-cache, must-revalidate, max-age=0"}
    )

@router.post("/api/seo/request-indexing/{article_id}")
async def request_instant_indexing(
    article_id: int,
    db: AsyncSession = Depends(get_db),
    api_key_obj = Depends(verify_api_key)
):
    """
    Manually push an article URL to Google Indexing API.
    """
    # 1. Get the article
    stmt = select(Article).filter_by(id=article_id)
    res = await db.execute(stmt)
    article = res.scalar_one_or_none()
    
    if not article:
        return {"status": "error", "message": "Article not found"}
        
    if article.status not in [ArticleStatus.PUBLISHED, ArticleStatus.READY, ArticleStatus.EDITED]:
        return {"status": "error", "message": "Only public articles can be indexed"}

    # 2. Construct the absolute URL
    url = f"{settings.BASE_URL}/article/{article.slug}"
    
    # 3. Trigger Google Indexing API
    result = await google_indexing.notify_url_update(url)
    
    return result

