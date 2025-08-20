import User from "../models/User.js";
import Prediction from "../models/Prediction.js";
import LeagueMembership from "../models/LeagueMembership.js";

const userController = {

    getUserProfile: async(req,res) => {
        try{
            const user = await User.findById(req.user.id) // attached from JWT library
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

            const user = await User.findById(
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

    getUserStats: async(req,res) => {
        try{

            const userId = req.user.id
            const totalPredictions = await Prediction.countDocuments({
                    user:userId,
                    type:'user'
                });
            const completedPredictions = await Prediction.find({
                user:userId,
                type:'user',
                actualStats: {$exists: true}
            })
            //calculate accuracy
            let correctPredictions = 0;
            let totalAccuracy = 0;
            completedPredictions.forEach(prediction => {
                if(prediction.accuracy && prediction.accuracy.overallScore > 0){
                    correctPredictions ++
                    totalAccuracy += prediction.accuracy.overallScore; //adds the score of the current prediction to a running total, which will be used to calculate the average.
                }
            })

              const averageAccuracy = completedPredictions.length > 0 
                ? (totalAccuracy / completedPredictions.length).toFixed(2)
                : 0;

            const leagueMembership = await LeagueMembership.find({user:userId})
            .populate('league','name')
            .select('league rank points wins losses accuracy');

            res.json({
                leagues:leagueMembership,
                stats:{
                    totalPredictions,
                    completedPredictions: completedPredictions.length,
                    correctPredictions,
                    averageAccuracy: parseFloat(averageAccuracy),
                     successRate: completedPredictions.length > 0 
                        ? ((correctPredictions / completedPredictions.length) * 100).toFixed(1)
                        : 0
                }      
            })
      
        }catch(error) {
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
             .skip(parseInt(page) - 1) * (parseInt(limit))
             .populate('league','name')

        }catch(error){

        }
    }
}

