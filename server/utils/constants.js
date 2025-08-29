export const NBA_TEAMS = [
    {id:1, name:'Boston Celtics', abbreviation:'BOS', city:'Boston', conference:'Eastern', division: 'Atlantic'},
    { id: 2, name: 'Brooklyn Nets', abbreviation: 'BKN', city: 'Brooklyn', conference: 'Eastern', division: 'Atlantic' },
    { id: 3, name: 'New York Knicks', abbreviation: 'NYK', city: 'New York', conference: 'Eastern', division: 'Atlantic' },
    { id: 4, name: 'Philadelphia 76ers', abbreviation: 'PHI', city: 'Philadelphia', conference: 'Eastern', division: 'Atlantic' },
    { id: 5, name: 'Toronto Raptors', abbreviation: 'TOR', city: 'Toronto', conference: 'Eastern', division: 'Atlantic' },

    { id: 6, name: 'Chicago Bulls', abbreviation: 'CHI', city: 'Chicago', conference: 'Eastern', division: 'Central' },
    { id: 7, name: 'Cleveland Cavaliers', abbreviation: 'CLE', city: 'Cleveland', conference: 'Eastern', division: 'Central' },
    { id: 8, name: 'Detroit Pistons', abbreviation: 'DET', city: 'Detroit', conference: 'Eastern', division: 'Central' },
    { id: 9, name: 'Indiana Pacers', abbreviation: 'IND', city: 'Indiana', conference: 'Eastern', division: 'Central' },
    { id: 10, name: 'Milwaukee Bucks', abbreviation: 'MIL', city: 'Milwaukee', conference: 'Eastern', division: 'Central' },

  // Eastern Conference - Southeast Division
  { id: 11, name: 'Atlanta Hawks', abbreviation: 'ATL', city: 'Atlanta', conference: 'Eastern', division: 'Southeast' },
  { id: 12, name: 'Charlotte Hornets', abbreviation: 'CHA', city: 'Charlotte', conference: 'Eastern', division: 'Southeast' },
  { id: 13, name: 'Miami Heat', abbreviation: 'MIA', city: 'Miami', conference: 'Eastern', division: 'Southeast' },
  { id: 14, name: 'Orlando Magic', abbreviation: 'ORL', city: 'Orlando', conference: 'Eastern', division: 'Southeast' },
  { id: 15, name: 'Washington Wizards', abbreviation: 'WAS', city: 'Washington', conference: 'Eastern', division: 'Southeast' },

  // Western Conference - Northwest Division
  { id: 16, name: 'Denver Nuggets', abbreviation: 'DEN', city: 'Denver', conference: 'Western', division: 'Northwest' },
  { id: 17, name: 'Minnesota Timberwolves', abbreviation: 'MIN', city: 'Minnesota', conference: 'Western', division: 'Northwest' },
  { id: 18, name: 'Oklahoma City Thunder', abbreviation: 'OKC', city: 'Oklahoma City', conference: 'Western', division: 'Northwest' },
  { id: 19, name: 'Portland Trail Blazers', abbreviation: 'POR', city: 'Portland', conference: 'Western', division: 'Northwest' },
  { id: 20, name: 'Utah Jazz', abbreviation: 'UTA', city: 'Utah', conference: 'Western', division: 'Northwest' },

  // Western Conference - Pacific Division
  { id: 21, name: 'Golden State Warriors', abbreviation: 'GSW', city: 'Golden State', conference: 'Western', division: 'Pacific' },
  { id: 22, name: 'Los Angeles Clippers', abbreviation: 'LAC', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
  { id: 23, name: 'Los Angeles Lakers', abbreviation: 'LAL', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
  { id: 24, name: 'Phoenix Suns', abbreviation: 'PHX', city: 'Phoenix', conference: 'Western', division: 'Pacific' },
  { id: 25, name: 'Sacramento Kings', abbreviation: 'SAC', city: 'Sacramento', conference: 'Western', division: 'Pacific' },

  // Western Conference - Southwest Division
  { id: 26, name: 'Dallas Mavericks', abbreviation: 'DAL', city: 'Dallas', conference: 'Western', division: 'Southwest' },
  { id: 27, name: 'Houston Rockets', abbreviation: 'HOU', city: 'Houston', conference: 'Western', division: 'Southwest' },
  { id: 28, name: 'Memphis Grizzlies', abbreviation: 'MEM', city: 'Memphis', conference: 'Western', division: 'Southwest' },
  { id: 29, name: 'New Orleans Pelicans', abbreviation: 'NOP', city: 'New Orleans', conference: 'Western', division: 'Southwest' },
  { id: 30, name: 'San Antonio Spurs', abbreviation: 'SAS', city: 'San Antonio', conference: 'Western', division: 'Southwest' }


];

export const POSITIONS = ["PG", "SG", "SF", "PF", "C"]

export const POSITION_NAMES = {
  'PG': 'Point Guard',
  'SG': 'Shooting Guard', 
  'SF': 'Small Forward',
  'PF': 'Power Forward',
  'C': 'Center'
};

export const PREDICTION_LIMITS = {
  POINTS: { MIN: 0, MAX: 100 },
  REBOUNDS: { MIN: 0, MAX: 30 },
  ASSISTS: { MIN: 0, MAX: 25 },
  STEALS: { MIN: 0, MAX: 10 },
  BLOCKS: { MIN: 0, MAX: 15 },
  TURNOVERS: { MIN: 0, MAX: 15 },
  FIELD_GOAL_PCT: { MIN: 0, MAX: 1 },
  THREE_POINTERS: { MIN: 0, MAX: 20 }
};

export const SCORING_WEIGHTS = {
    POINTS: 1.0,
    REBOUNDS: 0.8,
    ASSISTS: 0.7
}

export const LEAGUE_TYPES = ['public', 'private'];
export const LEAGUE_STATUS = ['active', 'inactive', 'completed'];


export const ERROR_MESSAGES = {
  UNAUTHORIZED: 'Authentication required',
  FORBIDDEN: 'Access denied',
  NOT_FOUND: 'Resource not found',
  PREDICTION_EXISTS: 'You have already made a prediction for this player in this game',
  GAME_STARTED: 'Cannot make predictions after game has started',
  INVALID_PREDICTION: 'Prediction values are outside allowed ranges',
  LEAGUE_FULL: 'This league has reached maximum capacity',
  ALREADY_MEMBER: 'You are already a member of this league'
};

export const SUCCESS_MESSAGES = {
  PREDICTION_CREATED: 'Prediction saved successfully',
  LEAGUE_JOINED: 'Successfully joined the league',
  PROFILE_UPDATED: 'Profile updated successfully',
  PREDICTION_UPDATED: 'Prediction result updated successfully'
};

export const CACHE_KEYS = {
  LEADERBOARD_GLOBAL: 'leaderboard:global',
  TEAM_DATA: 'teams:all',
  TODAYS_GAMES: 'games:today',
  LEADERBOARD_LEAGUE: (leagueId) => `leaderboard:league:${leagueId}`,
  USER_STATS: (userId) => `stats:user:${userId}`,
  PLAYER_STATS: (playerId, gameId) => `stats:${playerId}:${gameId}`
};


export const CACHE_TTL = {
  LEADERBOARD: 300,     // 5 minutes
  USER_STATS: 600,      // 10 minutes
  TEAM_DATA: 86400,     // 24 hours
  GAMES: 1800,          // 30 minutes
  PLAYER_STATS: 3600    // 1 hour
};

