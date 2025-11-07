import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Leaderboard = ({ userId, onLeaderboardUpdate }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [timeFilter, setTimeFilter] = useState('weekly');
  const [showFilters, setShowFilters] = useState(false);

  const CATEGORIES = [
    { id: 'overall', name: 'Overall', icon: '🏆' },
    { id: 'speed', name: 'Speed', icon: '⚡' },
    { id: 'strength', name: 'Strength', icon: '💪' },
    { id: 'flexibility', name: 'Flexibility', icon: '🧘' },
    { id: 'endurance', name: 'Endurance', icon: '🏃' },
  ];

  const TIME_FILTERS = [
    { id: 'daily', name: 'Today' },
    { id: 'weekly', name: 'This Week' },
    { id: 'monthly', name: 'This Month' },
    { id: 'alltime', name: 'All Time' },
  ];

  useEffect(() => {
    loadLeaderboardData();
    updateUserRank();
  }, [selectedCategory, timeFilter]);

  const loadLeaderboardData = async () => {
    try {
      // Mock data - in real app, this would come from API
      const mockData = generateMockLeaderboardData(selectedCategory, timeFilter);
      setLeaderboardData(mockData);
      
      if (onLeaderboardUpdate) {
        onLeaderboardUpdate(mockData);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const generateMockLeaderboardData = (category, timeFilter) => {
    const baseData = [
      { id: '1', name: 'Arjun Singh', avatar: '🏃', totalPoints: 2580, speed: 850, strength: 720, flexibility: 680, endurance: 330 },
      { id: '2', name: 'Priya Sharma', avatar: '⚡', totalPoints: 2420, speed: 920, strength: 650, flexibility: 750, endurance: 100 },
      { id: '3', name: 'Rahul Kumar', avatar: '💪', totalPoints: 2350, speed: 780, strength: 890, flexibility: 480, endurance: 200 },
      { id: '4', name: 'Anita Patel', avatar: '🧘', totalPoints: 2280, speed: 700, strength: 600, flexibility: 880, endurance: 100 },
      { id: '5', name: 'Vikram Joshi', avatar: '🏆', totalPoints: 2210, speed: 800, strength: 700, flexibility: 510, endurance: 200 },
      { id: '6', name: 'Sneha Reddy', avatar: '🌟', totalPoints: 2150, speed: 750, strength: 650, flexibility: 650, endurance: 100 },
      { id: '7', name: 'Amit Verma', avatar: '🎯', totalPoints: 2080, speed: 820, strength: 580, flexibility: 480, endurance: 200 },
      { id: '8', name: 'Pooja Gupta', avatar: '🎖️', totalPoints: 2020, speed: 680, strength: 620, flexibility: 620, endurance: 100 },
      { id: '9', name: 'Rajesh Yadav', avatar: '🔥', totalPoints: 1950, speed: 720, strength: 550, flexibility: 580, endurance: 100 },
      { id: '10', name: 'Neha Singh', avatar: '⭐', totalPoints: 1890, speed: 650, strength: 590, flexibility: 550, endurance: 100 },
    ];

    // Add current user if not in top 10
    const currentUser = {
      id: userId,
      name: 'You',
      avatar: '👤',
      totalPoints: 1750,
      speed: 600,
      strength: 500,
      flexibility: 450,
      endurance: 200,
    };

    const userInTop10 = baseData.find(user => user.id === userId);
    if (!userInTop10) {
      baseData.push(currentUser);
    }

    // Sort by selected category
    const sortedData = baseData.sort((a, b) => {
      if (category === 'overall') {
        return b.totalPoints - a.totalPoints;
      }
      return b[category] - a[category];
    });

    return sortedData.map((user, index) => ({
      ...user,
      rank: index + 1,
      score: category === 'overall' ? user.totalPoints : user[category],
    }));
  };

  const updateUserRank = () => {
    const userEntry = leaderboardData.find(user => user.id === userId);
    setUserRank(userEntry ? userEntry.rank : null);
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return `#${rank}`;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return styles.rank1;
      case 2: return styles.rank2;
      case 3: return styles.rank3;
      default: return styles.rankDefault;
    }
  };

  const renderLeaderboardItem = ({ item, index }) => (
    <View style={[
      styles.leaderboardItem,
      item.id === userId && styles.currentUserItem
    ]}>
      <View style={styles.rankContainer}>
        <Text style={[styles.rankText, getRankStyle(item.rank)]}>
          {getRankIcon(item.rank)}
        </Text>
      </View>
      
      <View style={styles.userInfo}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatar}>{item.avatar}</Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[
            styles.userName,
            item.id === userId && styles.currentUserName
          ]}>
            {item.name}
          </Text>
          <Text style={styles.userScore}>
            {item.score} points
          </Text>
        </View>
      </View>
      
      <View style={styles.scoreBreakdown}>
        {selectedCategory === 'overall' && (
          <View style={styles.breakdownContainer}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>⚡</Text>
              <Text style={styles.breakdownValue}>{item.speed}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>💪</Text>
              <Text style={styles.breakdownValue}>{item.strength}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🧘</Text>
              <Text style={styles.breakdownValue}>{item.flexibility}</Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownIcon}>🏃</Text>
              <Text style={styles.breakdownValue}>{item.endurance}</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );

  const renderUserRankBanner = () => {
    if (!userRank) return null;
    
    return (
      <LinearGradient
        colors={['#4CAF50', '#8BC34A']}
        style={styles.userRankBanner}
      >
        <View style={styles.userRankContent}>
          <Text style={styles.userRankText}>Your Rank</Text>
          <Text style={styles.userRankNumber}>{getRankIcon(userRank)}</Text>
          <Text style={styles.userRankScore}>
            {leaderboardData.find(u => u.id === userId)?.score} points
          </Text>
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboard</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.filterButtonText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {renderUserRankBanner()}

      <View style={styles.categoryTabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryTab,
                selectedCategory === category.id && styles.activeCategoryTab
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryTabText,
                selectedCategory === category.id && styles.activeCategoryTabText
              ]}>
                {category.icon} {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={leaderboardData}
        renderItem={renderLeaderboardItem}
        keyExtractor={(item) => item.id}
        style={styles.leaderboardList}
        showsVerticalScrollIndicator={false}
      />

      <Modal
        visible={showFilters}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Leaderboard Filters</Text>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Time Period</Text>
              {TIME_FILTERS.map(filter => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterOption,
                    timeFilter === filter.id && styles.activeFilterOption
                  ]}
                  onPress={() => {
                    setTimeFilter(filter.id);
                    setShowFilters(false);
                  }}
                >
                  <Text style={[
                    styles.filterOptionText,
                    timeFilter === filter.id && styles.activeFilterOptionText
                  ]}>
                    {filter.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalCloseButtonText}>Close</Text>
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
  filterButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  filterButtonText: {
    fontSize: 18,
  },
  userRankBanner: {
    padding: 15,
    margin: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userRankContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userRankText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userRankNumber: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  userRankScore: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  categoryTabs: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryTab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  activeCategoryTab: {
    backgroundColor: '#4CAF50',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  activeCategoryTabText: {
    color: '#FFFFFF',
  },
  leaderboardList: {
    flex: 1,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginHorizontal: 15,
    marginVertical: 5,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentUserItem: {
    backgroundColor: '#E8F5E8',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rank1: {
    color: '#FFD700',
    fontSize: 24,
  },
  rank2: {
    color: '#C0C0C0',
    fontSize: 22,
  },
  rank3: {
    color: '#CD7F32',
    fontSize: 20,
  },
  rankDefault: {
    color: '#666',
    fontSize: 16,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatar: {
    fontSize: 20,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  currentUserName: {
    color: '#4CAF50',
  },
  userScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreBreakdown: {
    width: 120,
  },
  breakdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownItem: {
    alignItems: 'center',
  },
  breakdownIcon: {
    fontSize: 12,
  },
  breakdownValue: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  filterOption: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    marginBottom: 8,
  },
  activeFilterOption: {
    backgroundColor: '#4CAF50',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  activeFilterOptionText: {
    color: '#FFFFFF',
  },
  modalCloseButton: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Leaderboard;