from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging

from app.database import init_db, get_db
from app.config import settings
from app import models, auth
from app.routes import articles, categories, subscribers, seo
from app.routes.articles import track_view
from sqlalchemy import select
from app.services.scheduler import start_scheduler, stop_scheduler
from app.auth import verify_api_key

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info(" Starting Marliz Sec News API...")
    
    # Initialize database
    await init_db()
    logger.info("✓ Database initialized")
    
    # Start background scheduler
    start_scheduler()
    logger.info("✓ Background tasks started")
    
    yield
    
    # Shutdown
    logger.info("Shutting down...")
    stop_scheduler()
    logger.info("✓ Cleanup complete")

app = FastAPI(
    title="Marliz Sec News API",
    description="Cybersecurity news and intelligence for small businesses",
    version="1.0.0",
    lifespan=lifespan
)
# CORS - Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        f"https://{settings.DOMAIN}",
        f"https://www.{settings.DOMAIN}"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security & Caching Middleware
@app.middleware("http")
async def security_and_cache_middleware(request, call_next):
    response = await call_next(request)
    
    # 1. Security Headers
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    
    # Content Security Policy (Allowing AdSense, Analytics, and Fonts)
    csp = (
        "upgrade-insecure-requests; "
        "default-src 'self' https:; "
        "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://pagead2.googlesyndication.com https://adservice.google.com; "
        "frame-src 'self' https://googleads.g.doubleclick.net https://tpc.googlesyndication.com https://www.google.com; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https: https://www.google-analytics.com https://stats.g.doubleclick.net;"
    )
    response.headers["Content-Security-Policy"] = csp

    # 2. Caching Logic (Prevent stale React builds)
    if request.method == "GET" and response.status_code == 200:
        path = request.url.path
        if path == "/" or path.startswith("/console") or "index.html" in path:
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        else:
            # Standard assets can be cached
            response.headers["Cache-Control"] = "public, max-age=3600"
        
    return response

# Include routers
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(subscribers.router)
app.include_router(seo.router)

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    from app.database import engine
    from sqlalchemy import text
    
    try:
        # Test database connection (Async)
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "api": "healthy",
        "database": db_status
    }

# Manual trigger endpoints (for testing)
# Manual trigger endpoints (Protected)
@app.post("/api/admin/fetch-news")
async def manual_fetch_news(
    api_key_obj = Depends(verify_api_key)
):
    """Manually trigger news fetch (Protected)"""
    from app.services.news_fetcher import news_fetcher
    result = await news_fetcher.fetch_news()
    logger.info(f"Manual news fetch triggered by {api_key_obj.name}")
    return result

@app.post("/api/admin/simplify")
async def manual_simplify(
    api_key_obj = Depends(verify_api_key)
):
    """Manually trigger AI simplification (Protected)"""
    from app.services.ai_simplifier import ai_simplifier
    result = await ai_simplifier.process_pending_articles()
    logger.info(f"Manual simplification triggered by {api_key_obj.name}")
    return result

# ==========================================
# SERVE STATIC FILES (React Frontend)
# ==========================================
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount assets folder (CSS, JS, Images)
FRONTEND_DIST = "../frontend/dist"
if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=f"{FRONTEND_DIST}/assets"), name="assets")

    # Catch-all route for React Router (SPA)
    @app.api_route("/{full_path:path}", methods=["GET", "HEAD"])
    async def serve_react_app(full_path: str, request: Request):
        # Explicitly ignore API paths so they don't get swallowed
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")

        # 1. Serve specific file if it exists (favicon.ico, robots.txt)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # 2. Otherwise serve index.html (Client-side routing)
        # BOT VIEW CAPTURE: If this is an article path and User-Agent is a bot, track it now.
        if full_path.startswith("article/"):
            ua = request.headers.get("user-agent", "").lower()
            # Known Bots & Previews
            bots = ["gpt", "gemini", "claude", "googlebot", "bingbot", "whatsapp", "facebookexternalhit", "linkedinbot", "twitterbot"]
            if any(b in ua for b in bots):
                try:
                    slug = full_path.split("/")[-1]
                    async for db in get_db():
                        stmt = select(models.Article.id).filter_by(slug=slug)
                        res = await db.execute(stmt)
                        article_id = res.scalar()
                        if article_id:
                            await track_view(article_id, request, db)
                        break # Only need one session
                except Exception as e:
                    logger.error(f"Failed to track bot view for {full_path}: {e}")

        return FileResponse(f"{FRONTEND_DIST}/index.html")

# Root path handler
@app.api_route("/", methods=["GET", "HEAD"])
async def root():
    if os.path.exists(f"{FRONTEND_DIST}/index.html"):
         return FileResponse(f"{FRONTEND_DIST}/index.html")
    return {"status": "Marliz Sec API Running (Frontend not built)"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,  # Auto-reload on code changes
        log_level="info"
    )