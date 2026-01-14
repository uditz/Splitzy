import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, setAuthCleanup } from '../services/api';
import { STORAGE_KEYS } from '../config/constants';

const AuthContext = createContext({});

// Helper function to validate JWT format (should have 3 parts separated by dots)
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Logout function - defined with useCallback so it's stable
  const logout = useCallback(async () => {
    try {
      console.log('Logging out...');
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      setToken(null);
      setUser(null);
      console.log('Logout complete');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // Load user and token from storage on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        console.log('Loading stored auth...');
        const storedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
        const storedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);
        
        console.log('Stored token:', storedToken ? `${storedToken.substring(0, 20)}...` : 'null');
        console.log('Stored user:', storedUser);
        
        // Validate the token format
        if (storedToken && isValidJWT(storedToken) && storedUser) {
          console.log('Token is valid JWT format');
          setToken(storedToken);
          try {
            setUser(JSON.parse(storedUser));
          } catch (parseError) {
            console.error('Error parsing stored user, clearing auth:', parseError);
            await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
          }
        } else {
          console.log('Invalid or missing token/user, clearing storage...');
          // Clear invalid data
          await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
        }
      } catch (error) {
        console.error('Error loading auth from storage:', error);
        // Clear on any error
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      } finally {
        setLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Register logout callback for 401 interceptor - after logout is defined
  useEffect(() => {
    setAuthCleanup(logout);
  }, [logout]);

  const login = async (username, password) => {
    try {
      console.log('Attempting login for:', username);
      const response = await authAPI.login({ name: username, password });
      console.log('Login response received:', response.data);
      
      // Backend returns: { token, userId, username, imageUrl }
      // Note: field is 'token' not 'jwt'
      const { token, userId, username: name, imageUrl } = response.data;
      
      // Validate the received JWT
      if (!token || !isValidJWT(token)) {
        console.error('Invalid token received from server:', token);
        return { success: false, error: 'Invalid token received from server' };
      }
      
      console.log('Received valid token:', token.substring(0, 20) + '...');
      
      const userData = { id: userId, name, imageUrl };
      
      // Store token and user data
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
      
      console.log('Token and user stored, updating state...');
      setToken(token);
      setUser(userData);
      
      console.log('Login successful - state updated');
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || error.response?.data || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData, imageUri) => {
    try {
      console.log('Attempting registration for:', userData.name);
      const formData = new FormData();
      
      // Add user data as JSON string
      formData.append('user', JSON.stringify({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        bio: userData.bio || '',
      }));
      
      // Add image if provided
      if (imageUri) {
        const filename = imageUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('image', {
          uri: imageUri,
          name: filename,
          type,
        });
      }
      
      await authAPI.register(formData);
      console.log('Registration successful');
      
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed. Please try again.' 
      };
    }
  };

  const updateUserData = async (newUserData) => {
    try {
      const updatedUser = { ...user, ...newUserData };
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    updateUserData,
    isAuthenticated: !!token && isValidJWT(token),
  };

  console.log('AuthContext state - isAuthenticated:', value.isAuthenticated, 'loading:', loading, 'hasToken:', !!token);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
