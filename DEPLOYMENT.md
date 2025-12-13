# Marliz Intel - Deployment Notes

**Date:** December 13, 2025  
**Domain:** https://marlizintel.tymirahealth.com  
**Platform:** DigitalOcean App Platform

---

## Issues Fixed During Deployment

### 1. ModuleNotFoundError: No module named 'app'
- **Cause:** Dockerfile WORKDIR was `/app`, but Python code expected `/app/backend`
- **Fix:** Set `WORKDIR /app/backend` in Dockerfile

### 2. PYTHONPATH Conflict
- **Cause:** DigitalOcean dashboard had `PYTHONPATH=/app` overriding Dockerfile
- **Fix:** Removed PYTHONPATH from environment variables

### 3. Missing `__init__.py`
- **Cause:** Python didn't recognize `app/` as a package
- **Fix:** Created `backend/app/__init__.py`

### 4. Missing email-validator
- **Cause:** Pydantic's EmailStr requires email-validator
- **Fix:** Added `email-validator==2.1.0` to requirements.txt

### 5. Database Tables Not Created
- **Cause:** `models` not imported before `init_db()` ran
- **Fix:** Added `from app import models` in main.py

---

## Environment Variables (Required in DigitalOcean)

```
NEWSDATA_IO_KEY=<your-key>
GROQ_API_KEY=<your-key>
FETCH_INTERVAL_HOURS=4
ADMIN_SECRET=<your-secret>
```

**Do NOT add:** `PYTHONPATH` or `DATABASE_URL`

---

## DNS

**CNAME Record:**
- Hostname: `marlizintel`
- Value: `<your-app>.ondigitalocean.app`
