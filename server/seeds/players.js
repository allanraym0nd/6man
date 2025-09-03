import Player from "../models/Player.js";
import mongoose from "mongoose";
import SportsDataService from "../services/sportsDataService.js";
import {connectDb} from '../config/connectDB.js';

const seedPlayers = async() => {
    try {
    console.log('Fetching NBA players from API...');

     console.log('Clearing existing players...');
     await Player.deleteMany({})

     let allPlayers = []
     let currentPage = 1
     let hasMorePages = true

     while (hasMorePages) {
         console.log(`Fetching page ${currentPage}...`);
         const result = await SportsDataService.getPlayers(currentPage,100)

        const transformedPlayers = result.players.map(player => ({
        playerId: player.id.toString(),
        firstName: player.firstName,
        lastName: player.lastName,
        fullName: `${player.firstName} ${player.lastName}`,
        team: {
          id: player.team.id.toString(),
          name: player.team.name,
          abbreviation: player.team.abbreviation
        },
        jersey: null, // API doesn't provide
        position: player.position || 'F',
        height: {
          feet: null,
          inches: null,
          total: player.height || null
        },
        weight: player.weight || null,
        age: null,
        experience: null,
        status: 'active',
        seasonStats: {
          season: '2024-25',
          gamesPlayed: 0,
          gamesStarted: 0,
          averages: {
            points: 0,
            rebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0,
            fieldGoalPercentage: 0,
            threePointPercentage: 0,
            freeThrowPercentage: 0,
            minutesPerGame: 0
          }
        },
        recentForm: {
          games: 0,
          averages: {
            points: 0,
            rebounds: 0,
            assists: 0
          }
        },
        isPredictionEligible: true
      }));

         allPlayers = allPlayers.concat(result.players)

         hasMorePages = result.meta.current_page < result.meta.total_pages
         currentPage++;


         await new Promise(resolve => setTimeout(resolve,1000))
     }

      console.log('Inserting players...');
      const players = await Player.insertMany(allPlayers);

    console.log(`Successfully seeded ${players.length} players`);
    return players

    }catch(error){
        console.log("Error seeding players", error)
        throw error;
    }

}

export default seedPlayers;

if(import.meta.url === `file://${process.argv[1]}`){
    await connectDb();
    await seedPlayers();
    await mongoose.connection.close();
    process.exit(0);

}