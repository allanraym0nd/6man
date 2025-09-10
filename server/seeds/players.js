import Player from "../models/Player.js";
import mongoose from "mongoose";
import sportsDataService from "../services/sportsDataService.js";
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
         const result = await sportsDataService.getPlayers(currentPage,100)
          console.log('API response structure:', JSON.stringify(result, null, 2));
            console.log('Total teams fetched:', result.length);

                if (!result || !result.players || result.players.length === 0) {
                 console.log("No more players or unexpected API response. Ending loop.");
                 hasMorePages = false;
                 break;
            }


         console.log(`First player from API: ${result.players[0].firstName} ${result.players[0].lastName}`);
         console.log(`Total players fetched on this page: ${result.players.length}`);


        const transformedPlayers = result.players.map(player => ({
        playerId: player.id.toString(),
        firstName: player.firstName || 'Unknown',
        lastName: player.lastName || 'Unknown',
        fullName: `${player.firstName} ${player.lastName}` || "Unknown",
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

         allPlayers.push(...transformedPlayers)

         if(result.players.length < 0) {
          console.log("Fewer players than requested. Assuming last page.");
          hasMorePages = false
         } else { 
             currentPage++;
         }

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