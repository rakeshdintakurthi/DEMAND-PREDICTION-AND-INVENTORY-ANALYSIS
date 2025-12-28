import pandas as pd
import numpy as np
from app.models.schemas import InventoryRequest, InventoryPlan

def calculate_inventory_metrics(request: InventoryRequest) -> list[InventoryPlan]:
    df = pd.DataFrame([d.dict() for d in request.data])
    
    # Ensure date is datetime
    df['date'] = pd.to_datetime(df['date'])
    
    # Group by product
    products = df['product'].unique()
    plans = []

    for product in products:
        if not product:
            continue
            
        p_df = df[df['product'] == product].sort_values('date')
        
        # Calculate daily usage statistics
        daily_usage = p_df['units_sold'].mean()
        std_dev_usage = p_df['units_sold'].std() if len(p_df) > 1 else 0
        
        # Service Level Z-score (approximate)
        # 0.95 -> 1.645
        z_score = 1.645 # Default for 95%
        
        # Safety Stock
        # SS = Z * std_dev * sqrt(lead_time)
        safety_stock = z_score * std_dev_usage * np.sqrt(request.lead_time)
        
        # Reorder Point
        # ROP = (Daily Usage * Lead Time) + Safety Stock
        reorder_point = (daily_usage * request.lead_time) + safety_stock
        
        # Determine Current Stock Status
        latest_inventory = p_df.iloc[-1]['inventory']
        status = "OK"
        if latest_inventory < reorder_point:
            status = "Low"
        if latest_inventory < safety_stock:
            status = "Critical"

        # Simple EOQ
        # EOQ = sqrt(2 * Demand * OrderCost / HoldingCost)
        # Annual Demand approx
        annual_demand = daily_usage * 365
        order_cost = 50 # Assumed fixed ordering cost
        eoq = np.sqrt((2 * annual_demand * order_cost) / request.holding_cost) if request.holding_cost > 0 else 0

        plan = InventoryPlan(
            product=product,
            reorder_point=round(reorder_point, 2),
            safety_stock=round(safety_stock, 2),
            current_stock_level=float(latest_inventory),
            current_stock_status=status,
            eoq=round(eoq, 2)
        )
        plans.append(plan)
        
    return plans
