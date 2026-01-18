import pandas as pd

FILE = "https___marlizintel.com_-Coverage-Validation-2026-01-18.xlsx"
try:
    df = pd.read_excel(FILE, sheet_name="Table")
    urls = df.iloc[:, 0].dropna().tolist()
    # Normalize
    clean_slugs = []
    for url in urls:
        if "/article/" in str(url):
            try:
                slug = str(url).split("/article/")[1].strip().split('?')[0]
                clean_slugs.append(slug)
            except:
                pass
    
    # Save to a .py format list we can paste
    with open("extracted_slugs.txt", "w", encoding="utf-8") as f:
        f.write("SLUG_LIST = [\n")
        for s in clean_slugs:
            f.write(f'    "{s}",\n')
        f.write("]\n")
        
    print(f"Extracted {len(clean_slugs)} slugs.")
    
except Exception as e:
    print(e)
