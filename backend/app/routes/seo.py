from fastapi import APIRouter, Response, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Article, ArticleStatus

router = APIRouter()

@router.get("/sitemap.xml")
def get_sitemap(db: Session = Depends(get_db)):
    """Generate dynamic sitemap for all published articles"""
    articles = db.query(Article).filter(Article.status == ArticleStatus.READY).all()
    
    # Base URL for your frontend
    base_url = "http://localhost:3000" # In production, change this to your actual domain
    
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

@router.get("/robots.txt")
def get_robots():
    """Serve robots.txt"""
    content = """User-agent: *
Allow: /

Sitemap: http://localhost:8000/sitemap.xml"""
    return Response(content=content, media_type="text/plain")
