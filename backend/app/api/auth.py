from fastapi import APIRouter, Request, HTTPException
from authlib.integrations.starlette_client import OAuth
from starlette.config import Config
from starlette.responses import RedirectResponse
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("WARNING: Google Client ID or Secret missing. OAuth will not work.")

# OAuth Configuration
oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

@router.get("/login")
async def login(request: Request):
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    
    redirect_uri = request.url_for('auth_callback')
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback")
async def auth_callback(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
        user = token.get('userinfo')
        if not user:
             # Sometimes user info is in 'id_token' claims
             user = await oauth.google.parse_id_token(request, token)

        # Store user in session
        request.session['user'] = dict(user)
        
        # Redirect to frontend dashboard
        return RedirectResponse(url='http://localhost:5173/')
    except Exception as e:
        print(f"OAuth Error: {e}")
        raise HTTPException(status_code=400, detail="Authentication failed")

@router.get("/me")
async def get_current_user(request: Request):
    user = request.session.get('user')
    if user:
        return user
    raise HTTPException(status_code=401, detail="Not authenticated")

@router.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url='http://localhost:5173/login')
