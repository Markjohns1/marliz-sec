from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base
import enum

class ArticleStatus(str, enum.Enum):
    RAW = "raw"
    PROCESSING = "processing"
    READY = "ready"
    EDITED = "edited"
    PUBLISHED = "published"

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
    
    # Tracking
    views = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Manual editing
    is_edited = Column(Boolean, default=False)
    edited_by = Column(String(100))
    edited_at = Column(DateTime(timezone=True))
    
    category = relationship("Category", back_populates="articles")
    simplified = relationship("SimplifiedContent", back_populates="article", uselist=False)

class SimplifiedContent(Base):
    __tablename__ = "simplified_content"
    
    id = Column(Integer, primary_key=True, index=True)
    article_id = Column(Integer, ForeignKey("articles.id"), unique=True, nullable=False)
    
    # AI-generated friendly content
    friendly_summary = Column(Text, nullable=False)  # 3-4 sentences max
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