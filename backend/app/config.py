import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # App Settings
    APP_NAME: str = "Marliz Intel"
    DOMAIN: str = os.getenv("DOMAIN", "marlizintel.com")
    BASE_URL: str = os.getenv("BASE_URL", f"https://{DOMAIN}")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-prod")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./cybersec_news.db")
    
    # AI Services (Groq)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    AI_MODEL: str = "llama-3.1-8b-instant"
    
    # News Fetcher
    NEWSDATA_IO_KEY: str = os.getenv("NEWSDATA_IO_KEY", "")
    FETCH_INTERVAL_HOURS: int = 4
    MAX_ARTICLES_PER_FETCH: int = 20
    MIN_ARTICLE_LENGTH: int = 200
    
    # Admin
    ADMIN_SECRET: str = os.getenv("ADMIN_SECRET", "change-me")

    class Config:
        env_file = ".env"
        extra = "ignore"  # Allow extra env vars without crashing

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
