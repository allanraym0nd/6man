import User from "../models/User";
import PlayerStats from "../models/PlayerStats";
import Prediction from "../models/Prediction";
import game from '../models/game.js';
import LeagueMembership from "../models/LeagueMembership.js";

const statsController = {
    getPlatformStats: async(req,res) => {

         try{

            const totalUsers = await User.countDocuments();
            const totalPredictions = await Prediction.countDocuments();
            const completedPredictions = await Prediction.countDocuments({
                type:'user',
                actualStats: {$exists: true}
            })

            const avgAccuracy = await Prediction.aggregate([
                {$match: {type: 'user', 'accuracy.overallScore': {$exists:true}}},
                {$group:  {_id: null, avgAccuracy: {$avg: '$accuracy.overallScore'}}} // This stage groups all the documents into a single group (_id: null) and calculates the average of the overallScore field.
            ])

            res.json({
                platform:{
                    totalUsers,
                    totalPredictions,
                    completedPredictions,
                    averageAccuracy: avgAccuracy[0]?.avgAccuracy.toFixed(2) || 0,
                    completionRate: ((completedPredictions / totalPredictions) * 100).toFixed(1)
                }
            })
            }catch(error){
                res.status(500).json({ error: error.message });
            }

    },

    getPredictionsTrends: async(req,res) => {
        try{
             const positionAccuracy = await Prediction.aggregate([
                {
                    $match:{
                        type:'user',
                        'accuracy.overallScore': {$exists:true}
                    }
                },
                {
                    $group:{
                        _id: '$player_position',
                        avgAccuracy: {$avg: 'accuracy.overallScore'},
                        totalPredictions: { $sum: 1 }
                    }
                },
                { $sort: { avgAccuracy: -1 } },
             ]    
         )

           const popularPlayers = await Prediction.aggregate([
            {
                $match: {
                    type: '$user'
                }
            },
            {
                $group:{
                     _id: '$player.id',
                     playerName: { $first: '$player.name' },
                     team: { $first: '$player.team' },
                     predictionCount: { $sum: 1 }
                }
            },
            { $sort: { predictionCount: -1 } },
             { $limit: 10 }

           ])

           const sevenDaysAgo = new Date()
           sevenDaysAgo.setDate(sevenDaysAgo() - 7) // This creates a Date object representing exactly seven days ago.

           const dailyVolume = await Prediction.aggregate([
            {
                $match: {
                    createdAt: {$gte : sevenDaysAgo, type: 'user'}
                }
            },
            {
                $group:{
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "s" } },
                    count: { $sum: 1 }
                }
            },
             { $sort: { _id: 1 } },
           ])

           res.json({
            trends:{
                  accuracyByPosition: positionAccuracy,
                    mostPredictedPlayers: popularPlayers,
                    dailyPredictionVolume: dailyVolume
            }
           })


        }catch(error){
            res.status(500).json({ error: error.message });

        }
    },

    getUserVsAIStats: async(req,res) => {
        try{
            const userStats = await Prediction.aggregate([
                {
                    $match:{
                        type:'user',
                        'accuracy.overallScore': {$exists: true}
                    }
                },
                {
                    $group:{
                        _id:null,
                        avgAccuracy:{$avg: 'accuracy.overrallScore'},
                        totalPredictions: { $sum: 1 }
                    }
                }
            ])

            const aiStats = await Prediction.aggregate([
                { $match: { type: 'ai', 'accuracy.overallScore': { $exists: true } } },
                {
                $group: {
                    _id: null,
                    avgAccuracy: { $avg: '$accuracy.overallScore' },
                    totalPredictions: { $sum: 1 }
                }
                }
            ])

            res.json({
                comparison:{
                    users: userStats[0] || { avgAccuracy: 0, totalPredictions: 0 },
                    ai: aiStats[0] || { avgAccuracy: 0, totalPredictions: 0 },
                    winner: (userStats[0]?.averageAccuracy || 0) >  (aiStats[0]?.avgAccuracy || 0) ? 'users' : 'ai'

                }
            })

        }catch(error){
            res.status(500).json({ error: error.message });
        }


    },

    getLeagueImpactStats: async(req,res) => {
        try{

            const leagueMembers = await Prediction.distinct('user')
            const leagueMemberAccuracy = await Prediction.aggregate([
                {
                    $match:{
                        type:'user',
                        user: {$in : leagueMembers},
                        'accuracy.overallScore': { $exists: true }
                    }
                },
                {
                    $group: {
                        _id: null,
                        avgAccuracy: { $avg: '$accuracy.overallScore' },
                        totalPredictions: { $sum: 1 }
                    }
                    }

            ])

             const soloUserAccuracy = await Prediction.aggregate([
                    { 
                    $match: { 
                        type: 'user',
                        user: { $nin: leagueMembers },
                        'accuracy.overallScore': { $exists: true }
                    }
                    },
                    {
                    $group: {
                        _id: null,
                        avgAccuracy: { $avg: '$accuracy.overallScore' },
                        totalPredictions: { $sum: 1 }
                    }
                    }
                ]);

                res.json({
                    leagueImpact:{
                        leagueMembers: leagueMemberAccuracy[0] || { avgAccuracy: 0, totalPredictions: 0 },
                        soloUsers: soloUserAccuracy[0] || { avgAccuracy: 0, totalPredictions: 0 },
                        improvementPercentage: leagueMembersAccuracy[0] && soloUserAccuracy[0]
                        ? (((leagueMemberAccuracy[0].avgAccuracy - soloUserAccuracy[0].avgAccuracy) / soloUserAccuracy[0].averageAccuracy)*100)
                        : 0
                    } 
                })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    },

    getPredictionDifficulty: async(req,res) => {
        try{
            const statDifficulty = await Prediction.aggregate([
                 { $match: { type: 'user', accuracy: { $exists: true } } },
                 {
                    $project:{
                        pointsAccurate:'$accuracy.pointsAccurate',
                        reboundsAccurate: '$accuracy.reboundsAccurate',
                        assistsAccurate: '$accuracy.assistsAccurate'
                    }
                 },

                 {
                    $group:{
                        _id:null,
                        pointsSuccess:{
                            $avg: {$cond : [$pointsAccurate,1,0]}
                        },
                        reboundsSuccess:{
                            $avg: {$cond: [reboundsAccurate,1,0]}

                        },
                         assistsSuccess: { 
                            $avg: { $cond: ['$assistsAccurate', 1, 0] }
                        },
                        totalPredictions: { $sum: 1 }
                    }
                 }
            ])

            const difficulty = statDifficulty[0] || {};

            const rankings = [
                {stat: 'points', successRate: ((difficulty.pointsSuccess || 0) * 100).toFixed(1)},
                {stat: 'rebounds', successRate: ((difficulty.reboundsSuccess || 0) * 100).toFixed(1)},
                { stat: 'assists', successRate: ((difficulty.assistsSuccess || 0) * 100).toFixed(1) }
            ]

            res.json({
                predictionDifficulty:{
                    easiestToHardest: rankings,
                    totalAnalyzed:difficulty.totalPredictions || 0
                }
            })

        }catch(error){
             res.status(500).json({ error: error.message });
        }
    }
}

export default statsController;