const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  // Basic Information
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  assessmentId: {
    type: String,
    required: true,
    unique: true,
    default: () => 'ASA' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase()
  },
  
  // Test Information
  testType: {
    type: String,
    required: true,
    enum: [
      '100m-dash',
      'sit-ups',
      'sit-reach',
      '600m-run',
      'standing-broad-jump',
      'shuttle-run',
      'push-ups',
      'pull-ups',
      'vertical-jump',
      'agility-test',
      'endurance-test',
      'strength-test',
      'flexibility-test',
      'balance-test',
      'coordination-test'
    ],
    index: true
  },
  
  testCategory: {
    type: String,
    required: true,
    enum: ['speed', 'strength', 'flexibility', 'endurance', 'agility', 'balance', 'coordination'],
    index: true
  },
  
  // Test Parameters
  testParameters: {
    targetReps: Number,
    targetDistance: Number,
    targetTime: Number,
    targetHeight: Number,
    equipmentUsed: [String],
    environmentalConditions: {
      temperature: Number,
      humidity: Number,
      windSpeed: Number,
      surfaceType: { type: String, enum: ['grass', 'track', 'concrete', 'indoor', 'other'] },
      location: String
    }
  },
  
  // Video Information
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  
  videoUrl: {
    type: String,
    required: true
  },
  
  thumbnailUrl: String,
  
  videoMetadata: {
    duration: Number,
    resolution: String,
    fps: Number,
    fileSize: Number,
    format: String,
    codec: String,
    bitrate: Number
  },
  
  // Raw Results (from AI analysis)
  rawResults: {
    detectedReps: Number,
    detectedDistance: Number,
    detectedTime: Number,
    detectedHeight: Number,
    detectedSpeed: Number,
    detectedAngle: Number,
    detectedForce: Number,
    
    // Pose detection data
    poseData: [{
      timestamp: Number,
      landmarks: [{
        name: String,
        x: Number,
        y: Number,
        z: Number,
        visibility: Number,
        presence: Number
      }],
      boundingBox: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      }
    }],
    
    // Movement analysis
    movementAnalysis: {
      startTime: Number,
      endTime: Number,
      totalTime: Number,
      phases: [{
        name: String,
        startTime: Number,
        endTime: Number,
        duration: Number,
        keyMetrics: mongoose.Schema.Types.Mixed
      }],
      
      // Form quality assessment
      formQuality: {
        score: Number,
        issues: [String],
        recommendations: [String],
        technique: String
      },
      
      // Biomechanical analysis
      biomechanics: {
        jointAngles: mongoose.Schema.Types.Mixed,
        rangeOfMotion: mongoose.Schema.Types.Mixed,
        powerOutput: Number,
        efficiency: Number,
        symmetry: Number
      }
    }
  },
  
  // Processed Results
  processedResults: {
    // Final calculated values
    finalReps: Number,
    finalDistance: Number,
    finalTime: Number,
    finalHeight: Number,
    finalSpeed: Number,
    finalAngle: Number,
    finalForce: Number,
    
    // Performance metrics
    performanceMetrics: {
      accuracy: Number,
      consistency: Number,
      efficiency: Number,
      technique: Number,
      power: Number,
      endurance: Number,
      speed: Number,
      strength: Number,
      flexibility: Number,
      balance: Number,
      coordination: Number
    },
    
    // Scoring
    scores: {
      rawScore: Number,
      adjustedScore: Number,
      percentileScore: Number,
      standardizedScore: Number,
      ageAdjustedScore: Number,
      genderAdjustedScore: Number,
      finalScore: Number
    },
    
    // Benchmarks and comparisons
    benchmarks: {
      ageGroup: String,
      gender: String,
      category: String,
      nationalAverage: Number,
      regionalAverage: Number,
      stateAverage: Number,
      districtAverage: Number,
      percentile: Number,
      ranking: Number
    },
    
    // Grade and classification
    grade: {
      letter: String,
      description: String,
      level: String,
      category: String
    },
    
    // Performance insights
    insights: {
      strengths: [String],
      weaknesses: [String],
      opportunities: [String],
      threats: [String],
      recommendations: [String],
      trainingFocus: [String]
    }
  },
  
  // Quality Assurance
  qualityChecks: {
    videoQuality: {
      score: Number,
      issues: [String],
      passed: Boolean
    },
    
    movementDetection: {
      confidence: Number,
      accuracy: Number,
      passed: Boolean
    },
    
    formValidation: {
      score: Number,
      issues: [String],
      passed: Boolean
    },
    
    dataIntegrity: {
      score: Number,
      anomalies: [String],
      passed: Boolean
    },
    
    cheatDetection: {
      score: Number,
      flags: [String],
      riskLevel: { type: String, enum: ['low', 'medium', 'high'] },
      passed: Boolean,
      details: mongoose.Schema.Types.Mixed
    }
  },
  
  // Verification Status
  verificationStatus: {
    aiVerified: {
      type: Boolean,
      default: false
    },
    humanVerified: {
      type: Boolean,
      default: false
    },
    officialVerified: {
      type: Boolean,
      default: false
    },
    verificationLevel: {
      type: String,
      enum: ['pending', 'ai-verified', 'human-verified', 'official-verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    verificationNotes: String,
    rejectionReason: String
  },
  
  // Status and Workflow
  status: {
    type: String,
    enum: ['draft', 'submitted', 'processing', 'completed', 'flagged', 'rejected', 'archived'],
    default: 'draft',
    index: true
  },
  
  processingStage: {
    type: String,
    enum: ['uploaded', 'preprocessing', 'ai-analysis', 'quality-check', 'verification', 'completed'],
    default: 'uploaded'
  },
  
  // Timestamps
  submittedAt: Date,
  processingStartedAt: Date,
  processingCompletedAt: Date,
  verifiedAt: Date,
  
  // Performance Summary
  overallScore: {
    type: Number,
    min: 0,
    max: 100,
    index: true
  },
  
  performanceLevel: {
    type: String,
    enum: ['excellent', 'good', 'average', 'below-average', 'poor'],
    index: true
  },
  
  // Tags and Categories
  tags: [String],
  
  // Flags and Reviews
  flags: [{
    type: String,
    reason: String,
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    flaggedAt: { type: Date, default: Date.now }
  }],
  
  // Comments and Notes
  comments: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    comment: String,
    type: { type: String, enum: ['general', 'technical', 'admin'] },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Metadata
  metadata: {
    deviceInfo: {
      deviceId: String,
      deviceModel: String,
      os: String,
      appVersion: String
    },
    location: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      address: String
    },
    network: {
      type: String,
      strength: String,
      carrier: String
    }
  },
  
  // Privacy and Consent
  consent: {
    dataProcessing: { type: Boolean, required: true },
    videoSharing: { type: Boolean, default: false },
    researchParticipation: { type: Boolean, default: false },
    consentDate: { type: Date, default: Date.now }
  },
  
  // Analytics and Reporting
  analytics: {
    views: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentsCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
assessmentSchema.index({ userId: 1, createdAt: -1 });
assessmentSchema.index({ testType: 1, status: 1 });
assessmentSchema.index({ overallScore: -1 });
assessmentSchema.index({ 'processedResults.scores.finalScore': -1 });
assessmentSchema.index({ status: 1, verificationStatus: 1 });
assessmentSchema.index({ submittedAt: -1 });
assessmentSchema.index({ assessmentId: 1 });
assessmentSchema.index({ 'metadata.location': '2dsphere' });

// Virtual Properties
assessmentSchema.virtual('performanceSummary').get(function() {
  return {
    score: this.overallScore,
    level: this.performanceLevel,
    grade: this.processedResults.grade,
    insights: this.processedResults.insights,
    benchmarks: this.processedResults.benchmarks
  };
});

assessmentSchema.virtual('isVerified').get(function() {
  return this.verificationStatus.verificationLevel === 'official-verified';
});

assessmentSchema.virtual('processingTime').get(function() {
  if (this.processingStartedAt && this.processingCompletedAt) {
    return this.processingCompletedAt - this.processingStartedAt;
  }
  return null;
});

assessmentSchema.virtual('userAgeAtAssessment').get(function() {
  if (this.userId && this.userId.dateOfBirth) {
    const assessmentDate = new Date(this.createdAt);
    const birthDate = new Date(this.userId.dateOfBirth);
    let age = assessmentDate.getFullYear() - birthDate.getFullYear();
    const monthDiff = assessmentDate.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && assessmentDate.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
  return null;
});

// Pre-save middleware
assessmentSchema.pre('save', async function(next) {
  // Generate assessment ID if not provided
  if (!this.assessmentId) {
    this.assessmentId = 'ASA' + Date.now().toString() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  
  // Calculate overall score
  if (this.processedResults && this.processedResults.scores && this.processedResults.scores.finalScore) {
    this.overallScore = this.processedResults.scores.finalScore;
    
    // Determine performance level
    if (this.overallScore >= 90) {
      this.performanceLevel = 'excellent';
    } else if (this.overallScore >= 75) {
      this.performanceLevel = 'good';
    } else if (this.overallScore >= 60) {
      this.performanceLevel = 'average';
    } else if (this.overallScore >= 40) {
      this.performanceLevel = 'below-average';
    } else {
      this.performanceLevel = 'poor';
    }
  }
  
  // Update verification status
  if (this.verificationStatus.aiVerified && this.verificationStatus.humanVerified && this.verificationStatus.officialVerified) {
    this.verificationStatus.verificationLevel = 'official-verified';
  } else if (this.verificationStatus.aiVerified && this.verificationStatus.humanVerified) {
    this.verificationStatus.verificationLevel = 'human-verified';
  } else if (this.verificationStatus.aiVerified) {
    this.verificationStatus.verificationLevel = 'ai-verified';
  } else {
    this.verificationStatus.verificationLevel = 'pending';
  }
  
  // Update processing stage based on status
  if (this.status === 'completed') {
    this.processingStage = 'completed';
    this.processingCompletedAt = new Date();
  } else if (this.status === 'processing') {
    if (!this.processingStartedAt) {
      this.processingStartedAt = new Date();
    }
  }
  
  // Generate tags
  if (this.isModified('processedResults') || this.isNew) {
    const tags = [];
    
    // Add performance level tag
    if (this.performanceLevel) {
      tags.push(this.performanceLevel);
    }
    
    // Add score range tag
    if (this.overallScore) {
      if (this.overallScore >= 90) tags.push('top-performer');
      else if (this.overallScore >= 75) tags.push('high-performer');
      else if (this.overallScore >= 60) tags.push('average-performer');
      else tags.push('needs-improvement');
    }
    
    // Add test-specific tags
    if (this.testType) {
      tags.push(this.testType.replace('-', '_'));
    }
    
    // Add age group tag
    if (this.userAgeAtAssessment) {
      const ageGroup = Math.floor(this.userAgeAtAssessment / 5) * 5;
      tags.push(`age_${ageGroup}-${ageGroup + 4}`);
    }
    
    this.tags = tags;
  }
  
  next();
});

// Instance Methods
assessmentSchema.methods.getPerformanceInsights = function() {
  const insights = {
    summary: '',
    recommendations: [],
    nextSteps: []
  };
  
  if (!this.processedResults) {
    insights.summary = 'Assessment results not available';
    return insights;
  }
  
  const { scores, grade, benchmarks, insights: resultInsights } = this.processedResults;
  
  // Generate summary
  if (scores.finalScore >= 90) {
    insights.summary = 'Outstanding performance! You are in the top 10% of athletes.';
  } else if (scores.finalScore >= 75) {
    insights.summary = 'Excellent performance! You are well above average.';
  } else if (scores.finalScore >= 60) {
    insights.summary = 'Good performance! You meet the standard requirements.';
  } else if (scores.finalScore >= 40) {
    insights.summary = 'Below average performance. Focused training can help improve.';
  } else {
    insights.summary = 'Needs significant improvement. Consider professional coaching.';
  }
  
  // Add specific recommendations
  if (resultInsights.recommendations) {
    insights.recommendations = resultInsights.recommendations;
  }
  
  // Add next steps
  if (this.testCategory === 'speed') {
    insights.nextSteps.push('Focus on sprint technique and explosive power training');
  } else if (this.testCategory === 'strength') {
    insights.nextSteps.push('Incorporate progressive resistance training');
  } else if (this.testCategory === 'flexibility') {
    insights.nextSteps.push('Daily stretching routine and mobility exercises');
  } else if (this.testCategory === 'endurance') {
    insights.nextSteps.push('Build aerobic base with consistent cardio training');
  }
  
  return insights;
};

assessmentSchema.methods.canBeVerified = function() {
  return this.status === 'completed' && 
         this.qualityChecks.videoQuality.passed && 
         this.qualityChecks.movementDetection.passed &&
         this.qualityChecks.cheatDetection.passed;
};

assessmentSchema.methods.addFlag = function(flagType, reason, flaggedBy) {
  this.flags.push({
    type: flagType,
    reason: reason,
    flaggedBy: flaggedBy,
    flaggedAt: new Date()
  });
  
  // Update status if needed
  if (flagType === 'serious' && this.status === 'completed') {
    this.status = 'flagged';
  }
};

assessmentSchema.methods.verify = function(verifiedBy, notes = '') {
  if (!this.canBeVerified()) {
    throw new Error('Assessment cannot be verified in its current state');
  }
  
  this.verificationStatus.aiVerified = true;
  this.verificationStatus.humanVerified = true;
  this.verificationStatus.officialVerified = true;
  this.verificationStatus.verifiedBy = verifiedBy;
  this.verificationStatus.verifiedAt = new Date();
  this.verificationStatus.verificationNotes = notes;
  this.verificationStatus.verificationLevel = 'official-verified';
};

assessmentSchema.methods.reject = function(reason, rejectedBy) {
  this.status = 'rejected';
  this.verificationStatus.rejectionReason = reason;
  this.addFlag('rejection', reason, rejectedBy);
};

// Static Methods
assessmentSchema.statics.findByUserId = function(userId, options = {}) {
  const query = { userId: userId, isDeleted: { $ne: true } };
  
  if (options.status) {
    query.status = options.status;
  }
  
  if (options.testType) {
    query.testType = options.testType;
  }
  
  return this.find(query)
    .populate('userId', 'firstName lastName email')
    .sort({ createdAt: -1 })
    .limit(options.limit || 50);
};

assessmentSchema.statics.getLeaderboard = async function(filters = {}) {
  const matchStage = { status: 'completed' };
  
  if (filters.testType) {
    matchStage.testType = filters.testType;
  }
  
  if (filters.testCategory) {
    matchStage.testCategory = filters.testCategory;
  }
  
  if (filters.dateRange) {
    matchStage.createdAt = {
      $gte: new Date(filters.dateRange.start),
      $lte: new Date(filters.dateRange.end)
    };
  }
  
  const assessments = await this.aggregate([
    { $match: matchStage },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'user'
      }
    },
    { $unwind: '$user' },
    {
      $match: {
        'user.isDeleted': { $ne: true },
        'user.isActive': true
      }
    },
    {
      $project: {
        assessmentId: 1,
        testType: 1,
        testCategory: 1,
        overallScore: 1,
        performanceLevel: 1,
        createdAt: 1,
        'user.fullName': { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        'user.email': 1,
        'user.age': {
          $floor: {
            $divide: [
              { $subtract: [new Date(), '$user.dateOfBirth'] },
              365.25 * 24 * 60 * 60 * 1000
            ]
          }
        },
        'user.gender': 1,
        'user.state': '$user.address.state',
        'user.city': '$user.address.city'
      }
    },
    { $sort: { overallScore: -1, createdAt: -1 } },
    { $limit: filters.limit || 100 }
  ]);
  
  return assessments;
};

assessmentSchema.statics.getAnalytics = async function(userId, options = {}) {
  const matchStage = { userId: userId };
  
  if (options.dateRange) {
    matchStage.createdAt = {
      $gte: new Date(options.dateRange.start),
      $lte: new Date(options.dateRange.end)
    };
  }
  
  if (options.testType) {
    matchStage.testType = options.testType;
  }
  
  const analytics = await this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAssessments: { $sum: 1 },
        averageScore: { $avg: '$overallScore' },
        highestScore: { $max: '$overallScore' },
        lowestScore: { $min: '$overallScore' },
        completedAssessments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        verifiedAssessments: {
          $sum: { $cond: [{ $eq: ['$verificationStatus.verificationLevel', 'official-verified'] }, 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAssessments: 1,
        averageScore: { $round: ['$averageScore', 2] },
        highestScore: 1,
        lowestScore: 1,
        completedAssessments: 1,
        verifiedAssessments: 1,
        completionRate: {
          $round: [{ $multiply: [{ $divide: ['$completedAssessments', '$totalAssessments'] }, 100] }, 2]
        },
        verificationRate: {
          $round: [{ $multiply: [{ $divide: ['$verifiedAssessments', '$totalAssessments'] }, 100] }, 2]
        }
      }
    }
  ]);
  
  return analytics[0] || {
    totalAssessments: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    completedAssessments: 0,
    verifiedAssessments: 0,
    completionRate: 0,
    verificationRate: 0
  };
};

assessmentSchema.statics.getTrends = async function(userId, testType, options = {}) {
  const matchStage = { userId: userId, testType: testType, status: 'completed' };
  
  if (options.dateRange) {
    matchStage.createdAt = {
      $gte: new Date(options.dateRange.start),
      $lte: new Date(options.dateRange.end)
    };
  }
  
  const trends = await this.aggregate([
    { $match: matchStage },
    {
      $project: {
        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        score: '$overallScore',
        performanceLevel: 1,
        processedResults: 1
      }
    },
    { $sort: { date: 1 } }
  ]);
  
  return trends;
};

const Assessment = mongoose.model('Assessment', assessmentSchema);

module.exports = Assessment;