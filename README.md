# Marliz Sec News

AI-Powered Cybersecurity News for Everyone

SEO-optimized news aggregator that translates technical cybersecurity threats into actionable advice for non-technical individuals and businesses.

## Table of Contents

- [The Problem We Solve](#the-problem-we-solve)
- [Our Solution](#our-solution)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Key Features](#key-features)
- [Content Strategy](#content-strategy)
- [Deployment](#deployment)
- [Success Metrics](#success-metrics)

---

## The Problem We Solve

- **Cybersecurity news is often too technical** for the average person to understand.
- **Complexity creates vulnerability**: People need to understand threats to protect themselves, but jargon gets in the way.
- **Everyone needs protection**: From individuals to small businesses, everyone needs simple, actionable security advice.
- **Critical information is often buried** in complicated reports.

## Our Solution

An automated system that:

- Fetches cybersecurity news every 4 hours via NewsData.io API
- Simplifies technical jargon using Groq AI (Llama 3.3 model)
- Delivers clear, actionable advice in plain English
- Ranks threats by urgency (Low/Medium/High/Critical)
- Provides specific action steps for each threat

## System Architecture

```mermaid
graph TD
    User([End User]) <-->|View News| Frontend[React + Vite Frontend]
    Frontend <-->|REST API| Backend[FastAPI Backend]
    
    subgraph Data_Pipeline[Automated Data Pipeline]
        Scheduler[APScheduler] -->|Trigger Every 4h| Fetcher[News Fetcher Service]
        Fetcher -->|1. Fetch Raw News| NewsAPI[NewsData.io API]
        NewsAPI -->|2. Return Articles| Fetcher
        Fetcher -->|3. Store Raw Data| DB[(Database)]
        
        DB -->|4. Detect New Articles| Simplifier[AI Simplifier Service]
        Simplifier -->|5. Send Text| Groq["Groq AI - Llama 3.3"]
        Groq -->|6. Return Simplified Text| Simplifier
        Simplifier -->|7. Store Processed Content| DB
    end
    
    Backend <-->|Query Content| DB
```

## Technology Stack

### Backend

- **FastAPI** - Async Python web framework
- **SQLAlchemy** - ORM for database operations
- **APScheduler** - Background task scheduling
- **Groq AI API** - Llama 3.3 for AI simplification
- **NewsData.io API** - News aggregation
- **HTTPX** - Async HTTP client

### Database

- **Development**: SQLite (zero setup)
- **Production**: PostgreSQL (via Railway/Supabase)

### Frontend

- **React + Vite** - UI framework
- **Tailwind CSS** - Styling
- **React Query** - Data fetching
- **React Router** - Navigation

## Project Structure

| Directory/File | Description |
|----------------|-------------|
| `backend/` | Python FastAPI application server |
| `backend/app/main.py` | Entry point for the FastAPI application |
| `backend/app/database.py` | Database connection handling |
| `backend/app/models.py` | SQLAlchemy database models |
| `backend/app/schemas.py` | Pydantic schemas for data validation |
| `backend/app/routes/` | API route definitions |
| `backend/app/services/` | News fetching, AI simplification, scheduling |
| `backend/requirements.txt` | Python dependencies |
| `frontend/` | React frontend application |
| `frontend/src/components/` | Reusable React components |
| `frontend/src/pages/` | Application pages |
| `frontend/src/services/` | API client services |

## Quick Start

### 1. Backend Setup

```bash
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
```

**Backend URL**: http://localhost:8000  
**API Docs**: http://localhost:8000/docs

### 2. Get API Keys

**NewsData.io**:
- Sign up at https://newsdata.io
- Get API key from dashboard
- Free tier: 200 requests/day

**Groq Cloud**:
- Sign up at https://console.groq.com
- Get API key from dashboard
- Free tier: 12,000 tokens per minute

### 3. Test the System

```bash
# Manually fetch news
curl -X POST "http://localhost:8000/api/admin/fetch-news?admin_secret=YOUR_SECRET"

# Process with AI
curl -X POST "http://localhost:8000/api/admin/simplify?admin_secret=YOUR_SECRET"

# View results
curl "http://localhost:8000/api/articles/"
```

## Key Features

- **Automatic slug generation** for SEO-friendly URLs
- **View tracking** for analytics
- **Threat level indexing** (Low/Medium/High/Critical)
- **Full-text search ready**
- **AI-powered simplification** of technical content

### How AI Simplification Works

**Input (Technical News)**:
> "CVE-2024-12345: Critical RCE vulnerability in FortiGate SSL-VPN allows unauthenticated threat actors to execute arbitrary code..."

**Output (Simplified)**:

```json
{
  "summary": "Hackers found a security gap in FortiGate systems that lets them break in without a password.",
  "impact": "If your employees work from home and connect to your office network, hackers could access your business systems.",
  "actions": [
    "Check if you use FortiGate (ask your IT provider)",
    "Update to the latest version immediately",
    "Enable two-factor authentication for all remote access"
  ],
  "threat_level": "high"
}
```

## Content Strategy

### Categories

| Category | Description |
|----------|-------------|
| Ransomware | Encryption attacks |
| Phishing | Email scams |
| Data Breaches | Customer data theft |
| Malware | Viruses and trojans |
| Passwords | Authentication security |
| General | Best practices |

### Content Format

Each article follows this structure:

1. **Title** (8-12 words, includes threat type)
2. **Threat Level** (Low/Medium/High/Critical)
3. **What Happened** (3-4 sentences, plain English)
4. **What This Means For You** (2-3 sentences, specific impact)
5. **What To Do** (3 specific, immediate actions)
6. **Source Link** (original article reference)

## Deployment

### Development

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev
```

### Production (Docker)

```bash
# Build and run
docker compose up -d --build

# View logs
docker compose logs -f web
```

### Database Migration (SQLite to PostgreSQL)

```bash
# Update .env
DATABASE_URL=postgresql://user:pass@host/db

# Reinitialize
python init_db.py
```

**Estimated Cost**: $15-20/month for 10K users

## Success Metrics

### Technical

| Metric | Target |
|--------|--------|
| API response time | <200ms |
| News fetch interval | Every 4 hours |
| AI processing time | <30 seconds per article |
| Uptime | >99.5% |

### Business

| Milestone | Target |
|-----------|--------|
| Month 1 | 100 articles, 50 subscribers |
| Month 3 | 500 articles, 1K visitors/day |
| Month 6 | 1500 articles, 5K visitors/day |
| Month 12 | $1000/month revenue |

---

## Support

| Issue | Solution |
|-------|----------|
| API not responding | Check `/api/health` endpoint |
| Database errors | Run `python init_db.py` to reinitialize |
| Scheduler not running | Check logs for "Scheduler started" message |

## License

This project is proprietary. All rights reserved.
