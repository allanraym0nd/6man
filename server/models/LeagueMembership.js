import mongoose from 'mongoose';

const leagueMembershipSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  competitionLeague: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompetitionLeague',
    required: true
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'banned'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['member', 'admin', 'moderator'],
    default: 'member'
  },
  stats: {
    predictions: { type: Number, default: 0 },
    correctPredictions: { type: Number, default: 0 },
    accuracy: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    rank: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

leagueMembershipSchema.index({user:1, competitionLeague:1}, {unique:true})

export default mongoose.model('LeagueMembership', leagueMembershipSchema)