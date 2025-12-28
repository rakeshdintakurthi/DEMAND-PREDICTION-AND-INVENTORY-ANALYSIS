from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List
import pandas as pd
import io
from pydantic import BaseModel
from app.models.schemas import (
    ForecastRequest, ForecastResult, 
    InventoryRequest, InventoryPlan, 
    SalesDataPoint
)
from app.services.forecasting import generate_forecast
from app.services.inventory import calculate_inventory_metrics

from app.core.database import insert_sales_data, get_all_sales_data, clear_sales_data, get_recent_sales_data

router = APIRouter()

@router.get("/history", response_model=List[SalesDataPoint])
async def get_history_endpoint():
    try:
        data_dicts = get_recent_sales_data(limit=500) # Fetch last 500 records
        # Convert to Pydantic models
        # Note: If DB has extra fields like 'id' or 'created_at', SalesDataPoint will ignore them 
        # unless strict config is set. Pydantic V2 ignores extras by default. 
        # But wait, SalesDataPoint definition in schemas.py doesn't have id/created_at.
        # We should just map the fields we know.
        return [SalesDataPoint(**record) for record in data_dicts]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear-data", response_model=dict)
async def clear_data_endpoint():
    try:
        result = clear_sales_data()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload", response_model=dict)
async def upload_file(file: UploadFile = File(...)):
    if not (file.filename.endswith('.csv') or file.filename.endswith('.xlsx') or file.filename.endswith('.xls')):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a CSV or Excel file.")
    
    try:
        # Decode with sig to handle BOM if CSV, else read bytes for Excel
        contents = await file.read()
        if file.filename.endswith('.csv'):
            df = pd.read_csv(io.StringIO(contents.decode('utf-8-sig')))
        else:
            try:
                import openpyxl
            except ImportError:
                # Force install if missing (desperate measure for persistent error)
                import subprocess, sys
                subprocess.check_call([sys.executable, "-m", "pip", "install", "openpyxl"])
                import openpyxl
                
            df = pd.read_excel(io.BytesIO(contents))
        
        # Normalize columns (strip whitespace, lowercase)
        df.columns = df.columns.str.strip().str.lower()
        
        # Robust Column Mapping
        # target_col: [list of potential aliases]
        column_mapping = {
            'date': ['date', 'time', 'period', 'day', 'txn_date', 'transaction_date'],
            'product': ['product', 'item', 'sku', 'product_name', 'model', 'name'],
            'region': ['region', 'location', 'area', 'zone', 'city', 'state', 'country', 'store'],
            'units_sold': ['units_sold', 'units', 'sold', 'sales', 'quantity', 'qty', 'demand', 'volume'],
            'price': ['price', 'selling_price', 'unit_price', 'cost', 'amount', 'revenue', 'value'],
            'inventory': ['inventory', 'stock', 'stock_level', 'on_hand', 'qty_on_hand']
        }
        
        # Helper to find best match
        def find_col(df_cols, targets):
            for target in targets:
                for col in df_cols:
                    if target in col: # Loose containment match
                        return col
            return None

        # internal_name: matched_df_column
        final_cols = {}
        for target, aliases in column_mapping.items():
            match = find_col(df.columns, aliases)
            if match:
                final_cols[target] = match
        
        # Processing rows with robust defaults
        records = []
        today_str = pd.Timestamp.now().strftime('%Y-%m-%d')
        
        for _, row in df.iterrows():
            # Date
            date_col = final_cols.get('date')
            try:
                date_val = pd.to_datetime(row[date_col]).strftime('%Y-%m-%d') if date_col and pd.notna(row[date_col]) else today_str
            except:
                date_val = str(row[date_col]).strip() if date_col and pd.notna(row[date_col]) else today_str
            
            # Product
            prod_col = final_cols.get('product')
            prod_val = str(row[prod_col]).strip() if prod_col and pd.notna(row[prod_col]) else "Unknown Product"
            if prod_val == '' or prod_val.lower() == 'nan': prod_val = "Unknown Product"

            # Region
            reg_col = final_cols.get('region')
            reg_val = str(row[reg_col]).strip() if reg_col and pd.notna(row[reg_col]) else "Unknown Region"
            if reg_val == '' or reg_val.lower() == 'nan': reg_val = "Unknown Region"

            # Units Sold
            units_col = final_cols.get('units_sold')
            try:
                units_val = float(row[units_col]) if units_col and pd.notna(row[units_col]) else 0.0
            except:
                units_val = 0.0

            # Price
            price_col = final_cols.get('price')
            try:
                price_val = float(row[price_col]) if price_col and pd.notna(row[price_col]) else 0.0
            except:
                price_val = 0.0

            # Inventory
            inv_col = final_cols.get('inventory')
            try:
                inv_val = float(row[inv_col]) if inv_col and pd.notna(row[inv_col]) else 0.0
            except:
                inv_val = 0.0

            records.append({
                "date": date_val,
                "product": prod_val,
                "region": reg_val,
                "units_sold": units_val,
                "price": price_val,
                "inventory": inv_val
            })
        
        # Clear old data (optional strategy: clean slate on upload)
        try:
            clear_sales_data()
        except:
            pass # Ignore if clear fails (e.g. first run)

        # Insert into Supabase
        insert_sales_data(records)
            
        return {"message": "Data uploaded and saved to database successfully"}
        
    except Exception as e:
        import traceback
        error_msg = f"UPLOAD ERROR: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("backend_errors.log", "a") as f:
            f.write(error_msg + "\n----------------\n")
            
        raise HTTPException(status_code=500, detail=f"Error processing file: {str(e)}")

