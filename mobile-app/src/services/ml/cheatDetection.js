import * as tf from '@tensorflow/tfjs';
import { decode as atob } from 'base-64';

class CheatDetectionService {
  constructor() {
    this.suspiciousPatterns = [];
    this.frameAnalysisResults = [];
    this.maxFrameHistory = 50;
    this.cheatThreshold = 0.7;
    this.frameRate = 30; // Assuming 30 FPS
  }

  async detectCheatAttempts(videoUri, testType) {
    try {
      console.log('Starting cheat detection for:', testType);
      
      // Step 1: Extract frames from video
      const frames = await this.extractFramesFromVideo(videoUri);
      
      // Step 2: Analyze each frame for anomalies
      const frameAnalysis = await this.analyzeFrames(frames, testType);
      
      // Step 3: Check for video manipulation
      const manipulationCheck = await this.checkVideoManipulation(frames);
      
      // Step 4: Analyze movement patterns
      const movementPatternAnalysis = await this.analyzeMovementPatterns(frames, testType);
      
      // Step 5: Check for external assistance
      const assistanceCheck = await this.checkExternalAssistance(frames);
      
      // Step 6: Combine all analysis results
      const finalResults = this.combineAnalysisResults(
        frameAnalysis,
        manipulationCheck,
        movementPatternAnalysis,
        assistanceCheck
      );

      return {
        isSuspicious: finalResults.suspicionScore > this.cheatThreshold,
        suspicionScore: finalResults.suspicionScore,
        detectedIssues: finalResults.issues,
        recommendations: finalResults.recommendations,
        detailedAnalysis: {
          frameAnalysis,
          manipulationCheck,
          movementPatternAnalysis,
          assistanceCheck,
        },
      };
      
    } catch (error) {
      console.error('Cheat detection error:', error);
      return {
        isSuspicious: false,
        suspicionScore: 0,
        detectedIssues: ['Analysis failed'],
        recommendations: ['Please try recording again'],
        error: error.message,
      };
    }
  }

