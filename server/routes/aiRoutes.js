import auth from "../middleware/auth";
import aiService from "../services/aiService";
import express from 'express'

const router = express.Router()

router.post('/predict', auth, async(req,res) => {
    try { 

    const {playerFeatures} = req.body 

    const requiredFeatures = [
        'season_avg_points', 'season_avg_rebounds', 'season_avg_assists',
            'last_10_avg_points', 'last_5_avg_points', 'last_5_avg_rebounds',
            'last_5_avg_assists', 'home_vs_away', 'games_played', 'rest_days'
    ]

    const missingFeatures  = requiredFeatures.filter(feature => 
        playerFeatures[feature] === undefined || playerFeatures[feature] === null
    )

    if(missingFeatures.length > 0){
        return res.status(400).json({
            error: 'Missing required features',
            missing: missingFeatures
        })
    }

    const prediction = await aiService.predictPlayerStats(playerFeatures)
    await savePredictionToUser(req.user.id, prediction);

    res.json({
        success:true,
        prediction,
        user_id: req.user.id,
        timestamp: new Date()
    })

}catch(error) {
    console.error('Prediction route error:', error);
      res.status(500).json({ 
        error: 'Failed to get prediction',
        message: error.message 
      });
}

router.post('/batch', auth, async(req,res) => {
    try {
        const { playersData } = req.body;

            if (!Array.isArray(playersData) || playersData.length === 0) {
            return res.status(400).json({ error: 'playersData must be a non-empty array' });
        }

        const predictions = await aiService.batchPredict(playersData)

        res.json({
            success: true,
            predictions,
            user_id: req.user.id,
            timestamp: new Date() 
        })

    }catch(error) {
        console.log('Batch prediction error')
        res.status(500).json({
            error: 'Failed to get batch predictions',
            message: error.message
        })


    }

    router.get('/health', auth, async(req,res) => {
        try { 
        const health = await aiService.getMLserviceHealth()
        res.json(health)

        } catch(error){
            res.status(500).json({status:'error', "message":error.message})
        }
    })
})
})

export default router;