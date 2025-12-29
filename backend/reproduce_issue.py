
import sys
import os
import asyncio
from typing import List

# Mock environment
sys.path.append(os.getcwd())
os.environ["SECRET_KEY"] = "mock"

try:
    from app.core.database import get_all_sales_data, insert_sales_data, clear_sales_data
    from app.models.schemas import SalesDataPoint
    from app.services.dashboard import get_dashboard_stats
except ImportError as e:
    print(f"Import Error: {e}")
    sys.exit(1)

async def test_dashboard_flow():
    print("--- Testing Dashboard Flow ---")
    try:
        print("1. Fetching raw data from DB...")
        raw_data = get_all_sales_data()
        print(f"   Raw data count: {len(raw_data)}")
        if raw_data:
            print(f"   First record: {raw_data[0]}")
        
        print("2. Converting to Pydantic models...")
        # valid_records = []
        # for i, r in enumerate(raw_data):
        #     try:
        #         valid_records.append(SalesDataPoint(**r))
        #     except Exception as e:
        #         print(f"   Validation failed for record {i}: {e}")
        #         # Continue to see if this is the breaker
        
        # In endpoints.py line 198: 
        # data = [SalesDataPoint(**record) for record in data_dicts]
        # This will crash if ONE record is invalid.
        data = [SalesDataPoint(**record) for record in raw_data]
        print(f"   Converted {len(data)} items successfully.")
        
        print("3. Calling get_dashboard_stats...")
        stats = get_dashboard_stats(data)
        print("   Success!")
        print(stats)
        
    except Exception as e:
        print("\n!!! CRITICAL FAILURE !!!")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_dashboard_flow())
