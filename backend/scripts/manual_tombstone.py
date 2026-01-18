import sqlite3
import os
import sys

# 1. FIND THE DATABASE
# We force priority to the 'backend/' folder because that's usually where the real DB lives
# even if a decoy exists in the root.
candidate_paths = [
    "backend/cybersec_news.db",    # Priority 1: Inside backend folder (Run from Root)
    "cybersec_news.db",            # Priority 2: In current folder (Run from Backend)
    "../cybersec_news.db"          # Priority 3: Parent folder
]

db_path = None
# We check file size > 0 to avoid empty decoys
for p in candidate_paths:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        print(f"✅ Found VALID database at: {p} (Size: {os.path.getsize(p)} bytes)")
        break

if not db_path:
    print("❌ ERROR: Could not find a valid (non-empty) 'cybersec_news.db'.")
    print("   Please ensure you are running this from the project root or backend folder.")
    sys.exit(1)

# 2. THE GHOST LIST
ghost_slugs = [
    "chinese-hackers-use-anthropics-claude-ai-in-global-cyber-attack",
    "cisa-loses-key-employee-behind-early-ransomware-warnings"
]

def bury_ghosts():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        print(f"\n👻 Attempting to bury {len(ghost_slugs)} ghosts into {db_path}...")
        
        # Verify table exists first
        try:
            cursor.execute("SELECT count(*) FROM deleted_articles")
        except sqlite3.OperationalError:
            print(f"❌ ERROR: Table 'deleted_articles' missing in {db_path}!")
            print("   This confirms we opened the WRONG database file.")
            conn.close()
            return

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
