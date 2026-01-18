import pandas as pd
import os

file_path = "https___marlizintel.com_-Coverage-Validation-2026-01-18.xlsx"

try:
    xls = pd.ExcelFile(file_path)
    print(f"SHEET_NAMES: {xls.sheet_names}")
    
    # If there is a sheet named "Table" or similar, let's peek at it
    for sheet in xls.sheet_names:
        print(f"\n--- SNEAK PEEK: {sheet} ---")
        df = pd.read_excel(file_path, sheet_name=sheet, nrows=5)
        print(df.columns.tolist())
        print(df.head(2))

except Exception as e:
    print(e)
