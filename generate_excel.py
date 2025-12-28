import pandas as pd
import numpy as np
from datetime import datetime, timedelta

# Settings
start_date = datetime(2024, 1, 1)
days = 90
products = ['Product-A', 'Product-B', 'Product-C', 'Product-D']
regions = ['North', 'South', 'East', 'West']

data = []

for i in range(days):
    current_date = start_date + timedelta(days=i)
    date_str = current_date.strftime('%Y-%m-%d')
    
    for product in products:
        # Simulate data
        region = np.random.choice(regions)
        
        # Base demand + random variation
        base_demand = 100 if product in ['Product-A', 'Product-B'] else 50
        units_sold = int(np.random.normal(base_demand, 20))
        units_sold = max(0, units_sold) # Ensure non-negative
        
        price = 45.00 if product == 'Product-A' else (120.00 if product == 'Product-B' else 85.50)
        
        # Inventory fluctuates
        inventory = np.random.randint(50, 500)
        
        data.append({
            'date': date_str,
            'product': product,
            'region': region,
            'units_sold': units_sold,
            'price': price,
            'inventory': inventory
        })

df = pd.DataFrame(data)

# Save to Excel
output_file = 'sample_data.xlsx'
df.to_excel(output_file, index=False)
print(f"Generated {output_file} with {len(df)} rows.")
