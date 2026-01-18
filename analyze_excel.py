import pandas as pd
import os

file_path = "https___marlizintel.com_-Coverage-2026-01-18.xlsx"

if not os.path.exists(file_path):
    print(f"File not found: {file_path}")
    exit(1)

try:
    # Read the Excel file - getting all sheets
    xls = pd.ExcelFile(file_path)
    sheet_names = xls.sheet_names
    print(f"Found {len(sheet_names)} sheets: {sheet_names}\n")

    for sheet_name in sheet_names:
        print(f"--- ANALYZING SHEET: {sheet_name} ---")
        df = pd.read_excel(file_path, sheet_name=sheet_name)
        
        # Print basic info
        print(f"Rows: {len(df)}")
        print(f"Columns: {list(df.columns)}")
        
        # Print first few rows found
        print("\nHead Data:")
        print(df.head(10).to_string(index=False))
        
        # If there are status columns or reason columns, summarize them
        # Common GSC columns: 'Status', 'Reason', 'Validation'
        if 'Status' in df.columns:
            print("\nStatus Distribution:")
            print(df['Status'].value_counts())
            
        print("\n" + "="*50 + "\n")

except Exception as e:
    print(f"Error analyzing Excel file: {e}")
