from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Article, ArticleStatus
from app.config import settings

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

@router.api_route("/robots.txt", methods=["GET", "HEAD"])
def get_robots():
    """Serve robots.txt"""
    content = f"""User-agent: *
Allow: /

Sitemap: {settings.BASE_URL}/sitemap.xml"""
    return Response(content=content, media_type="text/plain")

@router.get("/health-check")
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
