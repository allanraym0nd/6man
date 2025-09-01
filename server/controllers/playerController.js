import Player from "../models/Player.js";

const playerController =  {

    // GET /api/players
    getAllPlayers: async(req,res) =>{
        try{
            const {team, position, status, search, limit=50} =req.query

            const filter = {}

            if(team) filter['team.abbreviation'] =team
            if(position) filter.position =position
            if(status) filter.status =status

            let query = Player.find(filter)

            //text search
            if(search){
                query = Player.find({
                    ...filter,
                    $text: {$search: search}
                })
            }

            const players = await query
            .sort({'seasonStats.averages.points':-1})
            .limit(parseInt(limit))

            res.json({
                players,
                total:players.length,
                filter:{team, position, status, search}
            })

        }catch(error){
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/players/:playerId
    getPlayerById: async(req,res) => {
        try{
            const player = await Player.findOne({'playerId': req.params.playerId})

            if(!player) {
                return res.status(404).json({ error: 'Player not found' });
            }

       res.json({ player });
            
        }catch(error){
            res.status(500).json({ error: error.message });

        }
    },

    // GET /api/players/team/:teamId 
    getTeamRoster: async(req,res) => {
        try{
            const {teamId} = req.params
            const {position, status} = req.query

            const filter = {
                'team.id':teamId
            }

            if(status) filter.status = status
            if(position) filter.position = position

            const roster = await Player.find(filter)
            .sort({jersey:1})

            res.json({
                teamId,
                roster,
                total:roster.length
            })

        }catch(error){
            res.status(500).json({ error: error.message });

        }
    },

     // GET /api/players/prediction-eligible
     getPredictionEligiblePlayers: async(req,res) => {
        try{
            const {team,position,minGames = 5 } = req.query

            const filter = {
                isPredictionEligible:true,
                status:'active',
                'seasonStats.gamesPlayed': {$gte: parseInt(minGames)} 
            }

            if(team) filter['team.abbreviation'] = team
            if(position) filter.position = position

            const players = await Player.find(filter)
            .select('playerId fullName team position seasonStats.averages recentForm')
            .sort({'seasonStats.averages.points': -1})

            res.json({
                players,
                total: players.length,
                 message: players.length === 0 ? 'No eligible players found' : null
            })

        }catch(error){
              res.status(500).json({ error: error.message });

        }
     },

     // GET /api/players/:playerId/stats
     getPlayerStats: async(req,res) => {
        try{
            const player = await Player.findOne({playerId: req.params.playerId}) 

             if (!player) {
                return res.status(404).json({ error: 'Player not found' });
            }

            res.json({
                player: {
                    name:player.fullName,
                    team: player.team,
                    position: player.position,
                    jersey: player.jersey
                },
                seasonStats: player.seasonStats,
                recentForm: player.recentForm,
                status: player.status,
                injury: player.injury
            })

        }catch(error){
             res.status(500).json({ error: error.message });
        }
     },

     // GET /api/players/leaders/:stat
     getStatLeaders: async(req,res) => {
        try{
            const {stat} = req.params
            const {limit = 10, minGames = 10} = req.query

            const validStats = ['points', 'rebounds', 'assists', 'steals', 'blocks']
            if(!validStats.includes(stat)){
                 return res.status(400).json({ error: 'Invalid stat parameter' });
            }

            const sortField = `seasonStats.averages.${stat}`

            const leaders = await Player.find({
                status:'active',
                'seasonStats.gamesPlayed': {$gte:parseInt(minGames)}
            })
            .select('playerId fullName team position seasonStats.averages')
            .sort({ [sortField]: -1})
            .limit(parseInt(limit))

            res.json({
                    stat,
                    leaders: leaders.map((player, index) => ({
                    rank: index + 1,
                    player: {
                        id: player.playerId,
                        name: player.fullName,
                        team: player.team,
                        position: player.position
                    },
                    average: player.seasonStats.averages[stat]
                    }))
                });  

        }catch(error){
            res.status(500).json({ error: error.message });
        }

     },

     createOrUpdatePlayer: async(req,res) => {
        try{
            const playerData = req.body

            const player = await Player.findOneAndUpdate(
                {playerId: playerData.playerId},
                playerData,
                {
                    new:true,
                    upsert:true,
                    runValidators:true
                }
            )
            res.json({
                message: player.isNew ? 'Player created' : 'Player updated',
                player
            })
        }catch(error){
             res.status(500).json({ error: error.message });

        }
     },

      // PUT /api/players/:playerId/stats
      updatePlayerStats: async(req,res) => {
        try{

            const {playerId} = req.params
            const {seasonStats, recentForm} = req.body

            const player = await Player.findOneAndUpdate(
                {playerId},
                {seasonStats,recentForm},
                {new:true}
            );

             if (!player) {
                return res.status(404).json({ error: 'Player not found' });
            } 

            res.json({
                message: 'Player stats updated',
                player
            })
        }catch(error){
             res.status(500).json({ error: error.message });
        }
      },

       // PUT /api/players/:playerId/status 
       updatePlayerStatus: async(req,res) => {
        try{
            const {playerId} = req.params;
            const {status,injury} = req.body

            const player = await Player.findOneAndUpdate(
                {playerId},
                {status,injury},
                {new:true}
            )

             if (!player) {
                    return res.status(404).json({ error: 'Player not found' });
                }

                res.json({
                    message:'Status Updated',
                    player
                })
        }catch(error){
             res.status(500).json({ error: error.message });
        }
       }

}

export default playerController;