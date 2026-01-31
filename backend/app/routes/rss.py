from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app import models
from app.config import settings
from datetime import datetime

router = APIRouter(tags=["newsletter"])

@router.get("/feed", response_class=Response)
@router.get("/rss", response_class=Response)
@router.get("/rss.xml", response_class=Response)
async def get_rss_feed(db: AsyncSession = Depends(get_db)):
    """Generate RSS Feed for latest articles"""
    
    stmt = select(models.Article).where(
        models.Article.status == models.ArticleStatus.PUBLISHED
    ).order_by(models.Article.published_at.desc()).limit(20)
    
    result = await db.execute(stmt)
    articles = result.scalars().all()
    
    domain = settings.DOMAIN
    
    # Build XML
    xml = '<?xml version="1.0" encoding="UTF-8" ?>'
    xml += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">'
    xml += '<channel>'
    xml += f'<title>Marliz Security Intel</title>'
    xml += f'<link>https://{domain}</link>'
    xml += f'<description>Latest cybersecurity intelligence for small businesses.</description>'
    xml += f'<atom:link href="https://{domain}/rss" rel="self" type="application/rss+xml" />'
    
    for article in articles:
        pub_date = article.published_at.strftime("%a, %d %b %Y %H:%M:%S GMT") if article.published_at else ""
        link = f"https://{domain}/article/{article.slug}"
        
        xml += '<item>'
        xml += f'<title>{article.title}</title>'
        xml += f'<link>{link}</link>'
        xml += f'<guid>{link}</guid>'
        xml += f'<description>{article.meta_description or article.title}</description>'
        xml += f'<pubDate>{pub_date}</pubDate>'
        xml += '</item>'
        
    xml += '</channel>'
    xml += '</rss>'
    
    return Response(content=xml, media_type="application/xml")
