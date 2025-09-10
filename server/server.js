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
import errorHandler from './middleware/errorHandler.js';
import { adaptiveRateLimit, authRateLimit, generalRateLimit, predictionRateLimit,statsRateLimit } from './middleware/rateLimiting.js';
import redisClient from './config/redis.js';
import { connectDb, disconnectDB } from './config/connectDB.js';
import aiRoutes from './routes/aiRoutes.js'

dotenv.config();

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// try {
//   await redisClient.connect()
//    console.log('✅ Redis Connected');
// }catch(error){
//   console.log("Redis Connection failed, using memory based rate limiting")

// }

try {
  await connectDb()
}catch(error) {
  console.error('Database Connection Failed')
  process.exit(1)
}

// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sixthman')
//   .then(() => console.log('✅ MongoDB Connected'))
//   .catch(err => console.error('❌ MongoDB Error:', err));

app.use(adaptiveRateLimit);

  //routes
  app.use('/api/auth', authRateLimit, authRoutes)
  app.use('/api/competitions',competitionRoutes)
  app.use('/api/predictions',predictionRateLimit, predictionRoutes)
  app.use('/api/games',gameRoutes)
  app.use('/api/teams',teamRoutes)
  app.use('/api/players', playerRoutes);
  app.use('/api/playerstats', statsRateLimit, playerStatsRoutes);   
  app.use('/api/users', statsRateLimit,userRoutes)
  app.use('/api/leaderboards', statsRateLimit,leaderboardRoutes);
  app.use('/api/stats', statsRoutes);
  app.use('/api/ai', aiRoutes);



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

  process.on('SIGTERM', async() => {
    console.log('Shutting down gracefully...');
    await redisClient.disconnect();
    await disconnectDB()
    process.exit()
  });

app.use(errorHandler);
});