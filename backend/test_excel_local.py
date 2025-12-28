import requests
import pandas as pd
import io

# Create a sample Excel file in memory
df = pd.DataFrame({
    'date': ['2023-01-01', '2023-01-02'],
    'product': ['ExcelWidget', 'ExcelGadget'],
    'region': ['East', 'West'],
    'units_sold': [10, 20]
})

output = io.BytesIO()
with pd.ExcelWriter(output, engine='openpyxl') as writer:
    df.to_excel(writer, index=False)
output.seek(0)

url = "http://localhost:8000/api/upload"
files = {'file': ('test_excel.xlsx', output, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')}

try:
    print(f"Sending Excel upload to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
