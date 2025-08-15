import express from 'express';
import predictionController from '../controllers/predictionController.js';
import auth from '../middleware/auth.js';

const router = express.Router()

//User predictions

router.post('/user', auth, predictionController.createUserPrediction)
router.get('/user/userId', predictionController.getUserPredictions)

//AI predictions

router.post('/ai', predictionController.createAIPrediction) // flask - API
router.get('/ai', predictionController.getAIPredictions)

//comparison and results

router.get('/compare/:gameId/:playerId',predictionController.comparePredictions)
router.put('/:id/result', auth, predictionController.updatePredictPredictions)