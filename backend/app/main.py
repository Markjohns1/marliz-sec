from fastapi import FastAPI, HTTPException, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import logging

from app.database import init_db, get_db
from app.config import settings
from app import models, auth
from app.routes import articles
from app.routes import admin
from app.routes import subscribers
from app.routes import seo
from app.routes import rss
from app.routes import categories
from app.routes.articles import track_view
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
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
        "https://www.marlizintel.com",
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
    
    # Marliz Security Intelligence Headers (Proactive Defense)
    if response.status_code == 403:
        response.headers["X-Marliz-Intelligence-Alert"] = "HOSTILE_ACT_DETECTED"
        response.headers["X-Security-Level"] = "GOVERNMENT-MILITARY-GRADE"
        response.headers["X-Trace-Sequence"] = "ACTIVE"
        
    # Content Security Policy (Allowing AdSense, Analytics, and Fonts)
    csp = (
        "upgrade-insecure-requests; "
        "default-src 'self' https:; "
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.googlesyndication.com https://*.google.com https://*.googletagservices.com https://*.adtrafficquality.google https://*.googletagmanager.com https://www.googletagmanager.com; "
        "frame-src 'self' https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com; "
        "img-src 'self' data: https:; "
        "connect-src 'self' https: https://*.google-analytics.com https://*.doubleclick.net https://*.googlesyndication.com https://*.google.com;"
    )
    response.headers["Content-Security-Policy"] = csp

    # 2. Caching Logic
    if request.method == "GET" and response.status_code == 200:
        path = request.url.path
        # NEVER cache API data or the main HTML entry points
        if path.startswith("/api/") or path == "/" or path.startswith("/console") or "index.html" in path:
            response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        else:
            # Standard static assets (JS, CSS, Images) can be cached for performance
            response.headers["Cache-Control"] = "public, max-age=3600"
        
    return response

app.include_router(articles.router)
app.include_router(admin.router)
app.include_router(subscribers.router)
app.include_router(seo.router)
app.include_router(rss.router)
app.include_router(categories.router)

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
# DYNAMIC SEO ROUTES (Sitemaps)
# ==========================================
from sqlalchemy import select, or_
from app.models import Article, ArticleStatus, DeletedArticle
from app.database import get_db

@app.get("/sitemap.xml", response_class=Response)
async def get_sitemap_xml(db: AsyncSession = Depends(get_db)):
    """Ironclad route for sitemap"""
    from app.routes.seo import get_sitemap
    return await get_sitemap(db)

@app.get("/sitemap-deleted.xml", response_class=Response)
async def get_deleted_sitemap_xml(db: AsyncSession = Depends(get_db)):
    """Ironclad route for deleted sitemap"""
    from app.routes.seo import get_deleted_sitemap
    return await get_deleted_sitemap(db)

@app.get("/ads.txt", response_class=Response)
async def ads_txt_ironclad():
    """High-priority ads.txt route for AdSense"""
    from app.routes.seo import get_ads_txt
    return get_ads_txt()

