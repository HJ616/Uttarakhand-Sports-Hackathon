import * as tf from '@tensorflow/tfjs';
import { poseDetection } from '@tensorflow-models/pose-detection';
import { cameraWithTensors } from '@tensorflow/tfjs-react-native';

class PoseDetectionService {
  constructor() {
    this.detector = null;
    this.isModelLoaded = false;
    this.lastPoses = [];
    this.poseHistory = [];
    this.maxHistoryLength = 100;
  }

  async initialize() {
    try {
      // Wait for TensorFlow to be ready
      await tf.ready();
      
      // Load the MoveNet Thunder model
      const detectorConfig = {
        modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
        enableTracking: true,
        trackerType: poseDetection.TrackerType.BoundingBox,
      };

      this.detector = await poseDetection.createDetector(
        poseDetection.SupportedModels.MoveNet,
        detectorConfig
      );

      this.isModelLoaded = true;
      console.log('Pose detection model loaded successfully');
      
      return true;
    } catch (error) {
      console.error('Error initializing pose detection:', error);
      return false;
    }
  }

  async detectPoses(videoFrame) {
    if (!this.isModelLoaded || !this.detector) {
      console.warn('Pose detector not initialized');
      return null;
    }

    try {
      const poses = await this.detector.estimatePoses(videoFrame, {
        maxPoses: 1,
        flipHorizontal: false,
      });

      if (poses && poses.length > 0) {
        const pose = poses[0];
        this.updatePoseHistory(pose);
        this.lastPoses = poses;
        
        return {
          pose: pose,
          keypoints: this.processKeypoints(pose.keypoints),
          movementAnalysis: this.analyzeMovement(),
          formQuality: this.assessFormQuality(pose),
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error detecting poses:', error);
      return null;
    }
  }

  processKeypoints(keypoints) {
    const keypointMap = {};
    keypoints.forEach(kp => {
      keypointMap[kp.name] = {
        x: kp.x,
        y: kp.y,
        score: kp.score,
        visibility: kp.visibility || kp.score,
      };
    });
    return keypointMap;
  }

  updatePoseHistory(pose) {
    this.poseHistory.push({
      timestamp: Date.now(),
      pose: pose,
      keypoints: this.processKeypoints(pose.keypoints),
    });

    if (this.poseHistory.length > this.maxHistoryLength) {
      this.poseHistory.shift();
    }
  }

  analyzeMovement() {
    if (this.poseHistory.length < 10) {
      return { isMoving: false, movementType: 'unknown' };
    }

    const recentPoses = this.poseHistory.slice(-10);
    const movementData = this.calculateMovementMetrics(recentPoses);
    
    return {
      isMoving: movementData.totalMovement > 5,
      movementType: this.classifyMovement(movementData),
      velocity: movementData.velocity,
      acceleration: movementData.acceleration,
      jumpHeight: movementData.jumpHeight,
      squatDepth: movementData.squatDepth,
    };
  }

  calculateMovementMetrics(poses) {
    let totalMovement = 0;
    let jumpHeight = 0;
    let squatDepth = 0;
    let velocities = [];

    for (let i = 1; i < poses.length; i++) {
      const currentPose = poses[i].keypoints;
      const previousPose = poses[i - 1].keypoints;

      // Calculate movement of key joints
      const noseMovement = this.calculateDistance(
        currentPose['nose'],
        previousPose['nose']
      );
      
      const hipMovement = this.calculateDistance(
        currentPose['left_hip'] || currentPose['right_hip'],
        previousPose['left_hip'] || previousPose['right_hip']
      );

      totalMovement += noseMovement + hipMovement;
      
      // Calculate jump height (vertical movement of nose)
      if (noseMovement > jumpHeight) {
        jumpHeight = noseMovement;
      }

      // Calculate squat depth (vertical movement of hips)
      const hipVerticalMovement = Math.abs(currentPose['left_hip']?.y - previousPose['left_hip']?.y);
      if (hipVerticalMovement > squatDepth) {
        squatDepth = hipVerticalMovement;
      }

      // Calculate velocity
      const timeDiff = poses[i].timestamp - poses[i - 1].timestamp;
      if (timeDiff > 0) {
        velocities.push(totalMovement / timeDiff);
      }
    }

    const avgVelocity = velocities.length > 0 ? velocities.reduce((a, b) => a + b) / velocities.length : 0;
    
    return {
      totalMovement,
      jumpHeight,
      squatDepth,
      velocity: avgVelocity,
      acceleration: this.calculateAcceleration(velocities),
    };
  }

  calculateDistance(point1, point2) {
    if (!point1 || !point2) return 0;
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) + Math.pow(point1.y - point2.y, 2)
    );
  }

