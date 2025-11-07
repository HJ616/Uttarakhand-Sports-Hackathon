import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Image,
  Dimensions
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

const TestSelectionScreen = ({ navigation, route }) => {
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || null);
  const [refreshing, setRefreshing] = useState(false);
  const [userData, setUserData] = useState(null);
  const [offlineMode, setOfflineMode] = useState(false);

  useEffect(() => {
    loadUserData();
    checkOfflineMode();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      if (userDataStr) {
        setUserData(JSON.parse(userDataStr));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const checkOfflineMode = async () => {
    try {
      const offline = await AsyncStorage.getItem('offlineMode');
      setOfflineMode(offline === 'true');
    } catch (error) {
      console.error('Error checking offline mode:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    await checkOfflineMode();
    setRefreshing(false);
  };

  const assessmentTests = [
    {
      id: '40m-sprint',
      name: '40 Meter Sprint',
      category: 'speed',
      icon: 'run-fast',
      description: 'Measure your acceleration and top speed over 40 meters',
      duration: '2-3 minutes',
      difficulty: 'Beginner',
      requirements: ['Open space of 50m', 'Flat surface'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'shuttle-run',
      name: 'Shuttle Run (4x10m)',
      category: 'speed',
      icon: 'run',
      description: 'Test your agility and change of direction speed',
      duration: '3-4 minutes',
      difficulty: 'Intermediate',
      requirements: ['20m space', 'Two markers'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'standing-long-jump',
      name: 'Standing Long Jump',
      category: 'power',
      icon: 'arrow-expand-horizontal',
      description: 'Measure your explosive leg power and coordination',
      duration: '2-3 minutes',
      difficulty: 'Beginner',
      requirements: ['2m space', 'Flat surface'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'medicine-ball-throw',
      name: 'Medicine Ball Throw',
      category: 'power',
      icon: 'bowling',
      description: 'Test your upper body explosive power',
      duration: '3-4 minutes',
      difficulty: 'Intermediate',
      requirements: ['5kg medicine ball', 'Open space'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'push-ups',
      name: 'Push-ups (1 minute)',
      category: 'strength',
      icon: 'arm-flex',
      description: 'Measure your upper body muscular endurance',
      duration: '1 minute',
      difficulty: 'Beginner',
      requirements: ['Flat surface'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'sit-ups',
      name: 'Sit-ups (1 minute)',
      category: 'strength',
      icon: 'human-handsup',
      description: 'Test your core strength and endurance',
      duration: '1 minute',
      difficulty: 'Beginner',
      requirements: ['Mat or soft surface'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'sit-reach',
      name: 'Sit and Reach',
      category: 'flexibility',
      icon: 'human',
      description: 'Measure your lower back and hamstring flexibility',
      duration: '2-3 minutes',
      difficulty: 'Beginner',
      requirements: ['Sit and reach box', 'Flat surface'],
      aiAnalysis: true,
      offlineSupport: true
    },
    {
      id: 'shoulder-flexibility',
      name: 'Shoulder Flexibility',
      category: 'flexibility',
      icon: 'human-handsup',
      description: 'Test your shoulder joint range of motion',
      duration: '2-3 minutes',
      difficulty: 'Beginner',
      requirements: ['Minimal space'],
      aiAnalysis: true,
      offlineSupport: true
    }
  ];

  const categories = [
    { id: 'speed', name: 'Speed Tests', icon: 'run-fast', color: '#ef4444' },
    { id: 'power', name: 'Power Tests', icon: 'arm-flex', color: '#f59e0b' },
    { id: 'strength', name: 'Strength Tests', icon: 'dumbbell', color: '#10b981' },
    { id: 'flexibility', name: 'Flexibility Tests', icon: 'human-handsup', color: '#8b5cf6' }
  ];

  const handleTestSelection = (test) => {
    if (offlineMode && !test.offlineSupport) {
      Alert.alert(
        'Offline Mode',
        'This test requires internet connection for AI analysis. Please go online to perform this test.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Start Assessment',
      `Are you ready to start ${test.name}?\n\nDuration: ${test.duration}\nDifficulty: ${test.difficulty}\n\nRequirements:\n${test.requirements.join('\n')}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          style: 'default',
          onPress: () => {
            navigation.navigate('VideoRecording', {
              testType: test.id,
              testName: test.name,
              category: test.category,
              offlineMode: offlineMode
            });
          }
        }
      ]
    );
  };

  const filteredTests = selectedCategory
    ? assessmentTests.filter(test => test.category === selectedCategory)
    : assessmentTests;

  const renderTestCard = (test) => (
    <TouchableOpacity
      key={test.id}
      style={styles.testCard}
      onPress={() => handleTestSelection(test)}
    >
      <View style={styles.testCardHeader}>
        <MaterialCommunityIcons
          name={test.icon}
          size={32}
          color={categories.find(cat => cat.id === test.category)?.color || '#666'}
        />
        <View style={styles.testCardBadges}>
          {test.aiAnalysis && (
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={12} color="#fff" />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          {offlineMode && test.offlineSupport && (
            <View style={styles.offlineBadge}>
              <Ionicons name="cloud-offline-outline" size={12} color="#fff" />
              <Text style={styles.offlineBadgeText}>Offline</Text>
            </View>
          )}
        </View>
      </View>
      
      <Text style={styles.testCardTitle}>{test.name}</Text>
      <Text style={styles.testCardDescription}>{test.description}</Text>
      
      <View style={styles.testCardFooter}>
        <View style={styles.testCardInfo}>
          <Ionicons name="time-outline" size={14} color="#64748b" />
          <Text style={styles.testCardInfoText}>{test.duration}</Text>
        </View>
        <View style={styles.testCardInfo}>
          <Ionicons name="speedometer-outline" size={14} color="#64748b" />
          <Text style={styles.testCardInfoText}>{test.difficulty}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <LinearGradient
        colors={['#1e3a8a', '#3b82f6']}
        style={styles.headerGradient}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Assessment</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Help')}>
            <Ionicons name="help-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[styles.categoryButton, !selectedCategory && styles.categoryButtonActive]}
          onPress={() => setSelectedCategory(null)}
        >
          <Text style={[styles.categoryButtonText, !selectedCategory && styles.categoryButtonTextActive]}>
            All Tests
          </Text>
        </TouchableOpacity>
        
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              selectedCategory === category.id && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(category.id)}
          >
            <MaterialCommunityIcons
              name={category.icon}
              size={16}
              color={selectedCategory === category.id ? '#fff' : category.color}
              style={styles.categoryIcon}
            />
            <Text style={[
              styles.categoryButtonText,
              selectedCategory === category.id && styles.categoryButtonTextActive
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Offline Mode Banner */}
      {offlineMode && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={20} color="#f59e0b" />
          <Text style={styles.offlineBannerText}>
            Offline mode active - Some tests may have limited features
          </Text>
        </View>
      )}

      {/* Test Cards */}
      <View style={styles.testsContainer}>
        <Text style={styles.sectionTitle}>
          {selectedCategory ? 
            `${categories.find(cat => cat.id === selectedCategory)?.name} (${filteredTests.length})` :
            `All Assessment Tests (${filteredTests.length})`
          }
        </Text>
        
        <View style={styles.testsGrid}>
          {filteredTests.map(renderTestCard)}
        </View>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Assessment Guidelines</Text>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.instructionText}>Ensure adequate space for movement</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.instructionText}>Wear appropriate sports attire</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.instructionText}>Follow the on-screen instructions carefully</Text>
        </View>
        <View style={styles.instructionItem}>
          <Ionicons name="checkmark-circle" size={16} color="#10b981" />
          <Text style={styles.instructionText}>Maintain proper form during exercises</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  categoryFilter: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
  },
  categoryButtonActive: {
    backgroundColor: '#1e3a8a',
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  offlineBannerText: {
    fontSize: 14,
    color: '#92400e',
    marginLeft: 8,
    flex: 1,
  },
  testsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  testsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  testCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  testCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  testCardBadges: {
    flexDirection: 'row',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 2,
    fontWeight: '600',
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  offlineBadgeText: {
    fontSize: 10,
    color: '#fff',
    marginLeft: 2,
    fontWeight: '600',
  },
  testCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  testCardDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
    marginBottom: 12,
  },
  testCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  testCardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testCardInfoText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  instructionsContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#475569',
    marginLeft: 8,
  },
});

export default TestSelectionScreen;