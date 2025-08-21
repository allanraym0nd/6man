import User from "../models/User.js";
import Prediction from "../models/Prediction.js"
import LeagueMembership from "../models/LeagueMembership.js";
import CompetitionLeague from '../models/CompetitionLeague.js';


const leaderBoardController = {

    getGlobalLeaderBoard: async(req,res) => {
        try{
            const leaderboard = await Prediction.aggregate([
                {
                    $match:{
                        type: 'User',
                        actualStatsExist: {$exists: true},
                        'accuracy.overallScore': {$exists: true}
                    }

                },

                {
                   $group:{
                    _id:'$user',
                    totalPredictions: {$sum:1},
                    averageAccuracy:{$avg: '$accuracy.overallScore'},
                    totalPoints: {$sum: '$accuracy.overallScore'},
                    correctPredictions:{
                        $sum:{
                            $cond:[{$gt: ['$accuracy.overallScore',0]},1,0] // conditional statement ($cond) to count how many predictions had an overallScore greater than zero.
                        }
                    }
                   }
                },
                {
                    $lookup:{
                        from:'users',
                        localfield:'_id',
                        foreignfield:'_id',
                        as:'user'
                    }
                },
                { $unwind: '$user' }, //  $unwind stage deconstructs the new user array into a single document for each user. This makes it easier to access the user's data directly in the next stage.
                {
                    $project:{
                        _id:0,
                        userId: '$_id',
                        username: '$user.username',
                        totalPredictions:1,
                        averageAccuracy: {$round: ['$averageAccuracy',2]},
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
                    $sort: stat === 'Accuracy'
                    ? {averageAccuracy: -1}
                    : stat === 'total'
                    ? {totalPoints: -1}
                    : {succesRate: -1}
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
                    minimumPredictions:5
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
               const memberCount = await LeagueMembership.countDocuments({ league: leagueId });

                if (!league) {
                    return res.status(404).json({ error: 'League not found' });
                }
                

                 const leaderboard = await LeagueMembership.find({ league: leagueId })
                     .populate('user', 'username')
                     .sort({
                        points:-1,
                        accuracy:-1,
                        wins:-1
                     })

                     .limit(parseInt(limit));

                     res.json({
                        league:{
                            id: league._id,
                            name:league.name,
                            memberCount:memberCount
                        },
                        leaderboard: leaderboard((membership,index)=> ({
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
                        'accuracy.overallScore': {$exists:true}
                    }
                },
                {
                    $group:{
                        _id:{
                            user: '$user',
                             gameId: '$gameId',
                             playerId: '$player.id'
                        },
                        // The goal is to get the overallScore for the user's prediction and place it into a new field called userPrediction.
                        userPrediction:{
                            $first:{
                                $cond: [
                                    {$eq: ['$type', '$user']},
                                    '$accuracy.overallScore',
                                    null
                                ]
                            }
                        }, 
                        aiPrediction:{
                             $first: {
                $cond: [
                  { $eq: ['$type', 'ai'] },
                  '$accuracy.overallScore',
                  null
                ]
              }
                        }

                    }
                    
                },
                {
                    $match: {
                        userPrediction: { $ne: null },
                        aiPrediction: { $ne: null }
                    }
                },
                {
                    $group:{
                        _id: '$_id.user',
                        comparisons: {$sum:1},
                        userWins:{
                            $sum:{
                                $cond:[
                                    {$gt: ['$userPrediction', '$aiPrediction']},
                                    1,
                                    0
                                ]
                            }

                        }, 
                        avgUserAccuracy: { $avg: '$userPrediction' },
                        avgAIAccuracy: { $avg: '$aiPrediction' }
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
                            username:'user.username',
                             comparisons: 1,
                             userWins: 1,
                             winRate: {
                                $round: [
                                     { $multiply: [{ $divide: ['$userWins', '$comparisons'] }, 100] },
                                     1
                                    ]
                             },
                             avgUserAccuracy: { $round: ['$avgUserAccuracy', 2] },
                             avgAIAccuracy: { $round: ['$avgAIAccuracy', 2] }
                        }           
                    },

                    {
                        $match: {
                            comparisons: {$gte:10}
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
                    minimumComparisons: 10
                    }
             })

        }catch(error){
             res.status(500).json({ error: error.message });

        }
    },

    getPredictionStreak: async(req,res) => {
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
          .select('accuracy.overallScore createdAt');

          let currentStreak = 0;
          let bestStreak = 0;
          let tempStreak = 0;

          predictions.forEach((prediction, index) => {
            const isCorrect = prediction.accuracy?.overallScore > 0;

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

        }))
      })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }
}

export default leaderBoardController;
