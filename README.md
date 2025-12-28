# AI-Driven Demand Forecasting & Inventory Intelligence Dashboard

A comprehensive full-stack application for demand forecasting and inventory planning, powered by AI (Facebook Prophet) and built with Modern React and FastAPI.

## Features

- **Interactive Dashboard**: KPI cards, revenue trends, and activity logs.
- **AI Forecasting**: Prophet-based time-series forecasting with confidence intervals.
- **Inventory Planning**: Automated Reorder Point (ROP) and Safety Stock calculations.
- **Data Upload**: CSV upload functionality for custom datasets.
- **Responsive UI**: Modern interface with Dark Mode support (via system/code).

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, Recharts, Lucide Icons, Shadcn/UI patterns.
- **Backend**: FastAPI, Pandas, Prophet (Time-series ML), Pydantic.
- **Deployment**: Vercel (Frontend), Render (Backend).

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # Mac/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the server:
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   Server will start at `http://localhost:8000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   App will start at `http://localhost:5173`.

## Usage

### 1. Login
- **Username**: `admin`
- **Password**: `admin`

### 2. Import Data (Critical First Step!)
- Go to the **Import Data** page.
- Upload `sample_data.xlsx` (found in the project root).
- *Note: If you encounter errors on the Dashboard, click "Clear Data & Reset" and then upload the file.*

### 3. Features
- **Dashboard**: View high-level metrics. Click "Regional Demand" to view the **Interactive India Map**.
- **Predictions**: View AI sales forecasts.
- **Inventory**: Check stock levels and restock recommendations.
- **Analysis**: Deep dive into individual product performance.

## Deployment

### Backend (Render)
- Connect repository to Render.
- Select "Web Service".
- Runtime: Python.
- Build Command: `pip install -r backend/requirements.txt`
- Start Command: `uvicorn backend.app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel)
- Connect repository to Vercel.
- Framework Preset: Vite.
- Build Command: `npm run build`
- Output Directory: `dist`
- Add Environment Variable (if needed): `VITE_API_URL` pointing to your Render backend URL. (Note: You may need to update `api.ts` to use this env var).

## License
MIT
