from fastapi import APIRouter, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Article, ArticleStatus

router = APIRouter()

@router.api_route("/sitemap.xml", methods=["GET", "HEAD"])
async def get_sitemap(db: AsyncSession = Depends(get_db)):
    """Generate dynamic sitemap for all published articles"""
    stmt = select(Article).filter(Article.status.in_([ArticleStatus.READY, ArticleStatus.EDITED, ArticleStatus.PUBLISHED]))
    result = await db.execute(stmt)
    articles = result.scalars().all()
    
    # Base URL - use the custom domain for GSC
    base_url = "https://marlizintel.com"
    
    xml_content = ['<?xml version="1.0" encoding="UTF-8"?>']
    xml_content.append('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')
    
    # Add static pages
    static_pages = ["/", "/about", "/subscribe", "/all-threats"]
    for page in static_pages:
        xml_content.append(f"""
    <url>
        <loc>{base_url}{page}</loc>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
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
    content = """User-agent: *
Allow: /

Sitemap: https://marlizintel.com/sitemap.xml"""
    return Response(content=content, media_type="text/plain")
