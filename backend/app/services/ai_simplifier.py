import os
import json
import httpx
import asyncio
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Article, SimplifiedContent, ArticleStatus, ThreatLevel, Category
from app.database import get_db_context
from app.config import settings
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AISimplifier:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.AI_MODEL
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Category mapping (slug -> database ID)
        self.category_map = {} # Loaded dynamically
    
    async def _load_categories(self, db: AsyncSession):
        """Load categories from database into memory"""
        stmt = select(Category)
        result = await db.execute(stmt)
        categories = result.scalars().all()
        # Map regular slug AND spaced versions just in case
        self.category_map = {c.slug: c.id for c in categories}
        for c in categories:
             self.category_map[c.slug.replace("-", " ")] = c.id

    async def process_pending_articles(self) -> dict:
        """Process up to 10 RAW articles through AI simplification"""
        processed = 0
        failed = 0
        BATCH_LIMIT = 8  # Strictly 8 articles per batch to ensure high-quality, long-form processing
        
        # Use single async context manager
        async with get_db_context() as db:
            await self._load_categories(db)
            
            # Get all RAW articles (but only process BATCH_LIMIT)
            stmt = select(Article).filter_by(status=ArticleStatus.RAW).limit(BATCH_LIMIT)
            result = await db.execute(stmt)
            articles = result.scalars().all()
            
            # Count total remaining (for UI feedback)
            count_stmt = select(Article).filter_by(status=ArticleStatus.RAW)
            count_result = await db.execute(count_stmt)
            total_pending = len(count_result.scalars().all())
            
            logger.info(f"Found {len(articles)} articles to process (batch limit: {BATCH_LIMIT})")
            for article in articles:
                try:
                    # Mark as processing
                    article.status = ArticleStatus.PROCESSING
                    await db.commit()
                
                    # Simplify with Groq
                    result = await self._simplify_article(db, article)
                    
                    if result:
                        processed += 1
                        logger.info(f"SUCCESS - Processed: {article.title[:50]}...")
                    else:
                        # Mark as RAW for retry if it failed (but not if it was just irrelevant)
                        if article.status == ArticleStatus.PROCESSING:
                             failed += 1
                             article.status = ArticleStatus.RAW
                             await db.commit()
                    
                    # Add delay to avoid rate limits (500ms between requests)
                    await asyncio.sleep(2.0)
                
                except Exception as e:
                    logger.error(f"Failed to process article {article.id}: {str(e)}")
                    article.status = ArticleStatus.RAW
                    await db.commit()
                    failed += 1
        
        return {
            "processed": processed,
            "failed": failed,
            "remaining": total_pending - processed,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _simplify_article(self, db: AsyncSession, article: Article) -> bool:
        """Simplify a single article using Groq"""
        
        # Get article content
        content = article.raw_content or article.meta_description or ""
        
        # Build comprehensive prompt
        prompt = self._build_prompt(article, content)
        
        try:
            # Call Groq API
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            
            data = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are 'Marliz Intel', a Senior Cyber Threat Intelligence Analyst. Your goal is to provide deep, high-value, and original analytical reports for cybersecurity news. Google AdSense requires 'High Value Content', so your output MUST be substantial, insightful, and authoritative."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.2, # Lower temperature for strictly valid JSON
                "max_completion_tokens": 6000, 
                "top_p": 1,
                "stream": False,
                "response_format": { "type": "json_object" }
            }
            
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(self.base_url, headers=headers, json=data)
            
            # Handle rate limiting with exponential backoff
            if response.status_code == 429:
                logger.warning(f"Rate limited on article {article.id}, will retry later")
                return "rate_limited"
            
            # Enhanced error logging
            if response.status_code != 200:
                logger.error(f"Groq API error: {response.status_code}")
                logger.error(f"Response: {response.text}")
                response.raise_for_status()
            
            # Extract response
            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"]
            
            # Parse JSON response
            result = self._parse_response(response_text)
            
            if not result:
                logger.error(f"Failed to parse response for article {article.id}")
                return "parse_error"
            
            # CHECK RELEVANCE
            if not result.get("is_relevant", True):
                # IMPORTANT: For REFRESH mode (already READY articles), we don't delete.
                # However, this logic is shared. We'll keep the delete logic for RAW articles only
                # but since this is called for existing articles too, we need to be careful.
                # If it's a RAW article, we can delete. If it's already READY/PUBLISHED, maybe just skip?
                if article.status == ArticleStatus.RAW or article.status == ArticleStatus.PROCESSING:
                    logger.info(f"Article {article.id} rejected by AI as irrelevant. Deleting.")
                    stmt = select(SimplifiedContent).filter_by(article_id=article.id)
                    existing = await db.execute(stmt)
                    existing_simplified = existing.scalars().first()
                    if existing_simplified:
                        await db.delete(existing_simplified)
                    await db.delete(article)
                    await db.commit()
                else:
                    logger.warning(f"Article {article.id} marked as irrelevant but it's already {article.status}. Skipping update.")
                return True
            
            # Calculate reading time (200 words per minute)
            summary_words = result["summary"].split()
            impact_words = result["impact"].split()
            vector_words = result["attack_vector"].split()
            word_count = len(summary_words) + len(impact_words) + len(vector_words)
            reading_time = max(2, (word_count // 200) + 1)
            
            # Check if simplified content already exists (for re-processing)
            stmt = select(SimplifiedContent).filter_by(article_id=article.id)
            existing = await db.execute(stmt)
            existing_simplified = existing.scalars().first()
            
            if existing_simplified:
                # Update existing record
                existing_simplified.friendly_summary = result["summary"]
                existing_simplified.attack_vector = result["attack_vector"]
                existing_simplified.business_impact = result["impact"]
                existing_simplified.action_steps = json.dumps(result["actions"])
                existing_simplified.threat_level = ThreatLevel[result["threat_level"].upper()]
                existing_simplified.reading_time_minutes = reading_time
                logger.info(f"Updated existing simplified content for article {article.id}")
            else:
                # Create new record
                simplified = SimplifiedContent(
                    article_id=article.id,
                    friendly_summary=result["summary"],
                    attack_vector=result["attack_vector"],
                    business_impact=result["impact"],
                    action_steps=json.dumps(result["actions"]),
                    threat_level=ThreatLevel[result["threat_level"].upper()],
                    reading_time_minutes=reading_time
                )
                db.add(simplified)
            
            # Update article status and SEO fields
            # Only move to READY if it's not already EDITED or PUBLISHED
            if article.status not in [ArticleStatus.EDITED, ArticleStatus.PUBLISHED]:
                article.status = ArticleStatus.READY
            
            article.keywords = self._extract_keywords(result)
            
            # UPDATE TITLE with SEO-optimized version from AI
            # BUT: If it's already PUBLISHED or EDITED, do NOT change the title further
            # to protect shared links and existing indexing.
            if result.get("seo_title") and article.status not in [ArticleStatus.EDITED, ArticleStatus.PUBLISHED]:
                article.title = result["seo_title"]
                logger.info(f"Article {article.id} title updated: {result['seo_title'][:50]}...")
            else:
                logger.info(f"Article {article.id} keeping current title to protect links.")
            
            # UPDATE META DESCRIPTION with AI version
            if result.get("meta_description"):
                # Ensure no HTML tags in meta description
                clean_meta = re.sub(r'<[^>]*>', '', result["meta_description"])
                article.meta_description = clean_meta[:160]
            
            # Update category based on AI classification
            ai_category = result.get("category", "general").lower().replace(" ", "-")
            if ai_category in self.category_map:
                article.category_id = self.category_map[ai_category]
                logger.info(f"Article {article.id} classified as: {ai_category}")

            # Force updated_at refresh so sitemap.xml indicates the content is new to Google
            from datetime import datetime
            article.updated_at = datetime.utcnow()
            
            await db.commit()
            return "success"
        except httpx.HTTPError as e:
            logger.error(f"Groq API request error: {str(e)}")
            return "api_error"
        except Exception as e:
            logger.error(f"Groq API processing error: {str(e)}")
            return "api_error"
            
    def _build_prompt(self, article, content):
        """Build precise prompt for Groq AI with advanced SEO optimization and business-focused intelligence."""
        
        return f"""You are 'Marliz Intel', a Senior Cyber Threat Intelligence Analyst AND Strategic SEO Specialist.
Your report MUST be authoritative, deep, and provide proprietary-grade value.

ARTICLE TO ANALYZE:
Title: {article.title}
Source: {article.source_name or 'Intelligence feed'}
Content: {content[:10000]}

YOUR MISSION:
1. TECHNICAL AUDIT: Analyze the mechanism (CVEs, tools, tactics).
2. STRATEGIC REWRITE: Create a long-form Intel Report (Minimum 800 words, Target 1200-1600 words).
3. ADAPTIVE SEO: Generate a high-conversion Title and Meta Description.
4. ACTIONABLE PROTOCOLS: Provide clear, prioritized mitigation steps.

FIELD INSTRUCTIONS:
- "is_relevant": Set to true if cybersecurity related, false if political/war content.
- "category": Choose ONE from: ransomware, phishing, data-breach, malware, vulnerability, general
- "seo_title": Create a compelling headline like "Microsoft Breach: 30M Users Exposed – Update Now"
- "meta_description": Write exactly 150-160 characters with a hook and call-to-action.
- "summary": Write 800-1600 words of deep analysis. Use markdown headers (##) and paragraphs.
- "attack_vector": Explain the technical mechanism in detail (CVEs, exploits, tools used).
- "impact": Explain business/financial/reputational consequences for organizations.
- "who_is_at_risk": List specific sectors, systems, or user types affected.
- "actions": Provide 3-5 specific actionable steps as an array of strings.
- "threat_level": Choose ONE from: low, medium, high, critical
- "keywords": Provide 3-5 SEO keywords as an array of strings.

CONTENT DEPTH REQUIREMENT:
- MINIMUM 800 WORDS TOTAL across summary, attack_vector, and impact.
- If source is short, EXPAND by explaining threat history, defining technical terms, and adding industry context.

CRITICAL OUTPUT RULES:
1. Return ONLY a valid JSON object. No markdown wrappers like ```json.
2. Escape internal double quotes as \\"
3. Use \\n for newlines inside string values.
4. Fill in REAL content - do not copy these instructions.

EXAMPLE OUTPUT (fill in with REAL analysis, not these placeholders):
{{
  "is_relevant": true,
  "category": "data-breach",
  "seo_title": "Company Name Breach: X Million Records Exposed – Take Action",
  "meta_description": "A critical data breach at Company exposed X million records. Learn what happened and how to protect yourself now.",
  "summary": "## Executive Summary\\n\\nYour detailed 800+ word analysis goes here...",
  "attack_vector": "## Technical Analysis\\n\\nDetailed technical breakdown...",
  "impact": "## Business Impact\\n\\nFinancial and operational consequences...",
  "who_is_at_risk": "Healthcare organizations, financial institutions, and SMBs using affected software.",
  "actions": ["Immediately rotate all credentials", "Apply security patch version X.X", "Enable MFA on all accounts", "Monitor logs for suspicious activity"],
  "threat_level": "high",
  "keywords": ["data breach", "cybersecurity", "credential theft"]
}}

ADSENSE COMPLIANCE:
- If the article discusses war (Ukraine, Gaza, Israel), political propaganda, or violence, set "is_relevant": false.

NOW ANALYZE THE ARTICLE AND RETURN YOUR JSON RESPONSE:"""
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse Groq's JSON response with aggressive cleaning for control characters."""
        try:
            # 1. Strip whitespace
            cleaned = response_text.strip()
            
            # 2. Extract JSON if wrapped in markdown
            start = cleaned.find('{')
            end = cleaned.rfind('}')
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            
            # 3. HEALER: If the JSON is broken, it's usually literal newlines
            result = None
            try:
                result = json.loads(cleaned)
            except json.JSONDecodeError:
                # If it still fails, try the "Control Char Removal" as last resort
                cleaned = re.sub(r'[\x00-\x1F\x7F]', ' ', cleaned)
                result = json.loads(cleaned)
            
            if not result:
                return None

            # 4. VALIDATION
            is_relevant = result.get("is_relevant", True)
            if not is_relevant:
                 return {"is_relevant": False}

            required = ["summary", "attack_vector", "impact", "actions", "threat_level"]
            if not all(key in result for key in required):
                logger.error(f"Missing required keys in AI response: {[k for k in required if k not in result]}")
                return None
            
            # Validate threat level
            if result["threat_level"] not in ["low", "medium", "high", "critical"]:
                result["threat_level"] = "medium"
            
            # Validate actions (must be list with 2-5 items)
            if not isinstance(result["actions"], list) or len(result["actions"]) < 2:
                logger.error(f"Invalid actions format: {type(result['actions'])}")
                return None
            
            result["actions"] = result["actions"][:5]  # Max 5 actions
            return result

        except Exception as e:
            logger.error(f"Parse error: {str(e)}")
            return None
            
    def _extract_keywords(self, result: dict) -> str:
        """Extract SEO keywords from simplified content"""
        text = f"{result['summary']} {result['impact']}"
        
        # Base keywords
        keywords = [
            "cybersecurity",
            "threat intelligence",
            "data breach",
            "infosec",
            "malware analysis"
        ]
        
        # Add specific terms from content
        threat_terms = ["ransomware", "phishing", "malware", "breach", "hack", "fraud", "exploit", "vulnerability", "patch"]
        found_terms = [term for term in threat_terms if term in text.lower()]
        
        if found_terms:
            keywords.extend(found_terms)
        
        # Extract technical terms if present (simple regex for CVEs or capitalized tools)
        tech_terms = re.findall(r'\b[A-Z][A-Za-z0-9]+\b', text)
        if tech_terms:
             # Filter out common words
            common = ["The", "A", "An", "In", "On", "It", "We", "They", "This"]
            keywords.extend([t for t in tech_terms if t not in common and len(t) > 2])
        
        # Deduplicate and limit
        unique_keywords = list(set(keywords))
        return ", ".join(unique_keywords[:10])

# Global instance
ai_simplifier = AISimplifier()