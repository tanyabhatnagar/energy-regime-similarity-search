import pandas as pd
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import select, delete
from datetime import timedelta
from sklearn.preprocessing import StandardScaler
from app.models.data_models import TimeSeriesData, Windows

def load_data(db: Session, filepath: str = None, use_default: bool = True):
    if use_default:
        # Generate some dummy data for example purposes if no file provided
        dates = pd.date_range(start='2020-01-01', periods=1000, freq='h')
        df = pd.DataFrame({
            'timestamp': dates,
            'load': np.random.normal(5000, 500, 1000),
            'solar': np.random.normal(1000, 200, 1000),
            'wind': np.random.normal(2000, 400, 1000)
        })
    else:
        df = pd.read_csv(filepath)
        
        # Rename standard OPS columns to internal names
        df = df.rename(columns={
            "utc_timestamp": "timestamp",
            "DE_load_actual_entsoe_transparency": "load",
            "DE_solar_generation_actual": "solar",
            "DE_wind_generation_actual": "wind"
        })
        
        # Strip all names to lowercase just in case the user named it Load, Solar, Wind
        df.rename(columns=lambda x: x.lower(), inplace=True)

        found_features = [c for c in ['load', 'solar', 'wind'] if c in df.columns]
        if not found_features:
            raise ValueError("CSV must contain at least one of these columns: load, solar, wind")
            
        keep_cols = ['timestamp'] + found_features if 'timestamp' in df.columns else found_features
        df = df[keep_cols]

        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
        df = df.ffill()
        df = df.dropna()

    # clear old data
    db.execute(delete(TimeSeriesData))
    db.commit()

    records = []
    for _, row in df.iterrows():
        for feature in ['load', 'solar', 'wind']:
            if feature in row:
                records.append(
                    TimeSeriesData(
                        timestamp=row['timestamp'],
                        value=row[feature],
                        feature_name=feature
                    )
                )
    
    # Chunk insert
    chunk_size = 5000
    for i in range(0, len(records), chunk_size):
        db.add_all(records[i:i+chunk_size])
        db.commit()

def preprocess_and_window(db: Session, window_size_hours: int = 24):
    # Fetch all data sorted by timestamp
    query = select(TimeSeriesData).order_by(TimeSeriesData.timestamp)
    results = db.execute(query).scalars().all()

    if not results:
        raise ValueError("No data found to preprocess.")

    # Pivot into DataFrame
    df = pd.DataFrame([{
        'timestamp': r.timestamp,
        'value': r.value,
        'feature_name': r.feature_name
    } for r in results])
    
    df_pivot = df.pivot_table(index='timestamp', columns='feature_name', values='value').dropna()

    # Scale the data
    scaler = StandardScaler()
    scaled_values = scaler.fit_transform(df_pivot)
    df_scaled = pd.DataFrame(scaled_values, index=df_pivot.index, columns=df_pivot.columns)

    # Windowing
    from app.models.data_models import Regimes, SimilarityResults
    db.execute(delete(SimilarityResults))
    db.execute(delete(Regimes))
    db.execute(delete(Windows))
    db.commit()

    window_records = []
    for i in range(len(df_scaled) - window_size_hours + 1):
        window_df = df_scaled.iloc[i:i + window_size_hours]
        start_time = window_df.index[0]
        end_time = window_df.index[-1]
        
        # Store as array of shaped features
        data_array = window_df.values.tolist()
        
        window_records.append(
            Windows(
                start_time=start_time,
                end_time=end_time,
                data=data_array
            )
        )

    chunk_size = 1000
    for i in range(0, len(window_records), chunk_size):
        db.add_all(window_records[i:i+chunk_size])
        db.commit()
