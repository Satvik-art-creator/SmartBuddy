const mongoose = require('mongoose');
const { Schema } = mongoose;

const connectionRequestSchema = new Schema({
  from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: {
    type: String,
    enum: ['pending','accepted','rejected'],
    default: 'pending',
    index: true
  },
  message: { type: String, maxlength: 256 },
}, { timestamps: true });

// Add compound index for fast queries
connectionRequestSchema.index({ to: 1, status: 1 });

module.exports = mongoose.model('ConnectionRequest', connectionRequestSchema);
