import mongoose from "mongoose";
import { connectDb,disconnectDB } from "../config/connectDB";
import seedTeams from "./team";
import seedPlayers from "./players";

const runAllSeeds = async() => {
    try {
        console.log("Start database seeding")

        await connectDb()

        await seedTeams()
        await seedPlayers()

         console.log('All seeding completed successfully!');


    }catch(error){ 
        console.error('Seeding failed:', error);
        process.exit(1)
        
    }finally {
        await disconnectDB()
        process.exit(0)
    }
}

runAllSeeds();