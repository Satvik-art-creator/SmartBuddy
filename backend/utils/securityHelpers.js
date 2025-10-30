/**
 * Security helper functions
 */

// Check password strength
function validatePasswordStrength(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const strength = {
    score: 0,
    feedback: []
  };
  
  if (password.length >= minLength) {
    strength.score++;
  } else {
    strength.feedback.push(`Password must be at least ${minLength} characters`);
  }
  
  if (hasUpperCase) strength.score++;
  else strength.feedback.push('Add an uppercase letter');
  
  if (hasLowerCase) strength.score++;
  else strength.feedback.push('Add a lowercase letter');
  
  if (hasNumbers) strength.score++;
  else strength.feedback.push('Add a number');
  
  if (hasSpecialChar) {
    strength.score++;
  } else {
    strength.feedback.push('Add a special character (!@#$%^&*)');
  }
  
  return strength;
}

// Sanitize input to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim();
}

// Generate secure token
function generateSecureToken(length = 32) {
  const crypto = require('crypto');
  return crypto.randomBytes(length).toString('hex');
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  validatePasswordStrength,
  sanitizeInput,
  generateSecureToken,
  isValidEmail
};

