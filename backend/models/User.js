const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  // Basic Information
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  dateOfBirth: {
    type: Date,
    required: true,
    validate: {
      validator: function(date) {
        const age = new Date().getFullYear() - date.getFullYear();
        return age >= 8 && age <= 35; // Age validation for athletes
      },
      message: 'Athlete must be between 8 and 35 years old'
    }
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other'],
    lowercase: true
  },
  
  // Contact Information
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Please enter a valid phone number']
  },
  address: {
    street: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true, match: [/^[1-9][0-9]{5}$/, 'Please enter a valid Indian pincode'] },
    country: { type: String, default: 'India' }
  },
  
  // Athletic Information
  athleteType: {
    type: String,
    enum: ['student', 'amateur', 'professional', 'coaching', 'other'],
    default: 'student'
  },
  sportsInterests: [{
    type: String,
    enum: ['athletics', 'badminton', 'basketball', 'boxing', 'cricket', 'football', 'hockey', 'swimming', 'tennis', 'volleyball', 'weightlifting', 'wrestling', 'other']
  }],
  
  // Physical Attributes
  physicalAttributes: {
    height: { type: Number, min: 100, max: 250 }, // in cm
    weight: { type: Number, min: 20, max: 200 }, // in kg
    dominantHand: { type: String, enum: ['left', 'right', 'both'] },
    dominantFoot: { type: String, enum: ['left', 'right', 'both'] }
  },
  
  // Assessment Data
  assessments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment'
  }],
  totalAssessments: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Gamification
  gamification: {
    level: { type: Number, default: 1, min: 1, max: 100 },
    totalPoints: { type: Number, default: 0 },
    badges: [{
      id: String,
      name: String,
      description: String,
      icon: String,
      earnedAt: { type: Date, default: Date.now }
    }],
    achievements: [{
      id: String,
      name: String,
      description: String,
      progress: { type: Number, default: 0 },
      target: Number,
      completed: { type: Boolean, default: false },
      completedAt: Date
    }],
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActivity: Date
    }
  },
  
  // Preferences
  preferences: {
    language: { type: String, default: 'en', enum: ['en', 'hi', 'ta', 'te', 'mr', 'bn', 'kn', 'ml', 'gu', 'pa', 'or', 'as', 'ur'] },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, default: 'friends', enum: ['private', 'friends', 'public'] },
      showStats: { type: Boolean, default: true },
      allowAnalytics: { type: Boolean, default: true }
    }
  },
  
  // Security
  role: {
    type: String,
    enum: ['athlete', 'coach', 'admin', 'official'],
    default: 'athlete'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  loginAttempts: {
    type: Number,
    default: 0,
    max: 5
  },
  lockUntil: Date,
  
  twoFactorSecret: String,
  isTwoFactorEnabled: {
    type: Boolean,
    default: false
  },
  
  // Session Management
  refreshTokens: [{
    token: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
    deviceInfo: {
      userAgent: String,
      ip: String,
      deviceId: String
    }
  }],
  
  // Metadata
  lastLogin: Date,
  lastActivity: Date,
  deviceInfo: [{
    deviceId: String,
    userAgent: String,
    lastUsed: Date,
    trusted: { type: Boolean, default: false }
  }],
  
  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  
  // Registration Source
  registrationSource: {
    type: String,
    enum: ['mobile', 'web', 'admin'],
    default: 'mobile'
  },
  
  // Consent
  consent: {
    terms: { type: Boolean, required: true },
    privacy: { type: Boolean, required: true },
    dataProcessing: { type: Boolean, required: true },
    marketing: { type: Boolean, default: false },
    consentDate: { type: Date, default: Date.now }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ 'address.state': 1, 'address.city': 1 });
userSchema.index({ dateOfBirth: 1, gender: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual Properties
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.virtual('age').get(function() {
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
});

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.virtual('progressPercentage').get(function() {
  let completed = 0;
  let total = 0;
  
  // Check required fields
  const requiredFields = ['email', 'firstName', 'lastName', 'dateOfBirth', 'gender', 'phone', 'address.city', 'address.state', 'address.pincode'];
  requiredFields.forEach(field => {
    total++;
    if (this.get(field)) completed++;
  });
  
  // Check optional fields
  const optionalFields = ['physicalAttributes.height', 'physicalAttributes.weight', 'sportsInterests'];
  optionalFields.forEach(field => {
    total++;
    if (this.get(field)) completed++;
  });
  
  return Math.round((completed / total) * 100);
});

// Pre-save middleware
userSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  
  // Update average score
  if (this.isModified('assessments')) {
    const Assessment = mongoose.model('Assessment');
    const assessments = await Assessment.find({ _id: { $in: this.assessments }, status: 'completed' });
    
    if (assessments.length > 0) {
      const totalScore = assessments.reduce((sum, assessment) => sum + assessment.overallScore, 0);
      this.averageScore = totalScore / assessments.length;
      this.totalAssessments = assessments.length;
    }
  }
  
  // Update streak
  if (this.isModified('lastActivity')) {
    const today = new Date().toDateString();
    const lastActivity = this.lastActivity ? new Date(this.lastActivity).toDateString() : null;
    
    if (lastActivity !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActivity === yesterday.toDateString()) {
        this.gamification.streak.current++;
        this.gamification.streak.longest = Math.max(this.gamification.streak.longest, this.gamification.streak.current);
      } else {
        this.gamification.streak.current = 1;
      }
    }
  }
  
  // Handle soft delete
  if (this.isModified('isDeleted') && this.isDeleted) {
    this.deletedAt = new Date();
  }
  
  next();
});

