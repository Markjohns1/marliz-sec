import sqlite3
import os

def analyze():
    db_path = "cybersec_news.db"
    if not os.path.exists(db_path):
        print(f"❌ Error: Database file '{db_path}' not found in current directory.")
        return

    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()

        # 1. Total Burial Count
        cur.execute("SELECT count(*) FROM deleted_articles;")
        total = cur.fetchone()[0]

        # 2. Breakdown by Reason
        cur.execute("SELECT reason, count(*) FROM deleted_articles GROUP BY reason ORDER BY count(*) DESC;")
        reasons = cur.fetchall()

        # 3. Latest 20 Burials
        cur.execute("SELECT id, slug, reason, deleted_at FROM deleted_articles ORDER BY id DESC LIMIT 20;")
        latest = cur.fetchall()

        print("\n" + "="*60)
        print("🛡️  MARLIZ SECURITY: GRAVEYARD ANALYSIS REPORT")
        print("="*60)
        print(f"TOTAL BURIED LINKS (410 GONE): {total}")
        print("-" * 60)
        
        print("\n📊 BURIAL BREAKDOWN BY REASON:")
        for reason, count in reasons:
            print(f" - {reason}: {count}")
            
        print("\n⌛ LATEST 20 BURIED LINKS:")
        print(f"{'ID':<6} {'SLUG':<40} {'REASON':<15}")
        print("-" * 60)
        for row in latest:
            # Truncate slug if too long
            slug = (row[1][:37] + '...') if len(row[1]) > 40 else row[1]
            print(f"{row[0]:<6} {slug:<40} {row[2]:<15}")
        
        print("\n" + "="*60)
        print("Report Complete.")
        print("="*60 + "\n")

    except Exception as e:
        print(f"❌ Database error: {e}")
    finally:
        if conn:
            conn.close()

if __name__ == "__main__":
    analyze()
