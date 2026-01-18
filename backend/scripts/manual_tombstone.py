import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# 1. SETUP DATABASE CONNECTION
# We use the sync driver for this maintenance script
import sys
# Add parent dir to path to import config if needed, though we will try to be standalone to avoid async issues
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Attempt to read the correct DB path from the environment or default to the file
# On the server, the DB is likely at backend/cybersec_news.db relative to the project root
# or adjacent to the app folder.
DB_NAME = "cybersec_news.db"
# We assume this script is run from the project root or backend/ folder.
# Let's try to find the DB.
candidate_paths = [
    "cybersec_news.db",
    "backend/cybersec_news.db",
    "../cybersec_news.db"
]

db_path = None
for p in candidate_paths:
    if os.path.exists(p):
        db_path = p
        print(f"✅ Found database at: {p}")
        break

if not db_path:
    # If not found (maybe first run on fresh deploy), default to the one in backend
    db_path = "backend/cybersec_news.db"
    print(f"⚠️  Database not found locally, defaulting path to: {db_path} (Verify this explains why if running locally)")

# Standard SQLite URL
DATABASE_URL = f"sqlite:///{db_path}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 2. THE GHOST LIST (URLs that are 404 but should be 410)
ghost_slugs = [
    "thailand-shifts-focus-on-border-disputes-targeting-cybercrime-syndicates",
    "chinese-hackers-use-anthropics-claude-ai-to-automate-90-of-cyber-espionage",
    "password-hacking-software-market-hits-new-high-major-giants-medusa-wfuzz-ettercap",
    "passkeys-come-to-telegram-secure-messaging-app",
    "from-ai-to-cyber-risk-why-it-leaders-are-anxious-heading-into-2026"
]

def bury_ghosts():
    db = SessionLocal()
    print(f"\n👻 Attempting to bury {len(ghost_slugs)} ghosts...")
    
    count = 0
    try:
        for slug in ghost_slugs:
            # Check if likely already there
            check_sql = text("SELECT count(*) FROM deleted_articles WHERE slug = :slug")
            result = db.execute(check_sql, {"slug": slug}).scalar()
            
            if result > 0:
                print(f"   ⚰️  Already dead: {slug}")
                continue
                
            # Insert into graveyard
            # We use raw SQL to avoid model dependency issues with async/sync
            insert_sql = text("""
                INSERT INTO deleted_articles (slug, reason, deleted_at)
                VALUES (:slug, 'Manual Cleanup of Old 404s', CURRENT_TIMESTAMP)
            """)
            db.execute(insert_sql, {"slug": slug})
            print(f"   🔨 Buried: {slug}")
            count += 1
            
        db.commit()
        print(f"\n✅ SUCCESS: {count} ghosts converted to 410 Gone.")
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    bury_ghosts()