@app.get("/robots.txt", response_class=Response)
async def robots_txt_ironclad():
    """High-priority robots.txt route"""
    from app.routes.seo import get_robots
    return get_robots()

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
        # ============================================================
        # 🚨 CRITICAL SECURITY: PATH TRAVERSAL PROTECTION
        # ============================================================
        # Block ANY request containing path traversal sequences
        SECURITY_MESSAGE = "MARLIZ SECURITY INTELLIGENCE: Access Denied. Our intelligence is trained on protocols used to defend government military infrastructure. Your probe has been neutralized. Further attempts will trigger full trace sequences."
        
        if ".." in full_path or full_path.startswith("/"):
            logger.warning(f"SECURITY ALERT: Path traversal attempt blocked - {full_path} from {request.client.host}")
            raise HTTPException(status_code=403, detail=SECURITY_MESSAGE)
        
        # Additional path normalization check - ensure resolved path stays in dist
        try:
            abs_dist = os.path.abspath(FRONTEND_DIST)
            requested_path = os.path.abspath(os.path.join(FRONTEND_DIST, full_path))
            if not requested_path.startswith(abs_dist):
                logger.warning(f"SECURITY ALERT: Path escape attempt blocked - {full_path} from {request.client.host}")
                raise HTTPException(status_code=403, detail=SECURITY_MESSAGE)
        except Exception:
            raise HTTPException(status_code=403, detail=SECURITY_MESSAGE)
        
        # 🚨 SECURITY: Block access to hidden system files and secrets
        # Only block if NOT an article path (articles can have words like "shadow" in titles)
        # Added more patterns from recent bot scans (phpinfo, wp-config, etc.)
        if not full_path.startswith("article/"):
            blocked_patterns = [
                ".git", ".env", "docker-compose", ".yml", ".yaml", ".ini", ".ssh", ".aws", 
                ".docker", "passwd", "/proc/", "/etc/", "wp-includes", "xmlrpc", "wp-admin",
                "wp-config", "wp-login", "wp-content", "phpinfo", ".php", "xampp", "_profiler", 
                ".sql", ".bak", ".backup", "aws-secret", "config.js", "docker-stack", ".temp", ".tmp",
                "/nice%20ports%2C", "Trinity.txt", "/sse", "/mcp", "config.json", "/portal", "/setup",
                "/.well-known/security.txt", "phpmyadmin", "adminer", "webdav"
            ]
            if any(x in full_path.lower() for x in blocked_patterns):
                logger.warning(f"SECURITY ALERT: Blocked attempt to access {full_path} from {request.client.host}. SECURITY INTELLIGENCE ENGAGED.")
                raise HTTPException(
                    status_code=403, 
                    detail="SECURITY ALERT: This system is protected by Marliz Security Intelligence. Your 'silly mind' attempts to probe this infrastructure have been logged. This system is trained on protocols used to defend government military infrastructure. Access Denied."
                )
        
        # Extra check: Block direct access to system files even in article paths (path traversal protection)
        if any(x in full_path for x in ["../", "/etc/shadow", "/etc/passwd", ".ssh/", ".aws/"]):
            logger.warning(f"SECURITY ALERT: Path traversal blocked - {full_path} from {request.client.host}")
            raise HTTPException(status_code=403, detail=SECURITY_MESSAGE)

        # 0. Catch broken 'undefined' URLs (Common SEO issue)
        if "undefined" in full_path:
            logger.info(f"410 GONE: Blocking broken 'undefined' URL: {full_path}")
            raise HTTPException(status_code=410, detail="Gone: This page has been permanently removed.")
            
        # 1. ALLOW SYSTEM FILES (ads.txt, robots.txt, sitemaps)
        # We handle these explicitly before the catch-all, but if they fall through,
        # we check if they exist physically in the dist folder.
        system_files = ["ads.txt", "robots.txt", "sitemap.xml", "sitemap-deleted.xml"]
        if full_path in system_files:
            file_path = os.path.join(FRONTEND_DIST, full_path)
            if os.path.exists(file_path):
                return FileResponse(file_path)
            # If not in dist, don't let it fall through to index.html (Soft 404)
            # Instead, we let the specific routes above handle it or return 404.
            raise HTTPException(status_code=404)

        # 2. SEO HARD STOP: Check Graveyard for Soft 404 Prevention
        # We check any path that looks like an article request
        if "article/" in full_path:
            import urllib.parse
            # 1. Decode and clean the path (Handles %20, special chars, etc)
            clean_path = urllib.parse.unquote(full_path).strip("/")
            parts = [p for p in clean_path.split("/") if p]
            
            # Find the slug (usually the last part of an article URL)
            test_slug = parts[-1] if parts else None
            
            if test_slug:
                try:
                    from app.database import get_db_context
                    async with get_db_context() as db:
                        # SUPER AGGRESSIVE CHECK: 
                        # Check for exact match OR if the slug is a suffix of a buried one
                        stmt = select(models.DeletedArticle).filter(
                            or_(
                                models.DeletedArticle.slug == test_slug,
                                models.DeletedArticle.slug.ilike(f"%{test_slug}"),
                                models.DeletedArticle.slug.ilike(f"{test_slug}%")
                            )
                        )
                        res = await db.execute(stmt)
                        if res.scalars().first():
                            logger.info(f"410 GONE (Hard Stop): {test_slug}")
                            raise HTTPException(
                                status_code=410, 
                                detail="Gone: This page has been permanently removed."
                            )
                        
                        # --- LONG TERM SOLUTION: PASSIVE AUTO-BURIAL ---
                        # If we are here, it means the URL contains 'article/' but it's NOT in the grave.
                        # Now check if it's in the LIVE articles.
                        stmt_live = select(models.Article).filter_by(slug=test_slug)
                        res_live = await db.execute(stmt_live)
                        if not res_live.scalars().first():
                            # It's not in the Grave and not in Live -> It's a GHOST.
                            # We bury it automatically for future requests.
                            logger.warning(f"AUTO-BURYING GHOST URL: {test_slug}")
                            new_grave = models.DeletedArticle(
                                slug=test_slug, 
                                reason="Autonomous Passive Burial (404 Detection)"
                            )
                            db.add(new_grave)
                            await db.commit()
                            raise HTTPException(
                                status_code=410, 
                                detail="Gone: This page has been permanently removed."
                            )
                except HTTPException:
                    raise 
                except Exception as e:
                    logger.error(f"Failed to check graveyard for {test_slug}: {e}")

        # Explicitly ignore API and unexpected system paths so they don't get swallowed by React
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")

        # 2. Serve specific file if it exists (favicon.ico, robots.txt)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # 3. Otherwise serve index.html (Client-side routing)
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