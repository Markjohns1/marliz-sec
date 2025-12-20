from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime
from typing import Optional, List
from app.models import ArticleStatus, ThreatLevel

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    priority: int

# Simplified Content Schemas
class SimplifiedContentBase(BaseModel):
    friendly_summary: str
    attack_vector: Optional[str] = None
    business_impact: str
    action_steps: str  # JSON string
    threat_level: ThreatLevel
    reading_time_minutes: int = 3

class SimplifiedContent(SimplifiedContentBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    article_id: int
    created_at: datetime

# Article Schemas
class ArticleBase(BaseModel):
    title: str
    slug: str
    original_url: str
    source_name: Optional[str] = None
    published_at: Optional[datetime] = None
    image_url: Optional[str] = None
    category_id: Optional[int] = None

class ArticleCreate(ArticleBase):
    raw_content: Optional[str] = None

class ArticleUpdate(BaseModel):
    title: Optional[str] = None
    friendly_summary: Optional[str] = None
    attack_vector: Optional[str] = None
    business_impact: Optional[str] = None
    action_steps: Optional[str] = None
    threat_level: Optional[ThreatLevel] = None
    category_id: Optional[int] = None
    edited_by: str
    content_type: Optional[str] = None
    protected_from_deletion: Optional[bool] = None
    
    # Draft fields
    draft_title: Optional[str] = None
    draft_meta_description: Optional[str] = None
    draft_keywords: Optional[str] = None
    publish_now: Optional[bool] = False

class Article(ArticleBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: ArticleStatus
    views: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_edited: bool
    edited_at: Optional[datetime] = None
    meta_description: Optional[str] = None
    keywords: Optional[str] = None
    content_type: Optional[str] = "news"
    protected_from_deletion: Optional[bool] = False
    
    # Draft & Metrics
    draft_title: Optional[str] = None
    draft_meta_description: Optional[str] = None
    draft_keywords: Optional[str] = None
    has_draft: bool = False
    impressions: int = 0
    position: float = 0.0
    last_edited_at: Optional[datetime] = None
    last_edited_by: Optional[str] = None
    
class ArticleWithContent(Article):
    simplified: Optional[SimplifiedContent] = None
    category: Optional[Category] = None

class ArticleList(BaseModel):
    articles: List[ArticleWithContent]
    total: int
    page: int
    pages: int

# Manual Article Creation (Admin)
class ManualArticleCreate(BaseModel):
    title: str = Field(..., min_length=10, max_length=500)
    category_id: int
    friendly_summary: str = Field(..., min_length=50)
    business_impact: str = Field(..., min_length=30)
    action_steps: List[str] = Field(..., min_items=2, max_items=5)
    threat_level: ThreatLevel
    original_url: Optional[str] = None
    source_name: Optional[str] = "Staff Writer"
    image_url: Optional[str] = None
    admin_secret: str

# Subscriber Schemas
class SubscriberCreate(BaseModel):
    email: EmailStr

class Subscriber(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    email: str
    is_premium: bool
    is_verified: bool
    subscribed_at: datetime