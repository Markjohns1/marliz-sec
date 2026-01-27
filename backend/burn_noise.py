import sqlite3
import os

# CONFIGURATION: Explicit titles from your screenshot to KEEP
TITLES_TO_KEEP = [
    "Coupang Data Breach: 33M Accounts Exposed",
    "AI-Powered Hacking: Vibe Hacking",
    "Ann & Robert H. Lurie Children's Hospital",
    "React Vulnerability 2025",
    "Microsoft Data Breach: Maharashtra",
    "Commvault Confirms 'Salt Typhoon'",
    "Apple Expands App Distribution Choices in Japan"
]

# Path to the database
DB_PATH = "cybersec_news.db" 

def burn_the_noise():
    print("\n" + "="*50)
    print("   MARLIZ INTEL: AD-SENSE SURGICAL CLEANSE")
    print("="*50)
    
    if not os.path.exists(DB_PATH):
        if os.path.exists("backend/" + DB_PATH):
            db_file = "backend/" + DB_PATH
        else:
            print(f"Error: Database file '{DB_PATH}' not found.")
            return
    else:
        db_file = DB_PATH

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()

    try:
        # 1. Identify IDs and Slugs of the "Diamonds"
        query_parts = []
        for t in TITLES_TO_KEEP:
            query_parts.append(f"title LIKE '%{t}%'")
        
        where_clause = " OR ".join(query_parts)
        cursor.execute(f"SELECT id, title FROM articles WHERE {where_clause}")
        diamonds = cursor.fetchall()
        
        print("\n[STEP 1] VERIFY THE ARTICLES TO BE SAVED:")
        print("-" * 40)
        if not diamonds:
            print("!!! ERROR: NO ARTICLES FOUND MATCHING THE 7 TITLES !!!")
            print("Check if they are spelled exactly as they appear in the DB.")
            return

        for idx, d in enumerate(diamonds, 1):
            print(f"{idx}. KEEPING: {d[1]}")
        print("-" * 40)
        print(f"Total to SAVE: {len(diamonds)}")

        # 2. Count the ones to be burned
        diamond_ids = [str(d[0]) for d in diamonds]
        cursor.execute(f"SELECT COUNT(*) FROM articles WHERE id NOT IN ({','.join(diamond_ids)})")
        noise_count = cursor.fetchone()[0]
        
        print(f"\n[STEP 2] THE CLEANSE:")
        print(f"This will delete {noise_count} AI-smelling articles.")
        print("They will be moved to the Graveyard (410 Gone) for Google.")
        
        # 3. INTERACTIVE CONFIRMATION
        print("\n" + "!" * 40)
        confirm = input(f"CONFIRMATION REQUIRED: Type 'yes' to proceed, or anything else to cancel: ")
        print("!" * 40 + "\n")

        if confirm.lower() != 'yes':
            print("CLEANSE ABORTED. No changes made to your database.")
            return

        print("Executing cleanse... please wait.")

        # 4. Identify the slugs for Graveyard
        cursor.execute(f"SELECT slug, id FROM articles WHERE id NOT IN ({','.join(diamond_ids)})")
        noise_data = cursor.fetchall()
        
        # 5. Insert into Graveyard & Delete
        for slug, art_id in noise_data:
            # Move to graveyard
            cursor.execute(
                "INSERT OR IGNORE INTO deleted_articles (slug, reason) VALUES (?, ?)",
                (slug, "AdSense Optimization: Content Cleanse")
            )
            # Delete associated content
            cursor.execute("DELETE FROM simplified_content WHERE article_id = ?", (art_id,))
            # Delete heart of the noise
            cursor.execute("DELETE FROM articles WHERE id = ?", (art_id,))
        
        conn.commit()
        print(f"\nSUCCESS: YOUR SITE IS NOW CLEAN.")
        print(f"Live Articles remaining: {len(diamonds)}")
        print(f"Graveyard URLs created: {len(noise_data)}")
        print("Google will now see a boutique site with 7 high-value reports.")

    except Exception as e:
        conn.rollback()
        print(f"\nCRITICAL ERROR: {str(e)}")
    finally:
        conn.close()

if __name__ == "__main__":
    burn_the_noise()
