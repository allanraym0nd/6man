import Game from "../models/game.js";
import sportsDataService from "../services/sportsDataService.js";

const gameController = {

    // GET /api/games/today
    getTodaysGames: async (req, res) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            
           
            const nbaGamesData = await sportsDataService.getGamesByDate(today);
            
            // NBA data format to Game model format
            const transformedGames = nbaGamesData.games.map(gameRow => ({
                gameId: gameRow[2].toString(), 
                gameDate: new Date(),
                gameTime: gameRow[4] || 'TBD',
                homeTeam: {
                    id: gameRow[6].toString(), 
                    name: gameRow[7], 
                    abbreviation: gameRow[8] 
                },
                awayTeam: {
                    id: gameRow[9].toString(), 
                    name: gameRow[10], 
                    abbreviation: gameRow[11] 
                },
                status: gameRow[3] === 1 ? 'scheduled' : gameRow[3] === 2 ? 'live' : 'completed',
                isPredictionActive: gameRow[3] === 1, 
                predictionDeadline: new Date(Date.now() + 30 * 60 * 1000) // 30 mins before
            }));

            // Sync to local DB for caching
            for (const gameData of transformedGames) {
                await Game.findOneAndUpdate(
                    { gameId: gameData.gameId },
                    gameData,
                    { upsert: true, new: true }
                );
            }

            res.json({
                date: today,
                games: transformedGames,
                total: transformedGames.length
            });

        } catch (error) {


            // Fallback to local DB if NBA API fails
            const startOfDay = new Date();
            startOfDay.setHours(0,0,0,0);
            const endOfDay = new Date();
            endOfDay.setHours(23,59,59,999);

            const games = await Game.find({
                gameDate: { $gte: startOfDay, $lte: endOfDay },
                status: { $in: ['scheduled', 'live'] }
            }).sort({ gameTime: 1 });

            res.json({
                date: startOfDay.toISOString().split('T')[0],
                games,
                total: games.length,
                source: 'cached' // Indicate fallback data
            });
        }
    },

    // GET /api/games/schedule

    getSchedule: async (req, res) => {
        try {
            const { startDate, endDate, team, status } = req.query;
            
            if (!startDate) {
                return res.status(400).json({ error: 'startDate is required' });
            }

            // For single date, use NBA API
            if (!endDate || startDate === endDate) {
                const nbaGamesData = await sportsDataService.getGamesByDate(startDate);
                const transformedGames = nbaGamesData.games.map(gameRow => ({
                    gameId: gameRow[2].toString(),
                    gameDate: new Date(startDate),
                    homeTeam: {
                        id: gameRow[6].toString(),
                        name: gameRow[7],
                        abbreviation: gameRow[8]
                    },
                    awayTeam: {
                        id: gameRow[9].toString(),
                        name: gameRow[10],
                        abbreviation: gameRow[11]
                    },
                    status: gameRow[3] === 1 ? 'scheduled' : gameRow[3] === 2 ? 'live' : 'completed'
                }));

              
                const filteredGames = team ? transformedGames.filter(game => 
                    game.homeTeam.abbreviation === team || game.awayTeam.abbreviation === team
                ) : transformedGames;

                return res.json({
                    games: filteredGames,
                    total: filteredGames.length,
                    source: 'live'
                });
            }

            // For date ranges, fall back to local DB
            const filter = {
                gameDate: {
                    $gte: new Date(startDate),
                    $lte: new Date(endDate)
                }
            };

            if (team) {
                filter.$or = [
                    { 'homeTeam.abbreviation': team },
                    { 'awayTeam.abbreviation': team }
                ];
            }

            if (status) {
                filter.status = status;
            }

            const games = await Game.find(filter)
                .sort({ gameDate: 1, gameTime: 1 })
                .limit(100);

            res.json({
                games,
                total: games.length,
                source: 'cached'
            });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/games/:gameId

    getGameById: async (req, res) => {
        try {
           
            let game = await Game.findOne({ gameId: req.params.gameId });
            
            if (!game) {
            
                return res.status(404).json({ error: 'Game not found' });
            }

            res.json({ game });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/games/live

    getLiveGames: async (req, res) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const nbaGamesData = await sportsDataService.getGamesByDate(today);
            
           
            const liveGames = nbaGamesData.games
                .filter(gameRow => gameRow[3] === 2) // Live status
                .map(gameRow => ({
                    gameId: gameRow[2].toString(),
                    gameDate: new Date(),
                    homeTeam: {
                        id: gameRow[6].toString(),
                        name: gameRow[7],
                        abbreviation: gameRow[8]
                    },
                    awayTeam: {
                        id: gameRow[9].toString(),
                        name: gameRow[10],
                        abbreviation: gameRow[11]
                    },
                    status: 'live'
                }));

            res.json({
                liveGames,
                count: liveGames.length
            });

        } catch (error) {

            // Fallback to local DB
            const liveGames = await Game.find({ status: 'live' })
                .sort({ gameDate: 1 });

            res.json({
                liveGames,
                count: liveGames.length,
                source: 'cached'
            });
        }
    },

    // POST /api/games 

    createOrUpdateGame: async (req, res) => {
        try {
            const gameData = req.body;

            const game = await Game.findOneAndUpdate(
                { gameId: gameData.gameId },
                gameData,
                {
                    new: true,
                    upsert: true,
                    runValidators: true
                }
            );

            res.json({
                message: game.isNew ? 'Game Created' : 'Game Updated',
                game
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // PUT /api/games/:gameId/result
    
    updateGameResult: async (req, res) => {
        try {
            const { gameId } = req.params;
            const { score, status, gameStats } = req.body;

            const game = await Game.findOneAndUpdate(
                { gameId },
                {
                    score,
                    gameStats,
                    status,
                    isPredictionActive: false
                },
                { new: true }
            );

            if (!game) {
                return res.status(404).json({ error: 'Game not found' });
            }

            res.json({
                message: 'Game result updated',
                game
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // GET /api/games/predictions-active
    
    getPredictionActiveGames: async (req, res) => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const nbaGamesData = await sportsDataService.getGamesByDate(today);
            
            // Filter for scheduled games only
            const predictionActiveGames = nbaGamesData.games
                .filter(gameRow => gameRow[3] === 1) // Scheduled status
                .map(gameRow => ({
                    gameId: gameRow[2].toString(),
                    gameDate: new Date(),
                    homeTeam: {
                        id: gameRow[6].toString(),
                        name: gameRow[7],
                        abbreviation: gameRow[8]
                    },
                    awayTeam: {
                        id: gameRow[9].toString(),
                        name: gameRow[10],
                        abbreviation: gameRow[11]
                    },
                    status: 'scheduled',
                    isPredictionActive: true,
                    predictionDeadline: new Date(Date.now() + 30 * 60 * 1000)
                }));

            res.json({
                games: predictionActiveGames,
                count: predictionActiveGames.length,
                message: predictionActiveGames.length === 0 ? 'No games available for predictions right now' : null
            });

        } catch (error) {
            // Fallback to local DB
            const now = new Date();
            const games = await Game.find({
                isPredictionActive: true,
                predictionDeadline: { $gt: now },
                status: 'scheduled'
            }).sort({ gameDate: 1 });

            res.json({
                games,
                count: games.length,
                message: games.length === 0 ? 'No games available for predictions right now' : null,
                source: 'cached'
            });
        }
    }
};

export default gameController;