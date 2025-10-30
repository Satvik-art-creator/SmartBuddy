const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const updateXP = require('../utils/updateXP');

const router = express.Router();

// Get current user's XP
router.get('/', authMiddleware, async (req, res) => {
  try {
    const user = req.user;
    
    // Refresh user data from database to get latest XP
    const updatedUser = await User.findById(user._id);
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      xp: updatedUser.xp || 0
    });
  } catch (error) {
    console.error('Error fetching XP:', error);
    res.status(500).json({ message: 'Server error fetching XP', error: error.message });
  }
});

// Add XP to user
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { xpToAdd, reason } = req.body;

    if (!xpToAdd || typeof xpToAdd !== 'number' || xpToAdd <= 0) {
      return res.status(400).json({ 
        message: 'Invalid XP amount',
        error: 'INVALID_XP'
      });
    }

    const updatedXP = await updateXP(req.user._id, xpToAdd, reason || 'Activity reward');

    res.json({
      message: `Added ${xpToAdd} XP`,
      xp: updatedXP
    });
  } catch (error) {
    console.error('Error adding XP:', error);
    res.status(500).json({ 
      message: 'Server error adding XP', 
      error: error.message 
    });
  }
});

module.exports = router;

