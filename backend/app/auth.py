from fastapi import Security, HTTPException, status
from fastapi.security import APIKeyHeader
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models import APIKey
from passlib.context import CryptContext
from datetime import datetime
import logging

api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)

async def verify_api_key(
    api_key: str = Security(api_key_header),
    db: AsyncSession = Security(get_db)
):
    """
    Validate API Key from X-API-Key header.
    Returns the key object if valid.
    """
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing API Key"
        )
    
    # 1. Extract prefix (first 8 chars)
    if len(api_key) < 10:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key format"
        )
    
    prefix = api_key[:8]
    
    # 2. Find key in DB by prefix (Optimize search)
    stmt = select(APIKey).filter_by(key_prefix=prefix, is_active=True)
    result = await db.execute(stmt)
    db_key = result.scalars().first()
    
    if not db_key:
        # Prevent timing attacks by checking a fake hash? 
        # For now just return generic error
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    
    # 3. Verify hash
    if not pwd_context.verify(api_key, db_key.key_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API Key"
        )
    
    # 4. Update usage stats
    db_key.last_used_at = datetime.utcnow()
    await db.commit()
    
    return db_key

def hash_key(key: str) -> str:
    return pwd_context.hash(key)
