import Prediction from '../models/Prediction.js';
import CompetitionLeague from '../models/CompetitionLeague.js';
import LeagueMembership from '../models/LeagueMembership.js';

const predictionController = {
  // POST /api/predictions/user 
  createUserPrediction: async (req, res) => {
    try {
      const { competitionLeagueId, gameId, gameDate, player, predictions } = req.body;
      const userId = req.user.id;

      
      const membership = await LeagueMembership.findOne({
        user: userId,
        competitionLeague: competitionLeagueId,
        status: 'active'
      });

      if (!membership) {
        return res.status(403).json({ error: 'You are not a member of this league' });
      }

      // Check if prediction already exists

      const existingPrediction = await Prediction.findOne({
        type: 'user',
        user: userId,
        gameId,
        'player.id': player.id,
        competitionLeague: competitionLeagueId
      });

      if (existingPrediction) {
        return res.status(400).json({ error: 'Prediction already exists for this player in this game' });
      }

      // Check if game date is in the future (can't predict past games)
      const gameDateTime = new Date(gameDate);
      if (gameDateTime <= new Date()) {
        return res.status(400).json({ error: 'Cannot predict stats for games that have already started' });
      }

      // create prediction
      const prediction = new Prediction({
        type: 'user',
        user: userId,
        competitionLeague: competitionLeagueId,
        gameId,
        gameDate: gameDateTime,
        player,
        predictions
      });

      await prediction.save();

      // Update stats
      await CompetitionLeague.findByIdAndUpdate(competitionLeagueId, {
        $inc: { 'stats.totalPredictions': 1 }
      });

      await LeagueMembership.findOneAndUpdate(
        { user: userId, competitionLeague: competitionLeagueId },
        { $inc: { 'stats.predictions': 1 } }
      );

      res.status(201).json({
        message: 'User prediction created successfully',
        prediction
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/predictions/ai 
  createAIPrediction: async (req, res) => {
    try {
      const { gameId, gameDate, player, predictions, aiModel, confidence } = req.body;

      // Check if AI prediction exists for this player/game
      const existingPrediction = await Prediction.findOne({
        type: 'ai',
        gameId,
        'player.id': player.id
      });

      if (existingPrediction) {
        return res.status(400).json({ error: 'AI prediction already exists for this player in this game' });
      }

      // Create AI prediction
      const prediction = new Prediction({
        type: 'ai',
        gameId,
        gameDate: new Date(gameDate),
        player,
        predictions,
        aiModel,
        confidence
      });

      await prediction.save();

      res.status(201).json({
        message: 'AI prediction created successfully',
        prediction
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

// GET /api/predictions/ai 
getAIPredictions: async (req, res) => {
  try {
    const { gameId, playerId, date, limit = 20, page = 1 } = req.query;

    const filter = { type: 'ai' };
    if (gameId) filter.gameId = gameId;
    if (playerId) filter['player.id'] = playerId;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);
      filter.gameDate = { $gte: startDate, $lt: endDate };
    }

    const aiPredictions = await Prediction.find(filter)
      .sort({ gameDate: -1, confidence: -1 }) // highest confidence first
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Prediction.countDocuments(filter);

    res.json({
      aiPredictions,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

},


  // GET /api/predictions/compare/:gameId/:playerId 
  comparePredictions: async (req, res) => {
    try {
      const { gameId, playerId } = req.params;
      const { userId } = req.query;

      const filter = { gameId, 'player.id': playerId };

      
      const aiPrediction = await Prediction.findOne({ ...filter, type: 'ai' });

      
      let userPrediction = null;
      if (userId) {
        userPrediction = await Prediction.findOne({ 
          ...filter, 
          type: 'user', 
          user: userId 
        }).populate('user', 'username');
      }

      // Get all user predictions for this player/game (for comparison)
      const allUserPredictions = await Prediction.find({ 
        ...filter, 
        type: 'user' 
      }).populate('user', 'username');

      res.json({
        aiPrediction,
        userPrediction,
        allUserPredictions,
        comparison: aiPrediction && userPrediction ? {
          pointsDiff: Math.abs(aiPrediction.predictions.points - userPrediction.predictions.points),
          reboundsDiff: Math.abs(aiPrediction.predictions.rebounds - userPrediction.predictions.rebounds),
          assistsDiff: Math.abs(aiPrediction.predictions.assists - userPrediction.predictions.assists)
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/predictions/user/:userId 
  getUserPredictions: async (req, res) => {
    try {
      const userId = req.params.userId;
      const { leagueId, status, limit = 20, page = 1 } = req.query;

      const filter = { type: 'user', user: userId };
      if (leagueId) filter.competitionLeague = leagueId;  //  checks if a leagueId exists. If it does, it adds a new property to the filter object: competitionLeague
      if (status) filter.status = status; // this line adds a status property to the filter object if a status is provided. 


      const predictions = await Prediction.find(filter)
        .populate('competitionLeague', 'name')
        .sort({ gameDate: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      const total = await Prediction.countDocuments(filter);

      res.json({
        predictions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/predictions/:id/result - Update prediction with actual results
  updatePredictionResult: async (req, res) => {
    try {
      const predictionId = req.params.id;
      const { actualStats } = req.body;

      const prediction = await Prediction.findById(predictionId);
      if (!prediction) {
        return res.status(404).json({ error: 'Prediction not found' });
      }

      // Calculate accuracy
      const accuracy = {};
      const predictions = prediction.predictions;

      const pointsDiff = Math.abs(actualStats.points - predictions.points);
      accuracy.pointsAccuracy = Math.max(0, 100 - (pointsDiff * 10));

      const reboundsDiff = Math.abs(actualStats.rebounds - predictions.rebounds);
      accuracy.reboundsAccuracy = Math.max(0, 100 - (reboundsDiff * 15));

      const assistsDiff = Math.abs(actualStats.assists - predictions.assists);
      accuracy.assistsAccuracy = Math.max(0, 100 - (assistsDiff * 15));

      accuracy.overallAccuracy = (accuracy.pointsAccuracy + accuracy.reboundsAccuracy + accuracy.assistsAccuracy) / 3;

      const pointsEarned = Math.round(accuracy.overallAccuracy / 10);

      // Update prediction
      prediction.actualStats = actualStats;
      prediction.accuracy = accuracy;
      prediction.pointsEarned = pointsEarned;
      prediction.status = 'completed';

      await prediction.save();

      
      if (prediction.type === 'user') {
        await LeagueMembership.findOneAndUpdate(
          { user: prediction.user, competitionLeague: prediction.competitionLeague },
          { 
            $inc: { 
              'stats.correctPredictions': pointsEarned > 5 ? 1 : 0,
              'stats.points': pointsEarned
            }
          }
        );
      }

      res.json({
        message: 'Prediction result updated successfully',
        prediction
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default predictionController;