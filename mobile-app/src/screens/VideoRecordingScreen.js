import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  Platform,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Camera } from 'expo-camera';
import { Video } from 'expo-av';
import * as MediaLibrary from 'expo-media-library';
import { Button, IconButton, ProgressBar, Card } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import ML services
import { startPoseDetection } from '../services/ml/poseDetection';
import { analyzeVideoForTest } from '../services/ml/videoAnalysis';
import { detectCheatAttempts } from '../services/ml/cheatDetection';
import { saveOfflineVideo } from '../services/offlineService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function VideoRecordingScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const cameraRef = useRef(null);
  const [hasCameraPermission, setHasCameraPermission] = useState(null);
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [testInstructions, setTestInstructions] = useState('');
  const [currentTest, setCurrentTest] = useState(null);
  const [poseData, setPoseData] = useState([]);
  const [recordingProgress, setRecordingProgress] = useState(0);

  const { testType, testDuration, minReps } = route.params || {};

  useEffect(() => {
    requestPermissions();
    setupTestInstructions();
    initializePoseDetection();
  }, []);

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
        setRecordingProgress(prev => {
          const progress = (prev + 1) / testDuration;
          return progress > 1 ? 1 : progress;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording, testDuration]);

  const requestPermissions = async () => {
    try {
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const microphonePermission = await Camera.requestMicrophonePermissionsAsync();
      const mediaLibraryPermission = await MediaLibrary.requestPermissionsAsync();

      setHasCameraPermission(cameraPermission.status === 'granted');
      setHasMicrophonePermission(microphonePermission.status === 'granted');

      if (
        cameraPermission.status !== 'granted' ||
        microphonePermission.status !== 'granted'
      ) {
        Alert.alert(
          'Permissions Required',
          'Camera and microphone permissions are required to record your performance.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (error) {
      console.error('Permission error:', error);
      Alert.alert('Error', 'Failed to get required permissions');
    }
  };

  const setupTestInstructions = () => {
    const instructions = {
      'vertical-jump': 'Stand straight, then jump as high as you can with your arms reaching up.',
      'sit-ups': 'Lie on your back, knees bent, and perform sit-ups with proper form.',
      'shuttle-run': 'Run between two markers 20 meters apart as fast as possible.',
      'endurance-run': 'Run continuously for the specified duration at a steady pace.',
      'height-weight': 'Stand straight against a wall for height measurement.',
    };

    setTestInstructions(instructions[testType] || 'Follow the on-screen instructions.');
    setCurrentTest(testType);
  };

  const initializePoseDetection = async () => {
    try {
      await startPoseDetection();
    } catch (error) {
      console.error('Pose detection initialization error:', error);
    }
  };

  const startRecording = async () => {
    try {
      if (cameraRef.current) {
        setIsRecording(true);
        setRecordingTime(0);
        setRecordingProgress(0);
        setPoseData([]);

        const video = await cameraRef.current.recordAsync({
          maxDuration: testDuration || 60,
          quality: Camera.Constants.VideoQuality['720p'],
          mute: false,
        });

        setRecordedVideo(video.uri);
        setIsRecording(false);

        // Analyze the recorded video
        await analyzeRecordedVideo(video.uri);
      }
    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      Alert.alert('Recording Error', 'Failed to record video. Please try again.');
    }
  };

  const stopRecording = async () => {
    try {
      if (cameraRef.current && isRecording) {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Stop recording error:', error);
    }
  };

  const analyzeRecordedVideo = async (videoUri) => {
    setIsAnalyzing(true);
    
    try {
      // Step 1: Basic video analysis
      const analysisResults = await analyzeVideoForTest(videoUri, testType);
      
      // Step 2: Cheat detection
      const cheatDetectionResults = await detectCheatAttempts(videoUri, testType);
      
      // Step 3: Pose analysis for movement quality
      const poseAnalysisResults = await analyzePoseData(poseData, testType);
      
      // Combine all analysis results
      const finalResults = {
        testType,
        videoUri,
        analysis: analysisResults,
        cheatDetection: cheatDetectionResults,
        poseAnalysis: poseAnalysisResults,
        timestamp: new Date().toISOString(),
        duration: recordingTime,
      };

      // Check if results are valid and not cheated
      if (cheatDetectionResults.isSuspicious) {
        Alert.alert(
          'Video Analysis Failed',
          'The video appears to have issues. Please record again following the instructions.',
          [{ text: 'OK', onPress: () => resetRecording() }]
        );
        return;
      }

      // Save results locally for offline sync
      await saveOfflineVideo(finalResults);

      // Navigate to results screen
      navigation.navigate('Results', {
        results: finalResults,
        testType,
      });

    } catch (error) {
      console.error('Video analysis error:', error);
      Alert.alert('Analysis Error', 'Failed to analyze video. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzePoseData = async (poseData, testType) => {
    // Implement pose analysis based on test type
    // This would use TensorFlow.js for real-time pose detection
    return {
      movementQuality: 85,
      formScore: 90,
      recommendations: ['Keep your back straight', 'Land softly'],
    };
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setRecordingTime(0);
    setRecordingProgress(0);
    setPoseData([]);
  };

  const retakeVideo = () => {
    resetRecording();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (hasCameraPermission === null) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (hasCameraPermission === false) {
    return (
      <View style={styles.container}>
        <Text>No access to camera</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isAnalyzing ? (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.analyzingText}>Analyzing your performance...</Text>
          <ProgressBar progress={recordingProgress} style={styles.progressBar} />
        </View>
      ) : (
        <>
          {/* Camera View */}
          <View style={styles.cameraContainer}>
            <Camera
              style={styles.camera}
              type={Camera.Constants.Type.back}
              ref={cameraRef}
              onCameraReady={() => console.log('Camera ready')}
            >
              {/* Overlay UI */}
              <View style={styles.overlayContainer}>
                {/* Instructions Card */}
                <Card style={styles.instructionsCard}>
                  <Card.Content>
                    <Text style={styles.instructionsTitle}>{testType?.replace('-', ' ').toUpperCase()}</Text>
                    <Text style={styles.instructionsText}>{testInstructions}</Text>
                  </Card.Content>
                </Card>

                {/* Recording Timer */}
                {isRecording && (
                  <View style={styles.timerContainer}>
                    <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
                    <ProgressBar progress={recordingProgress} style={styles.recordingProgress} />
                  </View>
                )}

                {/* Pose Detection Overlay */}
                {isRecording && (
                  <View style={styles.poseOverlay}>
                    <Text style={styles.poseText}>Detecting movement...</Text>
                  </View>
                )}
              </View>
            </Camera>
          </View>

          {/* Controls */}
          <View style={styles.controlsContainer}>
            {!recordedVideo ? (
              <View style={styles.recordingControls}>
                {!isRecording ? (
                  <IconButton
                    icon="record"
                    size={80}
                    style={styles.recordButton}
                    onPress={startRecording}
                  />
                ) : (
                  <IconButton
                    icon="stop"
                    size={80}
                    style={styles.stopButton}
                    onPress={stopRecording}
                  />
                )}
                <Text style={styles.controlText}>
                  {isRecording ? 'Tap to stop recording' : 'Tap to start recording'}
                </Text>
              </View>
            ) : (
              <View style={styles.postRecordingControls}>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('Results', { results: { testType, videoUri: recordedVideo } })}
                  style={styles.primaryButton}
                >
                  Continue to Results
                </Button>
                <Button
                  mode="outlined"
                  onPress={retakeVideo}
                  style={styles.secondaryButton}
                >
                  Retake Video
                </Button>
              </View>
            )}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    padding: 20,
  },
  instructionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#666',
  },
  timerContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  recordingProgress: {
    marginTop: 10,
    height: 4,
  },
  poseOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  poseText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  controlsContainer: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
  },
  recordingControls: {
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: '#ff0000',
    borderRadius: 50,
    marginBottom: 20,
  },
  stopButton: {
    backgroundColor: '#333',
    borderRadius: 50,
    marginBottom: 20,
  },
  controlText: {
    fontSize: 16,
    color: '#666',
  },
  postRecordingControls: {
    width: '100%',
  },
  primaryButton: {
    marginBottom: 15,
    paddingVertical: 10,
  },
  secondaryButton: {
    borderColor: '#666',
  },
  analyzingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 40,
  },
  analyzingText: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 30,
    color: '#333',
  },
  progressBar: {
    width: '80%',
    height: 6,
  },
});