import express from 'express';
import gameController from '../controllers/gameController.js';
import auth from '../middleware/auth.js';
import game from '../models/game.js';

const router = express.Router();

//public game routes

router.get('/today', gameController.getTodaysGames);
router.get('/schedule', gameController.getSchedule);
router.get('/:gameId', gameController.getGameById);
router.get('/live', gameController.getLiveGames);
router.get('/predictions-active', gameController.getPredictionActiveGames);

// admin/sync routes
router.post('/', auth, gameController.createOrUpdateGame);
router.put('/:gameId/result', auth, gameController.updateGameResult);





export default router;
