import httpx
import os
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Article, Category, ArticleStatus
from app.database import get_db_context
from slugify import slugify
from bs4 import BeautifulSoup
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class NewsFetcher:
    def __init__(self):
        self.api_key = os.getenv("NEWSDATA_IO_KEY")
        self.base_url = "https://newsdata.io/api/1/news"
        self.max_articles = int(os.getenv("MAX_ARTICLES_PER_FETCH", 20))
        
        # Enhanced keywords with regional focus
        self.keywords = [
            # East African specific
            "Kenya cybersecurity",
            "M-Pesa fraud",
            "mobile money security Kenya",
            "Nairobi cyber attack",
            
            # African general
            "Africa cybersecurity",
            "Africa data breach",
            
            # Global threats
            "ransomware",
            "phishing", 
            "data breach",
            "malware"
        ]
        
        # African countries to monitor
        self.african_countries = ["ke", "ng", "za", "gh", "tz", "ug"]  # Kenya, Nigeria, SA, Ghana, Tanzania, Uganda
        
        # Category mapping
        self.category_map = {
            "ransomware": 1,
            "phishing": 2,
            "data breach": 3,
            "malware": 4,
            "email security": 5,
            "general": 6
        }
    
    async def fetch_news(self) -> dict:
        """Main method to fetch news from all sources"""
        total_fetched = 0
        total_new = 0
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            # 1. Fetch Kenya-specific news first (highest priority)
            try:
                result = await self._fetch_regional_news(client, "ke", "Kenya")
                total_fetched += result["fetched"]
                total_new += result["new"]
            except Exception as e:
                logger.error(f"Error fetching Kenya news: {str(e)}")
            
            # 2. Fetch other African countries
            for country_code in ["ng", "za", "gh", "tz", "ug"]:
                try:
                    result = await self._fetch_regional_news(client, country_code, country_code.upper())
                    total_fetched += result["fetched"]
                    total_new += result["new"]
                except Exception as e:
                    logger.error(f"Error fetching {country_code} news: {str(e)}")
            
            # 3. Fetch by keywords (global + regional)
            for keyword in self.keywords[:8]:  # Limit to 8 to avoid rate limits
                try:
                    result = await self._fetch_keyword(client, keyword)
                    total_fetched += result["fetched"]
                    total_new += result["new"]
                    logger.info(f"Keyword '{keyword}': {result['new']} new articles")
                except Exception as e:
                    logger.error(f"Error fetching '{keyword}': {str(e)}")
        
        return {
            "status": "success",
            "total_fetched": total_fetched,
            "total_new": total_new,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _fetch_regional_news(self, client: httpx.AsyncClient, country_code: str, country_name: str) -> dict:
        """Fetch cybersecurity news for a specific African country"""
        
        params = {
            "apikey": self.api_key,
            "q": "cybersecurity OR cyber OR hacking OR breach OR fraud OR security",
            "language": "en",
            "country": country_code,
            "category": "technology,business",
            "size": 10
        }
        
        try:
            response = await client.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            logger.error(f"API request failed for {country_name}: {str(e)}")
            return {"fetched": 0, "new": 0}
        
        articles = data.get("results", [])
        new_count = 0
        
        with get_db_context() as db:
            for article_data in articles:
                if self._should_skip(article_data):
                    continue
                
                # CRITICAL: Check if article exists by URL OR slug
                existing_url = db.query(Article).filter_by(
                    original_url=article_data["link"]
                ).first()
                
                if existing_url:
                    continue
                
                # Generate slug and check for duplicates
                slug = self._generate_unique_slug(db, article_data["title"])
                
                existing_slug = db.query(Article).filter_by(slug=slug).first()
                if existing_slug:
                    logger.info(f"Skipping duplicate slug: {slug}")
                    continue
                
                # Determine category
                category_id = self._categorize(article_data, "")
                
                # Extract text content
                raw_content = self._extract_content(article_data)
                
                # Create article
                new_article = Article(
                    title=article_data["title"][:500],
                    slug=slug,
                    original_url=article_data["link"],
                    source_name=article_data.get("source_id", "Unknown"),
                    published_at=self._parse_date(article_data.get("pubDate")),
                    image_url=article_data.get("image_url"),
                    raw_content=raw_content,
                    category_id=category_id,
                    status=ArticleStatus.RAW,
                    meta_description=article_data.get("description", "")[:160]
                )
                
                db.add(new_article)
                new_count += 1
            
            try:
                db.commit()
                logger.info(f"{country_name} news: {new_count} new articles")
            except Exception as e:
                db.rollback()
                logger.error(f"Database error for {country_name}: {str(e)}")
                return {"fetched": len(articles), "new": 0}
        
        return {"fetched": len(articles), "new": new_count}
    
    async def _fetch_keyword(self, client: httpx.AsyncClient, keyword: str) -> dict:
        """Fetch articles for a single keyword"""
        
        params = {
            "apikey": self.api_key,
            "q": keyword,
            "language": "en",
            "category": "technology",
            "size": 10
        }
        
        try:
            response = await client.get(self.base_url, params=params)
            response.raise_for_status()
            data = response.json()
        except Exception as e:
            logger.error(f"API request failed: {str(e)}")
            return {"fetched": 0, "new": 0}
        
        articles = data.get("results", [])
        new_count = 0
        
        with get_db_context() as db:
            for article_data in articles:
                if self._should_skip(article_data):
                    continue
                
                # CRITICAL: Check if exists by URL first
                existing_url = db.query(Article).filter_by(
                    original_url=article_data["link"]
                ).first()
                
                if existing_url:
                    continue
                
                # Generate unique slug
                slug = self._generate_unique_slug(db, article_data["title"])
                
                # Double-check slug doesn't exist
                existing_slug = db.query(Article).filter_by(slug=slug).first()
                if existing_slug:
                    logger.info(f"Skipping duplicate slug: {slug}")
                    continue
                
                # Determine category
                category_id = self._categorize(article_data, keyword)
                
                # Extract text content
                raw_content = self._extract_content(article_data)
                
                # Create article
                new_article = Article(
                    title=article_data["title"][:500],
                    slug=slug,
                    original_url=article_data["link"],
                    source_name=article_data.get("source_id", "Unknown"),
                    published_at=self._parse_date(article_data.get("pubDate")),
                    image_url=article_data.get("image_url"),
                    raw_content=raw_content,
                    category_id=category_id,
                    status=ArticleStatus.RAW,
                    meta_description=article_data.get("description", "")[:160]
                )
                
                db.add(new_article)
                new_count += 1
            
            try:
                db.commit()
            except Exception as e:
                db.rollback()
                logger.error(f"Database commit error: {str(e)}")
                return {"fetched": len(articles), "new": 0}
        
        return {"fetched": len(articles), "new": new_count}
    
    def _should_skip(self, article_data: dict) -> bool:
        """Filter out irrelevant articles"""
        title = article_data.get("title", "").lower()
        description = article_data.get("description", "").lower()
        
        # Skip if no title or too short
        if not title or len(title) < 20:
            return True
        
        # Skip if content is too short
        content_length = len(description) + len(article_data.get("content", ""))
        min_length = int(os.getenv("MIN_ARTICLE_LENGTH", 150))
        if content_length < min_length:
            return True
        
        # Skip non-security related (basic filter)
        security_terms = ["hack", "breach", "attack", "threat", "security", 
                         "ransomware", "phishing", "malware", "cyber", "fraud",
                         "scam", "data leak", "password", "encryption"]
        if not any(term in title or term in description for term in security_terms):
            return True
        
        return False
    
    def _categorize(self, article_data: dict, keyword: str) -> int:
        """Determine category based on content and keyword"""
        text = (article_data.get("title", "") + " " + 
                article_data.get("description", "")).lower()
        
        if "ransomware" in text:
            return self.category_map["ransomware"]
        elif "phishing" in text or "email" in text:
            return self.category_map["phishing"]
        elif "breach" in text or "data leak" in text:
            return self.category_map["data breach"]
        elif "malware" in text or "virus" in text:
            return self.category_map["malware"]
        elif "email" in text:
            return self.category_map["email security"]
        else:
            return self.category_map["general"]
    
    def _extract_content(self, article_data: dict) -> str:
        """Extract and clean article content"""
        content = article_data.get("content", "")
        description = article_data.get("description", "")
        
        # Combine and clean
        full_text = f"{description}\n\n{content}"
        
        # Basic HTML cleaning if present
        if "<" in full_text:
            soup = BeautifulSoup(full_text, "html.parser")
            full_text = soup.get_text()
        
        return full_text[:5000]  # Limit to 5000 chars
    
    def _generate_unique_slug(self, db: Session, title: str) -> str:
        """Generate unique slug for article"""
        base_slug = slugify(title)[:100]
        slug = base_slug
        counter = 1
        
        # Keep incrementing until we find a unique slug
        while db.query(Article).filter_by(slug=slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1
        
        return slug
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime"""
        if not date_str:
            return datetime.now()
        
        try:
            # NewsData.io format: "2024-01-15 12:30:00"
            return datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
        except:
            return datetime.now()

# Global instance
news_fetcher = NewsFetcher()