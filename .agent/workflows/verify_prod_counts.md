---
description: Verify the production database counts for active and deleted articles
---
1. Run the verification script on the production container
// turbo
```bash
docker exec marliz-sec-news python -c "
import asyncio
from app.database import AsyncSessionLocal
from sqlalchemy import text

async def count():
    async with AsyncSessionLocal() as s:
        # Count Buried (Deleted) Articles
        res_deleted = await s.execute(text('SELECT count(*) FROM deleted_articles'))
        deleted_count = res_deleted.scalar()
        
        # Count Active Articles
        res_active = await s.execute(text(\"SELECT count(*) FROM articles WHERE status IN ('READY', 'EDITED', 'PUBLISHED')\"))
        active_count = res_active.scalar()
        
        print(f'STATUS REPORT:')
        print(f'Active Articles (Live): {active_count}')
        print(f'Buried Articles (410): {deleted_count}')

asyncio.run(count())
"
```
