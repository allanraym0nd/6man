// tests/test-nba-official.js
import sportsDataService from '../services/sportsDataService.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const testNBAOfficial = async () => {
  try {
    console.log('Testing NBA.com official API...\n');
    
    const teams = await sportsDataService.getTeams();
    console.log('Teams count:', teams.length);
    console.log('First team data:', teams[0]);
    
    const players = await sportsDataService.getPlayers();
    console.log('\nPlayers count:', players.length);
    console.log('First player data:', players[0]);
    
    // Test for current superstars in the data
    const testPlayers = ['LeBron James', 'Stephen Curry', 'Giannis Antetokounmpo'];
    
    console.log('\n=== SUPERSTAR CHECK ===');
    testPlayers.forEach(starName => {
      const found = players.find(playerRow => {
        const fullName = playerRow[2]; // DISPLAY_FIRST_LAST
        return fullName && fullName.toLowerCase().includes(starName.toLowerCase());
      });
      
      if (found) {
        console.log(`✅ ${starName}: FOUND - Team: ${found[9]}`);
      } else {
        console.log(`❌ ${starName}: NOT FOUND`);
      }
    });
    
  } catch (error) {
    console.error('Test Error:', error.message);
  }
};

testNBAOfficial();