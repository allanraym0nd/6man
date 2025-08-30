import mongoose from 'mongoose' 

const teamSchema =new mongoose.Schema({
    // NBA API Identifiers
    teamId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  abbreviation: {
    type: String,
    required: true, // "LAL"
    unique: true
  },
  nickname: {
    type: String,
    required: true // "Lakers"
  },
  city: {
    type: String,
    required: true // "Los Angeles"
  },

  //UI stuff
   colors: {
    primary: { type: String }, 
    secondary: { type: String }, 
    accent: { type: String }
  },
  logo: {
    type: String // URL to team logo
  },

   conference: {
    type: String,
    enum: ['Eastern', 'Western'],
    required: true
  },
  division: {
    type: String,
    enum: ['Atlantic', 'Central', 'Southeast', 'Northwest', 'Pacific', 'Southwest'],
    required: true
  },

  currentSeason: {
    season: {type:String, required:true},
    record: {
        wins:{type:Number, default: 0},
        losses:{type:Number, default: 0},
        winPercentage:{type:Number, default: 0}
    },
    standings:{
        conferenceRank: { type: Number },
        divisionRank: { type: Number },
        overallRank: { type: Number }

    }
  },

   // Team stats (for prediction context)
  stats: {
    offensive: {
      pointsPerGame: { type: Number },
      fieldGoalPercentage: { type: Number },
      threePointPercentage: { type: Number },
      reboundsPerGame: { type: Number },
      assistsPerGame: { type: Number }
    },
    defensive: {
      pointsAllowedPerGame: { type: Number },
      reboundsAllowedPerGame: { type: Number },
      stealsPerGame: { type: Number },
      blocksPerGame: { type: Number }
    },
    overall: {
      pace: { type: Number }, // Possessions per game
      efficiency: { type: Number }
    }
  },

  // Team info
  venue: {
    name: { type: String }, // "Crypto.com Arena"
    city: { type: String },
    capacity: { type: Number }
  },
  
  // Active status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
    timestamps:true
}); 

teamSchema.index({conference:1, division:1})
teamSchema.index({abbreviation:1})
teamSchema.index({'currentSeason.season':1})

export default mongoose.model('Team', teamSchema)