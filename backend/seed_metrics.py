import sqlite3
import random

def seed_metrics():
    conn = sqlite3.connect('cybersec_news.db')
    cursor = conn.cursor()
    
    # Get all published articles
    cursor.execute("SELECT id, slug FROM articles WHERE status IN ('READY', 'EDITED', 'PUBLISHED')")
    articles = cursor.fetchall()
    
    for art_id, slug in articles:
        # Generate semi-realistic metrics
        # If it's the target article, give it specific high impressions
        if 'two-thirds' in slug:
            impressions = random.randint(50, 100)
            position = round(random.uniform(3.0, 6.0), 1)
        else:
            impressions = random.randint(0, 30)
            position = round(random.uniform(5.0, 50.0), 1) if impressions > 0 else 0.0
            
        cursor.execute("""
            UPDATE articles 
            SET impressions = ?, position = ? 
            WHERE id = ?
        """, (impressions, position, art_id))
    
    conn.commit()
    conn.close()
    print("✅ Seeded SEO metrics for articles.")

if __name__ == "__main__":
    seed_metrics()
