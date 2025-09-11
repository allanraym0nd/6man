import Team from "../models/Team.js";
import mongoose from "mongoose";
import sportsDataService from "../services/sportsDataService.js";
import {connectDb} from '../config/connectDB.js';

// NBA team mappings
const teamMappings = {
  'Atlanta Hawks': { city: 'Atlanta', division: 'Southeast', conference: 'Eastern' },
  'Boston Celtics': { city: 'Boston', division: 'Atlantic', conference: 'Eastern' },
  'Brooklyn Nets': { city: 'Brooklyn', division: 'Atlantic', conference: 'Eastern' },
  'Charlotte Hornets': { city: 'Charlotte', division: 'Southeast', conference: 'Eastern' },
  'Chicago Bulls': { city: 'Chicago', division: 'Central', conference: 'Eastern' },
  'Cleveland Cavaliers': { city: 'Cleveland', division: 'Central', conference: 'Eastern' },
  'Dallas Mavericks': { city: 'Dallas', division: 'Southwest', conference: 'Western' },
  'Denver Nuggets': { city: 'Denver', division: 'Northwest', conference: 'Western' },
  'Detroit Pistons': { city: 'Detroit', division: 'Central', conference: 'Eastern' },
  'Golden State Warriors': { city: 'Golden State', division: 'Pacific', conference: 'Western' },
  'Houston Rockets': { city: 'Houston', division: 'Southwest', conference: 'Western' },
  'Indiana Pacers': { city: 'Indiana', division: 'Central', conference: 'Eastern' },
  'LA Clippers': { city: 'Los Angeles', division: 'Pacific', conference: 'Western' },
  'Los Angeles Lakers': { city: 'Los Angeles', division: 'Pacific', conference: 'Western' },
  'Memphis Grizzlies': { city: 'Memphis', division: 'Southwest', conference: 'Western' },
  'Miami Heat': { city: 'Miami', division: 'Southeast', conference: 'Eastern' },
  'Milwaukee Bucks': { city: 'Milwaukee', division: 'Central', conference: 'Eastern' },
  'Minnesota Timberwolves': { city: 'Minnesota', division: 'Northwest', conference: 'Western' },
  'New Orleans Pelicans': { city: 'New Orleans', division: 'Southwest', conference: 'Western' },
  'New York Knicks': { city: 'New York', division: 'Atlantic', conference: 'Eastern' },
  'Oklahoma City Thunder': { city: 'Oklahoma City', division: 'Northwest', conference: 'Western' },
  'Orlando Magic': { city: 'Orlando', division: 'Southeast', conference: 'Eastern' },
  'Philadelphia 76ers': { city: 'Philadelphia', division: 'Atlantic', conference: 'Eastern' },
  'Phoenix Suns': { city: 'Phoenix', division: 'Pacific', conference: 'Western' },
  'Portland Trail Blazers': { city: 'Portland', division: 'Northwest', conference: 'Western' },
  'Sacramento Kings': { city: 'Sacramento', division: 'Pacific', conference: 'Western' },
  'San Antonio Spurs': { city: 'San Antonio', division: 'Southwest', conference: 'Western' },
  'Toronto Raptors': { city: 'Toronto', division: 'Atlantic', conference: 'Eastern' },
  'Utah Jazz': { city: 'Utah', division: 'Northwest', conference: 'Western' },
  'Washington Wizards': { city: 'Washington', division: 'Southeast', conference: 'Eastern' }
};

const seedTeams = async() => {
  try {
    console.log('Fetching NBA teams from NBA.com official API...');
    const teamsData = await sportsDataService.getTeams();
    console.log('Raw teams data length:', teamsData.length);
    console.log('First team raw data:', teamsData[0]);
    
    console.log('Clearing existing teams...');
    await Team.deleteMany({});
    
    const transformedTeams = teamsData.map(teamRow => {
      // NBA.com returns arrays: [TEAM_ID, TEAM_NAME, GP, W, L, W_PCT, ...]
      const teamId = teamRow[0];
      const teamName = teamRow[1];
      const gamesPlayed = teamRow[2] || 0;
      const wins = teamRow[3] || 0;
      const losses = teamRow[4] || 0;
      const winPct = teamRow[5] || 0;
      
      // Get team info from mapping
      const teamInfo = teamMappings[teamName] || {
        city: teamName.split(' ')[0],
        division: 'Atlantic',
        conference: 'Eastern'
      };
      
      // Generate abbreviation from team name
      const words = teamName.split(' ');
      let abbreviation;
      if (words.length >= 2) {
        abbreviation = words[words.length - 1].substring(0, 3).toUpperCase();
      } else {
        abbreviation = teamName.substring(0, 3).toUpperCase();
      }
      
      return {
        teamId: teamId.toString(),
        name: teamName,
        abbreviation: abbreviation,
        nickname: words[words.length - 1],
        city: teamInfo.city,
        conference: teamInfo.conference,
        division: teamInfo.division,
        currentSeason: {
          season: '2024-25',
          record: {
            wins: wins,
            losses: losses,
            winPercentage: winPct
          },
          standings: {
            conferenceRank: null,
            divisionRank: null,
            overallRank: null
          }
        },
        isActive: true
      };
    });
    
    console.log('Sample transformed team:', JSON.stringify(transformedTeams[0], null, 2));
    
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