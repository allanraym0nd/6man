import Player from "../models/Player.js";
import mongoose from "mongoose";
import sportsDataService from "../services/sportsDataService.js";
import {connectDb} from '../config/connectDB.js';

const seedPlayers = async() => {
  try {
    console.log('Fetching NBA players from NBA.com official API...');
    console.log('Clearing existing players...');
    await Player.deleteMany({});

    const playersData = await sportsDataService.getPlayers();
    console.log('Raw players data length:', playersData.length);
    console.log('First player raw data:', playersData[0]);

    const transformedPlayers = playersData.map(playerRow => {
      // NBA.com returns arrays: [PERSON_ID, DISPLAY_LAST_COMMA_FIRST, DISPLAY_FIRST_LAST, ROSTERSTATUS, FROM_YEAR, TO_YEAR, PLAYERCODE, TEAM_ID, TEAM_CITY, TEAM_NAME, TEAM_ABBREVIATION, TEAM_CODE, GAMES_PLAYED_FLAG]
      const personId = playerRow[0];
      const lastCommaFirst = playerRow[1] || '';
      const firstLast = playerRow[2] || '';
      const rosterStatus = playerRow[3];
      const fromYear = playerRow[4];
      const toYear = playerRow[5];
      const teamId = playerRow[7];
      const teamCity = playerRow[8] || '';
      const teamName = playerRow[9] || '';
      const teamAbbreviation = playerRow[10] || '';
      
      // Parse name from firstLast format
      const nameParts = firstLast.split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';
      
      return {
        playerId: personId.toString(),
        firstName: firstName,
        lastName: lastName,
        fullName: firstLast,
        team: {
          id: teamId ? teamId.toString() : 'unknown',
          name: teamName,
          abbreviation: teamAbbreviation
        },
        jersey: null,
        position: 'F', // NBA.com doesn't provide position in this endpoint
        height: {
          feet: null,
          inches: null,
          total: null
        },
        weight: null,
        age: null,
        experience: toYear && fromYear ? toYear - fromYear : null,
        status: rosterStatus === 1 ? 'active' : 'inactive',
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
        isPredictionEligible: rosterStatus === 1
      };
    });

    // Filter for only active players
    const activePlayers = transformedPlayers.filter(player => player.status === 'active');

    console.log(`Total players from API: ${transformedPlayers.length}`);
    console.log(`Active players to insert: ${activePlayers.length}`);
    console.log('Sample transformed player:', JSON.stringify(activePlayers[0], null, 2));

    const players = await Player.insertMany(activePlayers);
    console.log(`Successfully seeded ${players.length} current NBA players`);
    return players;

  } catch(error) {
    console.log("Error seeding players:", error);
    throw error;
  }
}

export default seedPlayers;

if(import.meta.url === `file://${process.argv[1]}`) {
  await connectDb();
  await seedPlayers();
  await mongoose.connection.close();
  process.exit(0);
}