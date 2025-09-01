import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'
import competitionRoutes from './routes/competitionRoutes.js';
import predictionRoutes from './routes/predictionRoutes.js';
import CompetitionLeague from './models/CompetitionLeague.js';
import gameRoutes from './routes/gameRoutes.js';
import teamRoutes from './routes/teamRoutes.js';
import playerRoutes from './routes/players.js';
import playerStatsRoutes from './routes/playerStats.js';
import userRoutes from './routes/userRoutes.js'
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import statsRoutes from './routes/statRoutes.js';
// import { connectDb } from './config/connectDB.js';

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// await connectDb()
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sixthman')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('❌ MongoDB Error:', err));

  //routes
  app.use('/api/auth', authRoutes)
  app.use('/api/competitions', competitionRoutes)
  app.use('/api/predictions',predictionRoutes)
  app.use('/api/games',gameRoutes)
  app.use('/api/teams',teamRoutes)
  app.use('/api/players', playerRoutes);
  app.use('/api/playerstats', playerStatsRoutes);   
  app.use('/api/users', userRoutes)
  app.use('/api/leaderboards', leaderboardRoutes);
  app.use('/api/stats', statsRoutes);


app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'SixthMan API is running! 🏀',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});


app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 SixthMan server running on port ${PORT}`);
  console.log(`📡 Test endpoint: http://localhost:${PORT}/api/test`);
});