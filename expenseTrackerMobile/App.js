import React, { useState, useEffect } from 'react';
import 'react-native-gesture-handler';
import 'react-native-reanimated';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthNavigator from './src/navigation/AuthNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { ActivityIndicator, View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from './src/config/constants';
import { connectivityAPI } from './src/services/api';

const AppContent = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState('Checking...');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    checkBackend();
  }, [retryCount]);

  const checkBackend = async () => {
    try {
      setConnectionStatus('Connecting...');
      await connectivityAPI.check();
      setConnectionStatus('Connected');
      console.log('[App] Backend connectivity verified');
    } catch (error) {
      setConnectionStatus('Failed');
      console.error('[App] Backend connectivity check failed:', error.message);
    }
  };

  console.log('AppContent render - isAuthenticated:', isAuthenticated, 'loading:', loading, 'user:', user?.name, 'status:', connectionStatus);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Initializing...</Text>
        <Text style={[styles.statusText, styles[connectionStatus.toLowerCase()]]}>
          Backend: {connectionStatus}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
      </NavigationContainer>
      
      {/* Global Debug Overlay */}
      {/* <View style={styles.debugOverlay}>
        <Text style={styles.debugText}>
          API: {connectionStatus} {connectionStatus === 'Failed' && '⚠️'}
        </Text>
        {connectionStatus === 'Failed' && (
          <TouchableOpacity onPress={() => setRetryCount(prev => prev + 1)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        )}
      </View> */}
    </View>
  );
};

export default function App() {
  console.log('App component rendering');
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  statusText: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
  },
  connected: { color: COLORS.success },
  failed: { color: COLORS.danger },
  connecting: { color: COLORS.warning },
  debugOverlay: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 9999,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
    marginRight: 8,
  },
  retryText: {
    color: COLORS.primary,
    fontSize: 12,
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  }
});
