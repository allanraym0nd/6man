import Team from "../models/Team.js";
import mongoose from "mongoose";
import sportsDataService from "../services/sportsDataService.js";
import {connectDb} from '../config/connectDB.js';

const seedTeams = async() => {
  try {
    console.log('Fetching NBA teams from API...');
    const teamsData = await sportsDataService.getTeams();
    console.log('First team from API:', JSON.stringify(teamsData[0], null, 2));
    console.log('Total teams fetched:', teamsData.length);
    
    console.log('Clearing existing teams...');
    await Team.deleteMany({});
    
    // Debug: Check a few teams for missing fields
    console.log('\n--- Checking for problematic teams ---');
    teamsData.forEach((team, index) => {
      if (!team.city || !team.division || team.city === '' || team.division === '') {
        console.log(`Team ${index + 1} (${team.name}) - City: "${team.city}", Division: "${team.division}"`);
      }
    });
    
    const transformedTeams = teamsData.map(team => {
      // Add validation and fallbacks
      const transformedTeam = {
        teamId: team.id.toString(),
        name: team.name || 'Unknown Team',
        abbreviation: team.abbreviation || 'UNK',
        nickname: team.name ? team.name.split(' ').pop() : 'Unknown',
        city: team.city && team.city.trim() !== '' ? team.city : 'Unknown City', // Handle empty strings
        conference: team.conference === 'East' ? 'Eastern' : 'Western',
        division: team.division && team.division.trim() !== '' ? team.division : 'Atlantic', // Handle empty strings
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
        isActive: true
      };
      
      // Debug log for first transformed team
      if (team.id === 1) {
        console.log('\n--- First transformed team ---');
        console.log(JSON.stringify(transformedTeam, null, 2));
      }
      
      return transformedTeam;
    });
    
    console.log('Inserting new teams...');
    const teams = await Team.insertMany(transformedTeams);
    console.log(`Successfully seeded ${teams.length} teams`);
    return teams;
  } catch(error) {
    console.error('Error seeding teams:', error);
    throw error;
  }
}

export default seedTeams;

if(import.meta.url === `file://${process.argv[1]}`) {
  await connectDb();
  await seedTeams();
  await mongoose.connection.close();
  process.exit(0);
}