  calculateAcceleration(velocities) {
    if (velocities.length < 2) return 0;
    
    let totalAcceleration = 0;
    for (let i = 1; i < velocities.length; i++) {
      totalAcceleration += velocities[i] - velocities[i - 1];
    }
    return totalAcceleration / (velocities.length - 1);
  }

  classifyMovement(movementData) {
    const { jumpHeight, squatDepth, velocity } = movementData;
    
    if (jumpHeight > 20 && velocity > 0.5) {
      return 'jumping';
    } else if (squatDepth > 15 && velocity < 0.3) {
      return 'squatting';
    } else if (velocity > 0.2) {
      return 'running';
    } else if (velocity > 0.1) {
      return 'walking';
    }
    
    return 'stationary';
  }

  assessFormQuality(pose) {
    const keypoints = this.processKeypoints(pose.keypoints);
    let formScore = 100;
    const feedback = [];

    // Check for proper posture
    if (keypoints['left_shoulder'] && keypoints['right_shoulder']) {
      const shoulderLevel = Math.abs(keypoints['left_shoulder'].y - keypoints['right_shoulder'].y);
      if (shoulderLevel > 10) {
        formScore -= 10;
        feedback.push('Keep shoulders level');
      }
    }

    // Check for straight back
    if (keypoints['nose'] && keypoints['left_hip']) {
      const backStraightness = this.calculateBackStraightness(keypoints);
      if (backStraightness < 0.8) {
        formScore -= 15;
        feedback.push('Keep your back straight');
      }
    }

    // Check for proper knee alignment
    if (keypoints['left_knee'] && keypoints['right_knee']) {
      const kneeAlignment = this.checkKneeAlignment(keypoints);
      if (!kneeAlignment.isAligned) {
        formScore -= 10;
        feedback.push(kneeAlignment.feedback);
      }
    }

    return {
      score: Math.max(0, formScore),
      feedback: feedback,
      isGoodForm: formScore >= 80,
    };
  }

  calculateBackStraightness(keypoints) {
    // Calculate the angle of the back relative to vertical
    if (!keypoints['nose'] || !keypoints['left_hip']) return 1;
    
    const backVector = {
      x: keypoints['nose'].x - keypoints['left_hip'].x,
      y: keypoints['nose'].y - keypoints['left_hip'].y,
    };
    
    const verticalVector = { x: 0, y: -1 };
    
    const dotProduct = backVector.x * verticalVector.x + backVector.y * verticalVector.y;
    const backMagnitude = Math.sqrt(backVector.x * backVector.x + backVector.y * backVector.y);
    
    if (backMagnitude === 0) return 1;
    
    const angle = Math.abs(dotProduct / backMagnitude);
    return Math.max(0, 1 - Math.abs(1 - angle));
  }

  checkKneeAlignment(keypoints) {
    // Check if knees are aligned with toes
    const leftKnee = keypoints['left_knee'];
    const rightKnee = keypoints['right_knee'];
    const leftAnkle = keypoints['left_ankle'];
    const rightAnkle = keypoints['right_ankle'];

    if (!leftKnee || !rightKnee || !leftAnkle || !rightAnkle) {
      return { isAligned: true, feedback: '' };
    }

    const leftKneeAngle = this.calculateKneeAngle(leftKnee, leftAnkle);
    const rightKneeAngle = this.calculateKneeAngle(rightKnee, rightAnkle);

    const isAligned = leftKneeAngle < 15 && rightKneeAngle < 15;
    
    return {
      isAligned,
      feedback: isAligned ? '' : 'Keep knees aligned with toes',
    };
  }

  calculateKneeAngle(knee, ankle) {
    // Calculate the horizontal deviation of knee from ankle
    return Math.abs(knee.x - ankle.x);
  }

  getMovementHistory() {
    return this.poseHistory;
  }

  getLastDetectedPose() {
    return this.lastPoses.length > 0 ? this.lastPoses[0] : null;
  }

  reset() {
    this.poseHistory = [];
    this.lastPoses = [];
  }

  dispose() {
    if (this.detector) {
      this.detector.dispose();
      this.detector = null;
    }
    this.isModelLoaded = false;
    this.reset();
  }
}

// Create singleton instance
const poseDetectionService = new PoseDetectionService();

// Export functions for easy use
export const startPoseDetection = () => poseDetectionService.initialize();
export const detectPoses = (videoFrame) => poseDetectionService.detectPoses(videoFrame);
export const getMovementHistory = () => poseDetectionService.getMovementHistory();
export const getLastDetectedPose = () => poseDetectionService.getLastDetectedPose();
export const resetPoseDetection = () => poseDetectionService.reset();
export const disposePoseDetection = () => poseDetectionService.dispose();

export default poseDetectionService;