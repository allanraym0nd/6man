import express from 'express';
import playerController from '../controllers/playerController.js';
import auth from '../middleware/auth.js';
import { statsRateLimit } from '../middleware/rateLimiting.js';

const router = express.Router()

// Public player routes
router.get('/', playerController.getAllPlayers);
router.get('/search/:name', playerController.searchPlayer)
router.get('/team/:teamId', playerController.getTeamRoster);
router.get('/prediction-eligible', statsRateLimit, playerController.getPredictionEligiblePlayers);
router.get('/:playerId/stats', playerController.getPlayerStats);
router.get('/leaders/:stat', statsRateLimit, playerController.getStatLeaders);
router.get('/:playerId', playerController.getPlayerById);

// Admin/sync routes (protected)
router.post('/', auth, playerController.createOrUpdatePlayer);
router.put('/:playerId/stats', auth, playerController.updatePlayerStats);
router.put('/:playerId/status', auth, playerController.updatePlayerStatus);

export default router;

