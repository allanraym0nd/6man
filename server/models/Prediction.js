import mongoose from 'mongoose';

const predictionSchema = new mongoose.Schema({

type: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return this.type === 'user'; } 
  },
  competitionLeague: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompetitionLeague',
    required: function() { return this.type === 'user'; } // AI predictions might be league-independent
  },
  gameId: {
    type: String,
    required: true
  },
  gameDate: {
    type: Date,
    required: true
  },
  player: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    team: { type: String, required: true },
    position: {type:String}
  },
  predictions: {
    points: { type: Number, required: true },
    rebounds: { type: Number, required: true },
    assists: { type: Number, required: true },
    steals: { type: Number },
    blocks: { type: Number },
    turnovers: { type: Number },
    fieldGoalPercentage: { type: Number },
    threePointers: { type: Number }
  },

  aiModel: {
    type: String, 
    required: function() { return this.type === 'ai'; }
  },
  confidence: {
    type: Number, 
    required: function() { return this.type === 'ai'; }
  },
  actualStats: {
    points: { type: Number },
    rebounds: { type: Number },
    assists: { type: Number },
    steals: { type: Number },
    blocks: { type: Number },
    turnovers: { type: Number },
    fieldGoalPercentage: { type: Number },
    threePointers: { type: Number }
  },
  accuracy: {
    pointsAccuracy: { type: Number },
    reboundsAccuracy: { type: Number },
    assistsAccuracy: { type: Number },
    overallAccuracy: { type: Number }
  },
  pointsEarned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate predictions

predictionSchema.index({ user: 1, gameId: 1, player: 1, competitionLeague: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: 'user' }
});
predictionSchema.index({ type: 1, gameId: 1, player: 1 }, { 
  unique: true, 
  partialFilterExpression: { type: 'ai' }
});

export default mongoose.model('Prediction', predictionSchema);