import sqlite3
import os

# 1. FIND THE DATABASE
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
    # Fallback for server structure
    db_path = "backend/cybersec_news.db"
    print(f"⚠️  Database not found locally, defaulting to: {db_path}")

# 2. THE GHOST LIST
ghost_slugs = [
    "thailand-shifts-focus-on-border-disputes-targeting-cybercrime-syndicates",
    "chinese-hackers-use-anthropics-claude-ai-to-automate-90-of-cyber-espionage",
    "password-hacking-software-market-hits-new-high-major-giants-medusa-wfuzz-ettercap",
    "passkeys-come-to-telegram-secure-messaging-app",
    "from-ai-to-cyber-risk-why-it-leaders-are-anxious-heading-into-2026"
]

def bury_ghosts():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print(f"\n👻 Attempting to bury {len(ghost_slugs)} ghosts...")
        
        count = 0
        for slug in ghost_slugs:
            # Check if exists
            cursor.execute("SELECT count(*) FROM deleted_articles WHERE slug = ?", (slug,))
            if cursor.fetchone()[0] > 0:
                print(f"   ⚰️  Already dead: {slug}")
                continue
                
            # Insert
            cursor.execute("""
                INSERT INTO deleted_articles (slug, reason, deleted_at)
                VALUES (?, 'Manual Cleanup of Old 404s', DATE('now'))
            """, (slug,))
            
            print(f"   🔨 Buried: {slug}")
            count += 1
            
        conn.commit()
        print(f"\n✅ SUCCESS: {count} ghosts converted to 410 Gone.")
        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    bury_ghosts()
