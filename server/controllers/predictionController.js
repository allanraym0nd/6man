// controllers/predictionController.js
import Prediction from '../models/Prediction.js';
import User from '../models/User.js';
import CompetitionLeague from '../models/CompetitionLeague.js';
import LeagueMembership from '../models/LeagueMembership.js';

const predictionController = {
  // POST /api/predictions/user
  createUserPrediction: async (req, res) => {
    try {
      const { gameId, gameDate, player, predictions, competitionLeague } = req.body;
      const userId = req.user.id;

      // Verify league membership if league is specified
      if (competitionLeague) {
        const membership = await LeagueMembership.findOne({
          user: userId,
          competitionLeague: competitionLeague
        });

        if (!membership) {
          return res.status(403).json({ error: 'Not a member of this league' });
        }
      }

      
      const prediction = new Prediction({
        type: 'user',
        user: userId,
        competitionLeague,
        gameId,
        gameDate,
        player,
        predictions,
        status: 'pending'
      });

      await prediction.save();

      res.status(201).json({
        message: 'Prediction created successfully',
        prediction
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'You have already made a prediction for this player in this game' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/predictions/user/:userId 
  getUserPredictions: async (req, res) => {
    try {
      const { userId } = req.params;
      const { status, gameId, limit = 20 } = req.query;

      const filter = { user: userId, type: 'user' };
      if (status) filter.status = status;
      if (gameId) filter.gameId = gameId;

      const predictions = await Prediction.find(filter)
        .populate('competitionLeague', 'name')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        predictions,
        total: predictions.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/predictions/ai
  createAIPrediction: async (req, res) => {
    try {
      const { gameId, gameDate, player, predictions, aiModel, confidence } = req.body;

      const aiPrediction = new Prediction({
        type: 'ai',
        gameId,
        gameDate,
        player,
        predictions,
        aiModel,
        confidence,
        status: 'pending'
      });

      await aiPrediction.save();

      res.status(201).json({
        message: 'AI prediction created successfully',
        prediction: aiPrediction
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(400).json({ error: 'AI prediction already exists for this player in this game' });
      }
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/predictions/ai 
  getAIPredictions: async (req, res) => {
    try {
      const { gameId, aiModel, limit = 20 } = req.query;

      const filter = { type: 'ai' };
      if (gameId) filter.gameId = gameId;
      if (aiModel) filter.aiModel = aiModel;

      const predictions = await Prediction.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));

      res.json({
        predictions,
        total: predictions.length
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

    
      const userPrediction = await Prediction.findOne({
        type: 'user',
        user: userId,
        gameId: gameId,
        'player.id': playerId
      });

   
      const aiPrediction = await Prediction.findOne({
        type: 'ai',
        gameId: gameId,
        'player.id': playerId
      });

      if (!userPrediction && !aiPrediction) {
        return res.status(404).json({ error: 'No predictions found for this game/player combination' });
      }

      res.json({
        gameId,
        player: userPrediction?.player || aiPrediction?.player,
        userPrediction: userPrediction || null,
        aiPrediction: aiPrediction || null,
        comparison: userPrediction && aiPrediction ? {
          points: {
            user: userPrediction.predictions.points,
            ai: aiPrediction.predictions.points,
            difference: Math.abs(userPrediction.predictions.points - aiPrediction.predictions.points)
          },
          rebounds: {
            user: userPrediction.predictions.rebounds,
            ai: aiPrediction.predictions.rebounds,
            difference: Math.abs(userPrediction.predictions.rebounds - aiPrediction.predictions.rebounds)
          },
          assists: {
            user: userPrediction.predictions.assists,
            ai: aiPrediction.predictions.assists,
            difference: Math.abs(userPrediction.predictions.assists - aiPrediction.predictions.assists)
          }
        } : null
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PUT /api/predictions/:id/result 
  updatePredictionResult: async (req, res) => {
      try {
        const { id } = req.params;
        const { actualStats } = req.body;

        const prediction = await Prediction.findById(id);
        if (!prediction) {
          return res.status(404).json({ error: 'Prediction not found' });
        }

        // Helper function to calculate category score
        const calculateCategoryScore = (predicted, actual, weight, maxPoints = 10) => {
          const difference = Math.abs(predicted - actual);
          const score = weight * Math.max(0, maxPoints - difference);
          return parseFloat(score.toFixed(2));
        };

        // Calculate scores using the new system
        const pointsScore = calculateCategoryScore(
          prediction.predictions.points, 
          actualStats.points, 
          1.0
        );

        const reboundsScore = calculateCategoryScore(
          prediction.predictions.rebounds, 
          actualStats.rebounds, 
          0.8
        );

        const assistsScore = calculateCategoryScore(
          prediction.predictions.assists, 
          actualStats.assists, 
          0.7
        );

        const totalScore = pointsScore + reboundsScore + assistsScore;
        const maxPossibleScore = (1.0 * 10) + (0.8 * 10) + (0.7 * 10); // 25 points max

        // Store individual scores and overall accuracy
        const accuracy = {
          pointsAccuracy: pointsScore,
          reboundsAccuracy: reboundsScore, 
          assistsAccuracy: assistsScore,
          overallAccuracy: totalScore / maxPossibleScore // Percentage (0-1)
        };

        const pointsEarned = totalScore;

        // Update prediction
        const updatedPrediction = await Prediction.findByIdAndUpdate(
          id,
          {
            actualStats,
            accuracy,
            pointsEarned,
            status: 'completed'
          },
          { new: true }
        );

        res.json({
          message: 'Prediction result updated successfully',
          prediction: updatedPrediction,
          scoring: {
            pointsScore: pointsScore,
            reboundsScore: reboundsScore,
            assistsScore: assistsScore,
            totalScore: totalScore,
            maxPossible: maxPossibleScore,
            accuracy: (totalScore / maxPossibleScore * 100).toFixed(1) + '%'
          }
        });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    },

  // GET /api/predictions/game/:gameId 
  getGamePredictions: async (req, res) => {
    try {
      const { gameId } = req.params;
      const { type, playerId } = req.query;

      const filter = { gameId };
      if (type) filter.type = type;
      if (playerId) filter['player.id'] = playerId;

      const predictions = await Prediction.find(filter)
        .populate('user', 'username')
        .populate('competitionLeague', 'name')
        .sort({ createdAt: -1 });

      res.json({
        gameId,
        predictions,
        total: predictions.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE /api/predictions/:id - Delete a prediction (before game starts)
  deletePrediction: async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const prediction = await Prediction.findOne({ 
        _id: id, 
        user: userId,
        status: 'pending'
      });

      if (!prediction) {
        return res.status(404).json({ error: 'Prediction not found or cannot be deleted' });
      }

      await Prediction.findByIdAndDelete(id);

      res.json({
        message: 'Prediction deleted successfully'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default predictionController;