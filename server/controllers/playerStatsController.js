import PlayerStats from "../models/PlayerStats.js";
import Player from "../models/player.js";

const playerStatsController = {
    // GET /api/playerstats/player/:playerId

    getPlayerStats:async(req,res) => {
        try{
            const {playerId} = req.params
            const {season, gameType ='regular', limit =50} = req.query

            const filter = {playerId}
            if(season) filter.season = season
            if(gameType) filter.gameType = gameType

            const stats = await PlayerStats.find(filter)
            .sort({gameDate: -1})
            .limit(parseInt(limit))


            res.json({
                playerId,
                stats,
                total: stats.length
            })

        }catch(error){
             res.status(500).json({ error: error.message });
        }
    },

    // GET /api/playerstats/player/:playerId/averages
    getPlayerAverages: async(req,res) => {
        try{
            const {playerId} = req.params
            const {season = '2024-25', gameType='regular'} = req.query

            const averages = await PlayerStats.getPlayerAverages(playerId,season,gameType)

             if (!averages.length) {
                return res.status(404).json({ error: 'No stats found for player' });
            }

            res.json({
                playerId,
                season,
                gameType,
                averages:averages[0]
            })
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    }
}


