from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Use standard sqlite url for sync (compatibility) but async for main engine
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./cybersec_news.db")

# Ensure using an async driver for SQLite if default is used
if "sqlite:///" in DATABASE_URL and "aiosqlite" not in DATABASE_URL:
    DATABASE_URL = DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")

# Create Async Engine
engine = create_async_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
    future=True
)

# Async Session Factory
AsyncSessionLocal = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency for FastAPI async routes"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

@asynccontextmanager
async def get_db_context():
    """Context manager for background tasks"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Initialize database tables (Async)"""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)