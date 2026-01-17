import sqlite3
import os

db_path = 'cybersec_news.db'

def count_words(text):
    if not text:
        return 0
    return len(text.split())

def check_status():
    if not os.path.exists(db_path):
        print(f"Error: Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Query to get content for word counting
    query = """
    SELECT 
        a.id, 
        a.title, 
        s.friendly_summary, 
        s.attack_vector, 
        s.business_impact
    FROM articles a
    JOIN simplified_content s ON a.id = s.article_id
    ORDER BY a.published_at DESC
    """
    
    try:
        cursor.execute(query)
        rows = cursor.fetchall()
        
        print(f"{'ID':<6} | {'WORD COUNT':<10} | {'STATUS':<12} | {'TITLE'}")
        print("-" * 100)
        
        for row in rows:
            art_id, title, summary, vector, impact = row
            
            # Combine all text fields
            total_text = f"{summary or ''} {vector or ''} {impact or ''}"
            word_count = count_words(total_text)
            
            # Determine status based on presence of "Strategic Assessment" and word count
            is_supercharged = "Strategic Assessment" in (summary or "")
            status = "SUPERCHARGED" if is_supercharged else "SHORT"
            
            # Only show top 20 or interesting ones? No, let's show them all but maybe limit for display
            # Or just filter for the latest ones to confirm today's work
            print(f"{art_id:<6} | {word_count:<10} | {status:<12} | {title[:60]}...")

    except Exception as e:
        print(f"Error executing query: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_status()
