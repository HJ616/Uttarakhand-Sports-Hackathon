const { body, param, query, validationResult } = require('express-validator');

// Validation middleware
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

// User validation rules
const userValidation = {
  register: [
    body('name')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only letters and spaces'),
    
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    
    body('role')
      .isIn(['athlete', 'coach', 'official', 'admin'])
      .withMessage('Role must be one of: athlete, coach, official, admin'),
    
    body('district')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('District must be between 2 and 50 characters'),
    
    body('school')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('School must be between 2 and 100 characters'),
    
    body('age')
      .optional()
      .isInt({ min: 5, max: 100 })
      .withMessage('Age must be between 5 and 100'),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be one of: male, female, other')
  ],

  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],

  update: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Name must be between 2 and 50 characters')
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Name must contain only letters and spaces'),
    
    body('district')
      .optional()
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('District must be between 2 and 50 characters'),
    
    body('school')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('School must be between 2 and 100 characters'),
    
    body('age')
      .optional()
      .isInt({ min: 5, max: 100 })
      .withMessage('Age must be between 5 and 100'),
    
    body('gender')
      .optional()
      .isIn(['male', 'female', 'other'])
      .withMessage('Gender must be one of: male, female, other')
  ]
};

// Assessment validation rules
const assessmentValidation = {
  create: [
    body('testType')
      .isIn(['30m Sprint', 'Standing Broad Jump', 'Sit and Reach', 'Height', 'Weight', 'Endurance Run', 'Shuttle Run'])
      .withMessage('Invalid test type'),
    
    body('score')
      .isFloat({ min: 0 })
      .withMessage('Score must be a positive number'),
    
    body('unit')
      .isIn(['seconds', 'meters', 'cm', 'kg', 'ml/kg/min'])
      .withMessage('Invalid unit'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters')
  ],

  update: [
    body('testType')
      .optional()
      .isIn(['30m Sprint', 'Standing Broad Jump', 'Sit and Reach', 'Height', 'Weight', 'Endurance Run', 'Shuttle Run'])
      .withMessage('Invalid test type'),
    
    body('score')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Score must be a positive number'),
    
    body('unit')
      .optional()
      .isIn(['seconds', 'meters', 'cm', 'kg', 'ml/kg/min'])
      .withMessage('Invalid unit'),
    
    body('notes')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Notes must not exceed 500 characters'),
    
    body('status')
      .optional()
      .isIn(['pending', 'verified', 'rejected'])
      .withMessage('Status must be one of: pending, verified, rejected')
  ],

  verify: [
    body('status')
      .isIn(['verified', 'rejected'])
      .withMessage('Status must be either verified or rejected'),
    
    body('comments')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Comments must not exceed 500 characters')
  ]
};

// Video validation rules
const videoValidation = {
  upload: [
    body('title')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Title must be between 1 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description must not exceed 500 characters'),
    
    body('testType')
      .optional()
      .isIn(['30m Sprint', 'Standing Broad Jump', 'Sit and Reach', 'Height', 'Weight', 'Endurance Run', 'Shuttle Run'])
      .withMessage('Invalid test type')
  ],

  analyze: [
    body('analysisType')
      .isIn(['performance', 'technique', 'form'])
      .withMessage('Analysis type must be one of: performance, technique, form')
  ]
};

// Pagination validation
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

// Search validation
const searchValidation = [
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search term must be between 1 and 100 characters')
];

// ID validation
const idValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format')
];

module.exports = {
  validate,
  userValidation,
  assessmentValidation,
  videoValidation,
  paginationValidation,
  searchValidation,
  idValidation
};