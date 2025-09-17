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

  createAIPrediction: async(req,res) => {
    try {
      const {gameId, gameDate, playerId, aiModel = "random_forest"} = req.body
      
      contextResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/playerstats/prediction-context/${playerId}`, {
        params: {gameId}
      });

      const {player, recentForm, seasonAverages} = contextResponse.data

      if(!player || !seasonAverages) {
        res.status(400).json({ error: 'Insufficient player data for prediction' })
      }

      const playerFeatures = { 

        player_id: parseInt(playerId),
        season_avg_points: seasonAverages.points || 0,
        season_avg_rebounds: seasonAverages.rebounds || 0,
        season_avg_assists: seasonAverages.assists || 0,
        season_avg_minutes: seasonAverages.minutes || 0,
        games_played: seasonAverages.gamesPlayed || 0,

        recent_points: recentForm.points > 0 ?
          recentForm.reduce((sum,game) => sum + game.stats.points, 0)/ recentForm.length : seasonAverages.points,
        recent_rebounds: recentForm.length > 0 ?
          recentForm.reduce((sum, game) => sum + game.stats.rebounds, 0) / recentForm.length : seasonAverages.rebounds,
        recent_assists: recentForm.length > 0 ?
          recentForm.reduce((sum, game) => sum + game.stats.assists, 0) / recentForm.length : seasonAverages.assists,

        home_game: true,
        rest_days: 1,

        position: player.position || 'F',
        team: player.team?.abbreviation || 'UNK'  

      }

      const mlService = await aiService.predictPlayerService(playerFeatures)
      const {predictions: mlPrediction, model_performance} = req.body 

      const aiPrediction = new Prediction({
        type:'ai',
        gameId, 
        gameDate, 
        player: {
          id: playerId,
          name: player.fullName,
          team: player.team
        },
        predictions: {
          points: Math.round(mlPrediction.points * 10) / 10,
          rebounds: Math.round(mlPrediction.rebounds * 10) / 10,
          assists: Math.round(mlPrediction.assists * 10) / 10
        },
        aiModel,
        confidence: model_performance || 0.85,
        metadata: {
          playerFeatures,
          modelPerformance: model_performance
        },
         status: 'pending'
      })

      await Prediction.save()

      res.status(201).json({
        message: 'Ai prediction generated successfully',
        prediction:aiPrediction,
        modelConfidence: model_performance
      })

    }catch(error) {
       console.error('AI Prediction Error:', error.message);
        if (error.code === 11000) {
        return res.status(400).json({ error: 'AI prediction already exists for this player in this game' });
      }
      res.status(500).json({ error: 'Failed to generate AI prediction: ' + error.message });
    }
  },


    // POST /api/predictions/ai/batch - Generate predictions for multiple players
  generateBatchAIPredictions: async (req, res) => {
    try {
      const { gameId, gameDate, playerIds } = req.body;
      
      if (!playerIds || !Array.isArray(playerIds) || playerIds.length === 0) {
        return res.status(400).json({ error: 'playerIds array is required' });
      }

      const predictions = [];
      const playersData = [];

      // Gather data for all players
      for (const playerId of playerIds) {
        try {
          const contextResponse = await axios.get(`http://localhost:${process.env.PORT || 5000}/api/playerstats/prediction-context/${playerId}`, {
            params: { gameId }
          });

          const { player, recentForm, seasonAverages } = contextResponse.data;
          
          if (player && seasonAverages) {
            playersData.push({
              player_id: parseInt(playerId),
              player,
              season_avg_points: seasonAverages.points || 0,
              season_avg_rebounds: seasonAverages.rebounds || 0,
              season_avg_assists: seasonAverages.assists || 0,
              recent_points: recentForm.length > 0 ? 
                recentForm.reduce((sum, game) => sum + game.stats.points, 0) / recentForm.length : seasonAverages.points,
              recent_rebounds: recentForm.length > 0 ?
                recentForm.reduce((sum, game) => sum + game.stats.rebounds, 0) / recentForm.length : seasonAverages.rebounds,
              recent_assists: recentForm.length > 0 ?
                recentForm.reduce((sum, game) => sum + game.stats.assists, 0) / recentForm.length : seasonAverages.assists,
              home_game: true,
              rest_days: 1
            });
          }
        } catch (playerError) {
          console.error(`Failed to get context for player ${playerId}:`, playerError.message);
        }
      }

      if (playersData.length === 0) {
        return res.status(400).json({ error: 'No valid player data found' });
      }

      // Call batch prediction
      const batchResponse = await aiService.batchPredict(playersData);
      
      // Save all predictions
      for (const result of batchResponse.batch_predictions) {
        const playerData = playersData.find(p => p.player_id === result.player_id);
        
        if (playerData && result.predictions) {
          const aiPrediction = new Prediction({
            type: 'ai',
            gameId,
            gameDate,
            player: {
              id: result.player_id.toString(),
              name: playerData.player.fullName,
              team: playerData.player.team
            },
            predictions: {
              points: Math.round(result.predictions.points * 10) / 10,
              rebounds: Math.round(result.predictions.rebounds * 10) / 10,
              assists: Math.round(result.predictions.assists * 10) / 10
            },
            aiModel: 'random_forest',
            confidence: 0.85,
            status: 'pending'
          });

          await aiPrediction.save();
          predictions.push(aiPrediction);
        }
      }

      res.status(201).json({
        message: `Generated ${predictions.length} AI predictions`,
        predictions,
        playersProcessed: playersData.length,
        totalRequested: playerIds.length
      });

    } catch (error) {
      console.error('Batch AI Prediction Error:', error.message);
      res.status(500).json({ error: 'Failed to generate batch predictions: ' + error.message });
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