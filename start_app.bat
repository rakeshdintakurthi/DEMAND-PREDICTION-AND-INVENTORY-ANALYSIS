@echo off
echo ===================================================
echo   DemandAI Dashboard - Startup Script
echo ===================================================

echo [1/2] Starting Backend Server...
start "DemandAI Backend" cmd /k "cd backend && ..\.venv\Scripts\python.exe -m uvicorn app.main:app --reload"

echo [2/2] Starting Frontend...
start "DemandAI Frontend" cmd /k "cd frontend && npm install && npm run dev"

echo.
echo ===================================================
echo   App should be running at: http://localhost:5173 
echo   Backend is running at: http://localhost:8000
echo ===================================================
echo.
pause
