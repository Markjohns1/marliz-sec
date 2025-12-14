"""
Initialize database with categories
Run this ONCE after setting up your environment:
python init_db.py
"""
from app.database import SessionLocal, init_db
from app.models import Category
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
def seed_categories():
    """Create initial categories"""
    db = SessionLocal()
    
    categories = [
        {
            "name": "Ransomware",
            "slug": "ransomware",
            "description": "Ransomware attacks and protection strategies",
            "icon": "",
            "priority": 100
        },
        {
            "name": "Phishing & Email Security",
            "slug": "phishing",
            "description": "Email scams, phishing attacks, and social engineering",
            "icon": "",
            "priority": 90
        },
        {
            "name": "Data Breaches",
            "slug": "data-breach",
            "description": "Data breach news and customer data protection",
            "icon": "",
            "priority": 80
        },
        {
            "name": "Malware & Viruses",
            "slug": "malware",
            "description": "Malware threats and antivirus protection",
            "icon": "",
            "priority": 70
        },
        {
            "name": "Vulnerabilities",
            "slug": "vulnerability",
            "description": "CVEs, zero-days, software flaws, and patches",
            "icon": "",
            "priority": 65
        },
        {
            "name": "General Security",
            "slug": "general",
            "description": "General cybersecurity news and best practices",
            "icon": "",
            "priority": 50
        }
    ]
    
    try:
        for cat_data in categories:
            existing = db.query(Category).filter_by(slug=cat_data["slug"]).first()
            if not existing:
                category = Category(**cat_data)
                db.add(category)
                logger.info(f"Created category: {cat_data['name']}")
            else:
                logger.info(f"Category exists: {cat_data['name']}")
        
        db.commit()
        logger.info("Categories initialized successfully")
        
    except Exception as e:
        logger.error(f"Error seeding categories: {str(e)}")
        db.rollback()
    finally:
        db.close()
if __name__ == "__main__":
    logger.info("Initializing database...")
    
    # Create tables
    init_db()
    logger.info("Tables created")
    
    # Seed categories
    seed_categories()
    
    logger.info("Database initialization complete!")
    logger.info("\nNext steps:")
    logger.info("1. Add your API keys to .env file")
    logger.info("2. Run: uvicorn app.main:app --reload")
    logger.info("3. Visit: http://localhost:8000/docs")