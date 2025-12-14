# **Marliz Sec News** - AI-Powered Cybersecurity News for Everyone

SEO-optimized news aggregator that translates technical cybersecurity threats into actionable advice for non-technical individuals and businesses.

## Table of Contents
- [The Problem We Solve](#the-problem-we-solve)
- [Our Solution](#our-solution)
- [System Architecture](#system-architecture)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Key Features](#key-features)
- [Content Strategy](#content-strategy)
- [Deployment](#deployment)
- [Success Metrics](#success-metrics)
- [Current Project Status](#current-project-status)

## The Problem We Solve


- **Cybersecurity news is often too technical** for the average person to understand.
- **Complexity creates vulnerability**: People need to understand threats to protect themselves, but jargon gets in the way.
- **Everyone needs protection**: From individuals to small businesses, everyone needs simple, actionable security advice.
- **Critical information is often buried** in complicated reports.


## **Our Solution**

An automated system that:

    Fetches cybersecurity news every 4 hours via NewsData.io API

    Simplifies technical jargon using Groq AI (Llama 3.3 model)

    Delivers clear, actionable advice in plain English

    Ranks threats by urgency (Low/Medium/High/Critical)

    Provides specific action steps for each threat

## System Architecture
```mermaid
graph TD
    User([End User]) <-->|View News| Frontend[React + Vite Frontend]
    Frontend <-->|REST API| Backend[FastAPI Backend]
    
    subgraph Data_Pipeline [Automated Data Pipeline]
        Scheduler[APScheduler] -->|Trigger Every 4h| Fetcher[News Fetcher Service]
        Fetcher -->|1. Fetch Raw News| NewsAPI[NewsData.io API]
        NewsAPI -->|2. Return Articles| Fetcher
        Fetcher -->|3. Store Raw Data| DB[(Database)]
        
        DB -->|4. Detect New Articles| Simplifier[AI Simplifier Service]
        Simplifier -->|5. Send Text| Groq["Groq AI (Llama 3.3)"]
        Groq -->|6. Return Simplified Text| Simplifier
        Simplifier -->|7. Store Processed Content| DB
    end
    
    Backend <-->|Query Content| DB
```

Technology Stack

Backend:

    FastAPI (async Python web framework)

    SQLAlchemy (ORM)

    APScheduler (background tasks)

    Groq AI API (Llama 3.3 for AI simplification)

    NewsData.io API (news aggregation)

    HTTPX (async HTTP client)

Database:

    Development: SQLite (zero setup)

    Production: PostgreSQL (via Railway/Supabase)

Frontend:

    React + Vite

    Tailwind CSS

    React Query (data fetching)

    React Router (navigation)

## Project Structure

| Directory/File | Description |
|---|---|
| **backend/** | Python FastAPI application server |
| `backend/app/main.py` | Entry point for the FastAPI application |
| `backend/app/database.py` | Database connection handling |
| `backend/app/models.py` | SQLAlchemy database models |
| `backend/app/schemas.py` | Pydantic schemas for data validation |
| `backend/app/routes/` | API route definitions (articles, categories, subscribers) |
| `backend/app/services/` | Logic for news fetching, AI simplification, and scheduling |
| `backend/requirements.txt` | Python dependencies |
| `backend/init_db.py` | Database initialization script |
| **frontend/** | React frontend application |
| `frontend/src/components/` | Reusable React components (Header, ArticleCard) |
| `frontend/src/pages/` | Application pages (Home, ArticleDetail) |
| `frontend/src/services/` | API client services |
| `frontend/src/App.jsx` | Main React application component |
| `README.md` | Project documentation |
| `run.py` | Script to run the application |


## Quick Start
1. Backend Setup
bash

cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your API keys

# Initialize database
python init_db.py

# Start server
uvicorn app.main:app --reload

Backend runs at: http://localhost:8000
API docs: http://localhost:8000/docs
2. Get API Keys

NewsData.io:

    Sign up at https://newsdata.io

    Get API key from dashboard

    Free tier: 200 requests/day

Groq Cloud:

    Sign up at https://console.groq.com

    Get API key from dashboard

    Free tier: 12,000 tokens per minute (on-demand tier)

3. Test the System
bash

# Manually fetch news
curl -X POST "http://localhost:8000/api/admin/fetch-news?admin_secret=YOUR_SECRET"

# Process with AI
curl -X POST "http://localhost:8000/api/admin/simplify?admin_secret=YOUR_SECRET"

# View results
curl "http://localhost:8000/api/articles/"

How AI Simplification Works
Input (Technical News):

    "CVE-2024-12345: Critical RCE vulnerability in FortiGate SSL-VPN allows unauthenticated threat actors to execute arbitrary code..."

Output (Simplified):
json

{
  "summary": "Hackers found a security gap in FortiGate systems that lets them break in without a password. This affects businesses using FortiGate for remote work.",
  
  "impact": "If your employees work from home and connect to your office network, hackers could access your business systems and steal customer data or lock your files for ransom.",
  
  "actions": [
    "Check if you use FortiGate (ask your IT provider)",
    "Update to the latest version immediately",
    "Enable two-factor authentication for all remote access"
  ],
  
  "threat_level": "high"
}

Database Schema
Tables:

    articles - Raw news articles

    simplified_content - AI-simplified versions

    categories - News categories (Ransomware, Phishing, etc.)

    subscribers - Email newsletter subscribers

## Key Features

    Automatic slug generation (SEO-friendly URLs)

    View tracking

    Edit history ("Last edited by...")

    Threat level indexing

    Full-text search ready

## Content Strategy
Categories:

    Ransomware - Encryption attacks

    Phishing - Email scams

    Data Breaches - Customer data theft

    Malware - Viruses and trojans

    Passwords - Authentication security

    General - Best practices

Content Format:
text

Article Title (8-12 words, includes threat type)

THREAT LEVEL: HIGH

WHAT HAPPENED: (3-4 sentences, plain English)

WHAT THIS MEANS FOR YOU: (2-3 sentences, specific impact)

WHAT TO DO:
  - Action 1 (specific, immediate)
  - Action 2 (specific, immediate)
  - Action 3 (specific, immediate)

Learn more: [original source]

Monetization Plan
Phase 1: Free Content (0-1K visitors/day)

    Build SEO authority

    Grow email list

    Google AdSense (minimal ads)

Phase 2: Premium Features (1K-10K visitors/day)

    Free: Weekly email digest

    Premium ($9/month):

        Daily threat alerts via email/SMS

        Custom alerts by business type

        Ad-free experience

        Security checklist templates

Phase 3: B2B (10K+ visitors/day)

    White-label newsletter for IT consultants ($49/month)

    Sponsored content from security vendors ($300-500/article)

    Affiliate partnerships (30-40% commission)

Target: $500-2000/month by month 6
SEO Strategy
Technical SEO:

    Clean URLs (/ransomware/latest-attacks)

    XML sitemap (auto-generated)

    Schema.org markup (NewsArticle + BreadcrumbList)

    Mobile-first responsive design

    Image optimization (WebP format)

    Fast page load (<2 seconds)

Content SEO:

    Target long-tail keywords ("how to protect small business from ransomware")

    Location-based content ("cybersecurity news Kenya")

    "How to" guides (evergreen content)

    Internal linking between related articles

    Meta descriptions (140-160 chars)

Target Keywords:

    Small business cybersecurity (6,600 searches/month)

    Ransomware protection SMB (880 searches/month)

    Phishing prevention business (720 searches/month)

## Deployment
Development:
bash

# Backend
uvicorn app.main:app --reload

# Frontend
npm run dev

Production:

Option 1: Railway.app (Recommended)

    Free $5 credit/month

    Automatic PostgreSQL

    One-command deploy

    Custom domain support

Option 2: Split Hosting

    Backend: Render/Railway (FastAPI + PostgreSQL)

    Frontend: Vercel/Netlify (React static)

Migration SQLite → PostgreSQL:
bash

# Just change .env
DATABASE_URL=postgresql://user:pass@host/db

# SQLAlchemy handles the rest!
python init_db.py

Cost estimate: $15-20/month for 10K users
## Success Metrics
Technical:

    API response time: <200ms

    News fetch: Every 4 hours

    AI processing: <30 seconds per article

    Uptime: >99.5%

Business:

    Month 1: 100 articles, 50 subscribers

    Month 3: 500 articles, 500 subscribers, 1K visitors/day

    Month 6: 1500 articles, 2K subscribers, 5K visitors/day

    Month 12: $1000/month revenue

SEO:

    Target: Top 10 for 20+ keywords by month 6

    Organic CTR: >3%

    Bounce rate: <60%

    Session duration: >2 minutes

Manual Content Creation

POST to /api/articles/manual with admin secret:
json

{
  "title": "New Ransomware Targeting Small Retailers",
  "category_id": 1,
  "friendly_summary": "A new ransomware called 'RetailLock' is attacking point-of-sale systems in small stores. It encrypts sales data and customer information.",
  "business_impact": "If your store uses a digital cash register or payment system, this ransomware could lock your sales records and customer data. You wouldn't be able to process transactions.",
  "action_steps": [
    "Back up your sales data daily to an external drive",
    "Update your point-of-sale software immediately",
    "Train staff to recognize suspicious emails"
  ],
  "threat_level": "high",
  "admin_secret": "your_secret"
}

Next Steps
Immediate (This Week):

    Backend complete

    Add API keys to .env

    Test news fetch + AI simplification

    Build React frontend

Short-term (Month 1):

    Launch MVP with 50 articles

    Submit to Google Search Console

    Share on Reddit/LinkedIn/Twitter

    Get first 100 email subscribers

Medium-term (Month 2-3):

    SEO optimization (backlinks, guest posts)

    Add more categories

    Build newsletter system

    Reach 1K visitors/day

Long-term (Month 4-6):

    Launch premium tier

    Add affiliate partnerships

    Scale to 10K visitors/day

    $500+ monthly revenue

Contributing

This is your project! The backend is production-ready. Focus on:

    Frontend design (make it stunning!)

    Content quality (readable, actionable)

    SEO execution (consistent publishing)

    User feedback (iterate based on data)

Support

    API Issues: Check /api/health endpoint

    Database Issues: rm cybersec_news.db && python init_db.py

    Scheduler Issues: Check logs for "Scheduler started"

# Current Project Status

##  **What's Working**

### Backend API
- **FastAPI server** running at `http://localhost:8000`
- **NewsData.io integration** fetching cybersecurity news
- **Groq AI processing** (Llama 3.3 model) simplifying articles
- **SQLite database** with articles, categories, simplified content
- **Automatic scheduler** fetching news every 4 hours
- **API endpoints**: `/api/articles/`, `/api/categories/`, `/api/subscribers/`

### Frontend (React)
- **React app** running at `http://localhost:5173`
- **Header component** with custom logo (`/logo.png`)
- **Home page** displaying articles in grid layout
- **ArticleCard component** rendering threat level badges
- **ArticleDetail page** for full article viewing
- **Tailwind CSS** for responsive design
- **React Query** for data fetching

### Database
- **Articles table**: Raw and simplified content
- **Categories table**: Ransomware, Phishing, Data Breaches, etc.
- **Simplified content table**: AI-processed summaries and action steps
- **Automatic slug generation** for SEO-friendly URLs

### DevOps
- **Git repository** initialized with proper `.gitignore`
- **Environment variables** separated (`.env.example` template)
- **API keys secured** in local `.env` file
- **Project structure** clean and organized

##  **Issues to Fix**

### 1. Duplicate Slug Error
```
UNIQUE constraint failed: articles.slug
```

**Fix needed in `news_fetcher.py`:**
```python
# Add duplicate check before inserting
existing = db.query(Article).filter_by(slug=slug).first()
if existing:
    continue  # Skip duplicate article
```

### 2. Groq API Rate Limits
Hitting 12,000 tokens/minute limit (free tier).

**Solutions:**
- Add delay between AI requests: `time.sleep(2)`
- Consider switching to `llama-3.1-8b-instant` model (cheaper/faster)
- Upgrade to Groq Developer tier if needed

### 3. Frontend Polish
- ArticleCard component styling refinement
- Mobile menu subscribe button visibility
- Loading states and error handling

##  **Current Metrics (From Logs)**
- **Articles fetched**: 8 new articles in latest run
- **AI processing**: 5 articles simplified successfully
- **API response**: 200 OK for all requests
- **Database**: Articles stored and accessible

##  **Immediate Next Steps**

### 1. Fix Duplicate Slug Issue
Edit `backend/app/services/news_fetcher.py` to add duplicate checking.

### 2. Improve AI Rate Limiting
Add delays in `backend/app/services/ai_simplifier.py`.

### 3. Deploy to Production
- Backend: Railway.app (FastAPI + PostgreSQL)
- Frontend: Vercel (React static)
- Domain: Your chosen domain name

### 4. Add Missing Features
- Email subscription system
- Search functionality
- User authentication (optional)
- Analytics tracking

##  **Deployment Checklist**

- [ ] Fix duplicate slug error
- [ ] Add AI rate limiting
- [ ] Set up PostgreSQL database
- [ ] Configure production environment variables
- [ ] Deploy backend to Railway
- [ ] Deploy frontend to Vercel
- [ ] Set up custom domain
- [ ] Configure SSL certificates
- [ ] Set up monitoring (error tracking, uptime)

##  **Business Ready Features**

### Already Implemented:
- **Content pipeline**: News → AI simplification → Publication
- **SEO-friendly structure**: Clean URLs, meta descriptions
- **Mobile-responsive design**: Works on all devices
- **Threat level system**: Low/Medium/High/Critical ranking
- **Actionable advice**: Clear steps for business owners

### To Add:
- **Email newsletter** (collect subscribers)
- **Premium content** (monetization)
- **Social sharing** (increase reach)
- **Analytics dashboard** (track performance)

##  **Success Metrics Achieved**

### Technical:
- API responding in <200ms
- Automatic news fetching
- AI processing working
- Frontend displaying content
- Database storing all data

### Business:
- MVP platform complete
- Brand identity (logo, name)
- Content pipeline automated
- Ready for users

##  **Quick Fix Commands**

```bash
# Restart backend
cd backend
uvicorn app.main:app --reload

# Restart frontend  
cd frontend
npm run dev

# Check logs
# Backend: Look for "News fetch completed"
# Frontend: Check browser console for errors
```
