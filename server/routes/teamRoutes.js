// import express from 'express';
// import teamController from '../controllers/teamController.js';
// import auth from '../middleware/auth.js';

// const router = express.Router()

// // Public team Routes
// router.get('/', teamController.getAllTeams);
// router.get('/:teamId', teamController.getTeamById);
// router.get('/standings/:conference', teamController.getStandings);
// router.get('/division/:division', teamController.getDivisionStandings);
// router.get('/:teamId/stats', teamController.getTeamStats);

// //Admin/sync routes
// router.post('/', auth, teamController.createOrUpdateTeam);
// router.put('/:teamId/record', auth, teamController.updateTeamRecord);
// router.put('/:teamId/stats', auth, teamController.updateTeamStats);

// export default router;