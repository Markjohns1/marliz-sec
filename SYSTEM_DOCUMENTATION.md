# Marliz Intel Sec - System Documentation

## 1. Executive Summary
**Marliz Intel Sec** is a real-time cybersecurity news aggregator and intelligence platform. It automates the collection of high-priority threat intelligence (Ransomware, Zero-day exploits, Malware) and uses AI to simplify complex technical jargon into actionable "friendly summaries" for business owners and general users.

---

## 2. System Architecture

### High-Level Diagram
The system follows a **Hybrid-Monolithic** architecture containerized with Docker, ensuring easy deployment and strict isolation.

```mermaid
graph TD
    User[Client Browser / Mobile] -->|HTTPS / 443| Host_Nginx[Host Nginx Reverse Proxy]
    
    subgraph "DigitalOcean Droplet (Ubuntu)"
        Host_Nginx -->|Proxy Pass / localhost:3005| Container[Docker Container: marliz-sec-news]
        
        subgraph "Application Container"
            Uvicorn[Uvicorn ASGI Server] --> FastAPI[FastAPI Backend]
            
            FastAPI -->|Serve| React[React Frontend (Static Files)]
            FastAPI -->|Query| SQLite[(SQLite Database)]
            
            Scheduler[Background Scheduler] -->|Every 4h| Fetcher[News Fetcher Module]
            Fetcher -->|GET| NewsAPI[NewsData.io API]
            
            Simplifier[AI Simplifier Module] -->|Process| Groq[Groq AI API]
            Simplifier -->|Update| SQLite
        end
    end
```

### Core Components
1.  **Host Layer (Security):**
    *   **Nginx:** Handles SSL termination (Let's Encrypt) and forwards traffic from `https://marlizintel.tymirahealth.com` to the internal app.
    *   **Firewall (UFW):** Restricts access to essential ports only.

2.  **Application Layer (Docker):**
    *   **Single Container:** The Backend and Frontend are packaged together for simplicity.
    *   **Port 3005:** The isolated internal port where the app runs, preventing conflicts with other services (like WordPress) on the same server.

---

## 3. Technology Stack

### Frontend (Client-Side)
*   **Framework:** React 18 + Vite (Fast, optimized build).
*   **Styling:** Tailwind CSS (Utility-first, responsive design).
*   **State Management:** TanStack Query (Efficient data fetching and caching).
*   **Icons:** Lucide React.
*   **Hosting:** Served statically via the Python Backend (Single Page Application pattern).

### Backend (Server-Side)
*   **Framework:** FastAPI (High-performance Python ASGI framework).
*   **Database:** SQLite (Lightweight, file-based relational DB).
*   **ORM:** SQLAlchemy (Database modeling and queries).
*   **Task Scheduling:** APScheduler (Manages background jobs).

### Intelligence & AI
*   **News Source:** NewsData.io API (Aggregates global tech news).
*   **AI Engine:** Groq API (High-speed LLM inference).
*   **Logic:** Custom filters for "Context-Aware" keyword matching (e.g., distinguishing "Virus" in software vs. biology).

---

## 4. Key Workflows

### A. The News Cycle (Automated)
1.  **Trigger:** Every 4 hours, the `Scheduler` wakes up `news_fetcher.py`.
2.  **Fetch:** Queries the external API for specific keywords (e.g., "Ransomware", "Digital Forensics").
3.  **Filter:** Applies logic to exclude irrelevant noise (e.g., "Stock Market", "Medical Surgery").
4.  **Deduplicate:** Checks `slugs` to ensure the same article isn't saved twice.
5.  **Save:** Stores raw articles in the Database with `Status: RAW`.

### B. The Simplification Cycle (AI)
1.  **Trigger:** Detects new `RAW` articles.
2.  **Process:** Sends the complex text to **Groq AI** with a strict prompt: *"Summarize this for a non-technical CEO. Explain the 'Business Impact' and 'Action Steps'."*
3.  **Update:** Saves the simplified summary and changes status to `PROCESSED`.

### C. The User Experience
1.  **Load:** User visits the site.
2.  **Serve:** Nginx proxies the request -> FastAPI serves `index.html`.
3.  **Data:** React fetches `/api/articles` -> FastAPI returns JSON data from SQLite.
4.  **Display:** User sees the "Friendly" summary by default, with an option to view technical details.

---

## 5. Directory Structure

## 5. Directory Structure

| Location | Component | Description |
| :--- | :--- | :--- |
| **Backend** | | |
| `backend/app/main.py` | **Core** | Entry point & API Routes |
| `backend/app/models.py` | **Database** | Database Tables (SQLAlchemy) |
| `backend/app/database.py` | **Database** | Connection Logic |
| `backend/app/services/news_fetcher.py` | **Service** | NewsData.io Integration Logic |
| `backend/app/services/ai_simplifier.py` | **Service** | Groq AI Integration Logic |
| `backend/app/services/scheduler.py` | **Service** | Background Job Manager |
| `backend/cybersec_news.db` | **Data** | SQLite Database File |
| `backend/requirements.txt` | **Config** | Python Dependencies |
| **Frontend** | | |
| `frontend/src/components/` | **UI** | Reusable Components (Header, Cards) |
| `frontend/src/pages/` | **UI** | Page Views (Home, ArticleDetail) |
| `frontend/src/services/` | **API** | API Client (Axios) |
| `frontend/vite.config.js` | **Build** | Vite Build Configuration |
| **Root** | | |
| `Dockerfile` | **DevOps** | Container Build Instructions |
| `docker-compose.yml` | **DevOps** | Production Orchestration |
| `DEPLOYMENT.md` | **Docs** | Operations Manual |

---

## 6. Maintenance Commands

**Deploy/Update:**
```bash
git pull origin main
sudo docker compose up -d --build
```

**Manual News Fetch (Force Run):**
```bash
sudo docker compose exec web python -c "import asyncio; from app.services.news_fetcher import news_fetcher; print(asyncio.run(news_fetcher.fetch_news()))"
```

**Check Logs:**
```bash
sudo docker compose logs -f web
```
