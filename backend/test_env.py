import sys
print(f"Python executable: {sys.executable}")
try:
    import pandas as pd
    print("Pandas imported successfully")
except ImportError as e:
    print(f"Pandas import failed: {e}")

try:
    import openpyxl
    print("Openpyxl imported successfully")
except ImportError as e:
    print(f"Openpyxl import failed: {e}")

try:
    import multipart
    print("python-multipart imported successfully")
except ImportError as e:
    print(f"python-multipart import failed: {e}")
