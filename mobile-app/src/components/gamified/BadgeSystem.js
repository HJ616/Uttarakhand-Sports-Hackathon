import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BADGES = {
  FIRST_TEST: {
    id: 'first_test',
    name: 'First Steps',
    description: 'Complete your first fitness test',
    icon: '🏃',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#8BC34A'],
    points: 10,
    category: 'beginner',
  },
  SPEED_DEMON: {
    id: 'speed_demon',
    name: 'Speed Demon',
    description: 'Complete 100m dash in under 15 seconds',
    icon: '⚡',
    color: '#FF9800',
    gradient: ['#FF9800', '#FFC107'],
    points: 25,
    category: 'speed',
  },
  STRENGTH_MASTER: {
    id: 'strength_master',
    name: 'Strength Master',
    description: 'Complete 50+ sit-ups in 1 minute',
    icon: '💪',
    color: '#F44336',
    gradient: ['#F44336', '#E91E63'],
    points: 30,
    category: 'strength',
  },
  FLEXIBILITY_PRO: {
    id: 'flexibility_pro',
    name: 'Flexibility Pro',
    description: 'Achieve excellent sit and reach score',
    icon: '🧘',
    color: '#9C27B0',
    gradient: ['#9C27B0', '#673AB7'],
    points: 20,
    category: 'flexibility',
  },
  ENDURANCE_CHAMPION: {
    id: 'endurance_champion',
    name: 'Endurance Champion',
    description: 'Complete 600m run without stopping',
    icon: '🏆',
    color: '#2196F3',
    gradient: ['#2196F3', '#03A9F4'],
    points: 35,
    category: 'endurance',
  },
  CONSISTENT_ATHLETE: {
    id: 'consistent_athlete',
    name: 'Consistent Athlete',
    description: 'Complete tests for 7 consecutive days',
    icon: '📅',
    color: '#607D8B',
    gradient: ['#607D8B', '#9E9E9E'],
    points: 50,
    category: 'consistency',
  },
  PERFECT_FORM: {
    id: 'perfect_form',
    name: 'Perfect Form',
    description: 'Maintain perfect form throughout all tests',
    icon: '⭐',
    color: '#FFD700',
    gradient: ['#FFD700', '#FFA000'],
    points: 40,
    category: 'technique',
  },
  CHEAT_DETECTOR: {
    id: 'cheat_detector',
    name: 'Honest Athlete',
    description: 'Complete all tests without any cheating detected',
    icon: '🔍',
    color: '#795548',
    gradient: ['#795548', '#A1887F'],
    points: 45,
    category: 'integrity',
  },
  IMPROVEMENT_STAR: {
    id: 'improvement_star',
    name: 'Improvement Star',
    description: 'Improve your score by 20% or more',
    icon: '📈',
    color: '#00BCD4',
    gradient: ['#00BCD4', '#009688'],
    points: 35,
    category: 'improvement',
  },
  ALL_ROUNDER: {
    id: 'all_rounder',
    name: 'All Rounder',
    description: 'Achieve good scores in all test categories',
    icon: '🎯',
    color: '#E91E63',
    gradient: ['#E91E63', '#C2185B'],
    points: 60,
    category: 'comprehensive',
  },
  RURAL_CHAMPION: {
    id: 'rural_champion',
    name: 'Rural Champion',
    description: 'Complete tests in challenging network conditions',
    icon: '🏞️',
    color: '#4CAF50',
    gradient: ['#4CAF50', '#66BB6A'],
    points: 30,
    category: 'accessibility',
  },
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete tests after 8 PM',
    icon: '🌙',
    color: '#3F51B5',
    gradient: ['#3F51B5', '#5C6BC0'],
    points: 15,
    category: 'timing',
  },
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete tests before 7 AM',
    icon: '🌅',
    color: '#FF5722',
    gradient: ['#FF5722', '#FF7043'],
    points: 15,
    category: 'timing',
  },
  SOCIAL_SHARER: {
    id: 'social_sharer',
    name: 'Social Sharer',
    description: 'Share your achievements with friends',
    icon: '📱',
    color: '#1976D2',
    gradient: ['#1976D2', '#42A5F5'],
    points: 20,
    category: 'social',
  },
  CHALLENGE_ACCEPTED: {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    description: 'Accept and complete a friend challenge',
    icon: '🤝',
    color: '#388E3C',
    gradient: ['#388E3C', '#66BB6A'],
    points: 25,
    category: 'social',
  },
};

