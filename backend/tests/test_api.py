import pytest
from app import models

@pytest.mark.asyncio
async def test_health_check(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["api"] == "healthy"

@pytest.mark.asyncio
async def test_get_articles_empty(client):
    response = client.get("/api/articles/")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
    assert data["articles"] == []

@pytest.mark.asyncio
async def test_create_and_get_category(db, client):
    # Manually insert category into test DB
    cat = models.Category(name="Test Cat", slug="test-cat", description="Test")
    db.add(cat)
    await db.commit()
    
    response = client.get("/api/categories/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["slug"] == "test-cat"
