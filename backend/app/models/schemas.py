from pydantic import BaseModel
from typing import List, Optional, Any, Dict

class SalesDataPoint(BaseModel):
    date: str
    product: str
    region: str
    units_sold: float
    price: float = 0.0
    inventory: float = 0.0

class ForecastRequest(BaseModel):
    data: List[SalesDataPoint] = []
    periods: int = 30
    freq: str = "D"

class ForecastResult(BaseModel):
    ds: List[str]
    yhat: List[float]
    yhat_lower: List[float]
    yhat_upper: List[float]
    trend: List[float]

class InventoryRequest(BaseModel):
    data: List[SalesDataPoint] = []
    lead_time: int = 5 
    service_level: float = 0.95
    holding_cost: float = 0.2

class DashboardStats(BaseModel):
    total_revenue: float
    active_forecasts: int
    avg_accuracy: float
    stock_risk_count: int
    sales_trend: List[Dict[str, Any]] # e.g., [{'name': 'Mon', 'sales': 120, 'forecast': 130}]
    region_demand: List[Dict[str, Any]] # e.g., [{'region': 'North', 'demand': 500}]

class ProductStats(BaseModel):
    product: str
    total_revenue: float
    total_units: int
    current_stock: float
    stock_status: str
    daily_trend: List[Dict[str, Any]]
    regional_breakdown: List[Dict[str, Any]]

class LoginRequest(BaseModel):
    username: str
    password: str

class User(BaseModel):
    username: str
    token: str

class InventoryPlan(BaseModel):
    product: str
    reorder_point: float
    safety_stock: float
    current_stock_level: float = 0.0
    current_stock_status: str # "OK", "Low", "Critical" (simulated)
    eoq: float # Economic Order Quantity

class ChatRequest(BaseModel):
    message: str
    context: str = ""
