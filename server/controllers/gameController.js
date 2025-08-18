import game from "../models/game.js";

const gameController = {
    // GET /api/games/today

    getTodaysGames : async(req,res) => {
        try {
        const date = new Date()
        const startOfDay = new Date(today.setHours(0,0,0,0))
        const endOfDay = new Date(today.setHours(23,59,59,999))

        const games = await game.find({
            gameDate: ({$gte: startOfDay, $lte: endOfDay}),
            status: {$in : ['scheduled', 'live']}
        })
        .sort({gameTime: 1})

        res.json({
            date:startOfDay.toString(),
            games,
            total: games.length  
        })

        } catch(error) {
            res.status(500).json({error: error.message})
        }
    },
    getSchedule: async(req,res) => {
        // GET /api/games/schedule
        try {
        const {startDate,endDate, team, status} = req.query

        const filter = {} // empty filter object
        if(startDate && endDate) {
            filter.gameDate = {
                $gte: new Date(startDate), 
                $lte: new Date(endDate) 
            }
        } else if (startDate) {
                 filter.gameDate= {$gte:new Date(startDate)} 
        }

        if (team) {
            filter.$or = [
                {'homeTeam.abbreviation': team},
                {'awayTeam.abbreviataion':team},
            ];
        }

        if(status) {
            filter.status = status
        }

        const games = await game.find(filter)
        .sort({gameDate: 1, gameTime:1})
        .limit(100)

        res.json({
            games,
            total:games.length,
            filter
        })
    }catch(error) {
        res.status(500).json({ error: error.message });
    }
    
        }
    }
    // getGameById: {},
    // getLiveGames: {},
    // createOrUpdateGame:{},
    // updateGameResult: {},
    // getPredictionActiveGames: {}


