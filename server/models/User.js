import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        minLength:3,
        maxlength:20
    },
    email:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        trim:true
    },
    password:{
        type:String,
        required:true,
        minlength:6
    },
    avatar:{
        type:String,
        default: '',
    },
    stats:{
        totalPredictions: {type:String, default: 0 },
        correctPredictions: { type: Number, default: 0 },
        accuracy: { type: Number, default: 0 },
        weeklyPoints: { type: Number, default: 0 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        rank: { type: Number, default: 0 }

    }
}, {
    timestamps: true

})

// hash password before saving
userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next() // if the password has not been modified (e.g., the user is just updating their email or name), the function immediately calls next(), 
    this.password = await bcrypt.hash(this.password,12)
    next()
})
// 'this' refers to the Mongoose document that is currently being processed. I

// match/confirm password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema);

// commonJS: module.exports = mongoose.model('User', userSchema);