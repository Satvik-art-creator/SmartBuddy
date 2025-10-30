const mongoose = require('mongoose');
const { Schema } = mongoose;

const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  delivered: { type: Boolean, default: false },
}, { timestamps: { createdAt: true, updatedAt: false }});

module.exports = mongoose.model('Message', messageSchema);
