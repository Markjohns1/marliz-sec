from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
from app.database import Base
import enum

class ArticleStatus(str, enum.Enum):
    RAW = "RAW"
    PROCESSING = "PROCESSING"
    READY = "READY"
    EDITED = "EDITED"
    PUBLISHED = "PUBLISHED"

class ThreatLevel(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(Text)
    icon = Column(String(50))  # emoji or icon class
    priority = Column(Integer, default=0)  # for ordering
    
    articles = relationship("Article", back_populates="category")

class APIKey(Base):
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)  # e.g. "Admin", "MobileApp"
    key_prefix = Column(String, index=True)  # First 8 chars for identification
    key_hash = Column(String, index=True)  # Hashed key
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    last_used_at = Column(DateTime, nullable=True)

class Article(Base):
    __tablename__ = "articles"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(500), nullable=False)
    slug = Column(String(600), unique=True, nullable=False, index=True)
    original_url = Column(String(1000), unique=True, nullable=False)
    source_name = Column(String(200))
    published_at = Column(DateTime)
    image_url = Column(String(1000))
    raw_content = Column(Text)  # Store original article text
    
    category_id = Column(Integer, ForeignKey("categories.id"))
    status = Column(SQLEnum(ArticleStatus), default=ArticleStatus.RAW, index=True)
    
    # SEO fields
    meta_description = Column(String(160))
    keywords = Column(Text)  # comma-separated
    
    # NEW: Draft Workflow columns
    draft_title = Column(String(500))
    draft_meta_description = Column(String(160))
    draft_keywords = Column(Text)
    has_draft = Column(Boolean, default=False)
    
    # NEW: SEO Performance Metrics
    impressions = Column(Integer, default=0)
    position = Column(Float, default=0.0)
    
    # Tiered Content System
    content_type = Column(String(20), default="news") # 'news' or 'evergreen'
    protected_from_deletion = Column(Boolean, default=False)
    
    # Tracking
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Manual editing
    is_edited = Column(Boolean, default=False)
    edited_by = Column(String(100))
    edited_at = Column(DateTime(timezone=True))
    last_edited_at = Column(DateTime(timezone=True))
    last_edited_by = Column(String(100))
    
    category = relationship("Category", back_populates="articles")
    simplified = relationship("SimplifiedContent", back_populates="article", uselist=False)

class SimplifiedContent(Base):
    __tablename__ = "simplified_content"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), unique=True, nullable=False)
    
    # AI-generated friendly content
    friendly_summary = Column(Text, nullable=False)  # 3-4 sentences max
    attack_vector = Column(Text, default="")  # "HOW it happened"
    business_impact = Column(Text, nullable=False)  # "What this means for YOU"
    action_steps = Column(Text, nullable=False)  # JSON array of steps
    
    threat_level = Column(SQLEnum(ThreatLevel), default=ThreatLevel.MEDIUM, index=True)
    
    # Reading metrics
    reading_time_minutes = Column(Integer, default=3)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    article = relationship("Article", back_populates="simplified")

class Subscriber(Base):
    __tablename__ = "subscribers"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    is_premium = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    preferences = Column(Text)  # JSON: categories, frequency
    
    subscribed_at = Column(DateTime(timezone=True), server_default=func.now())
    unsubscribed_at = Column(DateTime(timezone=True))
    
    # For tracking
    last_email_sent = Column(DateTime(timezone=True))
    open_rate = Column(Integer, default=0)  # percentage

class ViewLog(Base):
    __tablename__ = "view_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"))
    referrer = Column(String(500))  # e.g., facebook.com, discord.com, google.com
    source_type = Column(String(50)) # 'social', 'search', 'direct', 'other'
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    article = relationship("Article")

class DeletedArticle(Base):
    """
    Table to store slugs that have been permanently deleted and should return 410 Gone.
    This helps remove them from Google Index faster.
    """
    __tablename__ = "deleted_articles"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(600), unique=True, nullable=False, index=True)
    deleted_at = Column(DateTime(timezone=True), server_default=func.now())
    reason = Column(String(200), default="Content cleanup")