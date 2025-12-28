import pandas as pd
from prophet import Prophet
from app.models.schemas import ForecastRequest, ForecastResult
import logging

logger = logging.getLogger(__name__)

def generate_forecast(request: ForecastRequest) -> ForecastResult:
    try:
        # Convert request data to DataFrame
        df = pd.DataFrame([d.dict() for d in request.data])
        
        # Prepare for Prophet (requires 'ds' and 'y' columns)
        df = df.rename(columns={'date': 'ds', 'units_sold': 'y'})
        df['ds'] = pd.to_datetime(df['ds'])
        
        # Aggregate by date if multiple entries per day exist
        df_agg = df.groupby('ds')['y'].sum().reset_index()

        if len(df_agg) < 5:
            # Not enough data for Prophet
            raise ValueError("Not enough data points for forecasting. Need at least 5 days.")

        # Initialize and fit model
        m = Prophet(yearly_seasonality=True, daily_seasonality=False)
        m.fit(df_agg)

        # Create future dataframe
        future = m.make_future_dataframe(periods=request.periods, freq=request.freq)
        
        # Predict
        forecast = m.predict(future)

        # Format result
        result = ForecastResult(
            ds=forecast['ds'].dt.strftime('%Y-%m-%d').tolist(),
            yhat=forecast['yhat'].fillna(0).tolist(),
            yhat_lower=forecast['yhat_lower'].fillna(0).tolist(),
            yhat_upper=forecast['yhat_upper'].fillna(0).tolist(),
            trend=forecast['trend'].tolist()
        )
        
        return result

    except Exception as e:
        logger.error(f"Forecasting error: {str(e)}")
        raise e
