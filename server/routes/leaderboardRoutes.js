import express from 'express'
import leaderBoardController from "../controllers/leaderboardController.js";
import auth from '../middleware/auth.js'

const router = express.Router();

// Public leaderboard routes

router.get('/global', leaderBoardController.getGlobalLeaderboard);
router.get('/weekly', leaderBoardController.getWeeklyLeaderboard);
router.get('/user-vs-ai', leaderBoardController.getUserVsAILeaderboard);
router.get('/streaks', leaderBoardController.getPredictionStreaks);

// League-specific leaderboard (could be public or protected depending on league privacy)
router.get('/league/:leagueId', leaderboardController.getLeagueLeaderboard);

export default router; 

