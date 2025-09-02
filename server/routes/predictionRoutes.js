// routes/predictions.js
import express from 'express';
import predictionController from '../controllers/predictionController.js';
import auth from '../middleware/auth.js';
import validation from '../middleware/validation.js';

const router = express.Router();

// User predictions

router.post('/user', auth, validation.validatePrediction, predictionController.createUserPrediction);
router.get('/user/:userId', validation.validateObjectId('userId'), predictionController.getUserPredictions);

// AI predictions  

router.post('/ai', validation.validateAIPrediction, predictionController.createAIPrediction); // For Flask API
router.get('/ai', predictionController.getAIPredictions);

// Comparison & results

router.get('/compare/:gameId/:playerId', predictionController.comparePredictions);
router.put('/:id/result', validation.validateObjectId('id'), predictionController.updatePredictionResult);

router.get('/game/:gameId', predictionController.getGamePredictions);
router.delete('/:id', auth,validation.validateObjectId, predictionController.deletePrediction);

export default router;