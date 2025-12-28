import os
import sys

with open("debug_log.txt", "w") as f:
    f.write(f"Python Executable: {sys.executable}\n")

    try:
        from dotenv import load_dotenv
        load_dotenv()
        f.write("DOTENV loaded successfully.\n")
    except ImportError:
        f.write("ERROR: python-dotenv not installed.\n")

    api_key = os.getenv("GOOGLE_API_KEY")
    if api_key:
        if "your_api_key_here" in api_key:
             f.write("CRITICAL ERROR: user has NOT replaced the placeholder API key.\n")
        else:
             f.write(f"API Key found: {api_key[:4]}...{api_key[-4:]}\n")
    else:
        f.write("ERROR: GOOGLE_API_KEY not found in environment.\n")

    try:
        import google.generativeai as genai
        f.write("google.generativeai imported successfully.\n")
        
        if api_key and "your_api_key_here" not in api_key:
            genai.configure(api_key=api_key)
            
            f.write("Listing available models:\n")
            try:
                for m in genai.list_models():
                    if 'generateContent' in m.supported_generation_methods:
                         f.write(f"- {m.name}\n")
            except Exception as e:
                f.write(f"Error listing models: {e}\n")

            model = genai.GenerativeModel('gemini-flash-latest')
            f.write("Model configured. Attempting generation...\n")
            try:
                response = model.generate_content("Hello")
                f.write(f"Success! Response: {response.text}\n")
            except Exception as e:
                f.write(f"Generation Error: {e}\n")
    except ImportError:
        f.write("ERROR: google.generativeai not installed.\n")
    except Exception as e:
        f.write(f"Unexpected Error: {e}\n")
