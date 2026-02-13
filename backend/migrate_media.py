import asyncio
from sqlalchemy import text
from app.database import engine

async def migrate():
    print("🚀 Starting Marliz Intel DB Migration...")
    async with engine.begin() as conn:
        # Check if columns exist
        metadata = await conn.run_sync(lambda sync_conn: __import__('sqlalchemy').inspect(sync_conn).get_columns('media_assets'))
        column_names = [c['name'] for c in metadata]
        
        if 'summary' not in column_names:
            print("Adding 'summary' column...")
            await conn.execute(text("ALTER TABLE media_assets ADD COLUMN summary TEXT"))
        
        if 'is_published' not in column_names:
            print("Adding 'is_published' column...")
            await conn.execute(text("ALTER TABLE media_assets ADD COLUMN is_published BOOLEAN DEFAULT 0"))
            
    print("✅ Migration complete!")

if __name__ == "__main__":
    asyncio.run(migrate())
