import pandas as pd
import numpy as np
from app.models.schemas import SalesDataPoint, DashboardStats
from typing import List

def get_dashboard_stats(data: List[SalesDataPoint]) -> DashboardStats:
    if not data:
        return DashboardStats(
            total_revenue=0,
            active_forecasts=0,
            avg_accuracy=0,
            stock_risk_count=0,
            sales_trend=[],
            region_demand=[]
        )

    df = pd.DataFrame([d.dict() for d in data])
    df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce').fillna(0)
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
    df['inventory'] = pd.to_numeric(df['inventory'], errors='coerce').fillna(0)
    df['revenue'] = df['units_sold'] * df['price']

    # 1. Total Revenue
    total_revenue = df['revenue'].sum()

    # 2. Active Forecasts (Unique Products)
    active_forecasts = df['product'].nunique()

    # 3. Avg Accuracy (Mocked for now as we don't have historical ground truth vs forecast yet)
    # We can calculate "Forecastability" based on variance, or just return a placeholder based on data quality
    avg_accuracy = 94.2 # Placeholder

    # 4. Stock Risk (Items with low inventory)
    # Define a simple threshold or use detailed logic if needed. 
    # Here checking last inventory status per product.
    latest_inventory = df.sort_values('date').groupby('product').tail(1)
    
    # Assume arbitrary safety stock threshold if not defined, e.g., < 150 units for demo purposes
    stock_risk_count = len(latest_inventory[latest_inventory['inventory'] < 150])

    # 5. Sales Trend (Aggregated by Date)
    # Group by date and sum units_sold and revenue
    # Limiting to last 7-10 periods for the chart if data is large, or just daily freq
    df['date'] = pd.to_datetime(df['date'])
    daily_sales = df.groupby('date')[['units_sold', 'revenue']].sum().reset_index()
    
    # Sort and take last 30 days max for clarity
    daily_sales = daily_sales.sort_values('date')
    
    # We need 'sales' and 'forecast' for the chart. 
    # Since we can't run the full forecast model here instantly for every request, 
    # we will return the ACTUAL sales as 'sales', and a mocked 'forecast' line that is just smoothed or shifted sales 
    # to demonstrate the UI. Real app would pull stored forecasts.
    
    sales_trend = []
    for i, row in daily_sales.iterrows():
        sales_val = row['revenue'] # Chart shows Revenue or Units? Dashboard says "Sales vs Forecast", let's use Revenue ($)
        # Mock forecast as slightly different
        forecast_val = sales_val * (1 + (np.random.rand() - 0.5) * 0.2) 
        
        sales_trend.append({
            'name': row['date'].strftime('%b %d'),
            'sales': round(sales_val, 2),
            'forecast': round(forecast_val, 2)
        })

    # 6. Regional Demand with Product Breakdown
    regional_group = df.groupby(['region', 'product'])['units_sold'].sum().reset_index()
    
    region_demand = []
    for region_name, group in regional_group.groupby('region'):
        total_region_demand = group['units_sold'].sum()
        products_list = []
        for _, row in group.iterrows():
            if row['units_sold'] > 0:
                products_list.append({
                    'product': row['product'],
                    'units': int(row['units_sold'])
                })
        # Sort products by units sold
        products_list.sort(key=lambda x: x['units'], reverse=True)
        
        region_demand.append({
            'region': region_name, 
            'demand': int(total_region_demand),
            'products': products_list
        })

    # Sort by demand desc
    region_demand.sort(key=lambda x: x['demand'], reverse=True)

    return DashboardStats(
        total_revenue=round(total_revenue, 2),
        active_forecasts=active_forecasts,
        avg_accuracy=avg_accuracy,
        stock_risk_count=stock_risk_count,
        sales_trend=sales_trend,
        region_demand=region_demand
    )

from app.models.schemas import ProductStats

def get_product_stats(data: List[SalesDataPoint], product_name: str) -> ProductStats:
    df = pd.DataFrame([d.dict() for d in data])
    # Filter for product
    df = df[df['product'] == product_name].copy()
    
    if df.empty:
        return ProductStats(
            product=product_name,
            total_revenue=0,
            total_units=0,
            current_stock=0,
            stock_status="Unknown",
            daily_trend=[],
            regional_breakdown=[]
        )

    # Convert types
    df['units_sold'] = pd.to_numeric(df['units_sold'], errors='coerce').fillna(0)
    df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
    df['inventory'] = pd.to_numeric(df['inventory'], errors='coerce').fillna(0)
    df['revenue'] = df['units_sold'] * df['price']
    df['date'] = pd.to_datetime(df['date'])
    
    # Metrics
    total_revenue = df['revenue'].sum()
    total_units = df['units_sold'].sum()
    
    latest_record = df.sort_values('date').iloc[-1]
    current_stock = latest_record['inventory']
    
    # Simple status logic
    stock_status = "Good"
    if current_stock < 50: # Using same simplified logic or could re-use inventory service logic
        stock_status = "Critical"
    elif current_stock < 150:
        stock_status = "Low"
        
    # Daily Trend
    daily = df.groupby('date')[['units_sold', 'revenue']].sum().reset_index().sort_values('date')
    daily_trend = []
    for _, row in daily.iterrows():
        daily_trend.append({
            'date': row['date'].strftime('%Y-%m-%d'),
            'sales': float(row['revenue']),
            'units': int(row['units_sold'])
        })
        
    # Regional Breakdown
    regional = df.groupby('region')['units_sold'].sum().reset_index()
    regional_breakdown = [
        {'region': r['region'], 'units': int(r['units_sold'])}
        for _, r in regional.iterrows()
    ]
    
    return ProductStats(
        product=product_name,
        total_revenue=round(total_revenue, 2),
        total_units=int(total_units),
        current_stock=float(current_stock),
        stock_status=stock_status,
        daily_trend=daily_trend,
        regional_breakdown=regional_breakdown
    )
