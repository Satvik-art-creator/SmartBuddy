const mongoose = require('mongoose');
const { Schema } = mongoose;

const conversationSchema = new Schema({
  participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }], // must be 2
  lastMessage: String,
}, { timestamps: true });

module.exports = mongoose.model('Conversation', conversationSchema);
