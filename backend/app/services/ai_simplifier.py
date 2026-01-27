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
        BATCH_LIMIT = 3  # LIMITED TO 3: Per user request for tighter human oversight
        
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
                    result_status = await self._simplify_article(db, article)
                    
                    if result_status == "success":
                        processed += 1
                        logger.info(f"SUCCESS - Processed: {article.title[:50]}...")
                    else:
                        # Mark as RAW for retry if it failed (but not if it was just irrelevant)
                        if article.status == ArticleStatus.PROCESSING:
                             failed += 1
                             article.status = ArticleStatus.RAW
                             await db.commit()
                    
                    # Add delay to avoid rate limits (10s between requests)
                    await asyncio.sleep(10.0)
                
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
                        "content": "You are 'Marliz Intel', a Senior Cyber Threat Intelligence Analyst. Your goal is to provide deep, high-value, and original analytical reports. You generate UNIFIED MARKDOWN. Google AdSense requires unique value, so expand deeply on history and strategy."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.65, 
                "max_completion_tokens": 8192, 
                "top_p": 1,
                "stream": False,
                "response_format": { "type": "json_object" }
            }
            
            async with httpx.AsyncClient(timeout=180.0) as client:
                response = await client.post(self.base_url, headers=headers, json=data)
            
            if response.status_code == 429:
                return "rate_limited"
            
            if response.status_code != 200:
                response.raise_for_status()
            
            response_data = response.json()
            response_text = response_data["choices"][0]["message"]["content"]
            result = self._parse_response(response_text)
            
            if not result:
                return "parse_error"
            
            # CHECK RELEVANCE
            if not result.get("is_relevant", True):
                if article.status == ArticleStatus.RAW or article.status == ArticleStatus.PROCESSING:
                    logger.info(f"Article {article.id} rejected by AI as irrelevant. Deleting.")
                    await db.delete(article)
                    await db.commit()
                return "success"
            # Save to DRAFT fields (Per user request: AI does processing, Human does edit)
            article.draft_content_markdown = result["content_markdown"]
            article.has_draft = True
            
            # Extract word count and reading time
            word_count = len(result["content_markdown"].split())
            reading_time = max(5, (word_count // 200) + 1)
            
            # Check if simplified content already exists (for re-processing)
            # Ensure SimplifiedContent exists but we use it only for legacy/metadata support
            stmt = select(SimplifiedContent).filter_by(article_id=article.id)
            existing = await db.execute(stmt)
            existing_simplified = existing.scalars().first()
            
            if not existing_simplified:
                simplified = SimplifiedContent(
                    article_id=article.id,
                    friendly_summary="See unified markdown content.",
                    attack_vector="See unified markdown content.",
                    business_impact="See unified markdown content.",
                    action_steps=json.dumps(result.get("actions", [])),
                    threat_level=ThreatLevel[result["threat_level"].upper()],
                    reading_time_minutes=reading_time
                )
                db.add(simplified)
            else:
                existing_simplified.threat_level = ThreatLevel[result["threat_level"].upper()]
                existing_simplified.reading_time_minutes = reading_time
                existing_simplified.action_steps = json.dumps(result.get("actions", []))
            
            # Update article status and SEO fields
            # Only move to READY if it's not already EDITED or PUBLISHED
            if article.status not in [ArticleStatus.EDITED, ArticleStatus.PUBLISHED]:
                article.status = ArticleStatus.READY
            
            # Use AI-generated keywords if available, otherwise fall back to extraction
            if result.get("seo_keywords") and isinstance(result["seo_keywords"], list):
                # meaningful limit of 10 keywords
                article.keywords = ", ".join(result["seo_keywords"][:10])
            else:
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

            article.updated_at = datetime.utcnow()
            article.last_edited_by = "AI Processor"
            
            await db.commit()
            return "success"
        except httpx.HTTPError as e:
            logger.error(f"Groq API request error: {str(e)}")
            return "api_error"
        except Exception as e:
            logger.error(f"Groq API processing error: {str(e)}")
            return "api_error"

    async def refine_article(self, db: AsyncSession, article: Article) -> str:
        """
        Surgically adds Marliz Intel Strategic Assessment and expands Business Impact
        WITHOUT overwriting the existing summary/title.
        """
        # 1. Get existing content
        stmt = select(SimplifiedContent).filter_by(article_id=article.id)
        result = await db.execute(stmt)
        existing = result.scalars().first()
        
        if not existing:
            # If it's totally empty, we fall back to a full simplify
            return await self._simplify_article(db, article)

        # 2. Build the "Refinement" Prompt
        prompt = f"""You are 'Marliz Intel'. I have an existing cybersecurity article. 
Your job is to ADD two specific, high-value sections to it. 

EXISTING TITLE: {article.title}
EXISTING SUMMARY: {existing.friendly_summary[:1500]}

MANDATE (INTERNAL ANALYSIS):
1. **Marliz Intel Strategic Assessment**:
   - WRITE 300+ WORDS of PURE ANALYSIS.
   - **DO NOT** repeat facts from the existing summary. 
   - **DO NOT** use bullet points. Use deep, analytical paragraphs.
   - YOU MUST PROVIDE:
     a) A prediction of how this threat evolves in 2026 or currrrent year, eg if we go to 2027, the year mentioned will be 2027.
     b) A comparison to a similar historical breach (e.g. SolarWinds, MoveIT, etc). You are not limited to one comparison.
     c) A criticism of the current security "best practices" that failed here.
2. **Business & Operational Impact**:
   - WRITE 250+ WORDS.
   - Focus on the "Downstream" costs: Insurance premium hikes, Class-Action litigation risks, and the cost of "Trust Erosion" in the specific sector (e.g. Healthcare, Finance).

STRICT RULES:
- ZERO REPETITION. If you repeat the existing summary, the task is a failure.
- Return ONLY a JSON object with two keys: "assessment" and "impact".
- No other text. Escape newlines as \\n.
"""
        try:
            headers = {"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"}
            data = {
                "model": self.model,
                "messages": [{"role": "system", "content": "You are a Senior Strategic Cyber Analyst."}, {"role": "user", "content": prompt}],
                "response_format": { "type": "json_object" }
            }
            async with httpx.AsyncClient(timeout=120.0) as client:
                resp = await client.post(self.base_url, headers=headers, json=data)
                resp.raise_for_status()
                res = resp.json()
                # Robust JSON parsing
                try:
                    content = json.loads(raw_content)
                except json.JSONDecodeError:
                    logger.error(f"JSON Error for {article.id}")
                    return "api_error"

                # 3. EXTRACT AND CLEAN (Strictly ignore AI-generated headers to prevent doubling)
                assessment_text = content.get('assessment', "")
                if isinstance(assessment_text, dict):
                    assessment_text = next(iter(assessment_text.values()), str(assessment_text))
                
                # Strip any ## headers the AI might have accidentally returned
                assessment_text = str(assessment_text).replace("## Marliz Intel Strategic Assessment", "").replace("## Strategic Assessment", "").strip()
                
                impact_text = content.get('impact', "")
                if isinstance(impact_text, dict):
                    impact_text = next(iter(impact_text.values()), str(impact_text))
                impact_text = str(impact_text).replace("## Business & Operational Impact", "").strip()

                # 4. SURGICAL CLEANUP (Remove any existing duplicated headers in the summary)
                current_summary = existing.friendly_summary or ""
                # If we already have a 'Strategic Assessment' header, we'll strip everything from that point on
                # and replace it with the fresh, high-quality one.
                if "## Marliz Intel Strategic Assessment" in current_summary:
                    current_summary = current_summary.split("## Marliz Intel Strategic Assessment")[0].strip()

                # 5. RE-ASSEMBLE with Deep Content
                # Force a clean, single header and the new deep paragraph
                new_assessment_block = f"\n\n## Marliz Intel Strategic Assessment\n\n{assessment_text}"
                existing.friendly_summary = f"{current_summary}\n\n{new_assessment_block}"
                
                # Update the impact section with the expanded text
                existing.business_impact = impact_text
                
                # Refresh timestamp
                article.updated_at = datetime.utcnow()
                
                await db.flush()
                await db.commit()
                return "success"
        except Exception as e:
            try:
                await db.rollback()
            except:
                pass
            logger.error(f"Refinement failed for {article.id}: {str(e)}")
            return "api_error"
            
    def _build_prompt(self, article, content):
        """Build precise prompt for Groq AI to generate UNIFIED MARKDOWN for human review."""
        
        return f"""You are 'Marliz Intel', a Senior Strategic Cyber Analyst.
Your goal is to write a PREMIUM, HIGH-VALUE cybersecurity report that satisfies Google's "High Value Content" standards.
You must NOT simply summarize the text. You must EXPAND, ANALYZE, and TEACH.

ARTICLE CONTEXT:
Title: {article.title}
Source: {article.source_name or 'Intelligence Field Feed'}
Raw Content: {content[:15000]}

MANDATE:
Produce a single, detailed MARKDOWN ARTICLE (Total 1800+ Words) that reads like a professional intelligence journal.
Avoid robotic traits (repetitive transitions, "in conclusion", etc.). Use professional, sharp, and authoritative language.
You are writing for C-Level executives who need DEPTH.

STRICT FORMATTING RULE: 
- Return a JSON object with a key 'content_markdown'. 
- Do NOT use bullet points in the prose. 
- Do NOT use em-dashes (—). Use commas, colons, or periods.
- Use long, dense paragraphs (150-200 words each).

REQUIRED MARKDOWN STRUCTURE (Inside 'content_markdown' key):
1. ## Strategic Intelligence Summary
   - Start with a solid Executive Summary.
2. ## Marliz Intel Strategic Assessment
   - Deep analysis, comparisons to historical breaches, predictions for next year.
3. ## Technical Analysis & Attack Mechanics
   - Explain the Kill Chain and tech vector in detail.
4. ## Business Impact & Risk Assessment
   - Downstream costs, litigation, insurance, and brand erosion.
5. ## Recommended Strategic Action Steps
   - 3-5 technical steps.

REQUIRED JSON KEYS:
- "content_markdown": The full 1800-word markdown text.
- "actions": Array of strings (the mitigation steps).
- "seo_title": String (50-60 chars).
- "meta_description": String (Max 160 chars).
- "seo_keywords": Array of strings.
- "threat_level": low, medium, high, or critical.
- "category": ransomware, phishing, data-breach, malware, vulnerability, or general.
- "is_relevant": boolean.

PRODUCE THE JSON NOW."""
    
    def _parse_response(self, response_text: str) -> dict:
        """Parse Groq's JSON response with aggressive cleaning."""
        try:
            # 0. Strip AI-style Em-Dashes
            response_text = response_text.replace("—", "-").replace("–", "-")

            cleaned = response_text.strip()
            start = cleaned.find('{')
            end = cleaned.rfind('}')
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            
            result = json.loads(cleaned)
            
            if not result.get("is_relevant", True):
                 return {"is_relevant": False}

            required = ["content_markdown", "threat_level"]
            if not all(key in result for key in required):
                return None
            
            return result
        except Exception as e:
            logger.error(f"Parse error: {str(e)}")
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