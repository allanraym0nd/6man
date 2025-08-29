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