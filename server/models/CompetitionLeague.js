import mongoose from 'mongoose'

const competitionLeagueSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        maxLength:50
    },
    description:{
        type:String,
        maxLength:200,    
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    type: {
        type:String,
        enum: ['public','private','invite-only'],
        default:'public'
    },
    settings: {
        maxMembers: { type: Number, default: 100 },
        entryFee: { type: Number, default: 0 },
        prizePool: { type: Number, default: 0 },
        duration: { type: String, enum: ['weekly', 'monthly', 'season'], default: 'weekly' },
        difficulty: { type: String, enum: ['beginner', 'intermediate', 'expert'], default: 'beginner' }
  },
  stats: {
    totalMembers:{type: Number, default:0},
    totalPredictions:{type:Number, default:0},
    averageAccuracy:{type:Number, default:0}
  },
  isActive:{
    type:Boolean,
    default:true
  },
  startDate: {
    type:Date,
    default: Date.now()
  },
  endDate:{
    type: Date
  }
}, {
    timestamps:true
})

export default mongoose.model('CompetionLeague', competitionLeagueSchema)