import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Check authentication and navigate
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // Check if user is already logged in
      const userToken = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');
      
      // Simulate loading time
      setTimeout(() => {
        if (userToken && userData) {
          navigation.replace('Dashboard');
        } else {
          navigation.replace('Login');
        }
      }, 3000);
    } catch (error) {
      console.error('Auth check error:', error);
      setTimeout(() => {
        navigation.replace('Login');
      }, 3000);
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../assets/sai-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SAI Assessment</Text>
        <Text style={styles.subtitle}>AI-Powered Sports Talent Assessment</Text>
      </Animated.View>
      
      <Animated.View 
        style={[
          styles.loaderContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.loadingText}>Loading...</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#93c5fd',
    textAlign: 'center',
  },
  loaderContainer: {
    position: 'absolute',
    bottom: 100,
  },
  loadingText: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default SplashScreen;