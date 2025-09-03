import Team from "../models/Team.js";
import mongoose from "mongoose";
import SportsDataService from "../services/sportsDataService.js";
import {connectDb} from '../config/connectDB.js';

const seedTeams = async() => {
    try {
         console.log('Fetching NBA teams from API...');
         const teamsData = await SportsDataService.getTeams()

         const transformedTeams = teamsData.map(team => ({
            teamId: team.id.toString(),
        name: team.name,
        abbreviation: team.abbreviation,
        nickname: team.name.split(' ').pop(), // "Los Angeles Lakers" -> "Lakers"
        city: team.city,
        conference: team.conference,
        division: team.division,
        currentSeason: {
            season: '2024-25',
            record: {
            wins: 0,
            losses: 0,
            winPercentage: 0
            },
            standings: {
            conferenceRank: null,
            divisionRank: null,
            overallRank: null
            }
        },
        stats: {
            offensive: {
            pointsPerGame: null,
            fieldGoalPercentage: null,
            threePointPercentage: null,
            reboundsPerGame: null,
            assistsPerGame: null
            },
            defensive: {
            pointsAllowedPerGame: null,
            reboundsAllowedPerGame: null,
            stealsPerGame: null,
            blocksPerGame: null
            },
            overall: {
            pace: null,
            efficiency: null
            }
        },
        isActive: true

         }))

         console.log('Clearing existing teams...');
         await Team.deleteMany({})

        console.log('Inserting new teams...');
        const teams = await Team.insertMany()

        console.log(`Successfully seeded ${teams.length} teams`)
        return teams;
    }catch(error){
        console.error('Error seeding teams:', error);
        throw error;
    }
}

export default seedTeams

   if(import.meta.url === `file://${process.argv[1]}`) {  //checks if the current file is being executed as the main script(team.js)
    await connectDb()
    await seedTeams()
    await mongoose.connection.close()
    process.exit(0) // if it exits with 0, the script ran sucessfully
   }
