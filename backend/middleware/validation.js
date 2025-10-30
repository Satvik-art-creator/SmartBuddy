const { body, validationResult } = require('express-validator');

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/).withMessage('Name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail()
    .isLength({ max: 255 }).withMessage('Email is too long'),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
    .isLength({ max: 100 }).withMessage('Password is too long'),
  
  body('branch')
    .optional()
    .trim()
    .isIn(['CSE', 'CSH', 'CSD', 'CSA', 'ECE', 'ECI']).withMessage('Invalid branch'),
  
  body('year')
    .optional()
    .isInt({ min: 1, max: 4 }).withMessage('Year must be between 1 and 4'),
  
  body('skills')
    .optional()
    .isArray().withMessage('Skills must be an array')
    .custom((skills) => {
      if (skills.length > 20) {
        throw new Error('Maximum 20 skills allowed');
      }
      return true;
    }),
  
  body('interests')
    .optional()
    .isArray().withMessage('Interests must be an array')
    .custom((interests) => {
      if (interests.length > 20) {
        throw new Error('Maximum 20 interests allowed');
      }
      return true;
    })
];

const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

module.exports = {
  registerValidation,
  loginValidation,
  handleValidationErrors
};

