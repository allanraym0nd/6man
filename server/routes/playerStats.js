import express from 'express';
import playerStatsController from '../controllers/playerStatsController.js';
import auth from '../middleware/auth.js';

const router  = express.Router()

// Public stats routes
router.get('/player/:playerId', playerStatsController.getPlayerStats);
router.get('/player/:playerId/averages', playerStatsController.getPlayerAverages);
router.get('/player/:playerId/recent', playerStatsController.getRecentForm);
router.get('/player/:playerId/vs/:opponent', playerStatsController.getPlayerVsOpponent);
router.get('/game/:gameId', playerStatsController.getGameStats);
router.get('/leaders/:stat', playerStatsController.getGameLeaders);
router.get('/prediction-context/:playerId', playerStatsController.getPredictionContext);

// Admin/sync routes (protected)
router.post('/', auth, playerStatsController.createOrUpdatePlayerStats);

export default routes;

