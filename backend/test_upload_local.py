import requests

url = "http://localhost:8000/api/upload"
files = {'file': ('test_data.csv', 'date,product,region,units_sold\n2023-01-01,Widget,North,100\n2023-01-02,Gadget,South,50')}

try:
    print(f"Sending POST request to {url}...")
    response = requests.post(url, files=files)
    print(f"Status Code: {response.status_code}")
    print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
