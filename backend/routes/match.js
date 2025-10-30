const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const updateXP = require('../utils/updateXP');

const router = express.Router();

/**
 * Convert skills/interests array to binary vector based on all unique items
 * @param {Array} items - Array of skills or interests
 * @param {Array} allUniqueItems - All unique items across all users
 * @returns {Array} Binary vector representation
 */
function toBinaryVector(items, allUniqueItems) {
  return allUniqueItems.map(item => items.includes(item) ? 1 : 0);
}

/**
 * Calculate dot product of two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {Number} Dot product
 */
function dotProduct(vecA, vecB) {
  return vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
}

/**
 * Calculate magnitude (norm) of a vector
 * @param {Array} vector - Vector to calculate norm for
 * @returns {Number} Magnitude
 */
function magnitude(vector) {
  return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
}

/**
 * Calculate cosine similarity between two vectors
 * @param {Array} vecA - First vector
 * @param {Array} vecB - Second vector
 * @returns {Number} Cosine similarity (0-1)
 */
function cosineSimilarity(vecA, vecB) {
  const magA = magnitude(vecA);
  const magB = magnitude(vecB);
  
  if (magA === 0 || magB === 0) {
    return 0; // No similarity if either vector is empty
  }
  
  return dotProduct(vecA, vecB) / (magA * magB);
}

// Get study buddy matches - AI-Driven Matching System 2.0
router.get('/', authMiddleware, async (req, res) => {
  try {
    const currentUser = req.user;
    
    // Validate current user has required fields
    if (!currentUser || !currentUser.skills || !currentUser.interests) {
      return res.status(400).json({ message: 'User profile incomplete. Please update your skills and interests.' });
    }

    // Get all users except current user
    const allUsers = await User.find({ _id: { $ne: currentUser._id } });
    
    if (allUsers.length === 0) {
      return res.json([]);
    }

    // Collect all unique skills and interests across all users (including current user)
    const allUniqueSkills = new Set(currentUser.skills || []);
    const allUniqueInterests = new Set(currentUser.interests || []);
    
    allUsers.forEach(user => {
      (user.skills || []).forEach(skill => allUniqueSkills.add(skill));
      (user.interests || []).forEach(interest => allUniqueInterests.add(interest));
    });
    
    const uniqueSkillsArray = Array.from(allUniqueSkills);
    const uniqueInterestsArray = Array.from(allUniqueInterests);

    // Convert current user's skills and interests to binary vectors
    const currentUserSkillsVector = toBinaryVector(currentUser.skills || [], uniqueSkillsArray);
    const currentUserInterestsVector = toBinaryVector(currentUser.interests || [], uniqueInterestsArray);

    // Weight configuration for AI-driven matching
    const WEIGHTS = {
      skillsCosine: 0.25,      // Cosine similarity for skills (enhanced)
      skillsOverlap: 0.15,     // Direct overlap for skills (legacy)
      interestsCosine: 0.20,    // Cosine similarity for interests (enhanced)
      interestsOverlap: 0.10,  // Direct overlap for interests (legacy)
      availability: 0.2,
      proximity: 0.1
    };

    // Calculate weighted match scores for each user
    const matches = allUsers.map(user => {
      // Convert user's skills and interests to binary vectors
      const userSkillsVector = toBinaryVector(user.skills || [], uniqueSkillsArray);
      const userInterestsVector = toBinaryVector(user.interests || [], uniqueInterestsArray);
      
      // Calculate cosine similarity for skills and interests
      const skillsCosineSim = cosineSimilarity(currentUserSkillsVector, userSkillsVector);
      const interestsCosineSim = cosineSimilarity(currentUserInterestsVector, userInterestsVector);
      
      // Calculate shared skills (for display and overlap score)
      const sharedSkills = currentUser.skills.filter(skill => 
        user.skills && user.skills.includes(skill)
      );
      
      // Calculate shared interests (for display and overlap score)
      const sharedInterests = currentUser.interests.filter(interest => 
        user.interests && user.interests.includes(interest)
      );
      
      // Calculate shared availability
      const sharedAvailability = currentUser.availability && user.availability
        ? currentUser.availability.filter(avail => 
            user.availability.includes(avail)
          )
        : [];
      
      // Normalize scores (0-1 scale)
      // Skills overlap score: ratio of shared skills to max possible (legacy method)
      const maxSkills = Math.max(currentUser.skills.length, user.skills?.length || 0, 1);
      const skillsOverlapScore = sharedSkills.length / maxSkills;
      
      // Interests overlap score: ratio of shared interests to max possible (legacy method)
      const maxInterests = Math.max(currentUser.interests.length, user.interests?.length || 0, 1);
      const interestsOverlapScore = sharedInterests.length / maxInterests;
      
      // Availability score: ratio of shared availability slots
      const maxAvailability = Math.max(
        currentUser.availability?.length || 0,
        user.availability?.length || 0,
        1
      );
      const availabilityScore = sharedAvailability.length / maxAvailability;
      
      // Proximity score: 1 if same branch and year, 0.5 if same branch or same year, 0 otherwise
      let proximityScore = 0;
      if (currentUser.branch && user.branch && currentUser.year && user.year) {
        if (currentUser.branch === user.branch && currentUser.year === user.year) {
          proximityScore = 1;
        } else if (currentUser.branch === user.branch || currentUser.year === user.year) {
          proximityScore = 0.5;
        }
      } else if (currentUser.branch && user.branch && currentUser.branch === user.branch) {
        proximityScore = 0.5;
      } else if (currentUser.year && user.year && currentUser.year === user.year) {
        proximityScore = 0.5;
      }
      
      // Calculate weighted final score using cosine similarity (enhanced accuracy)
      // Combines cosine similarity (more accurate) with overlap metrics (backward compatibility)
      const finalScore = (
        skillsCosineSim * WEIGHTS.skillsCosine +
        skillsOverlapScore * WEIGHTS.skillsOverlap +
        interestsCosineSim * WEIGHTS.interestsCosine +
        interestsOverlapScore * WEIGHTS.interestsOverlap +
        availabilityScore * WEIGHTS.availability +
        proximityScore * WEIGHTS.proximity
      ) * 100; // Convert to percentage (0-100)
      
      return {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        year: user.year,
        availability: user.availability || [],
        skills: user.skills || [],
        interests: user.interests || [],
        sharedSkills,
        sharedInterests,
        score: Math.round(finalScore * 100) / 100, // Round to 2 decimal places
        // Include matchScore for backward compatibility
        matchScore: Math.round(finalScore * 100) / 100
      };
    });

    // Sort by final score (descending)
    const sortedMatches = matches.sort((a, b) => b.score - a.score);
    
    // Get limit from query parameter (default 3, max 10)
    const limit = Math.min(parseInt(req.query.limit) || 3, 10);
    const topMatches = sortedMatches.slice(0, limit);

    res.json(topMatches);
  } catch (error) {
    console.error('Match error:', error);
    res.status(500).json({ message: 'Server error getting matches', error: error.message });
  }
});