@router.post("/forecast", response_model=ForecastResult)
async def get_forecast(request: ForecastRequest):
    try:
        # Ignore request.data if it's empty, or fetch from DB
        # Since I am changing the frontend to NOT send data, I should fetch key data from DB here.
        # But wait, ForecastRequest model requires 'data'. I should check schemas.py.
        # For now, let's fetch data from DB and inject it.
        data_dicts = get_all_sales_data()
        data = [SalesDataPoint(**record) for record in data_dicts]
        
        # Create a new request object with the DB data
        # preserving context if passed (assuming request object still has context)
        # Note: If frontend sends empty data list, we replace it.
        request.data = data 
        
        return generate_forecast(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory", response_model=List[InventoryPlan])
async def get_inventory_plan(request: InventoryRequest):
    try:
        data_dicts = get_all_sales_data()
        data = [SalesDataPoint(**record) for record in data_dicts]
        request.data = data
        return calculate_inventory_metrics(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.models.schemas import DashboardStats
from app.services.dashboard import get_dashboard_stats

@router.get("/dashboard", response_model=DashboardStats) # Changed to GET
async def get_dashboard():
    try:
        data_dicts = get_all_sales_data()
        # Convert dicts back to Pydantic models for service layer
        data = [SalesDataPoint(**record) for record in data_dicts]
        return get_dashboard_stats(data)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.models.schemas import ProductStats
from app.services.dashboard import get_product_stats

@router.get("/product-stats", response_model=ProductStats) # Changed to GET
async def get_product_stats_endpoint(product_name: str):
    try:
        data_dicts = get_all_sales_data()
        data = [SalesDataPoint(**record) for record in data_dicts]
        return get_product_stats(data, product_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.models.schemas import LoginRequest, User

@router.post("/login", response_model=User)
async def login(credentials: LoginRequest):
    # Simple hardcoded check
    if credentials.username == "admin" and credentials.password == "admin":
        return User(username="admin", token="simulated-jwt-token-xyz-123")
    raise HTTPException(status_code=401, detail="Invalid credentials")

from app.models.schemas import ChatRequest
import os
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
model = None

try:
    import google.generativeai as genai
    if GOOGLE_API_KEY:
        genai.configure(api_key=GOOGLE_API_KEY)
        model = genai.GenerativeModel('gemini-flash-latest')
    else:
        print("WARNING: GOOGLE_API_KEY not found in .env. Chatbot will not work.")
except ImportError as e:
    print(f"WARNING: Could not import google.generativeai. Chatbot disabled. Error: {e}")
except Exception as e:
    print(f"WARNING: Error initializing Gemini: {e}")

@router.post("/chat")
async def chat_endpoint(request: ChatRequest):
    print("DEBUG: Chat endpoint called")
    if not model:
        print("DEBUG: Model is None")
        raise HTTPException(status_code=503, detail="Chatbot service is unavailable. Check server logs for API Key or Dependency issues.")
    
    try:
        print(f"DEBUG: Processing message: {request.message}")
        # Construct prompt with context
        system_prompt = (
            "You are an expert Supply Chain Analyst for the 'DemandAI' dashboard. "
            "Your behavior should be conversational and helpful.\n"
            "RULES:\n"
            "1. If the user sends a greeting (e.g., 'hi', 'hello'), respond politely effectively offering help, but DO NOT analyze the data yet.\n"
            "2. If the user asks a question about the data, use the [SALES DATA CONTEXT] to provide specific, numbers-driven insights.\n"
            "3. If the user asks a general question, provide professional supply chain advice.\n"
            "Keep answers concise."
        )
        full_prompt = f"{system_prompt}\n\n[SALES DATA CONTEXT]:\n{request.context}\n\n[USER QUESTION]:\n{request.message}"
        
        response = model.generate_content(full_prompt)
        print("DEBUG: Response generated successfully")
        return {"response": response.text}
    except Exception as e:
        print(f"DEBUG: Error generating content: {e}")
        raise HTTPException(status_code=500, detail=str(e))
