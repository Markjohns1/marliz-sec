import sys
import os

# Add backend directory to sys.path
sys.path.append(os.path.join(os.path.dirname(__file__)))

from app.database import SessionLocal
from app.models import Category
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def clear_emojis():
    """Clear all icons (emojis) from categories"""
    db = SessionLocal()
    try:
        categories = db.query(Category).all()
        logger.info(f"Found {len(categories)} categories")
        
        for cat in categories:
            if cat.icon:
                logger.info(f"Clearing icon for: {cat.name} (was: {cat.icon})")
                cat.icon = ""
        
        db.commit()
        logger.info("✓ All category emojis cleared successfully")
        
    except Exception as e:
        logger.error(f"Error clearing emojis: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_emojis()