  async extractFramesFromVideo(videoUri) {
    // This would use a video processing library to extract frames
    // For now, we'll simulate frame extraction
    const frames = [];
    
    try {
      // In a real implementation, you would use:
      // - react-native-video-processing for native video processing
      // - Or send the video to a backend server for processing
      
      console.log('Extracting frames from video:', videoUri);
      
      // Simulate frame extraction (in real app, this would be actual video frames)
      for (let i = 0; i < this.maxFrameHistory; i++) {
        frames.push({
          id: i,
          timestamp: i * (1000 / this.frameRate),
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
    // Simulate frame data for testing
    return {
      brightness: 0.5 + Math.random() * 0.5,
      contrast: 0.4 + Math.random() * 0.6,
      edges: Math.random() * 1000,
      motion: Math.random() * 100,
      colors: this.simulateColorDistribution(),
    };
  }

  simulateColorDistribution() {
    return {
      dominant: `hsl(${Math.random() * 360}, 70%, 50%)`,
      variance: Math.random() * 50,
      saturation: 0.3 + Math.random() * 0.7,
    };
  }

  async analyzeFrames(frames, testType) {
    const analysisResults = {
      brightnessConsistency: this.checkBrightnessConsistency(frames),
      frameRateConsistency: this.checkFrameRateConsistency(frames),
      resolutionConsistency: this.checkResolutionConsistency(frames),
      motionConsistency: this.checkMotionConsistency(frames, testType),
      colorConsistency: this.checkColorConsistency(frames),
    };

    return analysisResults;
  }

  checkBrightnessConsistency(frames) {
    const brightnessValues = frames.map(frame => frame.data.brightness);
    const avgBrightness = brightnessValues.reduce((a, b) => a + b) / brightnessValues.length;
    const variance = this.calculateVariance(brightnessValues, avgBrightness);
    
    return {
      isConsistent: variance < 0.1,
      variance: variance,
      avgBrightness: avgBrightness,
      suspiciousFrames: brightnessValues.filter(b => Math.abs(b - avgBrightness) > 0.3).length,
    };
  }

  checkFrameRateConsistency(frames) {
    const timeStamps = frames.map(frame => frame.timestamp);
    const timeDiffs = [];
    
    for (let i = 1; i < timeStamps.length; i++) {
      timeDiffs.push(timeStamps[i] - timeStamps[i - 1]);
    }
    
    const avgDiff = timeDiffs.reduce((a, b) => a + b) / timeDiffs.length;
    const variance = this.calculateVariance(timeDiffs, avgDiff);
    
    return {
      isConsistent: variance < 50, // 50ms variance threshold
      variance: variance,
      avgFrameTime: avgDiff,
      suspiciousDrops: timeDiffs.filter(diff => diff > avgDiff * 2).length,
    };
  }

  checkResolutionConsistency(frames) {
    // Check if video resolution changes (indicating possible splicing)
    return {
      isConsistent: true,
      resolutionChanges: 0,
      suspiciousChanges: [],
    };
  }

  checkMotionConsistency(frames, testType) {
    const motionValues = frames.map(frame => frame.data.motion);
    const avgMotion = motionValues.reduce((a, b) => a + b) / motionValues.length;
    
    // Different tests have different expected motion patterns
    const expectedMotion = this.getExpectedMotionForTest(testType);
    
    return {
      isConsistent: Math.abs(avgMotion - expectedMotion) < 30,
      avgMotion: avgMotion,
      expectedMotion: expectedMotion,
      suspiciousSpikes: motionValues.filter(m => m > avgMotion * 2).length,
    };
  }

  getExpectedMotionForTest(testType) {
    const expectedMotion = {
      'vertical-jump': 60,
      'sit-ups': 40,
      'shuttle-run': 80,
      'endurance-run': 50,
      'height-weight': 5,
    };
    
    return expectedMotion[testType] || 30;
  }

  checkColorConsistency(frames) {
    const colorVariances = frames.map(frame => frame.data.colors.variance);
    const avgVariance = colorVariances.reduce((a, b) => a + b) / colorVariances.length;
    
    return {
      isConsistent: avgVariance < 30,
      avgVariance: avgVariance,
      suspiciousChanges: colorVariances.filter(v => v > avgVariance * 2).length,
    };
  }

  async checkVideoManipulation(frames) {
    return {
      compressionArtifacts: this.detectCompressionArtifacts(frames),
      edgeInconsistencies: this.detectEdgeInconsistencies(frames),
      metadataAnomalies: this.checkMetadataAnomalies(),
      splicingDetection: this.detectSplicing(frames),
    };
  }

  detectCompressionArtifacts(frames) {
    // Check for signs of re-compression (indicating editing)
    const edgeValues = frames.map(frame => frame.data.edges);
    const avgEdges = edgeValues.reduce((a, b) => a + b) / edgeValues.length;
    
    return {
      hasArtifacts: avgEdges < 100, // Too few edges might indicate heavy compression
      avgEdges: avgEdges,
      confidence: Math.max(0, 1 - avgEdges / 100),
    };
  }

  detectEdgeInconsistencies(frames) {
    // Check for inconsistent edge detection across frames
    const edgeValues = frames.map(frame => frame.data.edges);
    const variance = this.calculateVariance(edgeValues);
    
    return {
      hasInconsistencies: variance > 500,
      variance: variance,
      confidence: Math.min(1, variance / 1000),
    };
  }

  checkMetadataAnomalies() {
    // In a real implementation, you would check video metadata
    return {
      hasAnomalies: false,
      anomalies: [],
      confidence: 0,
    };
  }

  detectSplicing(frames) {
    // Detect abrupt changes that might indicate video splicing
    const brightnessValues = frames.map(frame => frame.data.brightness);
    const suddenChanges = this.detectSuddenChanges(brightnessValues);
    
    return {
      hasSplicing: suddenChanges.length > 2,
      splicePoints: suddenChanges,
      confidence: Math.min(1, suddenChanges.length / 5),
    };
  }

  detectSuddenChanges(values, threshold = 0.3) {
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      const change = Math.abs(values[i] - values[i - 1]);
      if (change > threshold) {
        changes.push({
          frame: i,
          change: change,
          timestamp: i * (1000 / this.frameRate),
        });
      }
    }
    return changes;
  }

  async analyzeMovementPatterns(frames, testType) {
    const movementData = this.extractMovementData(frames);
    
    return {
      patternConsistency: this.checkPatternConsistency(movementData, testType),
      repetitionDetection: this.detectRepetitions(movementData, testType),
      speedConsistency: this.checkSpeedConsistency(movementData),
      accelerationPatterns: this.analyzeAcceleration(movementData),
    };
  }

  extractMovementData(frames) {
    return frames.map(frame => ({
      motion: frame.data.motion,
      timestamp: frame.timestamp,
    }));
  }

  checkPatternConsistency(movementData, testType) {
    // Check if movement follows expected patterns for the test type
    const expectedPattern = this.getExpectedPattern(testType);
    const actualPattern = this.identifyPattern(movementData);
    
    return {
      isConsistent: this.patternsMatch(expectedPattern, actualPattern),
      expectedPattern: expectedPattern,
      actualPattern: actualPattern,
      confidence: this.calculatePatternMatchConfidence(expectedPattern, actualPattern),
    };
  }

  getExpectedPattern(testType) {
    const patterns = {
      'vertical-jump': 'burst',
      'sit-ups': 'repetitive',
      'shuttle-run': 'back-and-forth',
      'endurance-run': 'steady',
      'height-weight': 'static',
    };
    
    return patterns[testType] || 'unknown';
  }

  identifyPattern(movementData) {
    const motionValues = movementData.map(m => m.motion);
    const avgMotion = motionValues.reduce((a, b) => a + b) / motionValues.length;
    
    if (avgMotion < 10) return 'static';
    if (this.hasRepetitivePattern(motionValues)) return 'repetitive';
    if (this.hasBurstPattern(motionValues)) return 'burst';
    if (this.hasBackAndForthPattern(motionValues)) return 'back-and-forth';
    if (this.hasSteadyPattern(motionValues)) return 'steady';
    
    return 'unknown';
  }

  hasRepetitivePattern(values) {
    // Simple repetitive pattern detection
    const peaks = this.findPeaks(values);
    return peaks.length > 3 && this.isRegularSpacing(peaks);
  }

  hasBurstPattern(values) {
    // Detect sudden bursts of high motion
    const maxMotion = Math.max(...values);
    const avgMotion = values.reduce((a, b) => a + b) / values.length;
    return maxMotion > avgMotion * 3;
  }

  hasBackAndForthPattern(values) {
    // Detect alternating high-low motion
    const alternating = this.findAlternatingPattern(values);
    return alternating.length > 4;
  }

  hasSteadyPattern(values) {
    // Detect consistent moderate motion
    const variance = this.calculateVariance(values);
    return variance < 100 && values.every(v => v > 20);
  }

  findPeaks(values, threshold = 0.3) {
    const peaks = [];
    for (let i = 1; i < values.length - 1; i++) {
      if (values[i] > values[i - 1] && values[i] > values[i + 1] && values[i] > threshold) {
        peaks.push({ index: i, value: values[i] });
      }
    }
    return peaks;
  }

  isRegularSpacing(peaks, tolerance = 0.2) {
    if (peaks.length < 2) return false;
    
    const spacings = [];
    for (let i = 1; i < peaks.length; i++) {
      spacings.push(peaks[i].index - peaks[i - 1].index);
    }
    
    const avgSpacing = spacings.reduce((a, b) => a + b) / spacings.length;
    return spacings.every(s => Math.abs(s - avgSpacing) / avgSpacing < tolerance);
  }

  findAlternatingPattern(values) {
    const pattern = [];
    for (let i = 1; i < values.length; i++) {
      if ((values[i] > values[i - 1] && i % 2 === 0) || 
          (values[i] < values[i - 1] && i % 2 === 1)) {
        pattern.push(i);
      }
    }
    return pattern;
  }

  checkSpeedConsistency(movementData) {
    const speeds = this.calculateSpeeds(movementData);
    const avgSpeed = speeds.reduce((a, b) => a + b) / speeds.length;
    const variance = this.calculateVariance(speeds, avgSpeed);
    
    return {
      isConsistent: variance < 50,
      avgSpeed: avgSpeed,
      variance: variance,
      confidence: Math.max(0, 1 - variance / 100),
    };
  }

  calculateSpeeds(movementData) {
    const speeds = [];
    for (let i = 1; i < movementData.length; i++) {
      const timeDiff = movementData[i].timestamp - movementData[i - 1].timestamp;
      const motionDiff = Math.abs(movementData[i].motion - movementData[i - 1].motion);
      if (timeDiff > 0) {
        speeds.push(motionDiff / timeDiff);
      }
    }
    return speeds;
  }

  analyzeAcceleration(movementData) {
    const speeds = this.calculateSpeeds(movementData);
    const accelerations = [];
    
    for (let i = 1; i < speeds.length; i++) {
      accelerations.push(speeds[i] - speeds[i - 1]);
    }
    
    const avgAcceleration = accelerations.reduce((a, b) => a + b) / accelerations.length;
    const maxAcceleration = Math.max(...accelerations);
    
    return {
      avgAcceleration: avgAcceleration,
      maxAcceleration: maxAcceleration,
      isNatural: maxAcceleration < 10, // Reasonable acceleration limit
      confidence: Math.max(0, 1 - maxAcceleration / 20),
    };
  }

  async checkExternalAssistance(frames) {
    return {
      multiplePeople: this.detectMultiplePeople(frames),
      objectDetection: this.detectSuspiciousObjects(frames),
      audioAnalysis: this.analyzeAudioForAssistance(),
      environmentalConsistency: this.checkEnvironmentConsistency(frames),
    };
  }

  detectMultiplePeople(frames) {
    // In a real implementation, you would use person detection
    // For now, we'll simulate this check
    return {
      hasMultiplePeople: false,
      personCount: 1,
      confidence: 0.9,
    };
  }

  detectSuspiciousObjects(frames) {
    // Check for objects that might indicate assistance (chairs, resistance bands, etc.)
    return {
      hasSuspiciousObjects: false,
      detectedObjects: [],
      confidence: 0.8,
    };
  }

  analyzeAudioForAssistance() {
    // In a real implementation, you would analyze audio for coaching or assistance
    return {
      hasExternalAudio: false,
      audioAnalysis: 'clear',
      confidence: 0.7,
    };
  }

  checkEnvironmentConsistency(frames) {
    // Check if the environment changes (indicating possible location changes)
    const colorVariances = frames.map(frame => frame.data.colors.variance);
    const avgVariance = colorVariances.reduce((a, b) => a + b) / colorVariances.length;
    
    return {
      isConsistent: avgVariance < 30,
      avgVariance: avgVariance,
      confidence: Math.max(0, 1 - avgVariance / 50),
    };
  }

  combineAnalysisResults(frameAnalysis, manipulationCheck, movementPatternAnalysis, assistanceCheck) {
    let totalSuspicionScore = 0;
    const issues = [];
    const recommendations = [];

    // Frame analysis scoring
    if (!frameAnalysis.brightnessConsistency.isConsistent) {
      totalSuspicionScore += 0.15;
      issues.push('Inconsistent lighting detected');
      recommendations.push('Ensure consistent lighting throughout the recording');
    }

    if (!frameAnalysis.frameRateConsistency.isConsistent) {
      totalSuspicionScore += 0.1;
      issues.push('Frame rate inconsistencies detected');
      recommendations.push('Record in a single continuous take');
    }

    // Manipulation check scoring
    if (manipulationCheck.compressionArtifacts.hasArtifacts) {
      totalSuspicionScore += 0.2;
      issues.push('Video compression artifacts detected');
      recommendations.push('Avoid editing or re-compressing the video');
    }

    if (manipulationCheck.splicingDetection.hasSplicing) {
      totalSuspicionScore += 0.3;
      issues.push('Video splicing detected');
      recommendations.push('Record the entire test in one continuous take');
    }

    // Movement pattern scoring
    if (!movementPatternAnalysis.patternConsistency.isConsistent) {
      totalSuspicionScore += 0.15;
      issues.push('Movement pattern inconsistencies');
      recommendations.push('Follow the test instructions carefully');
    }

    // Assistance check scoring
    if (assistanceCheck.multiplePeople.hasMultiplePeople) {
      totalSuspicionScore += 0.25;
      issues.push('Multiple people detected in video');
      recommendations.push('Ensure only the test taker is visible');
    }

    if (!assistanceCheck.environmentalConsistency.isConsistent) {
      totalSuspicionScore += 0.1;
      issues.push('Environment inconsistencies detected');
      recommendations.push('Record in a single location');
    }

    return {
      suspicionScore: Math.min(1, totalSuspicionScore),
      issues: issues,
      recommendations: recommendations.length > 0 ? recommendations : ['Video analysis completed successfully'],
    };
  }

  calculateVariance(values, mean = null) {
    const avg = mean || values.reduce((a, b) => a + b) / values.length;
    const squaredDiffs = values.map(value => Math.pow(value - avg, 2));
    return squaredDiffs.reduce((a, b) => a + b) / values.length;
  }

  patternsMatch(expected, actual) {
    return expected === actual;
  }

  calculatePatternMatchConfidence(expected, actual) {
    return expected === actual ? 1.0 : 0.0;
  }
}

// Create singleton instance
const cheatDetectionService = new CheatDetectionService();

// Export main function
export const detectCheatAttempts = (videoUri, testType) => 
  cheatDetectionService.detectCheatAttempts(videoUri, testType);

export default cheatDetectionService;