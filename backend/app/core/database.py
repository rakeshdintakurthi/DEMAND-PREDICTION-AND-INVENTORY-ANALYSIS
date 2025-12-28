import os
import json
from typing import List, Dict

# Local file path for storing data
DATA_FILE = "sales_data.json"

def _read_data() -> List[Dict]:
    """Helper to read data from JSON file."""
    if not os.path.exists(DATA_FILE):
        return []
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {DATA_FILE}: {e}")
        return []

def _write_data(data: List[Dict]):
    """Helper to write data to JSON file."""
    try:
        with open(DATA_FILE, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing to {DATA_FILE}: {e}")

def insert_sales_data(new_records: List[Dict]):
    """
    Inserts a list of dictionary records into the local JSON store.
    """
    current_data = _read_data()
    
    # Assign Mock IDs if not present (DB usually does this)
    start_id = 1
    if current_data:
        # Find max id
        ids = [r.get('id', 0) for r in current_data if isinstance(r.get('id'), int)]
        if ids:
            start_id = max(ids) + 1
            
    for i, record in enumerate(new_records):
        if 'id' not in record:
            record['id'] = start_id + i
            
    # Append new data
    updated_data = current_data + new_records
    _write_data(updated_data)
    return {"status": "success", "count": len(new_records)}

def get_all_sales_data():
    """
    Fetches all records from local store.
    """
    return _read_data()

def get_recent_sales_data(limit: int = 100):
    """
    Fetches the most recent records, mimicking 'order via id desc'.
    """
    data = _read_data()
    # Sort by id desc (assuming id is added or just reverse list)
    # If ids are consistent, last added is last in list.
    data.reverse()
    return data[:limit]

def clear_sales_data():
    """
    Deletes all records.
    """
    _write_data([])
    return {"status": "success"}
