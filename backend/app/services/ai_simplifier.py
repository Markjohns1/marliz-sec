import os
import json
import requests
import asyncio
from datetime import datetime
from sqlalchemy.orm import Session
from app.models import Article, SimplifiedContent, ArticleStatus, ThreatLevel
from app.database import get_db_context
import logging
import re

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AISimplifier:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        # Changed to faster model with higher rate limits
        self.model = "llama-3.1-8b-instant"  # 30k tokens/min vs 12k
        self.base_url = "https://api.groq.com/openai/v1/chat/completions"
        
        # Category mapping (slug -> database ID)
        # Must match categories in database
        self.category_map = {
            "ransomware": 1,
            "phishing": 2,
            "data-breach": 3,
            "malware": 4,
            "vulnerability": 5,
            "general": 6
        }
    
    async def process_pending_articles(self) -> dict:
        """Process all RAW articles through AI simplification"""
        processed = 0
        failed = 0
        
        with get_db_context() as db:
            # Get all RAW articles
            articles = db.query(Article).filter_by(status=ArticleStatus.RAW).all()
            
            logger.info(f"Found {len(articles)} articles to process")
            
            for article in articles:
                try:
                    # Mark as processing
                    article.status = ArticleStatus.PROCESSING
                    db.commit()
                    
                    # Simplify with Groq
                    result = await self._simplify_article(db, article)
                    
                    if result:
                        processed += 1
                        logger.info(f"✓ Processed: {article.title[:50]}...")
                    else:
                        # Mark as RAW for retry if it failed (but not if it was just irrelevant)
                        # The _simplify_article method should handle status for irrelevant items.
                        # If it returned False but didn't change status, we assume it failed.
                        if article.status == ArticleStatus.PROCESSING:
                             failed += 1
                             article.status = ArticleStatus.RAW
                             db.commit()
                    
                    # Add delay to avoid rate limits (500ms between requests)
                    await asyncio.sleep(2.0)
                
                except Exception as e:
                    logger.error(f"Failed to process article {article.id}: {str(e)}")
                    article.status = ArticleStatus.RAW
                    db.commit()
                    failed += 1
        
        return {
            "processed": processed,
            "failed": failed,
            "timestamp": datetime.now().isoformat()
        }
    
    async def _simplify_article(self, db: Session, article: Article) -> bool:
        """Simplify a single article using Groq"""
        
        # Get article content
        content = article.raw_content or article.meta_description or ""
        
        # Build comprehensive prompt
        prompt = self._build_prompt(article, content)  # <-- FIXED: Added content parameter
        
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
                "max_completion_tokens": 2000,
                "top_p": 1,
                "stream": False
            }
            
            response = requests.post(self.base_url, headers=headers, json=data, timeout=30)
            
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
                # We can mark it as 'REJECTED' or just delete it. 
                # For now let's mark it as a new status or just delete to save space?
                # Let's delete strictly irrelevant ones to keep DB clean.
                db.delete(article)
                db.commit()
                return True # Handled successfully (by rejection)
            
            # Calculate reading time (200 words per minute)
            word_count = len(result["summary"].split()) + len(result["impact"].split())
            reading_time = max(2, (word_count // 200) + 1)
            
            # Save simplified content
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
            
            # Update article status
            article.status = ArticleStatus.READY
            article.keywords = self._extract_keywords(result)
            
            # Update category based on AI classification
            ai_category = result.get("category", "general").lower().replace(" ", "-")
            if ai_category in self.category_map:
                article.category_id = self.category_map[ai_category]
                logger.info(f"Article {article.id} classified as: {ai_category}")
            
            db.commit()
            return True
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Groq API request error: {str(e)}")
            if hasattr(e, 'response') and e.response is not None:
                logger.error(f"Response body: {e.response.text}")
            return False
        except Exception as e:
            logger.error(f"Groq API error: {str(e)}")
            return False
    
    def _build_prompt(self, article, content):
        """Build precise prompt for Groq AI to simplify cybersecurity articles."""
        
        return f"""You are 'Marliz', a sophisticated Cyber Threat Intelligence Analyst.

ARTICLE TO ANALYZE:
Title: {article.title}
Source: {article.source_name or 'Intelligence feed'}
Content excerpt: {content[:2800]}

YOUR MISSION:
Analyze this threat data and explain the TECHNICAL MECHANISM. Do not give generic advice.
We need to know: HOW did they get in? WHAT tech was exploited? WHAT is the specific consequence?

RESPOND WITH VALID JSON ONLY:
{{
  "is_relevant": true,
  "category": "ransomware|phishing|data-breach|malware|vulnerability|general",
  "summary": "THE NEWS: 3 sentences summarizing WHAT happened. Focus on the event itself.",
  "attack_vector": "THE MECHANISM: Exactly HOW the attack occurred. Technical details. Example: 'Attackers used a zero-day in the V8 engine to execute code via a malicious PDF.'",
  "impact": "THE CONSEQUENCE: Specific technical and business impact. Example: 'Unencrypted PII was exfiltrated to a C2 server.'",
  "actions": ["Patch CVE-2024-XXXX immediately", "Disable NTLMv1", "Block IP range 192.168.x.x"],
  "threat_level": "low|medium|high|critical",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}}

CATEGORY DEFINITIONS:
- ransomware: Encryption attacks, file locking, ransom demands.
- phishing: Email scams, credential harvesting, social engineering.
- data-breach: Customer data theft, database leaks, exposed records.
- malware: Viruses, trojans, spyware, keyloggers.
- vulnerability: CVEs, zero-days, software flaws, patches needed.
- general: Best practices, security news, industry trends.

WRITING RULES:
1. RELEVANCE CHECK: If the article is NOT about a specific cybersecurity threat, vulnerability, or attack (e.g. if it is about lifestyle, politics, general tech, finance), return "is_relevant": false and empty strings for other fields.
2. NO REGIONAL BIAS: Do not mention specific countries (Kenya, USA, etc.) unless the attack is EXCLUSIVELY targeting that nation. Write for a borderless, global audience.
3. NO FLUFF: Do not say 'Stay safe' or 'In the digital age'. Start directly with the threat.
4. NO NONSENSE: If the article is vague, state 'Technical details are limited' rather than inventing them.
5. NO EMOJIS: Do not use emojis in the summary, impact, or actions. Use only professional technical language.
5. THREAT LEVELS:
   - CRITICAL: Active Zero-Day or Wormable RCE.
   - HIGH: Active Exploitation.
   - MEDIUM: POC available or Patch required.
   - LOW: General news.

RETURN ONLY THE JSON OBJECT."""
    
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