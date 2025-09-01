import express from 'express'
import leaderBoardController from "../controllers/leaderboardController.js";
import auth from '../middleware/auth.js'

const router = express.Router();

// Public leaderboard routes

router.get('/global', leaderBoardController.getGlobalLeaderBoard);
// router.get('/weekly', leaderBoardController.getWeeklyLeaderBoard);
router.get('/league',leaderBoardController.getLeagueLeaderboard)
router.get('/user-vs-ai', leaderBoardController.getUserVsAILeaderboard);
router.get('/streaks', leaderBoardController.getPredictionStreaks);

// League-specific leaderboard (could be public or protected depending on league privacy)
router.get('/league/:leagueId', leaderBoardController.getLeagueLeaderboard);

export default router; 

