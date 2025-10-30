const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const updateXP = require('../utils/updateXP');
const { registerValidation, loginValidation, handleValidationErrors } = require('../middleware/validation');
const { loginLimiter, registerLimiter } = require('../middleware/rateLimiter');

const router = express.Router();
const auth = require('../middleware/authMiddleware');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Register route with validation and rate limiting
router.post('/register', 
  registerLimiter,
  registerValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password, skills, interests, branch, year, availability } = req.body;

      // Check if user exists by email
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'User with this email already exists',
          error: 'EMAIL_EXISTS'
        });
      }

      // Create new user
      const user = new User({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password, // Will be hashed by pre-save middleware
        skills: skills || [],
        interests: interests || [],
        branch: branch || '',
        year: year || null,
        availability: availability || []
      });

      // Save user first to get ID
      await user.save();

      // Add XP for new signup (only once during registration)
      const updatedXP = await updateXP(user._id, 50, 'New user registration');

      // Mark registration bonus as received after XP is awarded
      user.registrationBonus = true;
      await user.save();

      // Generate JWT
      const token = generateToken(user._id);

      // Log successful registration (without sensitive data)
      console.log(`User registered: ${user.email} at ${new Date().toISOString()}`);

      res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skills: user.skills,
          interests: user.interests,
          branch: user.branch,
          year: user.year,
          availability: user.availability,
          about: user.about || '',
          xp: updatedXP
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      
      // Handle duplicate email error
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'Email already exists',
          error: 'EMAIL_EXISTS'
        });
      }
      
      // Handle validation errors
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
          message: 'Validation failed',
          errors 
        });
      }
      
      res.status(500).json({ 
        message: 'Server error during registration',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Login route with validation, rate limiting, and account lockout
router.post('/login',
  loginLimiter,
  loginValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user by email (case-insensitive)
      const user = await User.findOne({ email: email.toLowerCase().trim() });
      
      if (!user) {
        // Don't reveal if user exists or not (security best practice)
        return res.status(401).json({ 
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        });
      }

      // Check if account is locked
      const isLocked = user.accountLocked && user.lockUntil && user.lockUntil > Date.now();
      if (isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return res.status(423).json({ 
          message: `Account is temporarily locked. Please try again in ${lockTimeRemaining} minutes.`,
          error: 'ACCOUNT_LOCKED',
          lockTimeRemaining
        });
      }

      // Verify password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        // Increment login attempts
        await user.incLoginAttempts();
        
        // Refresh user to get updated login attempts
        const updatedUser = await User.findById(user._id);
        const remainingAttempts = Math.max(0, 4 - updatedUser.loginAttempts);
        
        return res.status(401).json({ 
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS',
          remainingAttempts: remainingAttempts > 0 ? remainingAttempts : 0
        });
      }

      // Successful login - reset login attempts and update last login
      await user.resetLoginAttempts();

      // Generate JWT
      const token = generateToken(user._id);

      // Log successful login (without sensitive data)
      console.log(`User logged in: ${user.email} at ${new Date().toISOString()}`);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          skills: user.skills,
          interests: user.interests,
          branch: user.branch,
          year: user.year,
          availability: user.availability,
          about: user.about || '',
          xp: user.xp || 0
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ 
        message: 'Server error during login',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
);

// Verify token route
router.get('/verify', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided',
        valid: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        valid: false
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      return res.status(423).json({ 
        message: 'Account is locked',
        valid: false,
        locked: true
      });
    }

    res.json({
      valid: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        about: user.about || '',
        xp: user.xp || 0
      }
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expired',
        valid: false,
        expired: true
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Invalid token',
        valid: false
      });
    }

    res.status(500).json({ 
      message: 'Server error during token verification',
      valid: false
    });
  }
});

// Update profile (skills, interests, branch, year, availability, name optional)
router.put('/profile', auth, async (req, res) => {
  try {
    const allowed = ['skills','interests','branch','year','availability','name','about'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: update }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({
      message: 'Profile updated',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        skills: user.skills,
        interests: user.interests,
        branch: user.branch,
        year: user.year,
        availability: user.availability,
        xp: user.xp || 0
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

module.exports = router;

