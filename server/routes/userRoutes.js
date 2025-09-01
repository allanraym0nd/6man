import express from 'express'
import userController from '../controllers/userController.js'
import auth from '../middleware/auth.js'

const router = express.Router()

// all require authentication
router.get('/profile', auth, userController.getUserProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/stats', auth, userController.getUserStats);
router.get('/predictions', auth, userController.getPredictionHistory);
router.get('/performance', auth, userController.getPerformanceAnalytics);
// router.get('/leagues', auth, userController.getUserLeagues);
router.delete('/account', auth, userController.deleteAccount);

//Public route (for leaderboards, other users to see)
router.get('/:userId/public', userController.getPublicProfile)


export default router;