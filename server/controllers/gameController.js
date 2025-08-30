import Game from "../models/game.js";

const gameController = {
   // GET /api/games/today

   getTodaysGames : async(req,res) => {
       try {
       const today = new Date()
       const startOfDay = new Date(today.setHours(0,0,0,0))
       const endOfDay = new Date(today.setHours(23,59,59,999))

       const games = await Game.find({
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
               {'awayTeam.abbreviation':team},
           ];
       }

       if(status) {
           filter.status = status
       }

       const games = await Game.find(filter)
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
   
       },

           // GET /api/games/:gameId
       getGameById: async (req,res) => {

       try { 
           const game = await Game.findOne({gameId: req.params.gameId})

           if(!game) {
               return res.status(404).json({error:'Game not found'})
           }
           res.json({game})
       }catch(error) {
           res.status(500).json({ error: error.message })

       }
   },
   // GET /api/games/live
       getLiveGames: async(req,res) => {

           try {
               const liveGames = await Game.find({status:'live'})
               .sort({gameDate:1});

               res.json({liveGames, count: liveGames.length})
           }catch(error) {
               res.status(500).json({error:error.message})
           }
       },
       // POST /api/games - Create/update game (for data syncing from NBA API)
       createOrUpdateGame: async(req,res) => {
           try{
               const gameData = req.body 

               const game = await Game.findOneAndUpdate(
                   {gameId: gameData.gameId}, 
                   gameData, 
                   {
                       new:true,
                       upsert:true,
                       runValidators:true
                   }
               )
               res.json({
                   message: game.isNew ? 'Game Created' : 'Game Updated',
                   game
               }
               )
           } catch(error) {
               res.status(500).json({error: error.message})
             
           }
       },
       // PUT /api/games/:gameId/result

       updateGameResult: async(req,res) => {
           try{
               const {gameId} =req.params
               const {score, status, gameStats} = req.body;

               const game = await Game.findOneAndUpdate(
                   {gameId},
                   {
                       score,
                       gameStats,
                       status,
                       isPredictionActive:false // Close predictions when game ends
                   },
                   {new: true}
               ); 

           if (!game) {
               return res.status(404).json({ error: 'Game not found' });
     } 

               res.json({
                   message:'game result updated',
                   game
               })
           }catch(error) {
                res.status(500).json({ error: error.message });
           }
       },

       // GET /api/games/predictions-active - Get games available for predictions
          getPredictionActiveGames: async(req,res) => {
           try {
               const now = new Date();

               const games = await Game.find({
                   isPredictionActive:true,
                   predictionDeadline: {$gt: now}, //deadline hasnt passed
                   status:'scheduled'
               })
               .sort({gameDate: 1})

               res.json({
                   games,
                   count:games.length,
                   message: games.length === 0 ? 'No games available for predictions right now' : null
               })
           }catch(error) {
               res.status(500).json({ error: error.message });
           }      
       }

}; 

export default gameController;