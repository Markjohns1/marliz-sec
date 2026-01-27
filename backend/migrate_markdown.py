import sqlite3
import os

# Database Path
DB_PATH = "backend/cybersec_news.db"
if not os.path.exists(DB_PATH):
    # Try server-side path
    DB_PATH = "cybersec_news.db"

def migrate_structure():
    print("--- MARLIZ INTEL: MIGRATING TO UNIFIED MARKDOWN ---")
    
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return

    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    try:
        # 1. Add new columns to 'articles' table
        print("Adding new columns to articles table...")
        columns_to_add = [
            ("content_markdown", "TEXT"),
            ("draft_content_markdown", "TEXT"),
            ("draft_title", "VARCHAR(500)"),
            ("draft_meta_description", "VARCHAR(160)"),
            ("draft_keywords", "TEXT")
        ]
        
        for col_name, col_type in columns_to_add:
            try:
                cursor.execute(f"ALTER TABLE articles ADD COLUMN {col_name} {col_type}")
                print(f"  + Added column: {col_name}")
            except sqlite3.OperationalError:
                print(f"  ! Column already exists: {col_name}")

        # 2. Convert existing fragmented content to Unified Markdown for all articles
        print("Unifying existing content fragments into Markdown...")
        cursor.execute("""
            SELECT 
                a.id, 
                a.title,
                s.friendly_summary, 
                s.attack_vector, 
                s.business_impact, 
                s.action_steps
            FROM articles a
            JOIN simplified_content s ON a.id = s.article_id
            WHERE a.content_markdown IS NULL OR a.content_markdown = ''
        """)
        articles = cursor.fetchall()

        for art in articles:
            a_id, title, summary, vector, impact, actions_json = art
            
            # Format as Markdown
            markdown = f"# {title}\n\n"
            markdown += f"## Strategic Intelligence Summary\n{summary}\n\n"
            
            if vector:
                markdown += f"## Technical Analysis & Attack Mechanics\n{vector}\n\n"
            
            markdown += f"## Business Impact & Risk Assessment\n{impact}\n\n"
            
            try:
                import json
                steps = json.loads(actions_json)
                if steps:
                    markdown += "## Recommended Strategic Action Steps\n"
                    for idx, step in enumerate(steps, 1):
                        markdown += f"{idx}. {step}\n"
            except:
                pass

            cursor.execute("UPDATE articles SET content_markdown = ? WHERE id = ?", (markdown, a_id))
        
        conn.commit()
        print(f"\nSUCCESS: Migrated {len(articles)} articles to unified markdown structure.")
        print("The Editor will now show one big box with all your content inside.")

    except Exception as e:
        conn.rollback()
        print(f"CRITICAL MIGRATION ERROR: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_structure()
