import pandas as pd
import sqlite3
import os
import sys
from urllib.parse import urlparse

# --- CONFIG ---
EXCEL_FILE = "https___marlizintel.com_-Coverage-Validation-2026-01-18.xlsx"
DB_PATHS = ["backend/cybersec_news.db", "cybersec_news.db"]

# --- FIND DATABASE ---
db_path = None
for p in DB_PATHS:
    if os.path.exists(p) and os.path.getsize(p) > 0:
        db_path = p
        break

if not db_path:
    print("❌ Critical: No database found.")
    sys.exit(1)

print(f"✅ Database: {db_path}")

# --- READ EXCEL ---
print(f"📂 Reading Excel: {EXCEL_FILE}...")
try:
    df = pd.read_excel(EXCEL_FILE, sheet_name="Table")
    urls = df.iloc[:, 0].tolist() # First column
    print(f"📊 Found {len(urls)} URLs to audit.")
except Exception as e:
    print(f"❌ Error reading Excel: {e}")
    sys.exit(1)

# --- AUDIT LOGIC ---
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

results = {
    "valid": [],
    "buried": [],
    "ghost": [],
    "conflict": [],  # Valid AND Buried (Bad state)
    "invalid_format": []
}

print("\n🚀 Starting Audit...")

for url in urls:
    if not isinstance(url, str):
        continue
        
    # extract slug
    # valid format: .../article/some-slug
    if "/article/" not in url:
        results["invalid_format"].append(url)
        continue
    
    parts = url.split("/article/")
    if len(parts) < 2:
        results["invalid_format"].append(url)
        continue
        
    slug = parts[1].strip().split('?')[0] # Remove query params
    
    # Check Tables
    cursor.execute("SELECT id FROM articles WHERE slug = ?", (slug,))
    is_live = cursor.fetchone() is not None
    
    cursor.execute("SELECT deleted_at FROM deleted_articles WHERE slug = ?", (slug,))
    is_buried = cursor.fetchone() is not None
    
    # Decision Matrix
    if is_live and is_buried:
        results["conflict"].append((slug, url))
    elif is_live:
        results["valid"].append((slug, url))
    elif is_buried:
        results["buried"].append((slug, url))
    else:
        results["ghost"].append((slug, url))

conn.close()

# --- REPORT GENERATION ---
report_file = "audit_results_FINAL.txt"
with open(report_file, "w", encoding="utf-8") as f:
    f.write(f"=== AUDIT REPORT (Total: {len(urls)}) ===\n")
    f.write(f"Database: {db_path}\n\n")
    
    f.write(f"✅ VALID ARTICLES (Status 200 - Should be Indexed): {len(results['valid'])}\n")
    for slug, url in results['valid']:
        f.write(f"   {url}\n")
        
    f.write(f"\n⚠️ CONFLICTS (Status 200 AND 410 - Need Fixing): {len(results['conflict'])}\n")
    for slug, url in results['conflict']:
        f.write(f"   {url}\n")

    f.write(f"\n👻 GHOSTS (Status 404 - Should be Buried): {len(results['ghost'])}\n")
    # Limit ghost output if huge, but list first 50
    for i, (slug, url) in enumerate(results['ghost']):
        if i < 100:
            f.write(f"   {url}\n")
    if len(results['ghost']) > 100:
        f.write(f"   ... and {len(results['ghost']) - 100} more.\n")

    f.write(f"\n⚰️ ALREADY BURIED (Status 410 - Ignore): {len(results['buried'])}\n")
    # f.write(f"   (List omitted for brevity)\n")

print(f"\n🏁 Audit Complete. Report saved to: {report_file}")
print("SUMMARY:")
print(f"   ✅ Valid: {len(results['valid'])}")
print(f"   ⚠️ Conflict: {len(results['conflict'])}")
print(f"   👻 Ghosts: {len(results['ghost'])}")
print(f"   ⚰️ Buried: {len(results['buried'])}")
