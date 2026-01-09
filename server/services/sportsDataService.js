import axios from 'axios';

class SportsDataService {
  constructor() {
    this.nbaBaseURL = 'https://stats.nba.com/stats';
    this.headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://stats.nba.com/',
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive'
    };
  }

  async getTeams() {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/leaguedashteamstats`, {
        headers: this.headers,
        params: {
          Conference: '',
          DateFrom: '',
          DateTo: '',
          Division: '',
          GameScope: '',
          GameSegment: '',
          Height: '',
          LastNGames: 0,
          LeagueID: '00',
          Location: '',
          MeasureType: 'Base',
          Month: 0,
          OpponentTeamID: 0,
          Outcome: '',
          PORound: 0,
          PaceAdjust: 'N',
          PerMode: 'PerGame',
          Period: 0,
          PlayerExperience: '',
          PlayerPosition: '',
          PlusMinus: 'N',
          Rank: 'N',
          Season: '2024-25',
          SeasonSegment: '',
          SeasonType: 'Regular Season',
          ShotClockRange: '',
          StarterBench: '',
          TeamID: 0,
          TwoWay: 0,
          VsConference: '',
          VsDivision: ''
        }
      });
      
      return response.data.resultSets[0].rowSet;
    } catch (error) {
      console.error('Error fetching teams:', error.response?.status, error.message);
      throw new Error('Failed to fetch NBA teams');
    }
  }

  async getPlayers() {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/commonallplayers`, {
        headers: this.headers,
        params: {
          LeagueID: '00',
          Season: '2024-25',
          IsOnlyCurrentSeason: '1'
        }
      });
      
      return response.data.resultSets[0].rowSet;
    } catch (error) {
      console.error('Error fetching players:', error.response?.status, error.message);
      throw new Error('Failed to fetch NBA players');
    }
  }

  
  async getGamesByDate(date) {
    try {
      // Convert date to YYYY-MM-DD format if needed
      let gameDate;
      if (typeof date === 'string') {
        gameDate = date.replace(/-/g, ''); // Remove dashes for NBA API
      } else if (date instanceof Date) { // Checks whether date is an actual Date object.
        gameDate = date.toISOString().split('T')[0].replace(/-/g, '');
      } else {
        // Default to today
        gameDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      }

      const response = await axios.get(`${this.nbaBaseURL}/scoreboardV2`, {
        headers: this.headers,
        params: {
          DayOffset: 0,
          LeagueID: '00',
          gameDate: gameDate
        }
      });
      
      // Parse the games data
      const gameHeader = response.data.resultSets[0].rowSet;
      const lineScore = response.data.resultSets[1].rowSet;
      
      return {
        games: gameHeader,
        scores: lineScore,
        date: gameDate
      };
    } catch (error) {
      console.error('Error fetching games by date:', error.message);
      throw new Error('Failed to fetch NBA games');
    }
  }

  async searchPlayer(playerName) {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/commonallplayers`, {
        headers: this.headers,
        params: {
          LeagueID: '00',
          Season: '2024-25',
          IsOnlyCurrentSeason: '1'
        }
      });
      
      const allPlayers = response.data.resultSets[0].rowSet;
      
      // Search for players matching the name
      const searchResults = allPlayers.filter(playerRow => {
        const fullName = playerRow[2]; 
        return fullName && fullName.toLowerCase().includes(playerName.toLowerCase());
      });
      
      return searchResults;
    } catch (error) {
      console.error('Error searching player:', error.message);
      throw new Error('Failed to search NBA players');
    }
  }


  async getPlayerById(playerId) {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/commonplayerinfo`, {
        headers: this.headers,
        params: {
          PlayerID: playerId
        }
      });
      
      return response.data.resultSets[0].rowSet[0];
    } catch (error) {
      console.error('Error fetching player details:', error.message);
      throw new Error('Failed to fetch player details');
    }
  }


  async getPlayerStats(playerId, season = '2024-25') {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/playerdashboardbyyearoveryear`, {
        headers: this.headers,
        params: {
          PlayerID: playerId,
          PerMode: 'PerGame',
          Season: season,
          SeasonType: 'Regular Season'
        }
      });
      
      return response.data.resultSets[1].rowSet;
    } catch (error) {
      console.error('Error fetching player stats:', error.message);
      throw new Error('Failed to fetch player statistics');
    }
  }

  
  async getTeamSchedule(teamId, season = '2024-25') {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/teamgamelog`, {
        headers: this.headers,
        params: {
          TeamID: teamId,
          Season: season,
          SeasonType: 'Regular Season'
        }
      });
      
      return response.data.resultSets[0].rowSet;
    } catch (error) {
      console.error('Error fetching team schedule:', error.message);
      throw new Error('Failed to fetch team schedule');
    }
  }

  
  async getLiveGames() {
    try {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
      
      const response = await axios.get(`${this.nbaBaseURL}/scoreboardV2`, {
        headers: this.headers,
        params: {
          DayOffset: 0,
          LeagueID: '00',
          gameDate: today
        }
      });
      
      return {
        games: response.data.resultSets[0].rowSet,
        scores: response.data.resultSets[1].rowSet
      };
    } catch (error) {
      console.error('Error fetching live games:', error.message);
      throw new Error('Failed to fetch live games');
    }
  }

  
  async getStandings(season = '2024-25') {
    try {
      const response = await axios.get(`${this.nbaBaseURL}/leaguestandingsv3`, {
        headers: this.headers,
        params: {
          LeagueID: '00',
          Season: season,
          SeasonType: 'Regular Season'
        }
      });
      
      return response.data.resultSets[0].rowSet;
    } catch (error) {
      console.error('Error fetching standings:', error.message);
      throw new Error('Failed to fetch standings');
    }
  }

  // Keeping existing method for compatibility
  async getTodaysGames() {
    return this.getLiveGames();
  }
}

export default new SportsDataService();