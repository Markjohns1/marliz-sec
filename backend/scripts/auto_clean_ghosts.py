import sqlite3
import os
import sys
from ghost_list import SLUG_LIST

# --- CONFIG ---
# Default to DRY RUN (Safety First)
DRY_RUN = True

if len(sys.argv) > 1 and sys.argv[1] == "--commit":
    DRY_RUN = False

# Priority search for DB
DB_PATHS = ["backend/cybersec_news.db", "cybersec_news.db", "../cybersec_news.db"]

# --- FIND DATABASE ---
db_path = None
for p in DB_PATHS:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        break

if not db_path:
    print("❌ Critical: No database found.")
    sys.exit(1)

print(f"✅ Target Database: {db_path}")
if DRY_RUN:
    print("🛡️  MODE: DRY RUN (No changes will be made)")
    print("   To commit changes, run: python3 backend/scripts/auto_clean_ghosts.py --commit")
else:
    print("⚠️  MODE: LIVE COMMIT (Changes WILL be saved)")

# --- EXECUTION ---
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

stats = {"buried": 0, "skipped_live": 0, "skipped_alrdy_dead": 0, "errors": 0}

print(f"\n🚀 Processing {len(SLUG_LIST)} candidates...")

for slug in SLUG_LIST:
    try:
        # 1. Is it LIVE? (Do NOT touch)
        cursor.execute("SELECT count(*) FROM articles WHERE slug = ?", (slug,))
        if cursor.fetchone()[0] > 0:
            stats["skipped_live"] += 1
            # print(f"   🟢 LIVE (Skipped): {slug}")
            continue

        # 2. Is it ALREADY DEAD?
        cursor.execute("SELECT count(*) FROM deleted_articles WHERE slug = ?", (slug,))
        if cursor.fetchone()[0] > 0:
            stats["skipped_alrdy_dead"] += 1
            continue

        # 3. IT IS A GHOST -> BURY IT
        if not DRY_RUN:
            cursor.execute("""
                INSERT INTO deleted_articles (slug, reason, deleted_at)
                VALUES (?, 'Auto-Audit Cleanup', DATE('now'))
            """, (slug,))
            print(f"   🔨 BURIED: {slug}")
        else:
             # In dry run, we simulate the bury
             # print(f"   [WOULD BURY]: {slug}")
             pass
        
        stats["buried"] += 1

    except Exception as e:
        print(f"   ❌ Error on {slug}: {e}")
        stats["errors"] += 1

if not DRY_RUN:
    conn.commit()
    print("\n💾 CHANGES COMMITTED.")
else:
    print("\n🛡️  DRY RUN COMPLETE. NO DATABASE CHANGES MADE.")

conn.close()

print(f"\n🏁 SUMMARY:")
print(f"   🟢 Live Articles Preserved: {stats['skipped_live']} (SAFE)")
print(f"   ⚰️  Already Dead: {stats['skipped_alrdy_dead']}")
print(f"   🔨 {'Would Bury' if DRY_RUN else 'Newly Buried'}: {stats['buried']}")
print(f"   ❌ Errors: {stats['errors']}")
