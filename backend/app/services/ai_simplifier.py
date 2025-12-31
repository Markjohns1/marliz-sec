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
        BATCH_LIMIT = 10  # Only process 10 articles per button click
        
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
                        logger.info(f"✓ Processed: {article.title[:50]}...")
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
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                # Increased tokens for longer articles (500-700 words + JSON overhead)
                "max_completion_tokens": 5000, 
                "top_p": 1,
                "stream": False
            }
            
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(self.base_url, headers=headers, json=data)
            
            # Handle rate limiting with exponential backoff
            if response.status_code == 429:
                logger.warning(f"Rate limited on article {article.id}, will retry later")
                return False
            
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
                return False
            
            # CHECK RELEVANCE
            if not result.get("is_relevant", True):
                logger.info(f"Article {article.id} rejected by AI as irrelevant.")
                # Delete any existing simplified content first (foreign key constraint)
                stmt = select(SimplifiedContent).filter_by(article_id=article.id)
                existing = await db.execute(stmt)
                existing_simplified = existing.scalars().first()
                if existing_simplified:
                    await db.delete(existing_simplified)
                await db.delete(article)
                await db.commit()
                return True # Handled successfully (by rejection)
            
            # Calculate reading time (200 words per minute)
            word_count = len(result["summary"].split()) + len(result["impact"].split())
            reading_time = max(2, (word_count // 200) + 1)
            
            # Check if simplified content already exists (for re-processing)
            stmt = select(SimplifiedContent).filter_by(article_id=article.id)
            existing = await db.execute(stmt)
            existing_simplified = existing.scalars().first()
            
            # Determine content type (Default to 'news', upgrade to 'evergreen' if deep analysis)
            # This is a basic heuristic; Admin can override later
            content_type = "news"
            # If word count is high or threat level critical, could be candidate for evergreen
            # But currently user logic is manual, so default to 'news'
            
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
            article.status = ArticleStatus.READY
            article.keywords = self._extract_keywords(result)
            
            # UPDATE TITLE with SEO-optimized version from AI
            if result.get("seo_title"):
                article.title = result["seo_title"]
                logger.info(f"Article {article.id} title updated: {result['seo_title'][:50]}...")
            
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
            
            await db.commit()
            return True
            
        except httpx.HTTPError as e:
            logger.error(f"Groq API request error: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response body: {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return False
    
    def _build_prompt(self, article, content):
        """Build precise prompt for Groq AI with advanced SEO optimization and business-focused intelligence."""
        
        return f"""You are 'Marliz Intel', a Senior Cyber Threat Intelligence Analyst AND Strategic SEO Specialist.
Your voice is AUTHORITY, URGENCY, and CLARITY. You translate complex chaos into boardroom-ready intelligence.

ARTICLE TO ANALYZE:
Title: {article.title}
Source: {article.source_name or 'Intelligence feed'}
Content excerpt: {content[:3500]}

YOUR MISSION:
1. TECHNICAL AUDIT: Analyze the mechanism (CVEs, tools, tactics).
2. STRATEGIC REWRITE: Create a long-form Intel Report (1200-1500 words) for business leaders.
3. ADAPTIVE SEO: Generate a high-conversion Title and Meta Description.
4. ACTIONABLE PROTOCOLS: Provide clear, prioritized mitigation steps.

RESPOND WITH VALID JSON ONLY:
{{
  "is_relevant": true,
  "category": "ransomware|phishing|data-breach|malware|vulnerability|general",
  "seo_title": "[Entity] [Event]: [Impact/Discovery] – [Urgency/Action]",
  "meta_description": "Shocking fact/stat + Critical impact + Direct call-to-action (160 chars).",
  "summary": "<p><strong>Executive Summary:</strong> High-impact narrative explaining the 'What' and 'Why' (250 words minimum). Use text-primary styles mentally.</p>",
  "attack_vector": "<h2>Technical Vector & Methodology</h2><p>Explain the 'How' using professional terminology but provide layperson translations in parentheses. Detail specific vulnerabilities (CVEs) if mentioned. (Keep extensive).</p>",
  "impact": "<h2>Business & Operational Impact</h2><p>Analyze consequences for: 1. Financial stability, 2. Brand Reputation, 3. Legal/Compliance (250 words minimum).</p>",
  "who_is_at_risk": "Specific industries, regions, or software users affected.",
  "actions": ["IMMEDIATE: Priority patch/action", "SECONDARY: System audit/monitoring", "LONG-TERM: Policy/Training update"],
  "threat_level": "low|medium|high|critical",
  "keywords": ["primary target", "malware name", "specific CVE", "cybersecurity news 2024", "intel report"]
}}

=== 🏆 THE MARLIZ SEO FORMULA ===
TITLE PROTOCOL:
- Rule: [Company/Softare] [Hacked/Leaked/Exposed]: [Scale of Impact] – [Immediate Action]
- Example: "Microsoft Exchange Zero-Day: 60k Servers Exposed – Patch Required Immediately"
- Constraint: Max 60 characters. No fluff.

META PROTOCOL:
- Rule: Lead with the most dangerous fact. End with a command.
- Example: "33 million customer records were leaked in the Coupang data breach. Your private credentials may be on the dark web. Check the security protocol now."

=== 🛑 SENSITIVE CONTENT & ADSENSE COMPLIANCE ===
PROHIBITED SUBJECTS:
- War in Ukraine, Russia, Israel, Hamas, Gaza, or any civilian casualties.
- Political propaganda or content condoning/exploiting sensitive geopolitical events.
- Rule: If the article even slightly touches on these sensitive war topics, you MUST mark it as "is_relevant": false to protect AdSense approval.

=== INTELLIGENCE GUIDELINES ===
1. RELEVANCE: If this is NOT about a digital threat (e.g., physical crime, general tech marketing, lifestyle) OR if it involves PROHIBITED SENSITIVE SUBJECTS (War/Conflict), RETURN "is_relevant": false.
2. TONE: Serious and analytical. Avoid "Stay safe" or "Be careful". Use "Implement mitigation" or "Execute protocol".
3. KENYAN & GLOBAL CONTEXT: If the source mentions generic targets, frame it globally. If it mentions African entities, highlight regional significance.

RETURN ONLY THE JSON OBJECT. NO MARKDOWN."""
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse Groq's JSON response"""
        try:
            # Clean up response (remove markdown if present)
            cleaned = response_text.strip()
            cleaned = re.sub(r'^```json\s*', '', cleaned)
            cleaned = re.sub(r'\s*```$', '', cleaned)
            
            # Parse JSON
            result = json.loads(cleaned)
            
            # Validate structure
            # is_relevant is optional, default to True if missing (legacy support) but usually strictly required by prompt
            is_relevant = result.get("is_relevant", True)
            
            if not is_relevant:
                 return {"is_relevant": False}

            required = ["summary", "attack_vector", "impact", "actions", "threat_level"]
            if not all(key in result for key in required):
                return None
            
            # Validate threat level
            if result["threat_level"] not in ["low", "medium", "high", "critical"]:
                result["threat_level"] = "medium"
            
            # Validate actions (must be list with 2-5 items)
            if not isinstance(result["actions"], list) or len(result["actions"]) < 2:
                return None
            
            result["actions"] = result["actions"][:5]  # Max 5 actions
            
            return result
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {str(e)}")
            logger.error(f"Response was: {response_text[:200]}")
            return None
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