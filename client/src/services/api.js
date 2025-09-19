import axios from "axios"

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json' 
    }
}); 

api.interceptors.request.use((config) => {
    const token =localStorage.getItem('token')
    
    if(token) {
        config.headers.Authorization = `Bearers ${token}`
    }
    return config
})

export const apiService = {
  // Authentication
  login: (email, password) => api.post('/auth/login', { email, password }),
  signup: (userData) => api.post('/auth/register', userData),
  refreshToken: () => api.post('/auth/refresh'),
  
  // Games
  getTodaysGames: () => api.get('/games/today'),
  
  // Predictions
  getAIPredictions: (limit = 5) => api.get(`/predictions/ai?limit=${limit}`),
  createUserPrediction: (predictionData) => api.post('/predictions/user', predictionData),
  getUserPredictions: (userId) => api.get(`/predictions/user/${userId}`),
  getRecentPredictions: (limit = 10) => api.get(`/predictions/recent?limit=${limit}`),
  
  // Teams
  getStandings: (conference) => api.get(`/teams/standings/${conference}`),
  
  // Players
  getStatLeaders: (stat, limit = 5) => api.get(`/players/leaders/${stat}?limit=${limit}`),
  searchPlayers: (name) => api.get(`/players/search/${name}`),
  getPlayerStats: (playerId) => api.get(`/players/${playerId}/stats`),
  
  // Leaderboard
  getLeaderboard: (timeframe = 'weekly', limit = 10) => api.get(`/leaderboard?timeframe=${timeframe}&limit=${limit}`),
  
  // User stats
  getUserStats: (userId) => api.get(`/users/${userId}/stats`),
};

export default api; 