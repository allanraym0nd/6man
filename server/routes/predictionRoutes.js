// routes/predictions.js
import express from 'express';
import predictionController from '../controllers/predictionController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// User predictions

router.post('/user', auth, predictionController.createUserPrediction);
router.get('/user/:userId', predictionController.getUserPredictions);

// AI predictions  

router.post('/ai', predictionController.createAIPrediction); // For Flask API
router.get('/ai', predictionController.getAIPredictions);

// Comparison & results

router.get('/compare/:gameId/:playerId', predictionController.comparePredictions);
router.put('/:id/result', auth, predictionController.updatePredictionResult);

export default router;