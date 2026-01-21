#!/usr/bin/env python3
"""
=============================================================================
GRAVEYARD SCRIPT: Bury Broken "undefined" URLs
=============================================================================
Purpose: Add all broken URLs with "/article/undefined/article/" pattern
         to the deleted_articles table so they return 410 Gone.

When to run: Once, after deploying the main.py fix.
             Run on the production server to update the database.

Usage:
    cd ~/cybersecurity-news/backend
    python -m scripts.bury_undefined_urls
=============================================================================
"""
import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import DeletedArticle

# List of broken slugs from Google Search Console (Jan 21, 2026)
# These are the FULL paths that appear after "/article/" in the broken URLs
# Format: /article/{slug} -> we store the {slug} part
BROKEN_SLUGS = [
    # Pattern: undefined/article/{actual-slug}
    "undefined/article/700credit-data-breach-exposes-personal-information-murphy-law-firm-investigates-legal-claims",
    "undefined/article/federal-contracts-now-demand-quantum-resilience-as-data-harvest-accelerates",
    "undefined/article/russian-cyber-group-targets-energy-sector-using-aws-misconfigurations",
    "undefined/article/google-org-backs-cyber-safes-resilic-africa-to-shield-2m-people-from-cyber-threats",
    "undefined/article/cyrima-announces-decyptr-4-0-industry-leading-ai-platform-engineered-for-pre-emptive-protection-agai-1",
    "undefined/article/milesight-announces-mctile-surveillance-unit-solution-powered-by-outdoor-ready-cameras-2",
    "undefined/article/nigeria-ranks-second-most-targeted-african-country-for-cyberattacks-in-nove-mber-checkpoint-research",
    "undefined/article/cross-border-email-becomes-an-operational-imperative-how-coremail-helps-hong-kong-enterprises-naviga",
]

async def bury_undefined_urls():
    """
    Insert all broken 'undefined' URLs into the graveyard (deleted_articles table).
    This ensures they return 410 Gone and are de-indexed by Google.
    """
    print("=" * 60)
    print(" GRAVEYARD: Burying Broken 'undefined' URLs")
    print("=" * 60)
    
    async with AsyncSessionLocal() as db:
        added_count = 0
        already_buried_count = 0
        
        for slug in BROKEN_SLUGS:
            # Check if already in graveyard
            stmt = select(DeletedArticle).filter_by(slug=slug)
            result = await db.execute(stmt)
            existing = result.scalars().first()
            
            if existing:
                already_buried_count += 1
                print(f"  [SKIP] Already buried: {slug[:60]}...")
            else:
                # Add to graveyard
                tombstone = DeletedArticle(
                    slug=slug,
                    reason="Broken URL with 'undefined' - SEO cleanup Jan 2026"
                )
                db.add(tombstone)
                added_count += 1
                print(f"  [BURY] Marking 410: {slug[:60]}...")
        
        await db.commit()
        
        print("")
        print("=" * 60)
        print(f" SUMMARY")
        print(f"   Already Buried: {already_buried_count}")
        print(f"   Newly Buried:   {added_count}")
        print(f"   Total Processed: {len(BROKEN_SLUGS)}")
        print("=" * 60)
        print("")
        print(" These URLs will now return 410 Gone to Google.")
        print(" Submit sitemap-deleted.xml to GSC to speed up de-indexing.")
        print("=" * 60)

if __name__ == "__main__":
    asyncio.run(bury_undefined_urls())
