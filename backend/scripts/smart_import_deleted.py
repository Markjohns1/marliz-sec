
import asyncio
import sys
import os
import re
import xml.etree.ElementTree as ET

# Add parent directory to path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import AsyncSessionLocal
from app.models import DeletedArticle, Article
from sqlalchemy import select

async def smart_import_deleted(shared_strings_path):
    if not os.path.exists(shared_strings_path):
        print(f"Error: File {shared_strings_path} not found.")
        return

    print("--- Phase 1: Extracting URLs from Excel Data ---")
    urls_to_check = []
    
    # Parse XML directly to get strings
    try:
        tree = ET.parse(shared_strings_path)
        root = tree.getroot()
        # The namespace often messes up findall, so we iterate
        for elem in root.iter():
            if elem.tag.endswith('t'): # <t> tag contains text
                text = elem.text
                if text and "marlizintel.com/article/" in text:
                    urls_to_check.append(text.strip())
    except Exception as e:
        print(f"Error parsing XML: {e}")
        return

    # Remove duplicates
    urls_to_check = list(set(urls_to_check))
    print(f"Found {len(urls_to_check)} unique article URLs in the file.")
    
    print("\n--- Phase 2: Database Validation & Protection ---")
    
    async with AsyncSessionLocal() as db:
        added_count = 0
        protected_count = 0
        already_deleted_count = 0
        
        for url in urls_to_check:
            # Extract slug from URL
            # Expected format: https://marlizintel.com/article/some-slug
            if "/article/" not in url:
                continue
                
            slug = url.split("/article/")[1].strip()
            if not slug:
                continue
                
            # 1. CHECK IF ACTIVE (The Protection Layer)
            res_active = await db.execute(select(Article).filter_by(slug=slug))
            if res_active.scalars().first():
                # print(f"✅ PROTECTED (Active): {slug}")
                protected_count += 1
                continue

            # 2. CHECK IF ALREADY DELETED
            res_deleted = await db.execute(select(DeletedArticle).filter_by(slug=slug))
            if res_deleted.scalars().first():
                # print(f"ℹ️ SKIPPING (Already 410): {slug}")
                already_deleted_count += 1
                continue

            # 3. MARK AS DELETED (The Action Layer)
            print(f" MARKING 410 GONE: {slug}")
            db.add(DeletedArticle(slug=slug, reason="Smart Bulk Import"))
            added_count += 1
        
        await db.commit()
        
        print("\n" + "="*40)
        print("       VALIDATION COMPLETE       ")
        print("="*40)
        print(f" Total URLs Scanned:   {len(urls_to_check)}")
        print(f" Active Pages Protected: {protected_count}")
        print(f" Already 410 Slugs:      {already_deleted_count}")
        print(f" New Slugs Marked 410:   {added_count}")
        print("="*40)

if __name__ == "__main__":
    file_path = "c:/Users/johnm/Desktop/PROJECTS/cybersecurity-news/tmp_validation/xl/sharedStrings.xml"
    asyncio.run(smart_import_deleted(file_path))