// Connect with a buddy and earn XP
router.post('/connect', authMiddleware, async (req, res) => {
  try {
    const { buddyId } = req.body;
    const currentUser = req.user;

    if (!buddyId) {
      return res.status(400).json({ message: 'Buddy ID is required' });
    }

    // Verify buddy exists
    const buddy = await User.findById(buddyId);
    if (!buddy) {
      return res.status(404).json({ message: 'Buddy not found' });
    }

    // Check if already connected
    const userMongoId = new mongoose.Types.ObjectId(buddyId);
    const alreadyConnected = currentUser.connections && currentUser.connections.some(
      conn => conn.toString() === buddyId.toString()
    );

    if (alreadyConnected) {
      return res.status(400).json({ 
        message: 'You have already connected with this buddy!',
        alreadyConnected: true,
        xp: currentUser.xp
      });
    }

    // Add connection
    if (!currentUser.connections) {
      currentUser.connections = [];
    }
    currentUser.connections.push(userMongoId);
    await currentUser.save();

    // Add XP using utility function (only once per buddy)
    const updatedXP = await updateXP(currentUser._id, 15, `Connecting with ${buddy.name}`);

    res.json({
      message: 'Connection request sent successfully!',
      xp: updatedXP
    });
  } catch (error) {
    console.error('Connect error:', error);
    res.status(500).json({ message: 'Server error during connection', error: error.message });
  }
});

module.exports = router;

