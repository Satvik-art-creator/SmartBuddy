const User = require('../models/User');

/**
 * Updates user XP and logs the action
 * @param {String} userId - The user's ID
 * @param {Number} xpToAdd - Amount of XP to add
 * @param {String} reason - Reason for the XP award
 * @returns {Promise<Number>} Updated XP total
 */
async function updateXP(userId, xpToAdd, reason) {
  try {
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Add XP
    user.xp = (user.xp || 0) + xpToAdd;
    
    // Save the updated user
    await user.save();

    // Log to console
    console.log(`Added ${xpToAdd} XP to ${user.name} for ${reason}`);
    console.log(`User ${user.name} now has ${user.xp} total XP`);

    // Return updated XP
    return user.xp;
  } catch (error) {
    console.error('Error updating XP:', error);
    throw error;
  }
}

module.exports = updateXP;

