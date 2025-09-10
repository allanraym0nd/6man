# services/ml_trainer.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os
from datetime import datetime

class NBAMLTrainer:
    def __init__(self):
        self.models = {
            'points': None,
            'rebounds': None,
            'assists': None
        }
        
        self.feature_columns = [
            'season_avg_points', 'season_avg_rebounds', 'season_avg_assists',
            'last_10_avg_points', 'last_5_avg_points', 
            'last_5_avg_rebounds', 'last_5_avg_assists',
            'home_vs_away', 'games_played', 'rest_days'
        ]
        
        self.target_columns = {
            'points': 'actual_points',
            'rebounds': 'actual_rebounds', 
            'assists': 'actual_assists'
        }
        
        self.model_params = {
            'n_estimators': 100,
            'max_depth': 10,
            'min_samples_split': 5,
            'min_samples_leaf': 2,
            'random_state': 42
        }

        self.model_metrics = {
        'points': None,
        'rebounds': None,
        'assists': None
    }
    
    def prepare_data(self, training_df):
        """Prepare features and targets for training"""
        print("Preparing training data...")
        
        # Clean the data
        clean_df = training_df.copy()
        
        # Remove any rows with missing values in key columns
        clean_df = clean_df.dropna(subset=self.feature_columns + list(self.target_columns.values()))
        
        # Remove outliers (e.g., games with 0 minutes or unrealistic stats)
        clean_df = clean_df[clean_df['actual_points'] <= 80]  # Max 80 points per game
        clean_df = clean_df[clean_df['actual_rebounds'] <= 30]  # Max 30 rebounds
        clean_df = clean_df[clean_df['actual_assists'] <= 25]   # Max 25 assists
        
        print(f"Clean dataset: {len(clean_df)} examples")
        return clean_df


    def train_models(self, training_df):
    
        print("Training Random Forest models...")
        
        clean_df = self.prepare_data(training_df)
        
        # Features (X)
        X = clean_df[self.feature_columns]
        
        results = {}
        
        for stat_name, target_col in self.target_columns.items():
            print(f"\nTraining {stat_name} model...")
            
            # Target (y)
            y = clean_df[target_col]
            
            # Train/test split
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Train Random Forest
            model = RandomForestRegressor(**self.model_params)
            model.fit(X_train, y_train)
            
            # Make predictions on test set
            y_pred = model.predict(X_test)
            
            # Calculate metrics
            mae = mean_absolute_error(y_test, y_pred)
            rmse = np.sqrt(mean_squared_error(y_test, y_pred))
            r2 = r2_score(y_test, y_pred)
            
            # Store model and results
            self.models[stat_name] = model
            
            # Store metrics in both places
            metric_data = {
                'mae': round(mae, 2),
                'rmse': round(rmse, 2),
                'r2': round(r2, 3),
                'train_samples': len(X_train),
                'test_samples': len(X_test)
            }
            
            results[stat_name] = metric_data  # For return value
            self.model_metrics[stat_name] = metric_data  # Store in class
            
            print(f"✅ {stat_name.title()} Model:")
            print(f"   - Mean Absolute Error: {mae:.2f}")
            print(f"   - Root Mean Square Error: {rmse:.2f}")  
            print(f"   - R² Score: {r2:.3f}")
            
            # Feature importance
            feature_importance = pd.DataFrame({
                'feature': self.feature_columns,
                'importance': model.feature_importances_
            }).sort_values('importance', ascending=False)
            
            print(f"   - Top 3 important features:")
            for _, row in feature_importance.head(3).iterrows():
                print(f"     • {row['feature']}: {row['importance']:.3f}")
        
        return results
    
     
    
    def save_models(self, filepath_prefix='nba_models'):
        """Save trained models to disk"""
        if not os.path.exists('models'):
            os.makedirs('models')
        
        saved_files = []
        
        for stat_name, model in self.models.items():
            if model is not None:
                filename = f"models/{filepath_prefix}_{stat_name}.joblib"
                joblib.dump(model, filename)
                saved_files.append(filename)
                print(f"✅ Saved {stat_name} model to {filename}")
        
        return saved_files
    
    def load_models(self, filepath_prefix='nba_models'):
        """Load trained models from disk"""
        loaded_files = []
        
        for stat_name in self.models.keys():
            filename = f"models/{filepath_prefix}_{stat_name}.joblib"
            if os.path.exists(filename):
                self.models[stat_name] = joblib.load(filename)
                loaded_files.append(filename)
                print(f"✅ Loaded {stat_name} model from {filename}")
            else:
                print(f"❌ Model file not found: {filename}")
        
        return loaded_files
    
    def predict(self, features_dict):
        """Make predictions for a single player/game"""
        # Convert features to the expected format
        feature_values = []
        for col in self.feature_columns:
            feature_values.append(features_dict.get(col, 0))
        
        features_array = np.array(feature_values).reshape(1, -1)
        
        predictions = {}
        
        for stat_name, model in self.models.items():
            if model is not None:
                pred = model.predict(features_array)[0]
                predictions[stat_name] = round(max(0, pred), 1)  # Ensure non-negative
            else:
                predictions[stat_name] = 0
        
        return predictions
    
    def get_feature_importance(self):
        """Get feature importance for all models"""
        importance_data = {}
        
        for stat_name, model in self.models.items():
            if model is not None:
                importance_data[stat_name] = {
                    'features': self.feature_columns,
                    'importances': model.feature_importances_.tolist()
                }
        
        return importance_data 


    def get_model_performance(self):
        """Get the actual trained model performance metrics"""
        return self.model_metrics