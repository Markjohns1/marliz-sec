from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app import models
from app.auth import verify_api_key
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats/dashboard")
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    api_key_obj = Depends(verify_api_key)
):
    """Get statistics for the admin dashboard"""
    
    # 1. Total Reports (Articles)
    stmt_total = select(func.count(models.Article.id))
    res_total = await db.execute(stmt_total)
    total_reports = res_total.scalar_one()

    # 2. Today's Reports
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    stmt_today = select(func.count(models.Article.id)).where(models.Article.created_at >= today_start)
    res_today = await db.execute(stmt_today)
    todays_reports = res_today.scalar_one()

    # 3. Engagement (Avg Views)
    stmt_views = select(func.avg(models.Article.views))
    res_views = await db.execute(stmt_views)
    avg_interest = res_views.scalar_one() or 0.0

    # 4. Global Readership (Total Views)
    stmt_global = select(func.sum(models.Article.views))
    res_global = await db.execute(stmt_global)
    global_readership = res_global.scalar_one() or 0

    return {
        "intelligence_library": total_reports,
        "public_impact": int(global_readership),
        "fresh_intel": todays_reports,
        "engagement": round(avg_interest, 1)
    }
