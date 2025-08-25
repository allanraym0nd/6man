import User from "../models/User.js";
import Prediction from "../models/Prediction.js";
import LeagueMembership from "../models/LeagueMembership.js";

const userController = {

    getUserProfile: async(req,res) => {
        try{
            const user = await User.findById(req.user.id) // attached from JWT library ::req.user.id is the user ID that was stored in the JWT token when they logged in,
            .select('-password')

            if(!user){
                 return res.status(404).json({ error: 'User not found' });
            }
            res.json({user})       
        }catch(error){
             res.status(500).json({ error: error.message });

        }
    },

    updateProfile: async(req,res) => {
        try{
            const {username, email} = req.body

            const user = await User.findByIdAndUpdate(
                req.user.id,
                {username,email},
                {
                    new:true,
                    runValidators:true
                }
            ).select('-password')

             if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                res.json({
                    message: 'Profile Updated Successfully',
                    user
                })
        }catch(error){
             res.status(500).json({ error: error.message });

        }
    },

    // GET /api/users/stats
    getUserStats: async (req, res) => {
        try {
            const userId = req.user.id;

            
            const totalPredictions = await Prediction.countDocuments({ 
            user: userId,
            type: 'user'
            });

            // Get completed predictions (with results)
            const completedPredictions = await Prediction.find({
            user: userId,
            type: 'user',
            actualStats: { $exists: true }
            });

            // Calculate accuracy
            const totalAccuracy = completedPredictions.reduce((sum, prediction) => {
            return sum + (prediction.accuracy?.overallAccuracy || 0);
            }, 0);

            const averageAccuracy = completedPredictions.length > 0 
            ? (totalAccuracy / completedPredictions.length).toFixed(2)
            : 0;

            // Count correct predictions - for success rate
            const correctPredictions = completedPredictions.filter(prediction => 
            prediction.accuracy?.overallAccuracy > 0
            ).length;

            // Get league memberships
            const leagueMemberships = await LeagueMembership.find({ user: userId })
            .populate('competitionLeague', 'name')  
            .select('competitionLeague stats');

            res.json({
            stats: {
                totalPredictions,
                completedPredictions: completedPredictions.length,
                correctPredictions,
                averageAccuracy: parseFloat(averageAccuracy),
                successRate: completedPredictions.length > 0 
                ? ((correctPredictions / completedPredictions.length) * 100).toFixed(1)
                : 0
            },
            leagues: leagueMemberships
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
        },

        

    getPredictionHistory: async(req,res) => {
        try{
            const userId = req.user.id
            const {status, limit =20, page =1} =req.query

              const filter = { 
                user: userId,
                type: 'user'
            };

            if(status === 'completed'){
                filter.actualStats = {$exists: true}
            } else if (status === 'pending') {
                filter.actualStats = { $exists: false };
            }

             const predictions = await Prediction.find(filter)
             .sort({ createdAt: -1 })
             .limit(parseInt(limit))
             .skip((parseInt(page) - 1) * parseInt(limit))
             .populate('league','name')

               const total = await Prediction.countDocuments(filter);

               res.json({
                predictions,
                pagination:{ 
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
               })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    },
     
        // get user prefomance
     getPerformanceAnalytics: async (req, res) => {
        try {
            const userId = req.user.id;

            const predictions = await Prediction.find({
            user: userId,
            type: 'user',
            actualStats: { $exists: true }
            });

            if (predictions.length === 0) {
            return res.json({
                message: 'No completed predictions found',
                analytics: null
            });
            }

            // Performance by stat type
            const statAnalytics = {
            points: { correct: 0, total: 0, accuracy: 0 },
            rebounds: { correct: 0, total: 0, accuracy: 0 },
            assists: { correct: 0, total: 0, accuracy: 0 }
            };

            predictions.forEach(prediction => {
            if (prediction.accuracy) {
              
                statAnalytics.points.total++;
                statAnalytics.rebounds.total++;
                statAnalytics.assists.total++;

                if (prediction.accuracy.pointsAccuracy > 0) {
                statAnalytics.points.correct++;
                }
                if (prediction.accuracy.reboundsAccuracy > 0) {
                statAnalytics.rebounds.correct++;
                }
                if (prediction.accuracy.assistsAccuracy > 0) {
                statAnalytics.assists.correct++;
                }
            }
            });

            // Calculate accuracy percentages
            Object.keys(statAnalytics).forEach(stat => { // object.keys(statAnalytics): gets an array of the keys from the statAnalytics object, which are 'points', 'rebounds', and 'assists'. 
            const { correct, total } = statAnalytics[stat];
            statAnalytics[stat].accuracy = total > 0 
                ? ((correct / total) * 100).toFixed(1)
                : 0;
            });

            // Recent performance 
            const recentPredictions = predictions
            .slice(-10)
            .map(p => ({
                date: p.createdAt,
                player: p.player.name,
                accuracy: p.accuracy?.overallAccuracy || 0  
            }));

            
            const totalAccuracy = predictions.reduce((sum,p) => sum + (p.accuracy?.overallAccuracy || 0),0)
            const averageAccuracy = (totalAccuracy / predictions.length).toFixed(2);

            res.json({
            analytics: {
                overall: {
                totalPredictions: predictions.length,
                averageAccuracy: parseFloat(averageAccuracy)
                },
                byStatType: statAnalytics,
                recentPerformance: recentPredictions
            }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
        },


    deleteAccount: async(req,res) => {
        try{
            const userId = req.user.id

            await LeagueMembership.deleteMany({user: userId})

            await Prediction.deleteMany({user: userId});

            await User.findByIdAndDelete(userId)

            res.json({
                message: 'Account deleted successfully'
            });

        }catch(error){
            res.status(500).json({ error: error.message });

        }
    }, 

    getPublicProfile: async(req,res) => {
        try{

            const {userId} = req.params

            const user = await User.findById(userId)
            .select('username createdAt');

               if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const totalPredictions = await Prediction.countDocuments({
                     user: userId,
                     type: 'user'
                    
                })

                const completedPredictions = await Prediction.countDocuments({
                    user: userId,
                    type: 'user',
                    actualStats: { $exists: true }
                });

                res.json({
                    user:{
                        id: user._id,
                        username: user.username,
                        joinedAt: user.createdAt
                    },
                    stats: totalPredictions,
                    completedPredictions
                })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }


}

export default userController;

