
import resend
import os
import logging
from datetime import datetime, timedelta
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.models import Article, Subscriber, ArticleStatus
from app.database import AsyncSessionLocal
from jinja2 import Template

logger = logging.getLogger(__name__)

class NewsletterService:
    def __init__(self):
        self.api_key = os.getenv("RESEND_API_KEY")
        if self.api_key:
            resend.api_key = self.api_key
        self.from_email = os.getenv("NEWSLETTER_FROM", "Marliz Intel <alerts@marlizintel.com>")

    async def get_top_articles(self, limit=5):
        """Fetch the most viewed and relevant articles from the last 24-48 hours."""
        async with AsyncSessionLocal() as db:
            since = datetime.utcnow() - timedelta(hours=48)
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

    def _generate_html(self, articles):
        """Generate the HTML email content using a premium template."""
        # Simple high-end template (usually we'd use a separate .html file)
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; }
                .header { padding: 40px 20px; text-align: center; border-bottom: 1px solid #1e293b; }
                .logo { font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: -1px; }
                .content { padding: 30px; }
                .article { margin-bottom: 40px; padding-bottom: 30px; border-bottom: 1px solid #1e293b; }
                .article:last-child { border-bottom: none; }
                .category { font-size: 10px; font-weight: 900; color: #ef4444; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px; display: block; }
                .title { font-size: 20px; font-weight: 800; margin-bottom: 15px; color: #ffffff; line-height: 1.3; }
                .summary { font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px; }
                .button { background-color: #ef4444; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: 800; font-size: 13px; display: inline-block; }
                .footer { padding: 30px; text-align: center; font-size: 11px; color: #64748b; background-color: #020617; }
                .unsubscribe { color: #ef4444; text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <div class="logo">MARLIZ INTEL</div>
                    <div style="font-size: 12px; color: #64748b; margin-top: 10px; text-transform: uppercase; font-weight: 900; letter-spacing: 2px;">Daily Intelligence Digest</div>
                </div>
                <div class="content">
                    {% for article in articles %}
                    <div class="article">
                        <span class="category">{{ article.category.name if article.category else 'Security' }}</span>
                        <div class="title">{{ article.title }}</div>
                        <div class="summary">{{ article.simplified.friendly_summary[:250] }}...</div>
                        <a href="https://marlizintel.com/article/{{ article.slug }}" class="button">Full Intelligence Report</a>
                    </div>
                    {% endfor %}
                </div>
                <div class="footer">
                    &copy; {{ year }} Marliz Intel. All rights reserved.<br>
                    You are receiving this because you subscribed to Marliz Intel alerts.<br><br>
                    <a href="https://marlizintel.com/unsubscribe" class="unsubscribe">Unsubscribe</a>
                </div>
            </div>
        </body>
        </html>
        """
        template = Template(template_str)
        return template.render(articles=articles, year=datetime.now().year)

    async def send_daily_digest(self):
        """Main entry point to send the daily intelligence digest."""
        if not self.api_key:
            logger.error("Resend API Key not found. Cannot send newsletter.")
            return False
            
        articles = await self.get_top_articles()
        if not articles:
            logger.info("No new articles to send in newsletter.")
            return False
            
        subscribers = await self.get_active_subscribers()
        if not subscribers:
            logger.info("No active subscribers to send newsletter to.")
            return False
            
        html_content = self._generate_html(articles)
        
        # Batch sending logic (Resend supports multiple recipients or we loop)
        # For now, we'll send individually to ensure deliverability and personalization
        for sub in subscribers:
            try:
                resend.Emails.send({
                    "from": self.from_email,
                    "to": sub.email,
                    "subject": f"INTEL ALERT: {articles[0].title[:50]}...",
                    "html": html_content
                })
                logger.info(f"Newsletter sent to {sub.email}")
            except Exception as e:
                logger.error(f"Failed to send newsletter to {sub.email}: {e}")
                
        return True

newsletter_service = NewsletterService()
