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
    },

    //GET /api/playerstats/player/:playerId/recent
    getRecentForm: async(req,res) => {
        try{
            const {playerId} = req.params
            const {games = 5} = req.query
            
            const recentStats = await PlayerStats.getRecentForm(playerId, parseInt(games))

            res.json({
                playerId,
                recentGames: parseInt(games),
                stats:recentStats,
                averages: recentStats.length > 0 ? {
                    points: (recentStats.reduce((sum,stat) => sum, stat.stats.points, 0)/recentStats.length).toFixed(1),
                     assists: (recentStats.reduce((sum,stat) => sum, stat.stats.assists, 0)/recentStats.length).toFixed(1),
                      rebounds: (recentStats.reduce((sum,stat) => sum, stat.stats.rebounds, 0)/recentStats.length).toFixed(1)
                } : null
            });
        }catch(error){
            res.status(500).json({ error: error.message });
        }
    },

     // GET /api/playerstats/game/:gameId - player stats for a specific game
     getGamesStats: async(req,res) => {
        try{
            const {gameId} = req.params
            const {team} = req.query

            const filter = {gameId}
            if(team) filter['player.team'] = team

            const gameStats = await PlayerStats.find(filter)
            .sort({'stats.points':-1})

            res.json({
                gameId,
                players:gameStats,
                total: gameStats.length
            })

        }catch(error){
            res.status(500).json({ error: error.message });
        }
     },

      // GET /api/playerstats/player/:playerId/vs/:opponent - Player vs specific team
      getPlayerVsOpponent: async(req,res) => {
        try{
             const { playerId, opponent } = req.params;
             const {season, limit = 10} = req.query;

             const filter = {
                playerId,
                'opponent.team':opponent.toUpperCase()
             }

             if (season) filter.season = season;

             const games = await PlayerStats.find(filter)
             .sort({gameDate: -1})
             .limit(parseInt(limit))

             const averages = games.length > 0 ? {
                games:games.length,
                points: (games.reduce((sum, game) => sum + game.stats.points, 0) / games.length).toFixed(1),
                rebounds: (games.reduce((sum, game) => sum + game.stats.rebounds, 0) / games.length).toFixed(1),
                assists: (games.reduce((sum, game) => sum + game.stats.assists, 0) / games.length).toFixed(1)
             } : null

             res.json({
                playerId,
                opponent: opponent.toUpperCase(),
                games,
                averages
             })

        }catch(error){
            res.status(500).json({ error: error.message });

        }
      },

      // GET /api/playerstats/leaders/:stat - Get stat leaders for specific games
      getGameLeaders: async(req,res) => {
        try{
            const {stat} = req.params
            const {date,season,limit=10} = req.query

            const validStats = ['points', 'rebounds', 'assists', 'steals', 'blocks'];
                if (!validStats.includes(stat)) {
                    return res.status(400).json({ error: 'Invalid stat parameter' });
                }

                const filter = {}

                if(date) {
                    const gameDate = new Date(date)
                    const nextDate = new Date(gameDate)
                    nextDate.setDate = (nextDate.getDate() + 1)
                    filter.gameDate = {$gte: gameDate, $lt:nextDate}
                }

                 if (season) filter.season = season;

                 const leaders = await PlayerStats.find(filter)
                 .sort({ [`stats.${stat}`]: -1 })
                 .limit(parseInt(limit))
                 .select('player stats gameDate opponent');

                 res.json({
                    stat,
                    date: date || 'all',
                    leaders
                 })

        }catch(error){
             res.status(500).json({ error: error.message });
        }
      },

      // POST /api/playerstats 
      createOrUpdatePlayerStats: async(req,res) => {
        try{
            const statsData =req.body

            if (statsData.stats) {
                const { points, rebounds, assists } = statsData.stats;
            }

            letDoubleDoubleCount = 0
            if (points >= 10) doubleDoubleCount++;
            if (rebounds >= 10) doubleDoubleCount++;
            if (assists >= 10) doubleDoubleCount++;
            if (statsData.stats.steals >= 10) doubleDoubleCount++;
            if (statsData.stats.blocks >= 10) doubleDoubleCount++;

        statsData.Performance = {
            ...statsData.Perfomance,
            isDoubleDouble: doubleDoubleCount >= 2,
            isTripleDouble: doubleDoubleCount >= 3,
            fantasyPoints: points + (rebounds * 1.2) + (assists * 1.5) + (statsData.stats.steals * 3) + (statsData.stats.blocks * 3)

        }

        const playerStats = await PlayerStats.findAndUpdate(
            {playerId: statsData.playerId,
                gameId: statsData.gameId 
             },
             statsData,
             { 
                new: true, 
                upsert: true,
                runValidators: true 
                }
        )

        res.json({
        message: playerStats.isNew ? 'Player stats created' : 'Player stats updated',
        playerStats
      });
        }catch(error){
             res.status(500).json({ error: error.message });

        }
      },

      // GET /api/playerstats/prediction-context/:playerId

      getPredictionContext: async(req,res) => {
        try{
            const { playerId } = req.params;
            const { gameId } = req.query;

            const recentStats = await PlayerStats.getRecentForm(playerId, 5);

            const seasonAverages = await PlayerStats.getPlayerAverages(playerId, '2024-25', 'regular');

            const player = await Player.findOne({ playerId })
            .select('fullName team position status injury')

            res.json({
                player,
                recentForm: recentStats,
                seasonAverages: seasonAverages[0] || null,
                contextForPrediction: {
                    gamesPlayed: seasonAverages[0]?.gamesPlayed || 0,
                    recentTrend: recentStats.length >= 3 ? 'available' : 'insufficient_data',
                    healthStatus: player?.status || 'unknown'
                }

            })

        }catch(error){
            res.status(500).json({ error: error.message });

        }
      }
}

export default playerStatsController; 


