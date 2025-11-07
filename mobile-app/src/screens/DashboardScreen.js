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
import BadgeSystem from '../components/gamified/BadgeSystem';
import Leaderboard from '../components/gamified/Leaderboard';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [userData, setUserData] = useState(null);
  const [isGuest, setIsGuest] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentAssessments, setRecentAssessments] = useState([]);
  const [userStats, setUserStats] = useState({
    totalAssessments: 0,
    averageScore: 0,
    badgesEarned: 0,
    streak: 0
  });

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataStr = await AsyncStorage.getItem('userData');
      const isGuestStr = await AsyncStorage.getItem('isGuest');
      
      if (userDataStr) {
        const user = JSON.parse(userDataStr);
        setUserData(user);
        setIsGuest(isGuestStr === 'true');
        
        // Load user stats and recent assessments
        await loadUserStats(user.id);
        await loadRecentAssessments(user.id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadUserStats = async (userId) => {
    try {
      // In a real app, this would be an API call
      // For now, using mock data
      setUserStats({
        totalAssessments: 12,
        averageScore: 78.5,
        badgesEarned: 5,
        streak: 7
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const loadRecentAssessments = async (userId) => {
    try {
      // Mock recent assessments data
      const mockAssessments = [
        {
          id: '1',
          testType: '40m Sprint',
          date: '2024-01-15',
          score: 85,
          status: 'completed'
        },
        {
          id: '2',
          testType: 'Standing Long Jump',
          date: '2024-01-14',
          score: 72,
          status: 'completed'
        },
        {
          id: '3',
          testType: 'Sit-ups',
          date: '2024-01-13',
          score: 90,
          status: 'completed'
        }
      ];
      setRecentAssessments(mockAssessments);
    } catch (error) {
      console.error('Error loading recent assessments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  const handleStartAssessment = () => {
    navigation.navigate('TestSelection');
  };

  const handleViewProfile = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.clear();
              navigation.replace('Splash');
            } catch (error) {
              console.error('Error during logout:', error);
            }
          }
        }
      ]
    );
  };

  const handleOfflineMode = () => {
    navigation.navigate('OfflineMode');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const assessmentTypes = [
    {
      id: 'speed',
      name: 'Speed Tests',
      icon: 'run-fast',
      color: '#ef4444',
      tests: ['40m Sprint', 'Shuttle Run']
    },
    {
      id: 'power',
      name: 'Power Tests',
      icon: 'arm-flex',
      color: '#f59e0b',
      tests: ['Standing Long Jump', 'Medicine Ball Throw']
    },
    {
      id: 'strength',
      name: 'Strength Tests',
      icon: 'dumbbell',
      color: '#10b981',
      tests: ['Push-ups', 'Sit-ups']
    },
    {
      id: 'flexibility',
      name: 'Flexibility Tests',
      icon: 'human-handsup',
      color: '#8b5cf6',
      tests: ['Sit & Reach', 'Shoulder Flexibility']
    }
  ];

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e3a8a" />
      </View>
    );
  }

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
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>
              {userData.firstName || userData.name || 'Athlete'}
            </Text>
            {isGuest && <Text style={styles.guestBadge}>Guest Mode</Text>}
          </View>
          <TouchableOpacity onPress={handleViewProfile}>
            <Image
              source={require('../assets/athlete-avatar.png')}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="trophy-outline" size={24} color="#f59e0b" />
          <Text style={styles.statNumber}>{userStats.totalAssessments}</Text>
          <Text style={styles.statLabel}>Assessments</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="star-outline" size={24} color="#10b981" />
          <Text style={styles.statNumber}>{userStats.averageScore}%</Text>
          <Text style={styles.statLabel}>Avg Score</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame-outline" size={24} color="#ef4444" />
          <Text style={styles.statNumber}>{userStats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="medal-outline" size={24} color="#8b5cf6" />
          <Text style={styles.statNumber}>{userStats.badgesEarned}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={handleStartAssessment}
          >
            <Ionicons name="play-circle-outline" size={32} color="#fff" />
            <Text style={styles.actionButtonText}>Start Assessment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleOfflineMode}
          >
            <Ionicons name="cloud-offline-outline" size={32} color="#1e3a8a" />
            <Text style={styles.actionButtonTextSecondary}>Offline Mode</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Assessment Types */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Assessment Categories</Text>
        <View style={styles.assessmentGrid}>
          {assessmentTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={styles.assessmentCard}
              onPress={() => navigation.navigate('TestSelection', { category: type.id })}
            >
              <MaterialCommunityIcons
                name={type.icon}
                size={32}
                color={type.color}
              />
              <Text style={styles.assessmentCardTitle}>{type.name}</Text>
              <Text style={styles.assessmentCardSubtitle}>
                {type.tests.length} tests available
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent Assessments */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Assessments</Text>
        {recentAssessments.length > 0 ? (
          <View style={styles.recentList}>
            {recentAssessments.map((assessment) => (
              <View key={assessment.id} style={styles.recentItem}>
                <View style={styles.recentItemLeft}>
                  <Text style={styles.recentItemTitle}>{assessment.testType}</Text>
                  <Text style={styles.recentItemDate}>{assessment.date}</Text>
                </View>
                <View style={styles.recentItemRight}>
                  <Text style={[styles.recentItemScore, { color: assessment.score >= 80 ? '#10b981' : '#f59e0b' }]}>
                    {assessment.score}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color="#cbd5e1" />
            <Text style={styles.emptyStateText}>No assessments yet</Text>
            <Text style={styles.emptyStateSubtext}>Start your first assessment to see it here</Text>
          </View>
        )}
      </View>

      {/* Leaderboard */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Top Performers</Text>
        <Leaderboard compact={true} />
      </View>

      {/* Badges */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Recent Badges</Text>
        <BadgeSystem compact={true} />
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: '#e2e8f0',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  guestBadge: {
    fontSize: 12,
    color: '#fef08a',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 4,
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: -20,
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryAction: {
    backgroundColor: '#1e3a8a',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  actionButtonTextSecondary: {
    color: '#1e3a8a',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  assessmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  assessmentCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  assessmentCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 8,
    textAlign: 'center',
  },
  assessmentCardSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
    textAlign: 'center',
  },
  recentList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  recentItemLeft: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  recentItemDate: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  recentItemRight: {
    alignItems: 'flex-end',
  },
  recentItemScore: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#475569',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutButtonText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DashboardScreen;