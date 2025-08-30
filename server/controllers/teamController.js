import Team from "../models/Team.js";

const teamController = {
    // GET /api/teams
    getAllTeams: async(req, res) => {
        try{
            const{conference,division,active=true} = req.query

            const filter = {}
            if(conference) filter.conference = conference
            if(division) filter.division = division
            if(active !== undefined)  filter.isActive = active === 'true'

            const teams = await Team.find(filter)
            .sort({name:1})

            res.json({
                teams,
                count:teams.length
            })

        }catch(error){
             res.status(500).json({ error: error.message });

        }
    },

    // GET /api/teams/:teamId
    getTeamById: async(req,res) => {
        try{
            const team = await Team.findOne({teamId: req.params.teamId})

             if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.json({team})

        } catch(error) {
             res.status(500).json({ error: error.message });

        }
    }, 

    // GET /api/teams/standings/:conference
    getStandings: async(req,res) => {
        try{

            const {conference} = req.params
            const {season} = req.query

            const filter = {
                isActive: true,
                conference: conference
            }

            if(season){
                filter['currentSeason.season'] = season
            }

            const teams = await Team.find(filter)
            .sort({
                'currentSeason.record.winPercentage':-1,
                'currentSeason.record.wins': -1
            
            })

            res.json({
                conference,
                season: season || 'current',
                standings: teams.map((team,index) => ({
                    rank:index + 1,
                    team:{
                        id: team.teamId,
                        name: team.name,
                        abbreviation: team.abbreviation,
                        logo: team.logo
                    },
                    record:team.currentSeason.record,
                    division:team.division
                }))
            });

        }catch(error) {
            res.status(500).json({ error: error.message });

        }
    },

    getDivisionStandings: async(req,res) => {
        try {
        const {division} = req.params
        const {season} = req.query

        const filter = {
            isActive:true,
            division:division
        }

        if(season){
            filter['currentSeason.season'] = season;
            
        }

        const teams = await Team.find(filter)
        .sort({'currentSeason.record.winPercentage':-1})

        res.json({
            division,
            teams: teams.map((team,index)=> ({
                divisionRank: index + 1,
                team:{
                    id:team.teamId,
                    name:team.name,
                    abbreviation: team.abbreviation
                },
                record: team.currentSeason.record
            }))
        })
    }catch(error){
        res.status(500).json({ error: error.message });
    }
    },

    // GET /api/teams/:teamId/stats
    getTeamStats: async(req,res) => {
        try{
            const team = await Team.findOne({teamId:req.params.teamId})

            if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({
                team:{
                    name:team.name,
                    abbreviation:team.abbreviation
                },
                stats:team.stats,
                team:team.currentSeason.record
            })

        }catch(error){
            res.status(500).json({ error: error.message });
        }
    },

    // POST /api/teams - Create/update team (for data syncing)

    createOrUpdateTeam: async(req,res) => {
        try{
            const teamData = req.body;

            const team = await Team.findOneAndUpdate(
                
                {teamId:teamData.teamId},
                teamData,
                {
                    new:true,
                    upsert:true,
                    runValidators: true
                }
            )
            res.json({
                message: team.isNew ? 'Team Created' : 'Team Updated',
                team
            })
        }catch(error){
            res.status(500).json({ error: error.message });

        }
    }, 

    // PUT /api/teams/:teamId/record - Update team record

    updateTeamRecord: async(req,res) => {
        try{

            const {teamId} = req.params
            const {wins, losses, season} = req.body

            const winPercentage = wins / (wins +losses)

            const team = await Team.findOneAndUpdate(
                {teamId},
                {
                    'currentSeason.season':season,
                    'currentSeason.record.wins':wins,
                    'currentSeason.record.losses':losses,
                    'currentSeason.record.winPercentage':winPercentage
                },
                {new:true}
            )
             if (!team) {
                return res.status(404).json({ error: 'Team not found' });
            }

            res.json({
                message: 'Team record updated',
                team
            })
        }catch(error){
             res.status(500).json({ error: error.message });
        }
    },
        // PUT /api/teams/:teamId/stats - Update team stats
  updateTeamStats: async (req, res) => {
    try {
      const { teamId } = req.params;
      const { stats } = req.body;

      const team = await Team.findOneAndUpdate(
        { teamId },
        { stats },
        { new: true }
      );

      if (!team) {
        return res.status(404).json({ error: 'Team not found' });
      }

      res.json({
        message: 'Team stats updated',
        team
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
}
}

export default teamController;