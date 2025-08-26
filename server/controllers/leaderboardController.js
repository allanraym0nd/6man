import User from "../models/User.js";
import Prediction from "../models/Prediction.js"
import LeagueMembership from "../models/LeagueMembership.js";
import CompetitionLeague from '../models/CompetitionLeague.js';

const leaderBoardController = {

    getGlobalLeaderBoard: async(req,res) => {
        try{
            const { stat = 'accuracy', limit = 50 } = req.query;

            const leaderboard = await Prediction.aggregate([
                {
                    $match:{
                        type: 'user',
                        actualStats: {$exists: true},
                        'accuracy.overallAccuracy': {$exists: true}
                    }
                },
                {
                   $group:{
                    _id:'$user',
                    totalPredictions: {$sum:1},
                    averageAccuracy:{$avg: '$accuracy.overallAccuracy'},
                    totalPoints: {$sum: '$pointsEarned'},
                    correctPredictions:{
                        $sum:{
                            $cond:[{$gte: ['$pointsEarned', 15]},1,0] // 15+ points out of 25 = "good prediction"
                        }
                    }
                   }
                },
                {
                    $lookup:{
                        from:'users',
                        localField:'_id',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                { $unwind: '$user' }, //  $unwind stage deconstructs the new user array into a single document for each user. This makes it easier to access the user's data directly in the next stage.

                {
                    // Reshapes the documents to clean up the output.selects and renames fields to prepare the final output.
                    $project:{
                        _id:0,
                        userId: '$_id',  // excludes id from the output
                        username: '$user.username',
                        totalPredictions:1,
                        averageAccuracy: {$round: ['$averageAccuracy',3]},
                        totalPoints: { $round: ['$totalPoints', 2] },
                        correctPredictions: 1,
                        successRate: { $round: [{ $multiply: [{ $divide: ['$correctPredictions', '$totalPredictions'] }, 100] }, 1] }
                    }
                },
                {
                    $match:{
                        totalPredictions: {$gte:5} // Minimum predictions to qualify
                    }
                },
                {
                    $sort: stat === 'accuracy'
                    ? {averageAccuracy: -1}
                    : stat === 'total'
                    ? {totalPoints: -1}
                    : {successRate: -1}
                },
                 {
                    $limit: parseInt(limit)
                }
            ])

            const rankedLeaderboard = leaderboard.map((user,index) => ({
                ...user,
                rank: index + 1
            }));

            res.json({
                leaderboard: rankedLeaderboard,
                total: rankedLeaderboard.length,
                criteria:{
                    sortBy:stat,
                    minimumPredictions:5,
                    scoringSystem: "0-25 points per prediction (15+ = good prediction)"
                }
            })

        }catch(error) {
             res.status(500).json({ error: error.message });
        }
    },

    getLeagueLeaderboard: async(req,res) => {
        try{
              const { leagueId } = req.params;
              const { limit = 50 } = req.query;

               const league = await CompetitionLeague.findById(leagueId);
               const memberCount = await LeagueMembership.countDocuments({ competitionLeague: leagueId });

                if (!league) {
                    return res.status(404).json({ error: 'League not found' });
                }

                 const leaderboard = await LeagueMembership.find({ competitionLeague: leagueId })
                     .populate('user', 'username')
                     .sort({
                        'stats.points':-1,
                        'stats.accuracy':-1,
                        'stats.wins':-1
                     })
                     .limit(parseInt(limit));

                     res.json({
                        league:{
                            id: league._id,
                            name:league.name,
                            memberCount:memberCount
                        },
                        leaderboard: leaderboard.map((membership,index)=> ({
                            rank: index + 1,
                            user: {
                                id:membership.user._id,
                                username:membership.user.username
                            },
                            stats:{
                                points: membership.stats.points,
                                predictions: membership.stats.predictions,
                                correctPredictions: membership.stats.correctPredictions,
                                accuracy: membership.stats.accuracy,
                                rank: membership.stats.rank,
                                joinedAt: membership.joinDate
                            }
                        }))
                     })

        }catch(error){
             res.status(500).json({ error: error.message });
        }
    },

    getUserVsAILeaderboard: async(req,res) => {
        try{
             const { limit = 30 } = req.query;

             const comparison = await Prediction.aggregate([
                {
                    $match:{
                        actualStats:{$exists:true},
                        'accuracy.overallAccuracy': {$exists:true}
                    }
                },
                {
                    // creates a unique group for every instance where a user and an AI made a prediction on the same player in the same game

                    $group:{
                        _id:{
                            gameId: '$gameId',
                             playerId: '$player.id'
                        },
                        predictions: { $push: '$$ROOT' } // creates an array containing the complete documents. // push adds items to an array, // $$ROOT refers to the entire document // 
                    }
                },
                {
                    $match:{
                        'predictions.1': { $exists: true } // Ensure at least 2 predictions exist
                    }
                },
                {
                    $project:{
                         // The goal is to get the overallScore for the user's prediction and place it into a new field called userPredictio
                        userPrediction: {
                            $arrayElemAt: [ //This operator gets an element from an array at a specified index.
                                { $filter: {
                                    input: '$predictions',
                                    cond: { $eq: ['$$this.type', 'user'] }
                                }}, 0
                            ]
                        },
                        aiPrediction: {
                            $arrayElemAt: [
                                { $filter: {
                                    input: '$predictions',
                                    cond: { $eq: ['$$this.type', 'ai'] }
                                }}, 0
                            ]
                        }
                    }
                },
                {
                     // removes any groups where either the userPrediction or aiPrediction field is missing 
                    $match: {
                        userPrediction: { $ne: null },
                        aiPrediction: { $ne: null }
                    }
                },
                {
                    $group:{
                        _id: '$userPrediction.user',
                        comparisons: {$sum:1},
                        userWins:{
                            $sum:{
                                $cond:[
                                    {$gt: ['$userPrediction.pointsEarned', '$aiPrediction.pointsEarned']}, 
                                    1,
                                    0
                                ]
                            }
                        }, 
                        avgUserAccuracy: { $avg: '$userPrediction.accuracy.overallAccuracy' },
                        avgAIAccuracy: { $avg: '$aiPrediction.accuracy.overallAccuracy' },
                        avgUserPoints: { $avg: '$userPrediction.pointsEarned' },
                        avgAIPoints: { $avg: '$aiPrediction.pointsEarned' }
                    }
                },
                {
                    $lookup:{
                        from: 'users',
                        localField: '_id',
                        foreignField:'_id',
                        as:'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project:{
                        _id:0,
                        userId:'$_id',
                        username:'$user.username',
                         comparisons: 1,  // explicitly includes this field in the output. 
                         userWins: 1,
                         winRate: {
                            $round: [
                                 { $multiply: [{ $divide: ['$userWins', '$comparisons'] }, 100] },
                                 1
                                ]
                         },
                         avgUserAccuracy: { $round: ['$avgUserAccuracy', 3] },
                         avgAIAccuracy: { $round: ['$avgAIAccuracy', 3] },
                         avgUserPoints: { $round: ['$avgUserPoints', 2] },
                         avgAIPoints: { $round: ['$avgAIPoints', 2] }
                    }           
                },
                {
                    $match: {
                        comparisons: {$gte:10} // removes users who dont meet minimum number of comparisons

                    }
                },
                 {
                    $sort: { winRate: -1 }
                    },
                    {
                    $limit: parseInt(limit)
                    }
             ])

             res.json({
                leaderboard: comparison.map((user,index) => ({
                    ...user,
                    rank:index + 1
                })), 
                description: "Users who beat AI predictions most often",
                criteria: {
                    minimumComparisons: 10,
                    scoringSystem: "Based on pointsEarned (0-25 scale)"
                }
             })

        }catch(error){
             res.status(500).json({ error: error.message });

        }
    },

    getPredictionStreaks: async(req,res) => {
        try{
             const { limit = 20, type = 'current' } = req.query;

             const users = await User.find().select('username').limit(100)

            const streakData = await Promise.all(
        users.map(async (user) => {
          const predictions = await Prediction.find({
            user: user._id,
            type: 'user',
            actualStats: { $exists: true }
          })
          .sort({ createdAt: -1 })
          .limit(50)
          .select('pointsEarned accuracy.overallAccuracy createdAt');

          let currentStreak = 0;
          let bestStreak = 0;
          let tempStreak = 0;

          predictions.forEach((prediction, index) => {
            const isCorrect = prediction.pointsEarned >= 15; // 15+ points = good prediction

            if (isCorrect) {
              tempStreak++;
              if (index === 0) currentStreak = tempStreak;
            } else {
              if (index === 0) currentStreak = 0;
              bestStreak = Math.max(bestStreak, tempStreak);
              tempStreak = 0;
            }
          });

          bestStreak = Math.max(bestStreak, tempStreak);

          return {
            userId: user._id,
            username: user.username,
            currentStreak,
            bestStreak
          };
        })
      );

      const sortedStreaks = streakData
      .filter(data => (type === 'current' ? data.currentStreak > 0 : data.bestStreak > 0))
      .sort((a,b) => (type === 'current' ? b.currentStreak - a.currentStreak : b.bestStreak - a.bestStreak))
      .slice(0, parseInt(limit))

      res.json({
        type,
        leaderboard: sortedStreaks.map((user, index) => ({
            ...user,
            rank: index + 1
        })),
        criteria: {
            goodPrediction: "15+ points out of 25"
        }
      })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }
}

export default leaderBoardController;

// The .map() method is a core JavaScript function that creates a new array by calling a provided function on every element in the original array