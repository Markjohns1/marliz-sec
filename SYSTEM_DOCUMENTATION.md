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
    *   **Nginx:** Handles SSL termination (Let's Encrypt) and forwards traffic from `https://marlizintel.com` to the internal app.
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

## 5. Intelligence Engine (The "Brain")
The system's core value lies in its proprietary AI-driven processing pipeline, optimized for business relevance and search visibility.

### 🧠 The Marliz Intelligence Persona
The AI (Groq/Llama-3.1) is prompted to act as a **Senior Cyber Threat Intelligence Analyst**. It doesn't just summarize; it performs:
- **Technical Mechanism Analysis:** Translating zero-days and exploits into actionable insights.
- **Operational Impact Modeling:** Explaining *why* a threat matters to business stability.
- **Strategic SEO Optimization:** Automatically generating click-worthy titles and meta descriptions using the `ENTITY + EVENT` formula.

### 🛡️ Smart Fetching Logic
The `NewsFetcher` uses a multi-layered filtering system:
1.  **Context-Aware Keywords:** Targets specific high-priority intel (Ransomware, Zero-day, Supply Chain).
2.  **Noise Reduction:** Automatically rejects lifestyle, marketing, and irrelevant medical "virus" news.
3.  **Deduplication:** Ensures unique content is served per fetch cycle.

---

## 6. SEO & Growth Strategy
Marliz Intel is built for search traffic growth through automated high-precision SEO.

| Feature | Implementation | Growth Impact |
| :--- | :--- | :--- |
| **Hook Titles** | Entity-led clickable headlines | Higher CTR in Search Results |
| **Meta Dynamics** | Stat-driven meta descriptions | Improved user click-through |
| **Internal Linking** | Slug-based canonical routing | Better indexing by Google |
| **Performance** | HSTS & Lite Static Assets | Core Web Vitals (LCP/FID) optimization |

---

## 7. Directory Structure

| Location | Component | Description |
| :--- | :--- | :--- |
| **Backend** | | |
| `backend/app/main.py` | **Core** | Entry point & API Routes |
| `backend/app/models.py` | **Database** | Database Tables (SQLAlchemy) |
| `backend/app/database.py` | **Database** | Connection Logic |
| `backend/app/services/news_fetcher.py` | **Intelligence** | NewsData.io Smart Fetcher |
| `backend/app/services/ai_simplifier.py` | **Intelligence** | Groq AI Strategic Simplifier |
| `backend/app/services/scheduler.py` | **Service** | Background Job Manager |
| **Frontend** | | |
| `frontend/src/pages/AdminDashboard.jsx` | **UI** | Dark "Console" Analytics Center |
| `frontend/src/index.css` | **Styling** | Global Design Tokens & Cards |
| **Root** | | |
| `Dockerfile` | **DevOps** | Container Build Instructions |
| `DEPLOYMENT.md` | **Docs** | Operations Manual |

---

## 8. Deployment & Architecture

The system uses a **Hybrid Reverse Proxy** architecture for maximum stability on shared servers:
1. **Edge Proxy:** Host-level **Nginx** manages SSL and domain routing (Port 80/443).
2. **Application Layer:** **Docker Compose** runs the integrated FastAPI + React bundle.
3. **Internal Port:** The application is exposed internally at `localhost:3005`.

### Deployment Steps
```bash
# 1. Update Code
cd /root/marliz-sec
git pull origin main

# 2. Rebuild Container
sudo docker compose up -d --build

# 3. Nginx Configuration
# Point marlizintel.com -> http://localhost:3005
```

### Maintenance Commands

**Force Intelligence Cycle (Manual):**
1. **Fetch News:** Trigger via Admin Console (Articles Tab)
2. **AI Simplify:** Trigger via Admin Console (Overview Tab)

**Check Logs:**
```bash
sudo docker compose logs -f web
```
