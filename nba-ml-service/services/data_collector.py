# services/data_collector.py
import requests
import pandas as pd
from datetime import datetime
import time
import asyncio

class NBADataCollector:
    def __init__(self):
        self.nba_base = "https://stats.nba.com/stats"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
            'Referer': 'https://www.nba.com/'
        }
        self.seasons = ['2020-21', '2021-22', '2022-23', '2023-24']
    
    async def get_season_stats(self, season):
        """Get all player game logs for a season"""
        print(f"Fetching data for {season}...")
        
        url = f"{self.nba_base}/leaguegamelog"
        params = {
            'Season': season,
            'SeasonType': 'Regular Season',
            'PlayerOrTeam': 'P',
            'Direction': 'DESC',
            'Sorter': 'DATE'
        }
        
        try:
            response = requests.get(url, headers=self.headers, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            headers = data['resultSets'][0]['headers'] # returns playerId , assists, points, rebounds etc as column names
            rows = data['resultSets'][0]['rowSet'] # returns actual data i.e. (a single player's game stats).
            
            df = pd.DataFrame(rows, columns=headers)
            print(f"Collected {len(df)} player games for {season}")
            return df
            
        except Exception as e:
            print(f"Error fetching {season}: {e}")
            return pd.DataFrame()
    
    def process_training_data(self, season_df):
        """Convert raw game logs into ML training format"""
        training_data = []
        
        for player_id in season_df['PLAYER_ID'].unique():
            player_games = season_df[season_df['PLAYER_ID'] == player_id].copy()
            player_games = player_games.sort_values('GAME_DATE')
            
            if len(player_games) < 10:
                continue
            
            for i in range(10, len(player_games)):
                # iloc[i] is a Pandas method for selecting data by its integer position.
                current_game = player_games.iloc[i] # This line selects the i-th row from the player_games DataFrame. This row represents the game you are trying to predict
                prev_games = player_games.iloc[:i]
                last_5 = player_games.iloc[i-5:i]
                last_10 = player_games.iloc[i-10:i] # previous 10 games
                
                features = {
                    'player_id': player_id,
                    'season_avg_points': prev_games['PTS'].mean(),
                    'season_avg_rebounds': prev_games['REB'].mean(), 
                    'season_avg_assists': prev_games['AST'].mean(),
                    'last_10_avg_points': last_10['PTS'].mean(),
                    'last_5_avg_points': last_5['PTS'].mean(),
                    'home_vs_away': 1 if '@' not in current_game['MATCHUP'] else 0,
                    'games_played': len(prev_games),
                    # targets
                    'actual_points': current_game['PTS'],
                    'actual_rebounds': current_game['REB'],
                    'actual_assists': current_game['AST']
                }
                
                training_data.append(features)
        
        return pd.DataFrame(training_data)
    
    async def collect_all_seasons(self):
        """Collect data from all seasons"""
        all_data = []
        
        for season in self.seasons:
            season_df = await self.get_season_stats(season)
            if not season_df.empty:
                training_df = self.process_training_data(season_df)
                all_data.append(training_df)
            
            await asyncio.sleep(2)  # Rate limiting

        return pd.concat(all_data, ignore_index=True) if all_data else pd.DataFrame()  

        
           