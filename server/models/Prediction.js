import mongoose from 'mongoose'

const predictionSchema = new Schema({

    type:{
        type:String,
        enum:['user', 'ai'],
        required:true

    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:'User',
        required: function() {return this.type === 'user'}
    },
    competitionLeague:{
        type:mongoose.Schema.ObjectId,
        ref:'Competition',
        required:function() {return this.type === 'user'}
    },
    gameId:{
        type:String,
        required:true
    },
    gameDate:{
        type:Date,
        required:true
    },
    prediction:{
        points: { type: Number, required: true },
        rebounds: { type: Number, required: true },
        assists: { type: Number, required: true },
        steals: { type: Number },

    },
    aiModel:{
        type:String, // Which AI model made this prediction
        required:function() {return this.type === 'ai'}
    },
    confidence:{
        type:Number,
        required: function() {return this.type === 'user'}

    },
    actualStats:{
        points: { type: Number },
        rebounds:{ type: Number },
        assists: { type: Number },
        steals: { type: Number },
    },
    accuracy:{
        pointsAccuracy: { type: Number },
        reboundsAccuracy: { type: Number },
        assistsAccuracy: { type: Number },
        overallAccuracy: { type: Number }
    },
    pointsEarned:{
        type:Number, 
        default:0
    },
    status:{
        type:String,
        enum:['pending', 'completed', 'cancelled'],
        defaut:'pending'

    }
    
} ,
{timestamps:true}
)

predictionSchema.index({gameId:1, user:1, player:1, competitionLeague:1}, {
    unique:true,
    partialFeatureExpression:'user'
})

predictionSchema.index({gameId:1, user:1, player:1, competitionLeague:1}, {
    unique:true,
    partialFeatureExpression:'ai'
})

export default mongoose.model('Prediction', predictionSchema)