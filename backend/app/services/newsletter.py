
import resend
import os
import asyncio
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
        """Fetch all verified and active subscribers."""
        async with AsyncSessionLocal() as db:
            stmt = select(Subscriber).where(
                Subscriber.unsubscribed_at.is_(None),
                Subscriber.is_verified == True
            )
            result = await db.execute(stmt)
            return result.scalars().all()

    def _generate_html(self, articles, custom_note=None, subscriber_email=None):
        """Generate a premium-style HTML email template for the newsletter."""
        # Create base unsubscribe URL
        unsubscribe_url = f"{settings.BASE_URL}/unsubscribe"
        if subscriber_email:
            unsubscribe_url += f"?email={subscriber_email}"

        # Clean summary text to remove placeholders like "See unified markdown..."
        def clean_summary(text, title):
            if not text or "See unified markdown" in text or "Full article content" in text:
                return f"New tactical intelligence published: {title}. Access the mission portal for the full technical breakdown and defensive strategy."
            return text

        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { margin: 0; padding: 0; background-color: #020617; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f8fafc; }
                .wrapper { background-color: #020617; width: 100%; padding: 40px 0; }
                .container { max-width: 700px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; border: 1px solid #1e293b; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .top-bar { background-color: #ef4444; height: 4px; width: 100%; }
                .header { padding: 40px; text-align: left; border-bottom: 1px solid #1e293b; }
                .brand { font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; text-decoration: none; }
                .brand span { color: #ef4444; }
                .meta { float: right; color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 8px; }
                .briefing-note { padding: 30px 40px; background-color: #1e293b; border-left: 4px solid #ef4444; margin: 20px 40px; border-radius: 4px; }
                .briefing-note p { margin: 0; font-size: 15px; font-style: italic; color: #f8fafc; line-height: 1.6; }
                .content { padding: 40px; }
                .article-card { margin-bottom: 50px; }
                .tag { display: inline-block; padding: 4px 10px; background: rgba(239, 68, 68, 0.1); color: #ef4444; font-size: 10px; font-weight: 900; border-radius: 4px; margin-bottom: 15px; letter-spacing: 1px; text-transform: uppercase; border: 1px solid rgba(239, 68, 68, 0.2); }
                .title { font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.2; margin-bottom: 15px; }
                .summary { font-size: 15px; color: #94a3b8; line-height: 1.7; margin-bottom: 25px; }
                .cta { background-color: #ef4444; color: #ffffff !important; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; }
                .footer { background-color: #020617; padding: 40px; text-align: center; border-top: 1px solid #1e293b; color: #475569; font-size: 11px; line-height: 1.8; }
                .unsub { color: #ef4444; text-decoration: none; font-weight: 700; }
                
                @media only screen and (max-width: 600px) {
                    .container { margin: 0; border-radius: 0; border: none; }
                    .header, .content, .footer { padding: 25px; }
                    .meta { float: none; display: block; margin-top: 15px; }
                    .title { font-size: 20px; }
                    .briefing-note { margin: 10px 20px; padding: 20px; }
                }
            </style>
        </head>
        <body>
            <div class="wrapper">
                <div class="container">
                    <div class="top-bar"></div>
                    <div class="header">
                        <span class="meta">{{ timestamp_readable }} ALERT</span>
                        <a href="https://marlizintel.com" class="brand">MARLIZ<span>INTEL</span></a>
                    </div>
                    
                    {% if custom_note %}
                    <div class="briefing-note">
                        <p>"{{ custom_note }}"</p>
                    </div>
                    {% endif %}

                    <div class="content">
                        {% for article in articles %}
                        <div class="article-card">
                            <span class="tag">{{ article.category.name if article.category else 'THREAT ALERT' }}</span>
                            <div class="title">{{ article.title }}</div>
                            <div class="summary">
                                {% if article.simplified and article.simplified.friendly_summary %}
                                    {{ clean_summary(article.simplified.friendly_summary, article.title) | truncate(350) }}
                                {% else %}
                                    {{ clean_summary(article.summary, article.title) | truncate(350) }}
                                {% endif %}
                            </div>
                            <a href="https://marlizintel.com/article/{{ article.slug }}" class="cta">Read Intel Report</a>
                        </div>
                        {% endfor %}
                    </div>
                    
                    <div class="footer">
                        CONFIDENTIAL DISPATCH #{{ timestamp }}<br>
                        &copy; {{ year }} Marliz Intelligence Systems. All rights reserved.<br>
                        This report contains time-sensitive cybersecurity intelligence.<br><br>
                        <a href="{{ unsubscribe_link }}" class="unsub">Unsubscribe from Intel Alerts</a>
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
            timestamp_readable=now.strftime("%B %d, %H:%M").upper(),
            unsubscribe_link=unsubscribe_url,
            clean_summary=clean_summary
        )

    def _generate_verification_html(self, verification_url):
        """Generate a premium-style verification email template."""
        template_str = """
        <!DOCTYPE html>
        <html>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body { font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #020617; color: #f8fafc; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 40px auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; padding: 40px; text-align: center; }
                .logo { font-size: 24px; font-weight: 900; color: #ef4444; letter-spacing: -1px; text-decoration: none; display: block; margin-bottom: 30px; }
                .title { font-size: 28px; font-weight: 800; color: #ffffff; margin-bottom: 20px; }
                .text { color: #94a3b8; line-height: 1.7; margin-bottom: 30px; font-size: 16px; }
                .button { background-color: #ef4444; color: #ffffff !important; padding: 16px 32px; border-radius: 14px; text-decoration: none; font-weight: 800; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
                .footer { margin-top: 40px; font-size: 12px; color: #475569; }
            </style>
        </head>
        <body>
            <div class="container">
                <a href="https://marlizintel.com" class="logo">MARLIZ INTEL</a>
                <h1 class="title">Verify Your Intelligence Access</h1>
                <p class="text">Welcome to the inner circle. To start receiving our premium daily intelligence dispatches and tactical alerts, please confirm your email address.</p>
                <a href="{{ verification_url }}" class="button">Confirm Subscription</a>
                <p class="text" style="margin-top: 30px; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
                <div class="footer">
                    &copy; 2026 Marliz Intelligence Systems.
                </div>
            </div>
        </body>
        </html>
        """
        template = Template(template_str)
        return template.render(verification_url=verification_url)

    async def send_verification_email(self, email, token):
        """Send a verification email to a new subscriber."""
        if not self.api_key:
            return False, "Missing API Key"
            
        verification_url = f"{settings.BASE_URL}/verify-email?token={token}"
        html_content = self._generate_verification_html(verification_url)
        
        try:
            resend.Emails.send({
                "from": self.from_email,
                "to": email,
                "subject": "ACTION REQUIRED: Verify your Marliz Intel subscription",
                "html": html_content
            })
            return True, "Verification email sent"
        except Exception as e:
            logger.error(f"Failed to send verification email to {email}: {e}")
            return False, str(e)

    async def send_daily_digest(self, article_ids=None, custom_note=None, to_email=None, subscriber_emails=None):
        """Main entry point to send the intelligence digest. Accepts manual article_ids or defaults to top articles.
        Can target a single to_email (test mode) or a list of subscriber_emails (targeted blast)."""
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
        elif subscriber_emails and len(subscriber_emails) > 0:
            # Targeted Blast: Filter to specific email list
            async with AsyncSessionLocal() as db:
                stmt = select(Subscriber).where(
                    Subscriber.email.in_(subscriber_emails), 
                    Subscriber.unsubscribed_at.is_(None),
                    Subscriber.is_verified == True
                )
                result = await db.execute(stmt)
                subscribers = result.scalars().all()
        else:
            # Default: Send to ALL active subscribers
            # (Matches when subscriber_emails is None OR empty list [])
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
                    # Rate Limiting: Resend free tier/unverified limit is 2 req/sec
                    await asyncio.sleep(0.5) 
                    
                    # Generate personalized HTML for this subscriber
                    html_content_personalized = self._generate_html(articles, custom_note=custom_note, subscriber_email=sub.email)
                    
                    logger.info(f"Attempting to send intel to {sub.email} via {self.from_email}...")
                    
                    # Add specialized deliverability headers
                    unsubscribe_url = f"{settings.BASE_URL}/unsubscribe?email={sub.email}"
                    
                    response = resend.Emails.send({
                        "from": self.from_email,
                        "to": sub.email,
                        "subject": f"INTEL ALERT: {articles[0].title[:50]}...",
                        "html": html_content_personalized,
                        "reply_to": "intelligence@marlizintel.com",
                        "headers": {
                            "List-Unsubscribe": f"<{unsubscribe_url}>",
                            "List-Unsubscribe-Post": "List-Unsubscribe=One-Click"
                        }
                    })
                    logger.info(f"✓ Resend Response for {sub.email}: {response}")
                    success_count += 1
                    
                    # Track last sent time if it's a real subscriber
                    if sub.id:
                        from sqlalchemy import update
                        # Subscriber is already imported globally
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
