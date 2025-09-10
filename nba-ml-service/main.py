# main.py - Update the test endpoint
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
from datetime import datetime
import os
from dotenv import load_dotenv
from services.data_collector import NBADataCollector
from services.ml_trainer import NBAMLTrainer



load_dotenv()

app = FastAPI(title="NBA ML Prediction Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

collector = NBADataCollector()
trainer = NBAMLTrainer()

@app.get("/")
async def root():
    return {"message": "NBA ML Service is running", "timestamp": datetime.now()}

@app.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now()}

#added
@app.get("/debug/nba-connection")
async def debug_nba_connection():
    """Debug NBA API connection issues"""
    try:
        result = await collector.test_nba_connection()
        return {"debug_results": result}
    except Exception as e:
        return {"error": str(e), "details": "Failed to test NBA connection"}

# added
@app.get("/debug/simple-test")
async def test_simple_endpoint():
    """Test alternative NBA API endpoint"""
    try:
        result = await collector.test_simple_endpoint()
        return {"test_results": result}
    except Exception as e:
        return {"error": str(e)}

@app.get("/collect-data/test")
async def test_data_collection():
    """Test endpoint to collect sample data from one season"""
    try:
        # FIXED: Use the correct method name
        season_df = await collector.get_season_player_stats('2023-24')
        
        if season_df.empty:
            return {"error": "No data collected", "count": 0}
        
        # Create training examples from the season data
        training_df = collector.create_training_examples(season_df)
        
        return {
            "message": "Data collection test successful",
            "players_found": len(season_df),
            "training_examples": len(training_df),
            "sample_features": list(training_df.columns) if not training_df.empty else [],
            "sample_data": training_df.head(3).to_dict('records') if not training_df.empty else []
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Data collection failed: {str(e)}")

@app.get("/collect-data/full")
async def collect_full_dataset():
    """Collect training data from all seasons"""
    try:
        training_df = await collector.collect_all_seasons()
        
        if training_df.empty:
            return {"error": "No training data collected", "total_examples": 0}
        
        # Save to CSV
        training_df.to_csv('nba_training_data.csv', index=False)
        
        return {
            "message": "Full dataset collection complete",
            "total_examples": len(training_df),
            "features": list(training_df.columns),
            "saved_to": "nba_training_data.csv",
            "sample_data": training_df.head(5).to_dict('records')
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Full collection failed: {str(e)}")

# Add to main.py
@app.get("/collect-data/real-games")
async def collect_real_game_data():
    """Collect real game-by-game data instead of synthetic"""
    try:
        # Collect real game logs
        game_logs_df = await collector.collect_real_game_data('2023-24', max_players=30)
        
        if game_logs_df.empty:
            return {"error": "No game logs collected"}
        
        # Process into training format
        training_df = collector.process_training_data(game_logs_df)
        
        # Save the real data
        training_df.to_csv('real_nba_training_data.csv', index=False)
        
        return {
            "message": "Real game data collected successfully",
            "total_games": len(game_logs_df),
            "training_examples": len(training_df),
            "players_included": len(game_logs_df['PLAYER_ID'].unique()),
            "saved_to": "real_nba_training_data.csv"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Real data collection failed: {str(e)}")

@app.get("/train/real-models")
async def train_real_ml_models():
    """Train Random Forest models on real game data"""
    try:
        # Load the real training data
        if not os.path.exists('real_nba_training_data.csv'):
            return {"error": "Real training data not found. Run /collect-data/real-games first"}
        
        training_df = pd.read_csv('real_nba_training_data.csv')
        
        if training_df.empty:
            return {"error": "No training data available"}
        
        print(f"Training models on {len(training_df)} real examples...")
        
        # Train models
        results = trainer.train_models(training_df)
        
        # Save models with 'real' prefix to distinguish from synthetic
        saved_files = trainer.save_models('real_nba_models')
        
        return {
            "message": "Models trained successfully on real NBA data",
            "training_examples": len(training_df),
            "players_included": len(training_df['player_id'].unique()),
            "model_performance": results,
            "saved_models": saved_files,
            "data_type": "real_game_logs"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

# Add this endpoint to main.py to test predictions
@app.post("/predict")
async def make_prediction(features: dict):
    """Make predictions for a player"""
    try:
        if all(model is None for model in trainer.models.values()):
            trainer.load_models('real_nba_models')
        
        predictions = trainer.predict(features)
        performance = trainer.get_model_performance()
        
        return {
            "predictions": predictions,
            "model_performance": performance,  # Real metrics, not hardcoded
            "features_used": trainer.feature_columns
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/players/predict/{player_id}")
async def predict_for_player(player_id: int, home_game: bool = True, rest_days: int = 1):
    """Get predictions for a specific NBA player using their recent stats"""
    try:
        # Load models
        if all(model is None for model in trainer.models.values()):
            trainer.load_models('real_nba_models')
        
        # You'd need to fetch this player's actual stats from your database
        # For now, return a structured response
        return {
            "player_id": player_id,
            "predictions": {
                "points": 0,  # Will implement after connecting to your player database
                "rebounds": 0,
                "assists": 0
            },
            "confidence": "Based on recent performance",
            "last_updated": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/batch-predict")
async def batch_predict(players_data: list):
    """Predict stats for multiple players at once"""
    try:
        if all(model is None for model in trainer.models.values()):
            trainer.load_models('real_nba_models')
        
        results = []
        for player_features in players_data:
            predictions = trainer.predict(player_features)
            results.append({
                "player_id": player_features.get("player_id"),
                "predictions": predictions
            })
        
        return {"batch_predictions": results}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)