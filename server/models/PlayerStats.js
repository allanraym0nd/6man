import mongoose from 'mongoose'

const playerStatsSchema = new mongoose.schema({
  playerId:{
     type:String,
     required:true,
     ref:'Player'
    },
 gameId:{
    type: String,
    required: true,
    ref: 'Game'
    },
 gameDate: {
    type: Date,
    required: true
  },
  season: {
    type: String,
    required: true 
  },
  gameType: {
    type: String,
    enum: ['regular', 'playoff', 'preseason'],
    default: 'regular'
  },
    player: {
    name: { type: String, required: true },
    team: { type: String, required: true }, // "LAL"
    position: { type: String, required: true }
  },
  opponent: {
    team: { type: String, required: true }, // "GSW"
    isHome: { type: Boolean, required: true } // Was player's team at home?
  },
  // Playing time
  minutes: {
    type: Number,
    required: true
  },
  started: {
    type: Boolean,
    default: false
  },
  stats: {
    points: { type: Number, required: true, default: 0 },
    rebounds: { type: Number, required: true, default: 0 },
    assists: { type: Number, required: true, default: 0 },
    steals: { type: Number, default: 0 },
    blocks: { type: Number, default: 0 },
    turnovers: { type: Number, default: 0 }
  },

  shooting: {
    fieldGoals:{
        made:{type:Number, default:0},
        attempted:{type:Number, default:0},
        percentage:{type:Number, default:0}

    },
    threePointers:{
        made:{type:Number, default:0},
        attempted:{type:Number, default:0},
        percentage:{type:Number, default:0}

    },
    freeThrows:{
        made:{type:Number, default:0},
        attempted:{type:Number, default:0},
        percentage:{type:Number, default:0}

    }

  },

    advanced: {
    plusMinus: { type: Number, default: 0 },
    efficiency: { type: Number, default: 0 }, // PER calculation
    trueShootingPercentage: { type: Number, default: 0 },
    usageRate: { type: Number, default: 0 }
  },

   performance: {
    isDoubleDouble: { type: Boolean, default: false },
    isTripleDouble: { type: Boolean, default: false },
    fantasyPoints: { type: Number, default: 0 },
    gameScore: { type: Number, default: 0 } // NBA game score metric
  },

    context: {
    daysRest: { type: Number }, 
    backToBack: { type: Boolean, default: false },
    homeGame: { type: Boolean, required: true },
    minutesRestriction: { type: Boolean, default: false }, // Injury management
    blowout: { type: Boolean, default: false } // Game decided early
  }
},{
    timestamps:true
})

playerStatsSchema.index({playerId:1, gameDate:-1})
playerStatsSchema.index({playerId:1, season:1})
playerStatsSchema.index({gameId:1})
playerStatsSchema.index({season:1, gameType:1})
playerStatsSchema.index({'player.team':1, gameDate:-1})

playerStatsSchema.virtual('basicStats').get(function() {
    return{
        points:this.stats.points,
        rebounds:this.stats.rebounds,
        assists:this.stats.assists
    }
})

playerStatsSchema.methods.meetsThreshold = function(threshold){
    return {
        points: this.stats.points >= threshold.points,
        rebounds: this.stats.rebounds >= threshold.rebounds,
        assists: this.stats.assists >= threshold.assists
    }
}

playerStatsSchema.statics.getPlayerAverages = function(playerId, season ,gameType = 'Regular'){
    return this.aggregate ([
            {
            $match: { 
                playerId: playerId,
                season: season,
                gameType: gameType
            }
            },
            {
                $group:{
                    _id:null,
                    avgPoints: { $avg: '$stats.points' },
                    avgRebounds: { $avg: '$stats.rebounds' },
                    avgAssists: { $avg: '$stats.assists' },
                    avgMinutes: { $avg: '$minutes' },
                    totalPoints: { $sum: '$stats.points' },
                    totalRebounds: { $sum: '$stats.rebounds' },
                    totalAssists: { $sum: '$stats.assists' }
                }
            }

    ])
}

     playerStatsSchema.statics.getRecentForm = function(playerId, games = 5) {
        return this.find({playerId})
        .sort({ gameDate: -1 })
        .limit(games)
        .select('stats gameDate opponent');
     }

export default mongoose.schema('PlayerStats', playerStatsSchema)