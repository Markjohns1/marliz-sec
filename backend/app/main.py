from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from app.database import init_db
from app import models  # Import models before init_db to register tables
from app.routes import articles, categories, subscribers, seo
from app.services.scheduler import start_scheduler, stop_scheduler

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
    init_db()
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
    description="AI-powered cybersecurity news for small businesses",
    version="1.0.0",
    lifespan=lifespan
)

# CORS - Allow frontend to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "https://marlizintel.146.190.146.121.nip.io",
        "https://marlizintel.tymirahealth.com"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Caching Middleware
@app.middleware("http")
async def add_cache_headers(request, call_next):
    response = await call_next(request)
    if request.method == "GET" and response.status_code == 200:
        # Cache successfully (1 hour for general content)
        # Note: Browsers will cache this.
        response.headers["Cache-Control"] = "public, max-age=3600" 
    return response

# Include routers
app.include_router(articles.router)
app.include_router(categories.router)
app.include_router(subscribers.router)
app.include_router(seo.router)

@app.get("/api/health")
def health_check():
    """Detailed health check"""
    from app.database import engine
    from sqlalchemy import text
    
    try:
        # Test database connection
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return {
        "api": "healthy",
        "database": db_status
    }

# Manual trigger endpoints (for testing)
@app.post("/api/admin/fetch-news")
async def manual_fetch_news(admin_secret: str):
    """Manually trigger news fetch"""
    import os
    if admin_secret != os.getenv("ADMIN_SECRET"):
        return {"error": "Unauthorized"}
    
    from app.services.news_fetcher import news_fetcher
    result = await news_fetcher.fetch_news()
    return result

@app.post("/api/admin/simplify")
async def manual_simplify(admin_secret: str):
    """Manually trigger AI simplification"""
    import os
    if admin_secret != os.getenv("ADMIN_SECRET"):
        return {"error": "Unauthorized"}
    
    from app.services.ai_simplifier import ai_simplifier
    result = await ai_simplifier.process_pending_articles()
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
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        # Explicitly ignore API paths so they don't get swallowed
        if full_path.startswith("api"):
            raise HTTPException(status_code=404, detail="Not Found")

        # 1. Serve specific file if it exists (favicon.ico, robots.txt)
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # 2. Otherwise serve index.html (Client-side routing)
        return FileResponse(f"{FRONTEND_DIST}/index.html")

# Root path handler
@app.get("/")
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