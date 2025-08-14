import competitionController from "../controllers/competitionController.js";
import express from 'express' 
import auth from '../middleware/auth.js'

const router = express.Router();

router.get('/', competitionController.getAllLeagues)

router.post('/',auth, competitionController.createLeague)

router.get('/:id', competitionController.getLeagueDetails)

router.post('/:id/join',auth, competitionController.joinLeague)

export default router;