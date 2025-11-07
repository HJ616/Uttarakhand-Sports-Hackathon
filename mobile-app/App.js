import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Import screens
import SplashScreen from './src/screens/SplashScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import TestSelectionScreen from './src/screens/TestSelectionScreen';
import VideoRecordingScreen from './src/screens/VideoRecordingScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import OfflineSyncScreen from './src/screens/OfflineSyncScreen';

// Import services
import { AuthProvider } from './src/contexts/AuthContext';
import { OfflineProvider } from './src/contexts/OfflineContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { initDatabase } from './src/services/database';
import { checkForUpdates } from './src/services/updateService';

const Stack = createStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await initDatabase();
      
      // Check if first launch
      const firstLaunch = await AsyncStorage.getItem('firstLaunch');
      if (firstLaunch === null) {
        setIsFirstLaunch(true);
        await AsyncStorage.setItem('firstLaunch', 'false');
      } else {
        setIsFirstLaunch(false);
      }

      // Check authentication status
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setIsAuthenticated(true);
      }

      // Check for app updates
      await checkForUpdates();

      // Set up network monitoring
      setupNetworkMonitoring();

    } catch (error) {
      console.error('App initialization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupNetworkMonitoring = () => {
    NetInfo.addEventListener(state => {
      if (state.isConnected) {
        // Sync offline data when connection is restored
        console.log('Network connection restored');
      }
    });
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <PaperProvider>
      <LanguageProvider>
        <AuthProvider>
          <OfflineProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                  cardStyle: { backgroundColor: '#fff' }
                }}
              >
                {isFirstLaunch ? (
                  <Stack.Screen name="Onboarding" component={OnboardingScreen} />
                ) : !isAuthenticated ? (
                  <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                ) : (
                  <>
                    <Stack.Screen name="Dashboard" component={DashboardScreen} />
                    <Stack.Screen name="TestSelection" component={TestSelectionScreen} />
                    <Stack.Screen name="VideoRecording" component={VideoRecordingScreen} />
                    <Stack.Screen name="Results" component={ResultsScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
                    <Stack.Screen name="OfflineSync" component={OfflineSyncScreen} />
                  </>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </OfflineProvider>
        </AuthProvider>
      </LanguageProvider>
    </PaperProvider>
  );
}