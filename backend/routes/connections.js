const express = require('express');
const router = express.Router();
const ConnectionRequest = require('../models/ConnectionRequest');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { getIO, getUserSocketMap } = require('../socket');
const auth = require('../middleware/authMiddleware');
const updateXP = require('../utils/updateXP');
const mongoose = require('mongoose');

// Helper to emit to a user if they're online
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

// POST /api/connections/request
router.post('/request', auth, async (req, res) => {
  try {
    const { toUserId, message } = req.body;
    const from = req.user.id;
    if (toUserId === from) return res.status(400).json({ message: "Cannot send request to yourself." });
    if (!mongoose.Types.ObjectId.isValid(toUserId)) return res.status(400).json({ message: "Invalid user id." });
    if (message && message.length > 256) return res.status(400).json({ message: "Message too long." });

    const to = await User.findById(toUserId);
    if (!to) return res.status(404).json({ message: "Recipient not found." });

    // Prevent >5 outgoing pending requests
    const pendingCount = await ConnectionRequest.countDocuments({ from, status: 'pending' });
    if (pendingCount >= 5) return res.status(429).json({ message: "Max 5 outgoing pending requests allowed." });
    // No duplicate pending request
    const existing = await ConnectionRequest.findOne({ from, to: toUserId, status: 'pending' });
    if (existing) return res.status(409).json({ message: "Request already pending." });

    const request = new ConnectionRequest({ from, to: toUserId, message });
    await request.save();
    let notified = emitToUser(toUserId, 'notification', {
      type:'request',
      requestId: request._id,
      from,
      message
    });
    console.log(`[ConnectionRequest] Request ${request._id} created from ${from} -> ${toUserId}, Notified:`, notified);
    res.json({ request, notified });
  } catch (err) {
    console.error('[ConnectionRequest][ERROR]', err);
    res.status(500).json({ message: "Failed to create request." });
  }
});

// GET /api/connections/requests?status=pending
router.get('/requests', auth, async (req, res) => {
  try {
    const status = req.query.status || 'pending';
    const role = (req.query.role || 'to').toLowerCase(); // 'to' | 'from' | 'any'
    let filter = { status };
    if (role === 'to') {
      filter.to = req.user.id;
    } else if (role === 'from') {
      filter.from = req.user.id;
    } else {
      filter.$or = [{ to: req.user.id }, { from: req.user.id }];
    }
    const requests = await ConnectionRequest.find(filter)
      .populate('from', 'name _id')
      .populate('to', 'name _id')
      .sort({ createdAt: -1 });
    res.json({ requests });
  } catch (err) {
    console.error('[ConnectionRequest][Fetch][ERROR]', err);
    res.status(500).json({ message: "Could not fetch requests." });
  }
});

// POST /api/connections/respond
router.post('/respond', auth, async (req, res) => {
  try {
    const { requestId, action } = req.body;
    if (!['accept','reject'].includes(action)) {
      return res.status(400).json({ message: "Action must be 'accept' or 'reject'." });
    }
    const request = await ConnectionRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found." });
    if (request.to.toString() !== req.user.id) return res.status(403).json({ message: "Not authorized for this request." });
    if (request.status !== 'pending') return res.status(409).json({ message: `Request already ${request.status}.` });

    let conversation = null;
    let notified = false;
    if (action === 'accept') {
      request.status = 'accepted';
      await request.save();
      // Find or create 1:1 convo
      conversation = await Conversation.findOne({ participants: { $all: [request.from, request.to], $size: 2 } });
      let convoCreated = false;
      if (!conversation) {
        conversation = new Conversation({ participants: [request.from, request.to], lastMessage: '', });
        await conversation.save();
        convoCreated = true;
      }
      // XP awards if utility exists
      try { await updateXP(request.from, 15, 'Connection Request Accepted'); } catch(e) { }
      try { if (convoCreated) { await updateXP(request.from, 10, 'Conversation Created'); await updateXP(request.to, 10, 'Conversation Created'); } } catch(e) { }
      // Notify both users (update, conversation_created)
      notified = emitToUser(request.from, 'request_update', { request });
      emitToUser(request.from, 'conversation_created', { conversationId: conversation._id });
      emitToUser(request.to, 'request_update', { request });
      emitToUser(request.to, 'conversation_created', { conversationId: conversation._id });
      console.log(`[ConnectionRequest] ${request._id} accepted. Conversation: ${conversation._id}. Notified both!`);
    } else {
      request.status = 'rejected';
      await request.save();
      notified = emitToUser(request.from, 'request_update', { request });
      console.log(`[ConnectionRequest] ${request._id} rejected. Notified sender: ${notified}`);
    }
    res.json({ request, conversation, notified });
  } catch (err) {
    console.error('[ConnectionRequest][Respond][ERROR]', err);
    res.status(500).json({ message: "Failed to handle request." });
  }
});

module.exports = router;
