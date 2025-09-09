# services/data_collector.py
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import time
import asyncio

class NBADataCollector:
   def __init__(self):
       # Working NBA API endpoints
       self.base_url = "https://stats.nba.com/stats"
       self.headers = {
           'Host': 'stats.nba.com',
           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:72.0) Gecko/20100101 Firefox/72.0',
           'Accept': 'application/json, text/plain, */*',
           'Accept-Language': 'en-US,en;q=0.5',
           'Accept-Encoding': 'gzip, deflate, br',
           'x-nba-stats-origin': 'stats',
           'x-nba-stats-token': 'true',
           'Connection': 'keep-alive',
           'Referer': 'https://stats.nba.com/',
           'Pragma': 'no-cache',
           'Cache-Control': 'no-cache'
       }
       
       self.seasons = ['2023-24', '2022-23', '2021-22']
   
   async def test_nba_connection(self):
       """Test NBA API connection with working endpoint"""
       url = f"{self.base_url}/commonallplayers"
       
       params = {
           'LeagueID': '00',
           'Season': '2023-24',
           'IsOnlyCurrentSeason': '1'
       }
       
       try:
           print("Testing NBA API connection...")
           response = requests.get(url, headers=self.headers, params=params, timeout=30)
           
           if response.status_code == 200:
               data = response.json()
               print("NBA API is working!")
               
               # Handle different response formats
               if 'resultSets' in data:
                   rows = data['resultSets'][0]['rowSet']
                   headers = data['resultSets'][0]['headers']
               elif 'resultSet' in data:
                   rows = data['resultSet']['rowSet']
                   headers = data['resultSet']['headers']
               else:
                   return {"success": False, "error": "Unknown response format", "keys": list(data.keys())}
               
               return {
                   "success": True,
                   "players_found": len(rows),
                   "sample_player": rows[0] if rows else None,
                   "columns": headers
               }
           else:
               return {"success": False, "status": response.status_code}
               
       except Exception as e:
           return {"success": False, "error": str(e)}
   
   async def test_simple_endpoint(self):
       """Test with the simplest possible NBA endpoint"""
       url = f"{self.base_url}/commonallplayers"
       
       params = {
           'LeagueID': '00',
           'Season': '2023-24',
           'IsOnlyCurrentSeason': '1'
       }
       
       try:
           print("Testing simple endpoint...")
           response = requests.get(url, headers=self.headers, params=params, timeout=30)
           
           if response.status_code == 200:
               data = response.json()
               
               # Handle different response formats
               if 'resultSets' in data:
                   rows = data['resultSets'][0]['rowSet']
               else:
                   rows = data['resultSet']['rowSet']
                   
               return {
                   "success": True,
                   "endpoint": "commonallplayers",
                   "players_found": len(rows),
                   "sample_player": rows[0] if rows else None
               }
           else:
               return {
                   "success": False,
                   "endpoint": "commonallplayers", 
                   "status": response.status_code,
                   "error": response.text[:100]
               }
               
       except Exception as e:
           return {"success": False, "error": str(e)}
   
   async def get_season_player_stats(self, season):
       """Get player stats for a season using working endpoint"""
       print(f"Fetching player stats for {season}...")
       
       # First get all active players
       players_url = f"{self.base_url}/commonallplayers"
       players_params = {
           'LeagueID': '00',
           'Season': season,
           'IsOnlyCurrentSeason': '1'
       }
       
       try:
           # Get players list
           players_response = requests.get(players_url, headers=self.headers, params=players_params, timeout=30)
           
           if players_response.status_code != 200:
               print(f"Failed to get players: {players_response.status_code}")
               return pd.DataFrame()
               
           players_data = players_response.json()
           
           # Handle response format
           if 'resultSets' in players_data:
               player_rows = players_data['resultSets'][0]['rowSet']
               player_headers = players_data['resultSets'][0]['headers']
           else:
               player_rows = players_data['resultSet']['rowSet']
               player_headers = players_data['resultSet']['headers']
           
           players_df = pd.DataFrame(player_rows, columns=player_headers)
           print(f"Found {len(players_df)} players")
           
           # Now get season stats for these players
           stats_url = f"{self.base_url}/leaguedashplayerstats"
           stats_params = {
               'College': '',
               'Conference': '',
               'Country': '',
               'DateFrom': '',
               'DateTo': '',
               'Division': '',
               'DraftPick': '',
               'DraftYear': '',
               'GameScope': '',
               'GameSegment': '',
               'Height': '',
               'LastNGames': 0,
               'LeagueID': '00',
               'Location': '',
               'MeasureType': 'Base',
               'Month': 0,
               'OpponentTeamID': 0,
               'Outcome': '',
               'PORound': 0,
               'PaceAdjust': 'N',
               'PerMode': 'PerGame',
               'Period': 0,
               'PlayerExperience': '',
               'PlayerPosition': '',
               'PlusMinus': 'N',
               'Rank': 'N',
               'Season': season,
               'SeasonSegment': '',
               'SeasonType': 'Regular Season',
               'ShotClockRange': '',
               'StarterBench': '',
               'TeamID': 0,
               'TwoWay': 0,
               'VsConference': '',
               'VsDivision': '',
               'Weight': ''
           }
           
           await asyncio.sleep(1)  # Rate limiting
           
           stats_response = requests.get(stats_url, headers=self.headers, params=stats_params, timeout=30)
           
           if stats_response.status_code == 200:
               stats_data = stats_response.json()
               
               # Handle response format for stats
               if 'resultSets' in stats_data:
                   stats_rows = stats_data['resultSets'][0]['rowSet']
                   stats_headers = stats_data['resultSets'][0]['headers']
               else:
                   stats_rows = stats_data['resultSet']['rowSet'] 
                   stats_headers = stats_data['resultSet']['headers']
               
               stats_df = pd.DataFrame(stats_rows, columns=stats_headers)
               print(f"Got stats for {len(stats_df)} players in {season}")
               return stats_df
           else:
               print(f"Failed to get stats: {stats_response.status_code}")
               return pd.DataFrame()
               
       except Exception as e:
           print(f"Error getting season stats: {e}")
           return pd.DataFrame()
   
   async def get_player_game_logs(self, player_id, season):
       """Get actual game-by-game stats for a specific player"""
       url = f"{self.base_url}/playergamelog"
       
       params = {
           'PlayerID': player_id,
           'Season': season,
           'SeasonType': 'Regular Season',
           'LeagueID': '00'
       }
       
       try:
           response = requests.get(url, headers=self.headers, params=params, timeout=30)
           
           if response.status_code == 200:
               data = response.json()
               
               # Handle response format (like we learned from debugging)
               if 'resultSets' in data:
                   headers = data['resultSets'][0]['headers']
                   rows = data['resultSets'][0]['rowSet']
               elif 'resultSet' in data:
                   headers = data['resultSet']['headers']
                   rows = data['resultSet']['rowSet']
               else:
                   return pd.DataFrame()
               
               df = pd.DataFrame(rows, columns=headers)
               return df
           else:
               print(f"Failed to get game logs for player {player_id}: {response.status_code}")
               return pd.DataFrame()
               
       except Exception as e:
           print(f"Error getting game logs: {e}")
           return pd.DataFrame()
   
   async def collect_real_game_data(self, season, max_players=50):
    """Collect real game logs for top players"""
    print(f"Collecting real game data for {season}...")
    
    # First get player list
    season_df = await self.get_season_player_stats(season)
    
    if season_df.empty:
        return pd.DataFrame()
    
    # Filter to active players with significant stats
    active_players = season_df[
        (season_df['GP'] > 20) & 
        (season_df['PTS'] > 10)
    ].head(max_players)
    
    all_game_logs = []
    
    for _, player in active_players.iterrows():
        player_id = player['PLAYER_ID']
        player_name = player.get('PLAYER_NAME', 'Unknown')
        print(f"Getting games for {player_name} (ID: {player_id})...")
        
        # Get game logs for the player
        game_logs = await self.get_player_game_logs(player_id, season)
        
        if not game_logs.empty:
            # FIX: Add the PLAYER_ID to the game_logs DataFrame
            game_logs['PLAYER_ID'] = player_id
            all_game_logs.append(game_logs)
            print(f"  Found {len(game_logs)} games")
        else:
            print(f"  No games found")
        
        # Rate limiting - crucial for API stability
        await asyncio.sleep(1.5)
    
    if all_game_logs:
        combined_df = pd.concat(all_game_logs, ignore_index=True)
        print(f"Total game logs collected: {len(combined_df)}")
        return combined_df
    else:
        return pd.DataFrame()
   
   def process_training_data(self, season_df):
       """Convert real game logs into ML training format"""
       training_data = []
       
       for player_id in season_df['PLAYER_ID'].unique():
           player_games = season_df[season_df['PLAYER_ID'] == player_id].copy()
           
           # Sort by date to ensure chronological order
           if 'GAME_DATE' in player_games.columns:
               player_games = player_games.sort_values('GAME_DATE')
           
           if len(player_games) < 10:
               continue
           
           for i in range(10, len(player_games)):
               current_game = player_games.iloc[i]
               prev_games = player_games.iloc[:i]
               last_5 = player_games.iloc[i-5:i]
               last_10 = player_games.iloc[i-10:i]
               
               # Calculate rest days if possible
               rest_days = 1
               if 'GAME_DATE' in player_games.columns and i > 0:
                   try:
                       current_date = pd.to_datetime(current_game['GAME_DATE'])
                       prev_date = pd.to_datetime(player_games.iloc[i-1]['GAME_DATE'])
                       rest_days = (current_date - prev_date).days - 1
                       rest_days = max(0, min(rest_days, 7))  # Cap at 7 days
                   except:
                       rest_days = 1
               
               features = {
                   'player_id': player_id,
                   'season_avg_points': prev_games['PTS'].mean(),
                   'season_avg_rebounds': prev_games['REB'].mean(),
                   'season_avg_assists': prev_games['AST'].mean(),
                   'last_10_avg_points': last_10['PTS'].mean(),
                   'last_5_avg_points': last_5['PTS'].mean(),
                   'last_5_avg_rebounds': last_5['REB'].mean(),
                   'last_5_avg_assists': last_5['AST'].mean(),
                   'home_vs_away': 1 if '@' not in str(current_game.get('MATCHUP', '')) else 0,
                   'games_played': len(prev_games),
                   'rest_days': rest_days,
                   'actual_points': current_game['PTS'],
                   'actual_rebounds': current_game['REB'],
                   'actual_assists': current_game['AST']
               }
               
               training_data.append(features)
       
       return pd.DataFrame(training_data)
   
   def create_training_examples(self, player_stats_df):
       """Create synthetic training examples from season averages (fallback method)"""
       if player_stats_df.empty:
           return pd.DataFrame()
           
       training_data = []
       
       # Filter to players who actually played significant minutes
       active_players = player_stats_df[player_stats_df['GP'] > 10].copy()  # At least 10 games
       
       print(f"Creating synthetic training examples for {len(active_players)} active players...")
       
       for _, player in active_players.iterrows():
           try:
               player_id = player['PLAYER_ID']
               
               # Get stats safely
               season_avg_pts = float(player['PTS']) if pd.notna(player['PTS']) else 0
               season_avg_reb = float(player['REB']) if pd.notna(player['REB']) else 0
               season_avg_ast = float(player['AST']) if pd.notna(player['AST']) else 0
               games_played = int(player['GP']) if pd.notna(player['GP']) else 0
               
               # Skip players with very low stats (bench warmers)
               if season_avg_pts < 5 and season_avg_reb < 3 and season_avg_ast < 2:
                   continue
               
               # Create multiple training examples per player (simulate different game situations)
               num_examples = min(games_played - 10, 40)  # Up to 40 examples per player
               
               for game_num in range(10, 10 + num_examples):
                   # Simulate performance variation based on recent form
                   form_variation = np.random.normal(0, 0.15)  # 15% variation
                   
                   last_5_pts = max(0, season_avg_pts * (1 + form_variation))
                   last_10_pts = max(0, season_avg_pts * (1 + form_variation * 0.7))
                   
                   last_5_reb = max(0, season_avg_reb * (1 + form_variation))
                   last_5_ast = max(0, season_avg_ast * (1 + form_variation))
                   
                   # Actual game performance with realistic variance
                   game_variation = np.random.normal(0, 0.25)  # 25% game-to-game variation
                   
                   actual_pts = max(0, season_avg_pts * (1 + game_variation))
                   actual_reb = max(0, season_avg_reb * (1 + game_variation))
                   actual_ast = max(0, season_avg_ast * (1 + game_variation))
                   
                   training_data.append({
                       'player_id': int(player_id),
                       'season_avg_points': round(season_avg_pts, 1),
                       'season_avg_rebounds': round(season_avg_reb, 1),
                       'season_avg_assists': round(season_avg_ast, 1),
                       'last_10_avg_points': round(last_10_pts, 1),
                       'last_5_avg_points': round(last_5_pts, 1),
                       'last_5_avg_rebounds': round(last_5_reb, 1),
                       'last_5_avg_assists': round(last_5_ast, 1),
                       'home_vs_away': np.random.choice([0, 1]),
                       'games_played': game_num,
                       'rest_days': np.random.choice([0, 1, 1, 2, 3], p=[0.1, 0.4, 0.3, 0.15, 0.05]),
                       'actual_points': round(actual_pts, 1),
                       'actual_rebounds': round(actual_reb, 1),
                       'actual_assists': round(actual_ast, 1)
                   })
                   
           except Exception as e:
               print(f"Error processing player: {e}")
               continue
       
       df = pd.DataFrame(training_data)
       print(f"Created {len(df)} synthetic training examples")
       return df
   
   async def collect_all_seasons(self):
       """Collect training data from multiple seasons using synthetic approach"""
       all_training_data = []
       
       for season in self.seasons:
           print(f"\n--- Processing {season} ---")
           season_df = await self.get_season_player_stats(season)
           
           if not season_df.empty:
               training_df = self.create_training_examples(season_df)
               if not training_df.empty:
                   all_training_data.append(training_df)
                   print(f"{season}: {len(training_df)} training examples")
               else:
                   print(f"{season}: No training examples created")
           else:
               print(f"{season}: No data collected")
           
           # Rate limiting between seasons
           await asyncio.sleep(2)
       
       if all_training_data:
           final_df = pd.concat(all_training_data, ignore_index=True)
           print(f"\nTotal synthetic training examples: {len(final_df)}")
           return final_df
       else:
           print("No training data collected from any season")
           return pd.DataFrame()
   
   # Backwards compatibility methods
   async def get_season_stats(self, season):
       """Backwards compatibility method"""
       return await self.get_season_player_stats(season)