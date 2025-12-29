import os
import json
from typing import List, Dict

NOTIFICATIONS_FILE = "notifications.json"
HISTORY_FILE = "history.json"
DATA_FILE = "sales_data.json"

def _read_json(filename: str) -> List[Dict]:
    """Generic helper to read JSON data."""
    if not os.path.exists(filename):
        return []
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading {filename}: {e}")
        return []

def _write_json(filename: str, data: List[Dict]):
    """Generic helper to write JSON data."""
    try:
        with open(filename, "w") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print(f"Error writing to {filename}: {e}")

def _read_data() -> List[Dict]:
    return _read_json(DATA_FILE)

def _write_data(data: List[Dict]):
    _write_json(DATA_FILE, data)

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
    Archies current data then deletes all records.
    """
    # Archive before clear is handled by explicit archive call now to be safe, 
    # or we can do it here. The user requested "When i cleared the data ,I alsowant it to save that data into history"
    # So we should probably force archive here.
    archive_current_data()
    _write_data([])
    return {"status": "success"}

# --- Notification System ---

def add_notification(title: str, message: str, type: str = 'info'):
    import datetime
    notifications = _read_json(NOTIFICATIONS_FILE)
    new_note = {
        "id": len(notifications) + 1,
        "title": title,
        "message": message,
        "type": type,
        "time": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "read": False
    }
    # Prepend to show newest first
    notifications.insert(0, new_note)
    # Keep last 50
    _write_json(NOTIFICATIONS_FILE, notifications[:50])

def get_notifications():
    return _read_json(NOTIFICATIONS_FILE)

def mark_notifications_read():
    notifications = _read_json(NOTIFICATIONS_FILE)
    for n in notifications:
        n['read'] = True
    _write_json(NOTIFICATIONS_FILE, notifications)

def clear_notifications():
    _write_json(NOTIFICATIONS_FILE, [])

# --- History / Archiving System ---

def archive_current_data():
    import datetime
    current_data = _read_data()
    if not current_data:
        return # Nothing to archive
        
    history = _read_json(HISTORY_FILE)
    
    # Create a summary batch
    batch_summary = {
        "id": len(history) + 1,
        "archived_at": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "record_count": len(current_data),
        "total_revenue": sum(float(r.get('price', 0)) * float(r.get('units_sold', 0)) for r in current_data),
        # Store a sample or the full file content reference?
        # For simplicity in this demo, we'll store the full data in a 'records' field 
        # but realistically this should go to a separate file per batch if large.
        "records": current_data 
    }
    
    history.insert(0, batch_summary)
    _write_json(HISTORY_FILE, history)

def get_archived_history():
    return _read_json(HISTORY_FILE)
