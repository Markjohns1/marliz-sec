import pandas as pd
import os

file_path = "https___marlizintel.com_-Coverage-2026-01-18.xlsx"

try:
    xls = pd.ExcelFile(file_path)
    print(f"SHEET_NAMES: {xls.sheet_names}")
except Exception as e:
    print(e)
