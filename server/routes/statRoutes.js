import express from 'express';
import statsController from '../controllers/statsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Public stats routes (platform insights)
router.get('/platform', statsController.getPlatformStats);
router.get('/prediction-trends', statsController.getPredictionTrends);
router.get('/user-vs-ai', statsController.getUserVsAIStats);
router.get('/league-impact', statsController.getLeagueImpactStats);
router.get('/prediction-difficulty', statsController.getPredictionDifficulty);

export default router;