import os
import shutil
import uuid
import io
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from app.database import get_db
from app import models, schemas
from app.auth import verify_api_key
from app.config import settings
from PIL import Image

router = APIRouter(prefix="/api/media", tags=["media"])

UPLOAD_DIR = "uploads"
# Ensure the upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

MAX_RES = 1600 # Maximum width/height for optimization

@router.post("/upload", response_model=schemas.MediaAsset)
async def upload_media(
    file: UploadFile = File(...),
    alt_text: Optional[str] = Form(None),
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload a file, optimize it (WebP), and verify security.
    """
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.pdf']:
        raise HTTPException(status_code=400, detail="Unsupported file type")
    
    # Read file content
    content = await file.read()
    
    # Logic for PDFs
    if ext == '.pdf':
        unique_filename = f"{uuid.uuid4().hex}.pdf"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        final_mime = "application/pdf"
    
    # Logic for Images
    else:
        try:
            # Security & Optimization: Process with Pillow
            img = Image.open(io.BytesIO(content))
            img_format = img.format
            
            # Verify it's a valid image format
            if img_format not in ['JPEG', 'PNG', 'WEBP', 'GIF', 'SVG']:
                # Some SVGs might fail Pillow check, but we handle standard images here
                if ext != '.svg':
                    raise Exception("Invalid image headers")

            # Optimization Logic
            # 1. Handle Orientation (EXIF)
            try:
                from PIL import ImageOps
                img = ImageOps.exif_transpose(img)
            except:
                pass

            # 2. Resize if too big
            if img.width > MAX_RES or img.height > MAX_RES:
                img.thumbnail((MAX_RES, MAX_RES), Image.Resampling.LANCZOS)

            # 3. Convert to WebP for maximum performance
            unique_filename = f"{uuid.uuid4().hex}.webp"
            file_path = os.path.join(UPLOAD_DIR, unique_filename)
            
            # Save optimized WebP
            img.save(file_path, "WEBP", quality=85, optimize=True)
            
            final_mime = "image/webp"
            
        except Exception as e:
            # Fallback for SVG or failure
            if ext == '.svg':
                unique_filename = f"{uuid.uuid4().hex}.svg"
                file_path = os.path.join(UPLOAD_DIR, unique_filename)
                with open(file_path, "wb") as buffer:
                    buffer.write(content)
                final_mime = "image/svg+xml"
            else:
                raise HTTPException(status_code=400, detail=f"Invalid or corrupted image: {str(e)}")
    
    # Calculate URL
    file_url = f"{settings.BASE_URL}/uploads/{unique_filename}"
    
    # Save to database
    media = models.MediaAsset(
        filename=unique_filename,
        original_name=file.filename,
        mime_type=final_mime,
        size_bytes=os.path.getsize(file_path),
        url=file_url,
        alt_text=alt_text
    )
    
    db.add(media)
    await db.commit()
    await db.refresh(media)
    
    return media

@router.get("/list", response_model=schemas.MediaList)
async def list_media(
    skip: int = 0,
    limit: int = 50,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """List all uploaded media assets"""
    stmt = select(models.MediaAsset).order_by(desc(models.MediaAsset.created_at)).offset(skip).limit(limit)
    res = await db.execute(stmt)
    media_items = res.scalars().all()
    
    count_stmt = select(func.count()).select_from(models.MediaAsset)
    count_res = await db.execute(count_stmt)
    total = count_res.scalar()
    
    return {"media": media_items, "total": total}

@router.put("/{asset_id}", response_model=schemas.MediaAsset)
async def update_media_meta(
    asset_id: int,
    data: schemas.MediaUpdate,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Update media metadata (like Alt Text)"""
    stmt = select(models.MediaAsset).filter_by(id=asset_id)
    res = await db.execute(stmt)
    media = res.scalars().first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    if data.alt_text is not None:
        media.alt_text = data.alt_text
    if data.summary is not None:
        media.summary = data.summary
    if data.is_published is not None:
        media.is_published = data.is_published
        
    await db.commit()
    await db.refresh(media)
    return media

@router.get("/resources", response_model=schemas.MediaList)
async def list_public_resources(
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint to list all published PDF resources"""
    stmt = select(models.MediaAsset).filter(
        models.MediaAsset.is_published == True,
        models.MediaAsset.mime_type == 'application/pdf'
    ).order_by(desc(models.MediaAsset.created_at))
    
    res = await db.execute(stmt)
    media_items = res.scalars().all()
    
    return {"media": media_items, "total": len(media_items)}

@router.delete("/{asset_id}")
async def delete_media(
    asset_id: int,
    api_key = Depends(verify_api_key),
    db: AsyncSession = Depends(get_db)
):
    """Delete a media asset"""
    stmt = select(models.MediaAsset).filter_by(id=asset_id)
    res = await db.execute(stmt)
    media = res.scalars().first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Media not found")
    
    # Delete from disk
    file_path = os.path.join(UPLOAD_DIR, media.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    await db.delete(media)
    await db.commit()
    
    return {"status": "success", "message": "Media deleted"}

@router.get("/public/{asset_id}")
async def get_public_media(
    asset_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Public endpoint to fetch media details (for download page)"""
    stmt = select(models.MediaAsset).filter_by(id=asset_id)
    res = await db.execute(stmt)
    media = res.scalars().first()
    
    if not media:
        raise HTTPException(status_code=404, detail="Resource not found")
    
    return {
        "id": media.id,
        "filename": media.filename,
        "original_name": media.original_name,
        "url": media.url,
        "mime_type": media.mime_type,
        "size_bytes": media.size_bytes
    }