// Instance Methods
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.generateAuthToken = function() {
  const payload = {
    id: this._id,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '24h'
  });
};

userSchema.methods.generateRefreshToken = function(deviceInfo) {
  const payload = {
    id: this._id,
    deviceId: deviceInfo.deviceId
  };
  
  const token = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d'
  });
  
  // Store refresh token
  this.refreshTokens.push({
    token: token,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    deviceInfo: deviceInfo
  });
  
  // Remove expired tokens
  this.refreshTokens = this.refreshTokens.filter(rt => new Date(rt.expiresAt) > new Date());
  
  return token;
};

userSchema.methods.incrementLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

userSchema.methods.addBadge = function(badge) {
  const existingBadge = this.gamification.badges.find(b => b.id === badge.id);
  
  if (!existingBadge) {
    this.gamification.badges.push({
      id: badge.id,
      name: badge.name,
      description: badge.description,
      icon: badge.icon,
      earnedAt: new Date()
    });
    
    // Add points for earning badge
    this.gamification.totalPoints += badge.points || 10;
    
    return true;
  }
  
  return false;
};

userSchema.methods.updateAchievement = function(achievementId, progress) {
  const achievement = this.gamification.achievements.find(a => a.id === achievementId);
  
  if (achievement && !achievement.completed) {
    achievement.progress = Math.min(progress, achievement.target);
    
    if (achievement.progress >= achievement.target) {
      achievement.completed = true;
      achievement.completedAt = new Date();
      
      // Add points for completing achievement
      this.gamification.totalPoints += 50;
    }
    
    return achievement;
  }
  
  return null;
};

userSchema.methods.canAccessResource = function(resource, action) {
  // Role-based access control
  const permissions = {
    athlete: {
      'assessment': ['create', 'read', 'update'],
      'profile': ['read', 'update'],
      'analytics': ['read']
    },
    coach: {
      'assessment': ['read'],
      'athlete': ['read'],
      'analytics': ['read']
    },
    official: {
      'assessment': ['read', 'update'],
      'athlete': ['read'],
      'analytics': ['read'],
      'reports': ['read', 'generate']
    },
    admin: {
      '*': ['create', 'read', 'update', 'delete']
    }
  };
  
  const rolePermissions = permissions[this.role];
  const resourcePermissions = rolePermissions[resource] || rolePermissions['*'];
  
  return resourcePermissions && resourcePermissions.includes(action);
};

// Static Methods
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase(), isDeleted: false });
};

userSchema.statics.findByCredentials = async function(email, password) {
  const user = await this.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
  
  if (!user) {
    throw new Error('Invalid credentials');
  }
  
  if (user.isLocked) {
    throw new Error('Account is locked due to too many failed login attempts');
  }
  
  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    await user.incrementLoginAttempts();
    throw new Error('Invalid credentials');
  }
  
  // Reset login attempts on successful login
  if (user.loginAttempts > 0) {
    await user.resetLoginAttempts();
  }
  
  // Update last login
  user.lastLogin = new Date();
  user.lastActivity = new Date();
  await user.save();
  
  return user;
};

userSchema.statics.getLeaderboard = async function(filters = {}) {
  const matchStage = { isDeleted: false, isActive: true };
  
  if (filters.state) {
    matchStage['address.state'] = filters.state;
  }
  
  if (filters.city) {
    matchStage['address.city'] = filters.city;
  }
  
  if (filters.ageGroup) {
    const [minAge, maxAge] = filters.ageGroup.split('-').map(Number);
    const today = new Date();
    const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
    const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
    
    matchStage.dateOfBirth = { $gte: minDate, $lte: maxDate };
  }
  
  if (filters.gender) {
    matchStage.gender = filters.gender;
  }
  
  const users = await this.aggregate([
    { $match: matchStage },
    {
      $project: {
        fullName: { $concat: ['$firstName', ' ', '$lastName'] },
        email: 1,
        averageScore: 1,
        totalAssessments: 1,
        gamification: 1,
        age: {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        },
        state: '$address.state',
        city: '$address.city',
        avatar: 1
      }
    },
    { $sort: { averageScore: -1, totalAssessments: -1 } },
    { $limit: filters.limit || 100 }
  ]);
  
  return users;
};

const User = mongoose.model('User', userSchema);

module.exports = User;