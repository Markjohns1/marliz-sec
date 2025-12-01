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
                        failed += 1
                        article.status = ArticleStatus.RAW  # Reset for retry
                        db.commit()
                    
                    # Add delay to avoid rate limits (500ms between requests)
                    await asyncio.sleep(0.5)
                
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
        
        # Build comprehensive prompt
        prompt = self._build_prompt(article)
        
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
            
            # Calculate reading time (200 words per minute)
            word_count = len(result["summary"].split()) + len(result["impact"].split())
            reading_time = max(2, (word_count // 200) + 1)
            
            # Save simplified content
            simplified = SimplifiedContent(
                article_id=article.id,
                friendly_summary=result["summary"],
                business_impact=result["impact"],
                action_steps=json.dumps(result["actions"]),
                threat_level=ThreatLevel[result["threat_level"].upper()],
                reading_time_minutes=reading_time
            )
            db.add(simplified)
            
            # Update article status
            article.status = ArticleStatus.READY
            article.keywords = self._extract_keywords(result)
            
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
    
    def _build_prompt(self, article: Article) -> str:
        """Build comprehensive prompt for Groq"""
        
        content = article.raw_content or article.title
        
        return f"""You are a cybersecurity expert communicating with non-technical small business owners in Kenya and East Africa.

ARTICLE INFORMATION:
Title: {article.title}
Source: {article.source_name}
Content: {content[:3000]}

YOUR TASK:
Transform this technical cybersecurity news into clear, actionable information for small business owners who have NO IT background. If the article mentions specific regions (Kenya, Africa, M-Pesa, mobile money), emphasize the local relevance.

RESPOND WITH VALID JSON ONLY (no markdown, no comments):
{{
  "summary": "3-4 sentences explaining what happened in simple terms (NO jargon)",
  "impact": "2-3 sentences explaining SPECIFICALLY how this threatens small businesses",
  "actions": ["Action 1", "Action 2", "Action 3"],
  "threat_level": "low|medium|high|critical"
}}

CRITICAL RULES:
1. NEVER use terms: exploit, vulnerability, CVE, threat actor, zero-day, vector
2. INSTEAD use: security gap, hackers, attack method, cybercriminals, new risk
3. Write at 8th-grade reading level
4. Each action step must be SPECIFIC and DOABLE TODAY (e.g., "Enable 2-factor authentication on your email account")
5. Focus on WHAT TO DO, not how the attack works technically
6. Be conversational but professional
7. If the article mentions Kenya/Africa/M-Pesa, highlight local relevance in the impact section

THREAT LEVEL GUIDE:
- LOW: Theoretical risk, no immediate action needed
- MEDIUM: Real risk, action recommended this week
- HIGH: Active attacks, action needed within 48 hours
- CRITICAL: Widespread attacks, immediate action required

Example good summary (Kenyan context):
"Hackers are targeting M-Pesa users with fake customer service calls. They pretend to be from Safaricom and ask for your PIN to 'verify your account.' Once they have your PIN, they drain your M-Pesa balance within minutes."

Example good summary (global):
"Hackers are sending fake Microsoft emails that look exactly like real password reset requests. When employees click the link and enter their password, the hackers steal it and access the company's systems."

Example bad summary (TOO TECHNICAL):
"A sophisticated phishing campaign leveraging OAuth token exploitation has been observed targeting Microsoft 365 tenants."

RETURN ONLY THE JSON, NO OTHER TEXT."""
    
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
            required = ["summary", "impact", "actions", "threat_level"]
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
        
        # Common cybersecurity terms for small businesses
        keywords = [
            "small business cybersecurity",
            "business data protection",
            "email security",
            "ransomware protection",
            "phishing prevention",
            "cyber threats",
            "business security"
        ]
        
        # Add Kenyan/African specific terms if mentioned
        african_terms = ["kenya", "m-pesa", "safaricom", "mpesa", "mobile money", "africa"]
        if any(term in text.lower() for term in african_terms):
            keywords.extend([
                "Kenya cybersecurity",
                "M-Pesa security",
                "mobile money fraud Kenya",
                "African business security"
            ])
        
        # Add specific terms from content
        threat_terms = ["ransomware", "phishing", "malware", "breach", "hack", "fraud"]
        found_terms = [term for term in threat_terms if term in text.lower()]
        
        if found_terms:
            keywords.extend([f"{term} small business" for term in found_terms])
        
        return ", ".join(keywords[:10])

# Global instance
ai_simplifier = AISimplifier()