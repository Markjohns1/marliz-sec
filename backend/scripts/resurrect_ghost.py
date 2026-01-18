import sqlite3
import os
import sys

# 1. FIND THE DATABASE
candidate_paths = [
    "backend/cybersec_news.db",    
    "cybersec_news.db",            
    "../cybersec_news.db"          
]

db_path = None
for p in candidate_paths:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        print(f"✅ Found VALID database at: {p} (Size: {os.path.getsize(p)} bytes)")
        break

if not db_path:
    print("❌ ERROR: Database not found.")
    sys.exit(1)

# 2. THE SLUG TO CHECK
target_slug = "password-hacking-software-market-hits-new-high-major-giants-medusa-wfuzz-ettercap"

def check_and_resurrect():
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print(f"\n🔍 Checking status for: {target_slug}...")
        
        # 1. Check LIVE table
        cursor.execute("SELECT id, title FROM articles WHERE slug = ?", (target_slug,))
        live = cursor.fetchone()
        
        if live:
            print(f"   🟢 LIVE STATUS: FOUND! (ID: {live[0]})")
            print(f"      Title: {live[1]}")
            print("      (This article is ALIVE and serving 200 OK. The Tombstone check is skipped.)")
        else:
            print("   🔴 LIVE STATUS: NOT FOUND (It is missing from the main 'articles' table)")
            
        # 2. Check GRAVEYARD table
        cursor.execute("SELECT deleted_at FROM deleted_articles WHERE slug = ?", (target_slug,))
        dead = cursor.fetchone()
        
        if dead:
            print(f"   ⚫ GRAVEYARD STATUS: FOUND (Buried at {dead[0]})")
            
            # RESURRECTION LOGIC
            print("\n🚑 Attempting Resurrection (Removing from graveyard)...")
            cursor.execute("DELETE FROM deleted_articles WHERE slug = ?", (target_slug,))
            conn.commit()
            print("   ✨ SUCCESS: Removed from 'deleted_articles'.")
            print("      Status is now: 404 Not Found (instead of 410 Gone)")
        else:
            print("   ⚪ GRAVEYARD STATUS: NOT FOUND (It is not in the deletion log)")

        conn.close()
        
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == "__main__":
    check_and_resurrect()
