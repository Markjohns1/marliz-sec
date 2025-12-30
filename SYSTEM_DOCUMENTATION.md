# Marliz Intel Sec - System Documentation

## 1. Executive Summary
**Marliz Intel Sec** is a real-time cybersecurity news aggregator and human-led intelligence platform. It automates the collection of high-priority threat intelligence (Ransomware, Zero-day exploits, Malware) and provides expert-curated "friendly summaries" for business owners and general users.

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
            
            Simplifier[Intelligence Simplifier] -->|Process| Groq[Groq AI API]
            Simplifier -->|Update| SQLite
            
            Uvicorn -->|TTS| WebSpeech[Browser Web Speech API]
            WebSpeech -->|Audio| User
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
*   **Styling:** Vanilla CSS + Tailwind (Utility-first, responsive design).
*   **State Management:** TanStack Query (Efficient data fetching and caching).
*   **Icons:** Lucide React.
*   **Hosting:** Served statically via the Python Backend.

### Backend (Server-Side)
*   **Framework:** FastAPI (High-performance Python ASGI framework).
*   **Database:** SQLite (Lightweight, file-based relational DB).
*   **ORM:** SQLAlchemy (Database modeling and queries).
*   **Task Scheduling:** APScheduler (Manages background jobs).

---

## 4. Key Workflows

### A. The News Cycle (Automated)
1.  **Trigger:** Every 4 hours, the `Scheduler` wakes up `news_fetcher.py`.
2.  **Fetch:** Queries the external API for specific keywords (e.g., "Ransomware").
3.  **Deduplicate:** Checks slugs to ensure the same article isn't saved twice.
4.  **Save:** Stores articles as `RAW`.

### B. The Simplification Cycle (AI)
1.  **Trigger:** Detects new `RAW` articles.
2.  **Process:** Sends text to **Groq AI** for human-friendly summarization.
3.  **Update:** Changes status to `PROCESSED`.

---

## 5. Intelligence Engine (The "Brain")
The system's core value lies in its proprietary AI-driven processing pipeline.

### 🧠 The Marliz Intelligence Persona
The AI is prompted to act as a **Senior Cyber Threat Intelligence Analyst**.
- **Technical Mechanism Analysis:** Translating zero-days into actionable insights.
- **Operational Impact Modeling:** Explaining *why* a threat matters to business.
- **Strategic SEO Optimization:** Automatically generating click-worthy titles.
- **Traffic Intelligence Tracking:** A context-aware referral engine that identifies traffic from platforms like WhatsApp and LinkedIn in real-time.

---

## 6. Traffic Intelligence Engine
Marliz Intel includes a built-in, zero-privacy-risk traffic analyzer.

### How it Works
1. **The Signal:** Captures the `Referer` header from the browser.
2. **The Logic:** A pattern-matching engine identifies the platform.
3. **The Storage:** Logged in the `view_logs` table for granular analytics.

### Detection Matrix
| Source | Header Pattern Detected |
| :--- | :--- |
| **WhatsApp** | `wa.me`, `whatsapp.com`, `android-app://com.whatsapp` |
| **Facebook** | `facebook.com`, `fb.me`, `l.facebook.com` |
| **LinkedIn** | `linkedin.com` |
| **Discord** | `discord.com` |
| **Google Search**| `google.com/search`, `google.co.ke` |
| **X (Twitter)**   | `t.co`, `twitter.com`, `x.com` |

---

## 7. SEO & Growth Strategy
Marliz Intel is built for search traffic growth through automated high-precision SEO.

| Feature | Implementation | Growth Impact |
| :--- | :--- | :--- |
| **Hook Titles** | Entity-led clickable headlines | Higher CTR in Search |
| **Meta Dynamics** | Stat-driven meta descriptions | Improved user click-through |
| **Internal Linking** | Slug-based canonical routing | Better indexing by Google |

---

## 8. Directory Structure

| Location | Component | Description |
| :--- | :--- | :--- |
| `backend/app/main.py` | **Core** | Entry point & API Routes |
| `backend/app/models.py` | **Database** | Database Tables (SQLAlchemy) |
| `frontend/src/pages/AdminDashboard.jsx` | **UI** | Dark "Console" Analytics Center + Traffic Table |

---

## 9. Deployment & Architecture
The system uses a **Hybrid Reverse Proxy** architecture.

1. **Edge Proxy:** Host-level **Nginx** manages SSL.
2. **Application Layer:** **Docker Compose** runs the integrated FastAPI + React bundle.

### Deployment Steps
```bash
git pull origin main
sudo docker compose up -d --build
```
