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
    Admin Diagnostic: Validates that all 'Active' articles are truly healthy 
    and verifies the 453 Deleted Articles are properly isolated.
    """
    from app.models import DeletedArticle
    
    # 1. Get Active Articles
    stmt_active = select(Article.slug, Article.title, Article.status).filter(
        Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED])
    )
    res_active = await db.execute(stmt_active)
    active_articles = res_active.all()
    
    # 2. Get Deleted Slugs
    stmt_deleted = select(DeletedArticle.slug)
    res_deleted = await db.execute(stmt_deleted)
    deleted_slugs = {row[0] for row in res_deleted.all()}
    
    # 3. Validation Logic
    report = {
        "summary": {
            "total_active": len(active_articles),
            "total_buried": len(deleted_slugs),
            "healthy_count": 0,
            "conflicts": 0,
            "status": "HEALTHY"
        },
        "conflicts": []
    }
    
    for article in active_articles:
        if article.slug in deleted_slugs:
            # CRITICAL ERROR: An active article is also in the ban list!
            report["conflicts"].append({
                "slug": article.slug,
                "title": article.title,
                "error": "Slug is marked ACTIVE but also exists in DELETED (410) table. This causes a conflict."
            })
        else:
            report["summary"]["healthy_count"] += 1
            
    if report["conflicts"]:
        report["summary"]["status"] = "WARNING"
        report["summary"]["conflicts"] = len(report["conflicts"])
        
    return report
