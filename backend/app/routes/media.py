import os
import shutil
import uuid
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.database import AsyncSessionLocal
from app import models, schemas
from app.routes.admin import verify_api_key
from app.config import settings

router = APIRouter(prefix="/media", tags=["media"])

UPLOAD_DIR = "uploads"
# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.MediaAsset)
async def upload_media(
    file: UploadFile = File(...),
    api_key: str = Depends(verify_api_key),
    db: AsyncSession = Depends(AsyncSessionLocal)
):
    """Upload a file to self-hosted storage"""
    # Create unique filename
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg']:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file to disk
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Calculate URL
    # We serve from /uploads/ static mount
    file_url = f"{settings.BASE_URL}/uploads/{unique_filename}"
    
    # Save to database
    media = models.MediaAsset(
        filename=unique_filename,
        original_name=file.filename,
        mime_type=file.content_type,
        size_bytes=os.path.getsize(file_path),
        url=file_url
    )
    
    db.add(media)
    await db.commit()
    await db.refresh(media)
    
    return media

@router.get("/list", response_model=schemas.MediaList)
async def list_media(
    skip: int = 0,
    limit: int = 50,
    api_key: str = Depends(verify_api_key),
    db: AsyncSession = Depends(AsyncSessionLocal)
):
    """List all uploaded media assets"""
    stmt = select(models.MediaAsset).order_by(desc(models.MediaAsset.created_at)).offset(skip).limit(limit)
    res = await db.execute(stmt)
    media_items = res.scalars().all()
    
    # Get total count
    total_stmt = select(models.Article).with_only_columns(models.Article.id) # Re-using Article ID column for simple count or just len
    # Correct way to count
    from sqlalchemy import func
    count_stmt = select(func.count()).select_from(models.MediaAsset)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar()
    
    return {"media": media_items, "total": total}

@router.delete("/{asset_id}")
async def delete_media(
    asset_id: int,
    api_key: str = Depends(verify_api_key),
    db: AsyncSession = Depends(AsyncSessionLocal)
):
    """Delete a media asset (deletes from DB and disk)"""
    stmt = select(models.MediaAsset).filter_by(id=asset_id)
    res = await db.execute(stmt)
    media = res.scalars().first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Delete from disk
    file_path = os.path.join(UPLOAD_DIR, media.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from DB
    await db.delete(media)
    await db.commit()
    
    return {"status": "success", "message": "Media deleted"}
