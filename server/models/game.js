import mongoose from 'mongoose'

const gameSchema = new mongoose.Schema({
    // NBA API Identifiers
    gameId: {
        type: String,
        required:true,
        unique:true
    },
    season: {
        type:String,
        required:true
    },
    gameType: {
        type:String,
        enum:['regular', 'preseason', 'preseason'],
        default: 'regular'
    },
    gameDate: {
    type: Date,
    required: true
  },
  gameTime: {
    type: String, // "7:30 PM ET"
    required: true
  },
  venue: {
    name:{type: String, required: true},
    city:{type: String, required: true},
    state:{type: String}
  },
  homeTeam: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String, required: true }, 
    record: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    }
  },
  awayTeam: {
    id: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    record: {
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 }
    }
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'final', 'postponed', 'cancelled'],
    default: 'scheduled'
  },
  score: {
    home: {type: Number},
    away:{type:Number},
    periods: [{
      period: { type: Number },
      home: { type: Number },
      away: { type: Number }
    }]
},
    gameStats: {
    totalPoints: { type: Number },
    pace: { type: Number },
    homeTeamStats: {
      fieldGoalPercentage: { type: Number },
      threePointPercentage: { type: Number },
      rebounds: { type: Number },
      assists: { type: Number }
    },
    awayTeamStats: {
      fieldGoalPercentage: { type: Number },
      threePointPercentage: { type: Number },
      rebounds: { type: Number },
      assists: { type: Number }
    }
  },
  predictionDeadline:{
    type:Date, // game start time
    required: true
  },
  isPredictionActive: {
    type: Boolean,
    default: true
  }  
},
{timestamp:true}
)

gameSchema.index({gameDate: 1}),
gameSchema.index({status: 1}),
gameSchema.index({season: 1, gameType:1}),
gameSchema.index({'homeTeam.id': 1, 'awayTeam.id':1})

export default mongoose.model('Game', gameSchema)