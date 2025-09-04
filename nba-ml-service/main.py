# main.py
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime
import os
from dotenv import load_dotenv
from services.data_collector import NBADataCollector

load_dotenv()

app = FastAPI(title="NBA ML Prediction Service", version="1.0.0")

# CORS for your Node.js backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize data collector
collector = NBADataCollector()

@app.get("/")
async def root():
    return {"message": "NBA ML Service is running", "timestamp": datetime.now()}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

@app.get("/collect-data/test")
async def test_data_collection():
    """Test endpoint to collect sample data from one season"""
    try:
        # Test with just 2023-24 season
        season_df = await collector.get_season_stats('2023-24')
        
        if season_df.empty:
            return {"error": "No data collected", "count": 0}
        
        # Process a small sample for testing
        sample_df = season_df.head(100)  # Just first 100 games
        training_df = collector.process_training_data(sample_df)
        
        return {
            "message": "Data collection test successful",
            "raw_games": len(season_df),
            "training_examples": len(training_df),
            "sample_features": list(training_df.columns) if not training_df.empty else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data collection failed: {str(e)}")

@app.get("/collect-data/full")
async def collect_full_dataset():
    """Collect training data from all seasons"""
    try:
        training_df = await collector.collect_all_seasons()
        
        # Save to CSV for now
        training_df.to_csv('nba_training_data.csv', index=False)
        
        return {
            "message": "Full dataset collection complete",
            "total_examples": len(training_df),
            "features": list(training_df.columns),
            "saved_to": "nba_training_data.csv"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full collection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)