const BadgeSystem = ({ userId, onBadgeEarned }) => {
  const [userBadges, setUserBadges] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadge, setNewBadge] = useState(null);
  const [badgeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    loadUserBadges();
    checkForNewBadges();
  }, []);

  const loadUserBadges = async () => {
    try {
      const storedBadges = await AsyncStorage.getItem(`badges_${userId}`);
      const storedPoints = await AsyncStorage.getItem(`points_${userId}`);
      
      if (storedBadges) {
        setUserBadges(JSON.parse(storedBadges));
      }
      
      if (storedPoints) {
        setTotalPoints(parseInt(storedPoints));
      }
    } catch (error) {
      console.error('Error loading badges:', error);
    }
  };

  const saveUserBadges = async (badges, points) => {
    try {
      await AsyncStorage.setItem(`badges_${userId}`, JSON.stringify(badges));
      await AsyncStorage.setItem(`points_${userId}`, points.toString());
    } catch (error) {
      console.error('Error saving badges:', error);
    }
  };

  const checkForNewBadges = async (testResults = null) => {
    const newBadges = [];
    
    // Check each badge condition
    for (const [key, badge] of Object.entries(BADGES)) {
      if (!userBadges.includes(badge.id)) {
        const earned = await checkBadgeCondition(badge, testResults);
        if (earned) {
          newBadges.push(badge);
        }
      }
    }
    
    // Award new badges
    if (newBadges.length > 0) {
      const updatedBadges = [...userBadges, ...newBadges.map(b => b.id)];
      const newPoints = newBadges.reduce((sum, badge) => sum + badge.points, 0);
      const updatedPoints = totalPoints + newPoints;
      
      setUserBadges(updatedBadges);
      setTotalPoints(updatedPoints);
      saveUserBadges(updatedBadges, updatedPoints);
      
      // Show badge notification for the first new badge
      if (newBadges.length > 0) {
        showNewBadgeNotification(newBadges[0]);
      }
      
      // Call callback if provided
      if (onBadgeEarned) {
        onBadgeEarned(newBadges, newPoints);
      }
    }
  };

  const checkBadgeCondition = async (badge, testResults) => {
    try {
      switch (badge.id) {
        case 'first_test':
          return await hasCompletedFirstTest();
        case 'speed_demon':
          return testResults && testResults['100m'] && testResults['100m'].time <= 15;
        case 'strength_master':
          return testResults && testResults['situps'] && testResults['situps'].count >= 50;
        case 'flexibility_pro':
          return testResults && testResults['sit_reach'] && testResults['sit_reach'].score >= 25;
        case 'endurance_champion':
          return testResults && testResults['600m'] && testResults['600m'].completed;
        case 'consistent_athlete':
          return await hasConsistentActivity();
        case 'perfect_form':
          return testResults && hasPerfectForm(testResults);
        case 'cheat_detector':
          return testResults && !hasCheatingDetected(testResults);
        case 'improvement_star':
          return await hasSignificantImprovement();
        case 'all_rounder':
          return testResults && isAllRounder(testResults);
        case 'rural_champion':
          return await isRuralChampion();
        case 'night_owl':
          return isNightOwl();
        case 'early_bird':
          return isEarlyBird();
        case 'social_sharer':
          return await hasSharedAchievement();
        case 'challenge_accepted':
          return await hasCompletedChallenge();
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error checking badge ${badge.id}:`, error);
      return false;
    }
  };

  const hasCompletedFirstTest = async () => {
    const testHistory = await AsyncStorage.getItem(`test_history_${userId}`);
    return testHistory && JSON.parse(testHistory).length > 0;
  };

  const hasConsistentActivity = async () => {
    const testHistory = await AsyncStorage.getItem(`test_history_${userId}`);
    if (!testHistory) return false;
    
    const history = JSON.parse(testHistory);
    const last7Days = getLast7Days();
    
    return last7Days.every(date => 
      history.some(test => 
        new Date(test.date).toDateString() === date.toDateString()
      )
    );
  };

  const hasPerfectForm = (testResults) => {
    return Object.values(testResults).every(result => result.formScore >= 90);
  };

  const hasCheatingDetected = (testResults) => {
    return Object.values(testResults).some(result => result.cheatingDetected);
  };

  const hasSignificantImprovement = async () => {
    const testHistory = await AsyncStorage.getItem(`test_history_${userId}`);
    if (!testHistory) return false;
    
    const history = JSON.parse(testHistory);
    if (history.length < 2) return false;
    
    const recent = history[history.length - 1];
    const previous = history[history.length - 2];
    
    return calculateImprovementPercentage(previous, recent) >= 20;
  };

  const isAllRounder = (testResults) => {
    const categories = ['speed', 'strength', 'flexibility', 'endurance'];
    return categories.every(category => {
      const testScore = getCategoryScore(testResults, category);
      return testScore >= 70;
    });
  };

  const isRuralChampion = async () => {
    const networkQuality = await AsyncStorage.getItem(`network_quality_${userId}`);
    return networkQuality === 'poor' || networkQuality === 'very-poor';
  };

  const isNightOwl = () => {
    const hour = new Date().getHours();
    return hour >= 20;
  };

  const isEarlyBird = () => {
    const hour = new Date().getHours();
    return hour < 7;
  };

  const hasSharedAchievement = async () => {
    const shareHistory = await AsyncStorage.getItem(`share_history_${userId}`);
    return shareHistory && JSON.parse(shareHistory).length > 0;
  };

  const hasCompletedChallenge = async () => {
    const challengeHistory = await AsyncStorage.getItem(`challenge_history_${userId}`);
    return challengeHistory && JSON.parse(challengeHistory).length > 0;
  };

  const showNewBadgeNotification = (badge) => {
    setNewBadge(badge);
    setShowBadgeModal(true);
    
    // Animate badge appearance
    Animated.sequence([
      Animated.timing(badgeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(badgeAnimation, {
        toValue: 1.2,
        friction: 2,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(badgeAnimation, {
        toValue: 1,
        friction: 2,
        tension: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.unshift(date);
    }
    return days;
  };

  const calculateImprovementPercentage = (previous, current) => {
    // Calculate overall improvement across all tests
    const previousTotal = Object.values(previous.scores).reduce((sum, score) => sum + score, 0);
    const currentTotal = Object.values(current.scores).reduce((sum, score) => sum + score, 0);
    
    return ((currentTotal - previousTotal) / previousTotal) * 100;
  };

  const getCategoryScore = (testResults, category) => {
    // Map category to specific tests
    const categoryTests = {
      speed: ['100m'],
      strength: ['situps'],
      flexibility: ['sit_reach'],
      endurance: ['600m'],
    };
    
    const tests = categoryTests[category];
    if (!tests) return 0;
    
    const scores = tests.map(test => testResults[test]?.score || 0);
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const renderBadge = (badge, earned = false) => (
    <View key={badge.id} style={[styles.badgeContainer, !earned && styles.lockedBadge]}>
      <LinearGradient
        colors={earned ? badge.gradient : ['#E0E0E0', '#BDBDBD']}
        style={styles.badgeIconContainer}
      >
        <Text style={[styles.badgeIcon, !earned && styles.lockedIcon]}>
          {earned ? badge.icon : '🔒'}
        </Text>
      </LinearGradient>
      <Text style={[styles.badgeName, !earned && styles.lockedText]}>
        {badge.name}
      </Text>
      <Text style={[styles.badgePoints, !earned && styles.lockedText]}>
        {badge.points} pts
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Achievements</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>{totalPoints}</Text>
          <Text style={styles.pointsLabel}>Total Points</Text>
        </View>
      </View>

      <ScrollView style={styles.badgesContainer}>
        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Beginner</Text>
          <View style={styles.badgesRow}>
            {renderBadge(BADGES.FIRST_TEST, userBadges.includes(BADGES.FIRST_TEST.id))}
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Performance</Text>
          <View style={styles.badgesRow}>
            {renderBadge(BADGES.SPEED_DEMON, userBadges.includes(BADGES.SPEED_DEMON.id))}
            {renderBadge(BADGES.STRENGTH_MASTER, userBadges.includes(BADGES.STRENGTH_MASTER.id))}
            {renderBadge(BADGES.FLEXIBILITY_PRO, userBadges.includes(BADGES.FLEXIBILITY_PRO.id))}
            {renderBadge(BADGES.ENDURANCE_CHAMPION, userBadges.includes(BADGES.ENDURANCE_CHAMPION.id))}
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Consistency & Technique</Text>
          <View style={styles.badgesRow}>
            {renderBadge(BADGES.CONSISTENT_ATHLETE, userBadges.includes(BADGES.CONSISTENT_ATHLETE.id))}
            {renderBadge(BADGES.PERFECT_FORM, userBadges.includes(BADGES.PERFECT_FORM.id))}
            {renderBadge(BADGES.CHEAT_DETECTOR, userBadges.includes(BADGES.CHEAT_DETECTOR.id))}
            {renderBadge(BADGES.IMPROVEMENT_STAR, userBadges.includes(BADGES.IMPROVEMENT_STAR.id))}
          </View>
        </View>

        <View style={styles.categorySection}>
          <Text style={styles.categoryTitle}>Special</Text>
          <View style={styles.badgesRow}>
            {renderBadge(BADGES.ALL_ROUNDER, userBadges.includes(BADGES.ALL_ROUNDER.id))}
            {renderBadge(BADGES.RURAL_CHAMPION, userBadges.includes(BADGES.RURAL_CHAMPION.id))}
            {renderBadge(BADGES.NIGHT_OWL, userBadges.includes(BADGES.NIGHT_OWL.id))}
            {renderBadge(BADGES.EARLY_BIRD, userBadges.includes(BADGES.EARLY_BIRD.id))}
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={showBadgeModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowBadgeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Animated.View style={[styles.animatedBadge, {
              transform: [{ scale: badgeAnimation }]
            }]}>
              <LinearGradient
                colors={newBadge?.gradient || ['#FFD700', '#FFA000']}
                style={styles.modalBadgeIconContainer}
              >
                <Text style={styles.modalBadgeIcon}>{newBadge?.icon}</Text>
              </LinearGradient>
            </Animated.View>
            
            <Text style={styles.modalTitle}>Achievement Unlocked!</Text>
            <Text style={styles.modalBadgeName}>{newBadge?.name}</Text>
            <Text style={styles.modalBadgeDescription}>{newBadge?.description}</Text>
            <Text style={styles.modalPoints}>+{newBadge?.points} points</Text>
            
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowBadgeModal(false)}
            >
              <Text style={styles.modalButtonText}>Awesome!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsContainer: {
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  badgesContainer: {
    flex: 1,
    padding: 15,
  },
  categorySection: {
    marginBottom: 25,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    marginLeft: 5,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    alignItems: 'center',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: 100,
  },
  lockedBadge: {
    opacity: 0.6,
  },
  badgeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeIcon: {
    fontSize: 30,
  },
  lockedIcon: {
    fontSize: 25,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  lockedText: {
    color: '#999',
  },
  badgePoints: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '80%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  animatedBadge: {
    marginBottom: 20,
  },
  modalBadgeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBadgeIcon: {
    fontSize: 40,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBadgeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalBadgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  modalPoints: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default BadgeSystem;