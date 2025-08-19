import mongoose from 'mongoose'

const playerSchema = new mongoose.Schema({
    //NBA API Identifiers
 playerId: {
        type:String,
        required:true,
        unique:true
    },
 firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true // "LeBron James"
  },

  //Team information
  team: {
    id:{type:Number, required:true},
    name: { type: String, required: true },
    abbreviation: { type: String, required: true }
  },

  // Player details
  jersey: {
    type: Number,
    required: true // 23
  },
  position: {
    type: String,
    enum: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F'],
    required: true
  },
  height:{
    feet:{type: Number},
    inches:{type:Number},
    total:{type:String} // like 6'9
  },
  weight: {
    type: Number // pounds
  },
  age: {
    type: Number
  },
  experience: {
    type: Number // years in NBA
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'injured', 'suspended'],
    default: 'active'
  },
  injury: {
    status: { type: String }, // "day-to-day", "out"
    description: { type: String }, // "ankle sprain"
    expectedReturn: { type: Date }
  },
  // season stats
  seasonStats: {
    season:String,
    gamesPlayed: {type:Number, default:0},
    gamesStarted: {type:Number, default:0},
    averages:{
        points: { type: Number, default: 0 },
        rebounds: { type: Number, default: 0 },
        assists: { type: Number, default: 0 },
        steals: { type: Number, default: 0 },
        blocks: { type: Number, default: 0 },
        turnovers: { type: Number, default: 0 },
        fieldGoalPercentage: { type: Number, default: 0 },
        threePointPercentage: { type: Number, default: 0 },
        freeThrowPercentage: { type: Number, default: 0 },
        minutesPerGame: { type: Number, default: 0}

    }
  },

  recentForm:{
    games:{type:Number, default:0},
    averages:{
        points:{type:Number, default:0},
        rebounds: { type: Number, default: 0 },
        assists: { type: Number, default: 0 }
    }
  },
  // Player photo/info
  photo: {
    type: String // URL to player photo
  },
  birthDate: {
    type: Date
  },
  college: {
    type: String
  },
  draftInfo: {
    year: { type: Number },
    round: { type: Number },
    pick: { type: Number }
  },

  isPredictionEligible: {
    type: Boolean,
    default: true // Can users make predictions on this player?
  }
},{
    timestamps:true
  }
)

playerSchema.index({'team.id':1})
playerSchema.index({'status':1})
playerSchema.index({'position':1})
playerSchema.index({'fullName':'text'})


export default mongoose.model('Player',playerSchema )