const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const updateXP = require('../utils/updateXP');

const router = express.Router();

// Get wellness tip
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { mood } = req.query;
    
    // Define tips based on mood
    const tips = {
      Happy: [
        "Keep it up! Try joining today's AI Workshop 🎯",
        "Your positive energy is contagious! Keep spreading the smiles.",
        "A great day! Consider helping a friend with their studies."
      ],
      Neutral: [
        "Take a 10-minute break, you got this.",
        "Every moment is a fresh beginning. Keep going!",
        "Small progress is still progress. Stay steady."
      ],
      Stressed: [
        "Breathe deeply — focus on one small task at a time.",
        "It's okay to take a step back. You're doing your best.",
        "Remember: this moment will pass. You've overcome challenges before."
      ]
    };

    const selectedTips = tips[mood] || tips.Neutral;
    const randomTip = selectedTips[Math.floor(Math.random() * selectedTips.length)];

    res.json({ tip: randomTip });
  } catch (error) {
    console.error('Wellness tip error:', error);
    res.status(500).json({ message: 'Server error getting wellness tip' });
  }
});

// Check-in and add XP
router.post('/checkin', authMiddleware, async (req, res) => {
  try {
    const { mood, tip } = req.body;
    const user = req.user;

    // Check if user has already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Ensure moodHistory is an array
    const userMoodHistory = user.moodHistory || [];
    
    const hasCheckedInToday = userMoodHistory.some(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    if (hasCheckedInToday) {
      return res.status(400).json({ 
        message: 'You have already checked in today! Come back tomorrow for more XP.',
        alreadyCheckedIn: true,
        xp: user.xp
      });
    }

    // Add XP using utility function (only if not checked in today)
    const updatedXP = await updateXP(user._id, 10, 'Wellness check-in');
    
    // Add to mood history
    user.moodHistory.push({
      mood,
      date: new Date(),
      tip
    });

    await user.save();

    res.json({
      message: 'Check-in successful',
      xp: updatedXP,
      alreadyCheckedIn: false
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: 'Server error during check-in' });
  }
});

module.exports = router;

