const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/authMiddleware');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const { getIO, getUserSocketMap } = require('../socket');

function emitToUser(userId, event, data) {
  const io = getIO();
  const userSocketMap = getUserSocketMap();
  const socketId = userSocketMap.get(userId.toString());
  if (io && socketId) {
    io.to(socketId).emit(event, data);
    return true;
  }
  return false;
}

// GET /api/conversations - list user's conversations
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name _id');

    const convoIds = conversations.map(c => c._id);
    // Incoming unread for current user (messages from other user not yet delivered to current user)
    const incomingAgg = await Message.aggregate([
      { $match: { conversationId: { $in: convoIds }, delivered: false, sender: { $ne: new mongoose.Types.ObjectId(userId) } } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } }
    ]);
    const outgoingAgg = await Message.aggregate([
      { $match: { conversationId: { $in: convoIds }, delivered: false, sender: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: '$conversationId', count: { $sum: 1 } } }
    ]);
    const incomingMap = new Map(incomingAgg.map(r => [r._id.toString(), r.count]));
    const outgoingMap = new Map(outgoingAgg.map(r => [r._id.toString(), r.count]));

    const payload = conversations.map(c => {
      const obj = c.toObject();
      obj.unreadIncoming = incomingMap.get(c._id.toString()) || 0; // messages I need to read
      obj.unreadOutgoing = outgoingMap.get(c._id.toString()) || 0; // messages the other user hasn't read
      return obj;
    });
    res.json({ conversations: payload });
  } catch (err) {
    console.error('[Conversations][List][ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch conversations.' });
  }
});

// GET /api/conversations/:id/messages?limit=50&skip=0 - paginated messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, skip = 0 } = req.query;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid conversation id.' });
    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found.' });
    if (!convo.participants.map(p => p.toString()).includes(req.user.id)) {
      return res.status(403).json({ message: 'Not a participant of this conversation.' });
    }
    const docs = await Message.find({ conversationId: id })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    const currentId = req.user.id.toString();
    const messages = docs.reverse().map((m) => {
      const obj = m.toObject();
      obj.isSelf = (m.sender?.toString?.() || `${m.sender}`) === currentId;
      return obj;
    });
    res.json({ messages });
  } catch (err) {
    console.error('[Conversations][GetMessages][ERROR]', err);
    res.status(500).json({ message: 'Failed to fetch messages.' });
  }
});

// POST /api/conversations/:id/messages - send a message
router.post('/:id/messages', auth, async (req, res) => {
  try {
    const { id } = req.params;
    let { text } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: 'Invalid conversation id.' });
    if (!text || typeof text !== 'string') return res.status(400).json({ message: 'Text is required.' });
    text = (text || '').trim();
    if (text.length === 0) return res.status(400).json({ message: 'Message cannot be empty.' });
    if (text.length > 2000) return res.status(400).json({ message: 'Message too long (max 2000).' });

    const convo = await Conversation.findById(id);
    if (!convo) return res.status(404).json({ message: 'Conversation not found.' });
    const participants = convo.participants.map(p => p.toString());
    if (!participants.includes(req.user.id)) return res.status(403).json({ message: 'Not a participant of this conversation.' });

    const message = new Message({ conversationId: id, sender: req.user.id, text });
    await message.save();

    convo.lastMessage = text;
    await convo.save();

    const otherParticipant = participants.find(p => p !== req.user.id);
  const notified = emitToUser(otherParticipant, 'chat_message', { message });
    console.log(`[Message] ${message._id} sent in convo ${id} from ${req.user.id} -> ${otherParticipant} Notified: ${notified}`);

  // Include isSelf flag for the sender in REST response
  const payload = message.toObject();
  payload.isSelf = true;
  res.json({ message: payload });
  } catch (err) {
    console.error('[Conversations][SendMessage][ERROR]', err);
    res.status(500).json({ message: 'Failed to send message.' });
  }
});

module.exports = router;
