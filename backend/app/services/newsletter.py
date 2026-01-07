
import resend
import os
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models import Article, Subscriber, ArticleStatus
from app.database import AsyncSessionLocal
from jinja2 import Template
from app.config import settings

logger = logging.getLogger(__name__)

class NewsletterService:
    def __init__(self):
        self.api_key = settings.RESEND_API_KEY
        if self.api_key:
            resend.api_key = self.api_key
            logger.info(f"✓ Newsletter Service: API Key detected ({self.api_key[:4]}...{self.api_key[-4:]})")
        else:
            logger.warning("✗ Newsletter Service: No Resend API Key found in settings.")
        self.from_email = settings.NEWSLETTER_FROM

    async def get_top_articles(self, limit=5):
        """Fetch the most viewed and relevant articles from the last 7 days."""
        async with AsyncSessionLocal() as db:
            since = datetime.utcnow() - timedelta(days=7)
            stmt = select(Article).options(
                selectinload(Article.simplified),
                selectinload(Article.category)
            ).where(
                Article.status == ArticleStatus.PUBLISHED,
                Article.published_at >= since
            ).order_by(desc(Article.views)).limit(limit)
            
            result = await db.execute(stmt)
            return result.scalars().all()

    async def get_active_subscribers(self):
        """Fetch all active subscribers."""
        async with AsyncSessionLocal() as db:
            stmt = select(Subscriber).where(Subscriber.unsubscribed_at.is_(None))
            result = await db.execute(stmt)
            return result.scalars().all()

    def _generate_html(self, articles, custom_note=None):
        """Generate the HTML email content using a bulletproof premium template."""
        # This template is optimized to prevent Gmail collapsing and clipping
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; -webkit-text-size-adjust: none; }
                .wrapper { width: 100%; table-layout: fixed; background-color: #020617; padding-bottom: 60px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; margin-top: 20px; overflow: hidden; }
                .preheader { display: none; max-height: 0px; overflow: hidden; mso-hide: all; }
                .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #1e293b; }
                .logo { font-size: 26px; font-weight: 900; color: #ef4444; letter-spacing: -1px; text-decoration: none; }
                .intelligence-brief { padding: 20px 30px; background-color: #1e293b; color: #94a3b8; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; text-align: center; }
                .content { padding: 30px; }
                .article-card { margin-bottom: 40px; background-color: #1e293b80; border-radius: 20px; padding: 25px; border: 1px solid #334155; }
                .category { font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: block; }
                .title { font-size: 20px; font-weight: 800; margin-bottom: 15px; color: #ffffff; line-height: 1.3; }
                .summary { font-size: 14px; color: #cbd5e1; line-height: 1.7; margin-bottom: 25px; }
                .button { background-color: #ef4444; color: #ffffff !important; padding: 14px 28px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 13px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
                .footer { padding: 40px 30px; text-align: center; font-size: 11px; color: #64748b; line-height: 1.8; }
                .unsubscribe { color: #ef4444; text-decoration: underline; font-weight: 700; }
                .dispatch-tag { display: inline-block; padding: 4px 10px; background-color: #1e293b; border-radius: 6px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <span class="preheader">Latest Intel: {{ articles[0].title[:100] }}</span>
            <div class="wrapper">
                <div class="container">
                    <div class="intelligence-brief">
                        Marliz Intel Bulletin • {{ timestamp_readable }}
                    </div>
                    <div class="header">
                        <a href="https://marlizintel.com" class="logo">MARLIZ INTEL</a>
                        {% if custom_note %}
                        <div style="margin-top: 30px; padding: 25px; background-color: #ef44440a; border-radius: 20px; font-size: 15px; line-height: 1.7; color: #f8fafc; font-style: italic; border: 1px solid #ef444433; text-align: left;">
                            "{{ custom_note }}"
                        </div>
                        {% endif %}
                    </div>
                    <div class="content">
                        {% for article in articles %}
                        <div class="article-card">
                            <span class="category">{{ article.category.name if article.category else 'SECURITY ALERT' }}</span>
                            <div class="title">{{ article.title }}</div>
                            <div class="summary">
                                {% if article.simplified and article.simplified.friendly_summary %}
                                    {{ article.simplified.friendly_summary[:350] }}...
                                {% else %}
                                    {{ article.summary[:350] if article.summary else 'Full technical intelligence report available on the portal.' }}...
                                {% endif %}
                            </div>
                            <a href="https://marlizintel.com/article/{{ article.slug }}" class="button">Access Full Intelligence</a>
                        </div>
                        {% endfor %}
                    </div>
                    <div class="footer">
                        <div class="dispatch-tag">OFFICIAL DISPATCH #{{ timestamp }}</div><br>
                        &copy; {{ year }} Marliz Intelligence Systems. All rights reserved.<br>
                        Confidentiality: This briefing is intended for subscribed parties only.<br><br>
                        <a href="https://marlizintel.com/unsubscribe" class="unsubscribe">One-click Unsubscribe</a>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        template = Template(template_str)
        now = datetime.now()
        return template.render(
            articles=articles, 
            year=now.year, 
            custom_note=custom_note,
            timestamp=now.strftime("%Y%m%d-%H%M%S"),
            timestamp_readable=now.strftime("%B %d, %H:%M")
        )

    async def send_daily_digest(self, article_ids=None, custom_note=None, to_email=None):
        """Main entry point to send the intelligence digest. Accepts manual article_ids or defaults to top articles."""
        if not self.api_key:
            logger.error("Resend API Key not found.")
            return False, "Missing API Key"
            
        if article_ids:
            # Manual Mode: Fetch specific articles
            async with AsyncSessionLocal() as db:
                stmt = select(Article).options(
                    selectinload(Article.simplified),
                    selectinload(Article.category)
                ).where(Article.id.in_(article_ids))
                result = await db.execute(stmt)
                articles = result.scalars().all()
        else:
            # Auto Mode: Fetch top articles (for the morning scheduler)
            articles = await self.get_top_articles()

        if not articles:
            logger.info("No articles found for newsletter.")
            return False, "No articles found"
            
        if to_email:
            # Special mode for test emails
            subscribers = [type('obj', (object,), {'email': to_email, 'id': None})]
        else:
            subscribers = await self.get_active_subscribers()
            
        if not subscribers:
            logger.info("No active subscribers.")
            return False, "No active subscribers"
            
        html_content = self._generate_html(articles, custom_note=custom_note)
        
        # Batch sending logic and tracking
        async with AsyncSessionLocal() as db:
            last_error = None
            success_count = 0
            for sub in subscribers:
                try:
                    logger.info(f"Attempting to send intel to {sub.email} via {self.from_email}...")
                    response = resend.Emails.send({
                        "from": self.from_email,
                        "to": sub.email,
                        "subject": f"INTEL ALERT: {articles[0].title[:50]}...",
                        "html": html_content
                    })
                    logger.info(f"✓ Resend Response for {sub.email}: {response}")
                    success_count += 1
                    
                    # Track last sent time if it's a real subscriber
                    if sub.id:
                        from sqlalchemy import update
                        from app.models import Subscriber
                        stmt = update(Subscriber).where(Subscriber.id == sub.id).values(last_email_sent=datetime.utcnow())
                        await db.execute(stmt)
                    
                except Exception as e:
                    last_error = str(e)
                    logger.error(f"Failed to send newsletter to {sub.email}: {e}")
            
            await db.commit()
            
        if success_count == 0 and last_error:
            return False, f"API Error: {last_error}"
                
        return True, f"Sent {len(articles)} articles to {success_count} recipients"

newsletter_service = NewsletterService()
