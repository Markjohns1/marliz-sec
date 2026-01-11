
import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# --- CONFIGURATION (Adjust if needed) ---
# Try to load from env, otherwise assume default production path
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://user:pass@localhost/dbname") 
# If using SQLite in prod (unlikely but possible):
# DATABASE_URL = "sqlite+aiosqlite:///./cybersec_news.db"

async def check_prod_stats():
    # Attempt to load environment variables from .env if present
    if os.path.exists(".env"):
        print(" Loading .env file...")
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v
    
    # Get DB URL from env
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print(" ERROR: DATABASE_URL not found. Please run this where your .env is located.")
        return

    # Fix for SQLAlchemy if using postgres://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://")
    elif db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")

    print(f" Connecting to database...")
    
    try:
        engine = create_async_engine(db_url, echo=False)
        async with engine.connect() as conn:
            # 1. Active Articles
            result = await conn.execute(text("SELECT status, count(*) FROM articles GROUP BY status"))
            rows = result.fetchall()
            
            print("\n=== LIVE SERVER ARTICLE COUNTS ===")
            total_active = 0
            for status, count in rows:
                print(f" {status}: {count}")
                if status in ['READY', 'EDITED', 'PUBLISHED']:
                    total_active += count
            
            print(f"----------------------------------")
            print(f" TOTAL LIVE ARTICLES: {total_active}")
            print(f" TOTAL PENDING (RAW): {sum(c for s, c in rows if s == 'RAW')}")

            # 2. Deleted Articles (The 410 List)
            try:
                result_del = await conn.execute(text("SELECT count(*) FROM deleted_articles"))
                deleted_counts = result_del.scalar()
                print(f" TOTAL BURIED (410 Gone): {deleted_counts}")
            except Exception:
                print(" TOTAL BURIED (410 Gone): 0 (Table 'deleted_articles' might not exist yet)")

            print("==================================\n")
            
    except Exception as e:
        print(f" DATA CONNECTION ERROR: {e}")

if __name__ == "__main__":
    if sys.platform == 'win32':
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(check_prod_stats())
