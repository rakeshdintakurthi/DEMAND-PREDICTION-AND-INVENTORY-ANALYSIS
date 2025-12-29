from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Demand Forecasting AI",
    description="Backend for AI-Driven Demand Forecasting & Inventory Intelligence Dashboard",
    version="1.0.0"
)

# Add Session Middleware for OAuth (Inner Middleware)
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "verify_random_secret_string")
app.add_middleware(SessionMiddleware, secret_key=SECRET_KEY)

# CORS Middleware (Outer Middleware - Must be added LAST to wrap everything)
# Allow all origins for demo deployment ease
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    # allow_origins=origins, # Wildcard * with credentials is not allowed by browsers
    allow_origin_regex="https?://.*", # Allow any http/https domain (Render, Vercel, Localhost)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Demand Forecasting AI Backend is Running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

from app.api.endpoints import router
from app.api.auth import router as auth_router

app.include_router(router, prefix="/api")
app.include_router(auth_router, prefix="/auth", tags=["auth"])
