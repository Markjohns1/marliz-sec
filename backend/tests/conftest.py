import pytest
import asyncio
import sys
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker

if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
from app.database import Base, get_db
from app.main import app
from unittest.mock import MagicMock

# Mock scheduler to prevent loop issues
app.dependency_overrides[get_db] = lambda: None # Placeholder
import app.services.scheduler as scheduler
scheduler.start_scheduler = MagicMock()
scheduler.stop_scheduler = MagicMock()

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# event_loop fixture removed to let pytest-asyncio handle it

@pytest.fixture
async def db_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL, 
        echo=False,
        connect_args={"check_same_thread": False}, 
        poolclass=StaticPool
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def db(db_engine):
    """Async session fixture"""
    async_session = sessionmaker(
        db_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session
        await session.rollback()

@pytest.fixture
def client(db):
    """FastAPI client with DB override"""
    from fastapi.testclient import TestClient
    
    def override_get_db():
        yield db

    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as c:
        yield c
    
    app.dependency_overrides.clear()
