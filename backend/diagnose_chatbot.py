import os, sys
from dotenv import load_dotenv
import google.generativeai as genai
import httpx

load_dotenv()
key = os.getenv("GOOGLE_API_KEY")
print(f"Key loaded: {key[:5]}... if valid")

if not key or "PASTE" in key:
    print("KEY_ERROR: GOOGLE_API_KEY is missing or placeholder in .env")
    sys.exit(1)

print("Testing Gemini API...")
try:
    genai.configure(api_key=key)
    model = genai.GenerativeModel('gemini-1.5-flash')
    # Try generating
    res = model.generate_content("Hello")
    print(f"API_SUCCESS: {res.text}")
except Exception as e:
    print(f"API_ERROR: {e}")

print("Testing Local Server...")
try:
    with httpx.Client() as c:
        r = c.post("http://localhost:8000/api/chat", json={"message":"Hi", "context":""})
        print(f"SERVER_STATUS: {r.status_code}")
        print(f"SERVER_RESPONSE: {r.text}")
except Exception as e:
    print(f"SERVER_ERROR: {e}")
