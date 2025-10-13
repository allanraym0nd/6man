import CompetitionLeague from '../models/CompetitionLeague.js';
import LeagueMembership from '../models/LeagueMembership.js';
import User from '../models/User.js';

const competitionController = {
    
  // GET /api/competitions 
  getAllLeagues: async (req, res) => {
    try {
      const leagues = await CompetitionLeague.find({ 
        isActive: true, 
        type: { $in: ['public', 'invite-only'] } 
      })
      .populate('creator', 'username avatar') // replaces the ObjectId in the creator field 

      .sort({ createdAt: -1 });

      res.json(leagues);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/competitions
  createLeague: async (req, res) => {
    try {
      const { name, description, type, settings } = req.body;

      const league = new CompetitionLeague({
        name,
        description,
        creator: req.user.id,
        type,
        settings
      });

      await league.save();

      // Auto-join creator as admin
      const membership = new LeagueMembership({
        user: req.user.id,
        competitionLeague: league._id,
        role: 'admin'
      });

      await membership.save();

      league.stats.totalMembers = 1;
      await league.save();

      res.status(201).json({
        message: 'League created successfully',
        league
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST /api/competitions/:id/join
  joinLeague: async (req, res) => {
    try {
      const leagueId = req.params.id;
      const userId = req.user.id;


      const league = await CompetitionLeague.findById(leagueId);
      if (!league || !league.isActive) {
        return res.status(404).json({ error: 'League not found or inactive' });
      }

  
      const existingMembership = await LeagueMembership.findOne({
        user: userId,
        competitionLeague: leagueId
      });

      if (existingMembership) {
        return res.status(400).json({ error: 'Already a member of this league' });
      }

    
      if (league.stats.totalMembers >= league.settings.maxMembers) {
        return res.status(400).json({ error: 'League is full' });
      }

      // Create membership
      const membership = new LeagueMembership({
        user: userId,
        competitionLeague: leagueId
      });

      await membership.save();

      // Update league member count
      league.stats.totalMembers += 1;
      await league.save();

      res.json({
        message: 'Successfully joined league',
        membership
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET /api/competitions/:id
  getLeagueDetails: async (req, res) => {
    try {
      const league = await CompetitionLeague.findById(req.params.id)
        .populate('creator', 'username avatar');

      if (!league) {
        return res.status(404).json({ error: 'League not found' });
      }

      // Get top members 
      const members = await LeagueMembership.find({
        competitionLeague: req.params.id,
        status: 'active'
      })
      .populate('user', 'username avatar')
      .sort({ 'stats.points': -1 })
      .limit(10);

      res.json({
        league,
        leaderboard: members
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default competitionController;