import * as tf from '@tensorflow/tfjs';
import * as poseDetection from '@tensorflow-models/pose-detection';
import { detectCheatAttempts } from './cheatDetection';

class OfflineAnalysisService {
  constructor() {
    this.models = {};
    this.isInitialized = false;
    this.analysisCache = new Map();
    this.maxCacheSize = 100;
    this.supportedTests = [
      'vertical-jump',
      'sit-ups',
      'push-ups',
      'shuttle-run',
      'endurance-run',
      'height-weight',
      'standing-broad-jump',
      '50m-sprint',
      '600m-run',
      'medicine-ball-throw'
    ];
  }

  async initialize() {
    try {
      console.log('Initializing offline analysis service...');
      
      // Load pose detection model
      this.models.poseDetector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
          enableSmoothing: true,
          minPoseScore: 0.3,
        }
      );

      // Load test-specific models
      await this.loadTestSpecificModels();
      
      this.isInitialized = true;
      console.log('Offline analysis service initialized successfully');
      
      return true;
    } catch (error) {
      console.error('Failed to initialize offline analysis service:', error);
      return false;
    }
  }

  async loadTestSpecificModels() {
    // Load models for specific test types
    try {
      // Vertical jump model
      this.models.verticalJump = await tf.loadLayersModel(
        'local://models/vertical-jump-model.json'
      ).catch(() => this.createFallbackModel('vertical-jump'));

      // Sit-ups model
      this.models.sitUps = await tf.loadLayersModel(
        'local://models/sit-ups-model.json'
      ).catch(() => this.createFallbackModel('sit-ups'));

      // Push-ups model
      this.models.pushUps = await tf.loadLayersModel(
        'local://models/push-ups-model.json'
      ).catch(() => this.createFallbackModel('push-ups'));

      console.log('Test-specific models loaded');
    } catch (error) {
      console.warn('Could not load test-specific models, using fallback models');
      await this.createAllFallbackModels();
    }
  }

  createFallbackModel(testType) {
    // Create simple rule-based models when ML models aren't available
    const model = {
      testType: testType,
      isFallback: true,
      predict: (features) => this.ruleBasedPrediction(testType, features),
    };
    
    return model;
  }

  async createAllFallbackModels() {
    this.models.verticalJump = this.createFallbackModel('vertical-jump');
    this.models.sitUps = this.createFallbackModel('sit-ups');
    this.models.pushUps = this.createFallbackModel('push-ups');
  }

  ruleBasedPrediction(testType, features) {
    // Simple rule-based predictions for when ML models aren't available
    switch (testType) {
      case 'vertical-jump':
        return this.analyzeVerticalJumpFallback(features);
      case 'sit-ups':
        return this.analyzeSitUpsFallback(features);
      case 'push-ups':
        return this.analyzePushUpsFallback(features);
      case 'shuttle-run':
        return this.analyzeShuttleRunFallback(features);
      case 'endurance-run':
        return this.analyzeEnduranceRunFallback(features);
      default:
        return this.genericAnalysisFallback(features);
    }
  }

  async analyzeVideoOffline(videoUri, testType, userProfile = {}) {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      console.log(`Starting offline analysis for ${testType}`);
      
      // Check cache first
      const cacheKey = `${videoUri}-${testType}-${JSON.stringify(userProfile)}`;
      if (this.analysisCache.has(cacheKey)) {
        console.log('Returning cached analysis results');
        return this.analysisCache.get(cacheKey);
      }

      // Validate test type
      if (!this.supportedTests.includes(testType)) {
        throw new Error(`Unsupported test type: ${testType}`);
      }

      // Step 1: Extract frames from video
      const frames = await this.extractFrames(videoUri);
      
      // Step 2: Perform pose detection on frames
      const poseData = await this.analyzePoses(frames);
      
      // Step 3: Analyze movement patterns
      const movementAnalysis = await this.analyzeMovement(poseData, testType);
      
      // Step 4: Count repetitions or measure performance
      const performanceMetrics = await this.calculatePerformance(movementAnalysis, testType);
      
      // Step 5: Perform cheat detection
      const cheatAnalysis = await detectCheatAttempts(videoUri, testType);
      
      // Step 6: Generate performance benchmarks
      const benchmarking = await this.performBenchmarking(performanceMetrics, userProfile);
      
      // Step 7: Compile results
      const results = {
        testType: testType,
        performanceMetrics: performanceMetrics,
        movementAnalysis: movementAnalysis,
        cheatAnalysis: cheatAnalysis,
        benchmarking: benchmarking,
        confidence: this.calculateConfidence(performanceMetrics, cheatAnalysis),
        recommendations: this.generateRecommendations(performanceMetrics, benchmarking),
        timestamp: new Date().toISOString(),
        deviceInfo: await this.getDeviceInfo(),
      };

      // Cache results
      this.setCache(cacheKey, results);
      
      console.log('Offline analysis completed successfully');
      return results;
      
    } catch (error) {
      console.error('Offline analysis error:', error);
      return {
        error: true,
        message: error.message,
        fallbackResults: await this.generateFallbackResults(videoUri, testType),
      };
    }
  }

  async extractFrames(videoUri) {
    // In a real implementation, this would extract frames from the video
    // For now, we'll simulate frame extraction
    const frames = [];
    
    try {
      // Simulate extracting 30 frames for analysis
      for (let i = 0; i < 30; i++) {
        frames.push({
          id: i,
          timestamp: i * 100, // 100ms intervals
          data: this.simulateFrameData(i),
        });
      }
      
      return frames;
    } catch (error) {
      console.error('Frame extraction error:', error);
      throw new Error('Failed to extract frames from video');
    }
  }

  simulateFrameData(frameIndex) {
    return {
      // Simulate different data based on frame index
      pose: this.simulatePoseData(frameIndex),
      motion: this.simulateMotionData(frameIndex),
      timing: frameIndex * 100,
    };
  }

  simulatePoseData(frameIndex) {
    // Simulate pose keypoints
    const basePose = {
      nose: { x: 0.5, y: 0.3, score: 0.9 },
      leftEye: { x: 0.48, y: 0.28, score: 0.9 },
      rightEye: { x: 0.52, y: 0.28, score: 0.9 },
      leftShoulder: { x: 0.4, y: 0.5, score: 0.8 },
      rightShoulder: { x: 0.6, y: 0.5, score: 0.8 },
      leftElbow: { x: 0.35, y: 0.7, score: 0.7 },
      rightElbow: { x: 0.65, y: 0.7, score: 0.7 },
      leftWrist: { x: 0.3, y: 0.9, score: 0.6 },
      rightWrist: { x: 0.7, y: 0.9, score: 0.6 },
      leftHip: { x: 0.42, y: 0.6, score: 0.8 },
      rightHip: { x: 0.58, y: 0.6, score: 0.8 },
      leftKnee: { x: 0.4, y: 0.8, score: 0.7 },
      rightKnee: { x: 0.6, y: 0.8, score: 0.7 },
      leftAnkle: { x: 0.38, y: 1.0, score: 0.6 },
      rightAnkle: { x: 0.62, y: 1.0, score: 0.6 },
    };

    // Add some variation based on frame index
    const variation = Math.sin(frameIndex * 0.1) * 0.1;
    const variedPose = {};
    
    Object.keys(basePose).forEach(key => {
      variedPose[key] = {
        x: basePose[key].x + variation,
        y: basePose[key].y + variation * 0.5,
        score: basePose[key].score - Math.abs(variation) * 0.2,
      };
    });

    return variedPose;
  }

  simulateMotionData(frameIndex) {
    return {
      intensity: Math.abs(Math.sin(frameIndex * 0.2)) * 100,
      direction: Math.cos(frameIndex * 0.15) * 180,
      velocity: Math.abs(Math.cos(frameIndex * 0.1)) * 50,
    };
  }

  async analyzePoses(frames) {
    const poseData = [];
    
    for (const frame of frames) {
      try {
        // In a real implementation, you would use the pose detector
        // const poses = await this.models.poseDetector.estimatePoses(frame);
        
        // Simulate pose analysis
        const poseAnalysis = {
          frameId: frame.id,
          timestamp: frame.timestamp,
          keypoints: frame.data.pose,
          poseScore: this.calculatePoseScore(frame.data.pose),
          bodyAngles: this.calculateBodyAngles(frame.data.pose),
          centerOfMass: this.calculateCenterOfMass(frame.data.pose),
        };
        
        poseData.push(poseAnalysis);
      } catch (error) {
        console.error(`Pose analysis error for frame ${frame.id}:`, error);
      }
    }
    
    return poseData;
  }

  calculatePoseScore(pose) {
    const scores = Object.values(pose).map(point => point.score);
    return scores.reduce((a, b) => a + b) / scores.length;
  }

  calculateBodyAngles(pose) {
    const angles = {};
    
    // Calculate key body angles
    if (pose.leftShoulder && pose.leftElbow && pose.leftWrist) {
      angles.leftElbow = this.calculateAngle(
        pose.leftShoulder, pose.leftElbow, pose.leftWrist
      );
    }
    
    if (pose.rightShoulder && pose.rightElbow && pose.rightWrist) {
      angles.rightElbow = this.calculateAngle(
        pose.rightShoulder, pose.rightElbow, pose.rightWrist
      );
    }
    
    if (pose.leftHip && pose.leftKnee && pose.leftAnkle) {
      angles.leftKnee = this.calculateAngle(
        pose.leftHip, pose.leftKnee, pose.leftAnkle
      );
    }
    
    if (pose.rightHip && pose.rightKnee && pose.rightAnkle) {
      angles.rightKnee = this.calculateAngle(
        pose.rightHip, pose.rightKnee, pose.rightAnkle
      );
    }
    
    return angles;
  }

  calculateAngle(point1, point2, point3) {
    const angle = Math.atan2(point3.y - point2.y, point3.x - point2.x) -
                  Math.atan2(point1.y - point2.y, point1.x - point2.x);
    return Math.abs(angle * 180 / Math.PI);
  }

  calculateCenterOfMass(pose) {
    const keypoints = Object.values(pose);
    const avgX = keypoints.reduce((sum, point) => sum + point.x, 0) / keypoints.length;
    const avgY = keypoints.reduce((sum, point) => sum + point.y, 0) / keypoints.length;
    
    return { x: avgX, y: avgY };
  }

  async analyzeMovement(poseData, testType) {
    const movement = {
      testType: testType,
      totalFrames: poseData.length,
      avgPoseScore: poseData.reduce((sum, p) => sum + p.poseScore, 0) / poseData.length,
      keyMovementPhases: this.identifyMovementPhases(poseData, testType),
      repetitionCount: this.countRepetitions(poseData, testType),
      movementQuality: this.assessMovementQuality(poseData, testType),
      timingAnalysis: this.analyzeTiming(poseData, testType),
    };
    
    return movement;
  }

  identifyMovementPhases(poseData, testType) {
    const phases = [];
    
    switch (testType) {
      case 'vertical-jump':
        phases.push(...this.identifyJumpPhases(poseData));
        break;
      case 'sit-ups':
      case 'push-ups':
        phases.push(...this.identifyRepetitivePhases(poseData, testType));
        break;
      case 'shuttle-run':
        phases.push(...this.identifyShuttlePhases(poseData));
        break;
      case 'endurance-run':
        phases.push(...this.identifyRunningPhases(poseData));
        break;
      default:
        phases.push(...this.identifyGenericPhases(poseData));
    }
    
    return phases;
  }

  identifyJumpPhases(poseData) {
    const phases = [];
    let currentPhase = 'standing';
    let phaseStart = 0;
    
    for (let i = 1; i < poseData.length; i++) {
      const prevPose = poseData[i - 1];
      const currPose = poseData[i];
      
      const kneeAngleChange = this.getKneeAngleChange(prevPose, currPose);
      const centerOfMassChange = this.getCenterOfMassChange(prevPose, currPose);
      
      if (currentPhase === 'standing' && kneeAngleChange > 20) {
        phases.push({
          phase: 'crouch',
          startFrame: phaseStart,
          endFrame: i,
          duration: (currPose.timestamp - poseData[phaseStart].timestamp) / 1000,
        });
        currentPhase = 'crouch';
        phaseStart = i;
      } else if (currentPhase === 'crouch' && centerOfMassChange > 0.1) {
        phases.push({
          phase: 'jump',
          startFrame: phaseStart,
          endFrame: i,
          duration: (currPose.timestamp - poseData[phaseStart].timestamp) / 1000,
        });
        currentPhase = 'jump';
        phaseStart = i;
      } else if (currentPhase === 'jump' && centerOfMassChange < -0.05) {
        phases.push({
          phase: 'landing',
          startFrame: phaseStart,
          endFrame: i,
          duration: (currPose.timestamp - poseData[phaseStart].timestamp) / 1000,
        });
        currentPhase = 'landing';
        phaseStart = i;
      }
    }
    
    return phases;
  }

  identifyRepetitivePhases(poseData, testType) {
    const phases = [];
    let isUpPhase = true;
    let phaseStart = 0;
    
    for (let i = 1; i < poseData.length; i++) {
      const currPose = poseData[i];
      const angleKey = testType === 'sit-ups' ? 'leftKnee' : 'leftElbow';
      const angle = currPose.bodyAngles[angleKey] || 90;
      
      if (isUpPhase && angle < 60) {
        phases.push({
          phase: 'down',
          startFrame: phaseStart,
          endFrame: i,
          duration: (currPose.timestamp - poseData[phaseStart].timestamp) / 1000,
        });
        isUpPhase = false;
        phaseStart = i;
      } else if (!isUpPhase && angle > 120) {
        phases.push({
          phase: 'up',
          startFrame: phaseStart,
          endFrame: i,
          duration: (currPose.timestamp - poseData[phaseStart].timestamp) / 1000,
        });
        isUpPhase = true;
        phaseStart = i;
      }
    }
    
    return phases;
  }

  getKneeAngleChange(prevPose, currPose) {
    const prevAngle = prevPose.bodyAngles.leftKnee || 90;
    const currAngle = currPose.bodyAngles.leftKnee || 90;
    return Math.abs(currAngle - prevAngle);
  }

  getCenterOfMassChange(prevPose, currPose) {
    const prevCOM = prevPose.centerOfMass.y;
    const currCOM = currPose.centerOfMass.y;
    return currCOM - prevCOM;
  }

  countRepetitions(poseData, testType) {
    if (['sit-ups', 'push-ups'].includes(testType)) {
      return this.countRepetitiveMovements(poseData, testType);
    }
    
    return 1; // Single movement for other tests
  }

  countRepetitiveMovements(poseData, testType) {
    const phases = this.identifyRepetitivePhases(poseData, testType);
    return Math.floor(phases.length / 2); // Count complete up-down cycles
  }

  assessMovementQuality(poseData, testType) {
    const scores = {
      form: this.assessForm(poseData, testType),
      consistency: this.assessConsistency(poseData, testType),
      rangeOfMotion: this.assessRangeOfMotion(poseData, testType),
      timing: this.assessTiming(poseData, testType),
    };
    
    const overallScore = Object.values(scores).reduce((a, b) => a + b) / Object.values(scores).length;
    
    return {
      overallScore: overallScore,
      detailedScores: scores,
      quality: overallScore > 0.8 ? 'excellent' : overallScore > 0.6 ? 'good' : 'needs-improvement',
    };
  }

  assessForm(poseData, testType) {
    // Assess if the movement follows proper form
    let formScore = 1.0;
    
    switch (testType) {
      case 'sit-ups':
        formScore = this.assessSitUpForm(poseData);
        break;
      case 'push-ups':
        formScore = this.assessPushUpForm(poseData);
        break;
      case 'vertical-jump':
        formScore = this.assessJumpForm(poseData);
        break;
    }
    
    return formScore;
  }

  assessSitUpForm(poseData) {
    // Check if knees are bent at proper angle
    const avgKneeAngle = poseData.reduce((sum, p) => {
      return sum + (p.bodyAngles.leftKnee || 90);
    }, 0) / poseData.length;
    
    return avgKneeAngle < 90 ? 1.0 : 0.7;
  }

  assessPushUpForm(poseData) {
    // Check if body maintains straight line
    let straightBodyScore = 1.0;
    
    for (const pose of poseData) {
      const shoulderHipDiff = Math.abs(
        pose.keypoints.leftShoulder.y - pose.keypoints.leftHip.y
      );
      if (shoulderHipDiff > 0.1) {
        straightBodyScore -= 0.1;
      }
    }
    
    return Math.max(0, straightBodyScore);
  }

  assessJumpForm(poseData) {
    // Check for proper crouch and extension
    const phases = this.identifyJumpPhases(poseData);
    return phases.length >= 3 ? 1.0 : 0.5;
  }

  assessConsistency(poseData, testType) {
    // Assess consistency across repetitions
    if (['sit-ups', 'push-ups'].includes(testType)) {
      const phases = this.identifyRepetitivePhases(poseData, testType);
      const durations = phases.map(p => p.duration);
      const variance = this.calculateVariance(durations);
      
      return variance < 0.5 ? 1.0 : 0.7;
    }
    
    return 1.0;
  }

  assessRangeOfMotion(poseData, testType) {
    // Assess if full range of motion is achieved
    let romScore = 1.0;
    
    switch (testType) {
      case 'sit-ups':
        const maxAngle = Math.max(...poseData.map(p => p.bodyAngles.leftKnee || 90));
        romScore = maxAngle < 45 ? 1.0 : 0.8;
        break;
      case 'push-ups':
        const minAngle = Math.min(...poseData.map(p => p.bodyAngles.leftElbow || 90));
        romScore = minAngle < 60 ? 1.0 : 0.7;
        break;
    }
    
    return romScore;
  }

  assessTiming(poseData, testType) {
    // Assess timing appropriateness
    const totalDuration = poseData[poseData.length - 1].timestamp - poseData[0].timestamp;
    
    const expectedDurations = {
      'vertical-jump': 2000, // 2 seconds
      'sit-ups': 30000, // 30 seconds
      'push-ups': 30000, // 30 seconds
      'shuttle-run': 20000, // 20 seconds
      'endurance-run': 180000, // 3 minutes
    };
    
    const expected = expectedDurations[testType] || 10000;
    const ratio = totalDuration / expected;
    
    return ratio > 0.5 && ratio < 2.0 ? 1.0 : 0.8;
  }

  analyzeTiming(poseData, testType) {
    const timing = {
      totalDuration: poseData[poseData.length - 1].timestamp - poseData[0].timestamp,
      avgFrameInterval: this.calculateAvgFrameInterval(poseData),
      movementPhases: this.calculatePhaseTimings(poseData),
    };
    
    return timing;
  }

  calculateAvgFrameInterval(poseData) {
    let totalInterval = 0;
    for (let i = 1; i < poseData.length; i++) {
      totalInterval += poseData[i].timestamp - poseData[i - 1].timestamp;
    }
    return totalInterval / (poseData.length - 1);
  }

  calculatePhaseTimings(poseData) {
    // Calculate timing for different movement phases
    return {
      preparation: 0,
      execution: 0,
      recovery: 0,
    };
  }

  async calculatePerformance(movementAnalysis, testType) {
    const metrics = {
      testType: testType,
      repetitionCount: movementAnalysis.repetitionCount,
      movementQuality: movementAnalysis.movementQuality.overallScore,
      totalDuration: movementAnalysis.timingAnalysis.totalDuration,
      performanceScore: this.calculatePerformanceScore(movementAnalysis, testType),
      keyMetrics: this.extractKeyMetrics(movementAnalysis, testType),
      techniqueScore: movementAnalysis.movementQuality.overallScore,
    };
    
    return metrics;
  }

  calculatePerformanceScore(movementAnalysis, testType) {
    let score = 0;
    
    switch (testType) {
      case 'sit-ups':
      case 'push-ups':
        score = movementAnalysis.repetitionCount * movementAnalysis.movementQuality.overallScore;
        break;
      case 'vertical-jump':
        score = movementAnalysis.movementQuality.overallScore * 100;
        break;
      default:
        score = movementAnalysis.movementQuality.overallScore * 50;
    }
    
    return Math.round(score * 10) / 10;
  }

  extractKeyMetrics(movementAnalysis, testType) {
    const metrics = {};
    
    switch (testType) {
      case 'sit-ups':
        metrics.repetitions = movementAnalysis.repetitionCount;
        metrics.avgDurationPerRep = movementAnalysis.timingAnalysis.totalDuration / movementAnalysis.repetitionCount;
        break;
      case 'vertical-jump':
        metrics.jumpHeight = this.estimateJumpHeight(movementAnalysis);
        metrics.hangTime = this.estimateHangTime(movementAnalysis);
        break;
      case 'shuttle-run':
        metrics.lapsCompleted = this.estimateShuttleLaps(movementAnalysis);
        metrics.avgLapTime = this.estimateAvgLapTime(movementAnalysis);
        break;
    }
    
    return metrics;
  }

  estimateJumpHeight(movementAnalysis) {
    // Estimate jump height based on movement analysis
    const phases = movementAnalysis.keyMovementPhases;
    const jumpPhase = phases.find(p => p.phase === 'jump');
    
    if (jumpPhase) {
      return Math.round(jumpPhase.duration * 50); // Rough estimate
    }
    
    return 30; // Default estimate in cm
  }

  estimateHangTime(movementAnalysis) {
    const phases = movementAnalysis.keyMovementPhases;
    const jumpPhase = phases.find(p => p.phase === 'jump');
    
    return jumpPhase ? jumpPhase.duration / 1000 : 0.5; // in seconds
  }

  estimateShuttleLaps(movementAnalysis) {
    // Estimate based on movement patterns
    return Math.floor(movementAnalysis.repetitionCount / 2);
  }

  estimateAvgLapTime(movementAnalysis) {
    return movementAnalysis.timingAnalysis.totalDuration / this.estimateShuttleLaps(movementAnalysis);
  }

  async performBenchmarking(performanceMetrics, userProfile) {
    const benchmarks = {
      ageGroup: this.determineAgeGroup(userProfile.age),
      gender: userProfile.gender || 'male',
      testType: performanceMetrics.testType,
      userScore: performanceMetrics.performanceScore,
      percentiles: this.calculatePercentiles(performanceMetrics, userProfile),
      rating: this.calculateRating(performanceMetrics, userProfile),
      recommendations: this.generateBenchmarkRecommendations(performanceMetrics, userProfile),
    };
    
    return benchmarks;
  }

  determineAgeGroup(age) {
    if (age < 13) return 'under-13';
    if (age < 16) return '13-15';
    if (age < 19) return '16-18';
    if (age < 25) return '19-24';
    return '25-plus';
  }

  calculatePercentiles(metrics, userProfile) {
    // Simplified percentile calculation based on age/gender norms
    const ageGroup = this.determineAgeGroup(userProfile.age);
    const gender = userProfile.gender || 'male';
    
    // These would be based on actual sports science data
    const norms = this.getPerformanceNorms(metrics.testType, ageGroup, gender);
    
    return {
      overall: Math.min(100, Math.max(0, (metrics.performanceScore / norms.excellent) * 100)),
      category: this.getPercentileCategory(metrics.performanceScore, norms),
    };
  }

  getPerformanceNorms(testType, ageGroup, gender) {
    // Simplified norms - in reality, these would come from extensive sports data
    const baseNorms = {
      'sit-ups': { poor: 10, average: 20, good: 30, excellent: 40 },
      'push-ups': { poor: 5, average: 15, good: 25, excellent: 35 },
      'vertical-jump': { poor: 30, average: 40, good: 50, excellent: 60 },
    };
    
    return baseNorms[testType] || { poor: 20, average: 50, good: 70, excellent: 90 };
  }

  getPercentileCategory(score, norms) {
    if (score >= norms.excellent) return 'excellent';
    if (score >= norms.good) return 'good';
    if (score >= norms.average) return 'average';
    return 'needs-improvement';
  }

  calculateRating(metrics, userProfile) {
    const percentiles = this.calculatePercentiles(metrics, userProfile);
    
    return {
      overall: percentiles.category,
      score: metrics.performanceScore,
      percentile: percentiles.overall,
      level: this.getSkillLevel(percentiles.overall),
    };
  }

  getSkillLevel(percentile) {
    if (percentile >= 90) return 'elite';
    if (percentile >= 75) return 'advanced';
    if (percentile >= 50) return 'intermediate';
    return 'beginner';
  }

  calculateConfidence(performanceMetrics, cheatAnalysis) {
    let confidence = 0.8; // Base confidence
    
    // Reduce confidence if cheat detection found issues
    if (cheatAnalysis.isSuspicious) {
      confidence -= 0.3;
    }
    
    // Increase confidence based on movement quality
    if (performanceMetrics.movementQuality > 0.8) {
      confidence += 0.1;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  generateRecommendations(performanceMetrics, benchmarking) {
    const recommendations = [];
    
    if (benchmarking.rating.percentile < 50) {
      recommendations.push('Focus on basic fitness fundamentals');
    }
    
    if (performanceMetrics.movementQuality < 0.7) {
      recommendations.push('Work on proper form and technique');
    }
    
    if (benchmarking.rating.level === 'elite') {
      recommendations.push('Consider advanced training programs');
    }
    
    return recommendations.length > 0 ? recommendations : ['Keep up the good work!'];
  }

  generateBenchmarkRecommendations(metrics, userProfile) {
    const recommendations = [];
    const rating = this.calculateRating(metrics, userProfile);
    
    switch (rating.overall) {
      case 'excellent':
        recommendations.push('Excellent performance! Consider competitive training.');
        break;
      case 'good':
        recommendations.push('Good performance. Focus on consistency.');
        break;
      case 'average':
        recommendations.push('Average performance. Regular practice recommended.');
        break;
      default:
        recommendations.push('Needs improvement. Focus on fundamentals.');
    }
    
    return recommendations;
  }

  async generateFallbackResults(videoUri, testType) {
    // Generate basic results when analysis fails
    return {
      testType: testType,
      performanceMetrics: {
        repetitionCount: 0,
        movementQuality: 0,
        performanceScore: 0,
      },
      movementAnalysis: {
        error: 'Analysis failed',
      },
      cheatAnalysis: {
        isSuspicious: false,
        suspicionScore: 0,
      },
      benchmarking: {
        error: 'Benchmarking unavailable',
      },
      confidence: 0,
      recommendations: ['Please try recording again with better lighting and camera angle'],
      fallback: true,
    };
  }

  setCache(key, value) {
    if (this.analysisCache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.analysisCache.keys().next().value;
      this.analysisCache.delete(firstKey);
    }
    
    this.analysisCache.set(key, value);
  }

  async getDeviceInfo() {
    // Get device information for performance context
    return {
      platform: 'mobile',
      timestamp: new Date().toISOString(),
      // In a real app, you would get actual device info
      deviceType: 'smartphone',
      appVersion: '1.0.0',
    };
  }

  calculateVariance(values, mean = null) {
    const avg = mean || values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }
}

// Create singleton instance
const offlineAnalysisService = new OfflineAnalysisService();

// Export main function
export const analyzeVideoOffline = (videoUri, testType, userProfile = {}) => 
  offlineAnalysisService.analyzeVideoOffline(videoUri, testType, userProfile);

export default offlineAnalysisService;