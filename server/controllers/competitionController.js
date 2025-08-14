import CompetitionLeague from '../models/CompetitionLeague.js';
import LeagueMembership from '../models/LeagueMembership.js';
import User from '../models/User.js';

const competitionController = {
    //GET /api/competitions 
 
    getAllLeagues : async(req,res) => {
        try {
            const leagues = await CompetitionLeague.findOne({
                isActive: true,
                type: {$in: ['public', 'invite-only']} // filters the leagues to include only those with a type that is either 'public' or 'invite-only'.
            })
            .populate('creator', 'username avatar') // replaces the ObjectId in the creator field 
            .sort({createdAt:-1})
        }catch(error) {
            res.status(500).json({ error: error.message });
        }
    }, 

    createLeague: async(req,res) => {
        
    }
}