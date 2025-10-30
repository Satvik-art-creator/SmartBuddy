const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        message: 'No token provided, authorization denied',
        error: 'NO_TOKEN'
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          message: 'Token has expired',
          error: 'TOKEN_EXPIRED'
        });
      }
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ 
          message: 'Invalid token',
          error: 'INVALID_TOKEN'
        });
      }
      throw error;
    }

    // Find user and check if account is locked
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ 
        message: 'User not found',
        error: 'USER_NOT_FOUND'
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

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ 
      message: 'Server error during authentication',
      error: 'AUTH_ERROR'
    });
  }
};

module.exports = authMiddleware;

