const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const updateXP = require('../utils/updateXP');
const axios = require('axios');

const router = express.Router();

// In-memory cache for tips (Map: userId-date => tips data)
const tipsCache = new Map();

/**
 * Generate cache key for user and date
 * @param {String} userId - User ID
 * @param {String} date - Date in YYYY-MM-DD format
 * @returns {String} Cache key
 */
function getCacheKey(userId, date) {
  return `${userId}-${date}`;
}

/**
 * Get today's date in YYYY-MM-DD format
 * @returns {String} Today's date
 */
function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
}

/**
 * Call Hugging Face API to generate personalized tips
 * @param {String} name - User's name
 * @param {Number} xp - User's XP level
 * @param {String} mood - User's mood
 * @param {String} activity - User's recent activity
 * @returns {Promise<Array<String>>} Array of generated tips
 */
async function generateAITips(name, xp, mood, activity) {
  try {
    const prompt = `You are SmartBuddy, an AI companion for students.
Generate 3 short motivational or wellness tips (<25 words each)
personalized for ${name}, XP level ${xp}, feeling ${mood},
with recent activity ${activity}.
Keep tone friendly, positive, and helpful.`;

    const response = await axios.post(
      'https://api-inference.huggingface.co/models/google/flan-t5-small',
      { inputs: prompt },
      {
        headers: {
          'Authorization': `Bearer ${process.env.HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Parse the response - flan-t5-small returns a generated text
    const generatedText = response.data[0]?.generated_text || '';
    
    // Split the response into individual tips
    // Try to split by common delimiters or lines
    let tips = [];
    if (generatedText) {
      // Remove any prefix/suffix text if present
      const cleanedText = generatedText.replace(/^(You are SmartBuddy[^:]*:)?\s*/i, '').trim();
      
      // Try to split by numbers or bullets
      tips = cleanedText
        .split(/\d+\.|[-•]\s*/)
        .map(tip => tip.trim())
        .filter(tip => tip.length > 0 && tip.length < 150) // Filter out invalid tips
        .slice(0, 3); // Limit to 3 tips
    }

    // If we couldn't parse properly, create fallback tips
    if (tips.length === 0) {
      tips = [
        `Hey ${name}! At your level, remember that small steps lead to big achievements. Keep pushing forward!`,
        `Feeling ${mood}? Take a moment to breathe and reflect. You're doing great at level ${xp}!`,
        `Your ${activity} shows dedication, ${name}! Every effort counts towards your growth.`
      ];
    }

    return tips;
  } catch (error) {
    console.error('Error calling Hugging Face API:', error.message);
    
    // Return fallback tips if API fails
    return [
      `Hey ${name}! Keep going strong at level ${xp}! Your perseverance is admirable.`,
      `Feeling ${mood}? Remember that every challenge is an opportunity to grow. You've got this!`,
      `Your recent ${activity} is building your success, ${name}. Stay positive and keep moving forward!`
    ];
  }
}

/**
 * POST /api/tips
 * Generate or retrieve personalized tips for the authenticated user
 * Request body: { name, xp, mood, activity }
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { name, xp, mood, activity } = req.body;

    // Validate input
    if (!name || !xp || !mood || !activity) {
      return res.status(400).json({
        message: 'Missing required fields: name, xp, mood, activity',
        error: 'MISSING_FIELDS'
      });
    }

    const today = getTodayDate();
    const cacheKey = getCacheKey(userId, today);

    // Check cache first
    if (tipsCache.has(cacheKey)) {
      const cachedData = tipsCache.get(cacheKey);
      console.log(`Returning cached tips for ${name} (${today})`);
      
      return res.json({
        tips: cachedData.tips,
        cached: true,
        date: today,
        message: 'AI Tips (cached)'
      });
    }

    // Generate new tips via AI
    console.log(`Generating new AI tips for ${name} (${today})`);
    const tips = await generateAITips(name, xp, mood, activity);

    // Cache the tips
    tipsCache.set(cacheKey, {
      tips,
      date: today,
      timestamp: Date.now()
    });

    // Schedule cache cleanup after 24 hours
    setTimeout(() => {
      tipsCache.delete(cacheKey);
      console.log(`Cleaned up cache for ${cacheKey}`);
    }, 24 * 60 * 60 * 1000); // 24 hours

    res.json({
      tips,
      cached: false,
      date: today,
      message: 'AI Tips (fresh)'
    });
  } catch (error) {
    console.error('Error in tips route:', error);
    res.status(500).json({
      message: 'Server error generating tips',
      error: error.message
    });
  }
});

module.exports = router;

