import os
from dotenv import load_dotenv
import httpx
import json

load_dotenv()
api_key = os.getenv("GOOGLE_API_KEY")

print("--- Gemini API Diagnostic (List Models) ---")

if not api_key:
    print("ERROR: GOOGLE_API_KEY not found in .env file.")
else:
    print(f"API Key found (starts with: {api_key[:5]}...)")
    
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
    
    print(f"Fetching available models from: {url.split('?')[0]}...")
    
    try:
        response = httpx.get(url, timeout=10.0)
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            if 'models' in data:
                print("\nAVAILABLE MODELS:")
                for m in data['models']:
                    # Filter for generation models
                    if 'generateContent' in m.get('supportedGenerationMethods', []):
                        print(f"- {m['name'].replace('models/', '')}")
            else:
                print("No 'models' field in response.")
                print(json.dumps(data, indent=2))
        else:
            print("FAILED. Response:")
            print(response.text)
            
    except Exception as e:
        print(f"Network/Request Error: {e}")
