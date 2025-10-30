const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/profile/preview/:userId
router.get('/preview/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }

    // Validate there is a pending request FROM userId TO current user
    const pending = await ConnectionRequest.findOne({
      from: userId,
      to: req.user._id,
      status: 'pending'
    });

    if (!pending) {
      console.warn(`[ProfilePreview] Unauthorized attempt by ${req.user._id} to preview ${userId}`);
      return res.status(403).json({ message: 'Not authorized to preview this profile.' });
    }

    // Fetch limited public fields
    const user = await User.findById(userId).select('name about branch year xp skills interests avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const profile = {
      id: user._id,
      name: user.name,
      about: user.about || '',
      branch: user.branch || '',
      year: user.year || null,
      xp: user.xp || 0,
      skills: user.skills || [],
      interests: user.interests || [],
      avatar: user.avatar || ''
    };
    return res.json({ profile });
  } catch (e) {
    console.error('[ProfilePreview][ERROR]', e);
    return res.status(500).json({ message: 'Failed to load profile preview' });
  }
});

// Also support query param variant: /api/profile/preview?userId=...
router.get('/preview', auth, async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user id' });
    }
    const pending = await ConnectionRequest.findOne({ from: userId, to: req.user._id, status: 'pending' });
    if (!pending) {
      console.warn(`[ProfilePreview][Q] Unauthorized attempt by ${req.user._id} to preview ${userId}`);
      return res.status(403).json({ message: 'Not authorized to preview this profile.' });
    }
    const user = await User.findById(userId).select('name about branch year xp skills interests avatar');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const profile = {
      id: user._id,
      name: user.name,
      about: user.about || '',
      branch: user.branch || '',
      year: user.year || null,
      xp: user.xp || 0,
      skills: user.skills || [],
      interests: user.interests || [],
      avatar: user.avatar || ''
    };
    return res.json({ profile });
  } catch (e) {
    console.error('[ProfilePreview][Q][ERROR]', e);
    return res.status(500).json({ message: 'Failed to load profile preview' });
  }
});

module.exports = router;


