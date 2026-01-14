import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, STORAGE_KEYS } from '../config/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Callback to be set by AuthContext to trigger UI logout
let authCleanup = null;

export const setAuthCleanup = (callback) => {
  authCleanup = callback;
};

// Helper function to validate JWT format
const isValidJWT = (token) => {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

// Request interceptor to add JWT token
api.interceptors.request.use(
  async (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // Only add token if it's a valid JWT format
      if (token && isValidJWT(token)) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Adding valid token to request:', config.url);
      } else if (token) {
        // Token exists but is invalid - clear it
        console.warn('Invalid token format found, clearing...');
        await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
        if (authCleanup) authCleanup();
      } else {
        console.log('No token for request:', config.url);
      }
    } catch (error) {
      console.error('Error in request interceptor:', error);
    }
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.config.url, response.status);
    return response;
  },
  async (error) => {
    console.error(`[API Error] ${error.config?.method?.toUpperCase()} ${error.config?.baseURL}${error.config?.url}`);
    console.error(`Message: ${error.message}`);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    } else if (error.request) {
      console.error(`Request sent but no response received. Configuration:`, {
        timeout: error.config?.timeout,
        headers: error.config?.headers,
        url: error.config?.url
      });
    }
    
    if (error.response?.status === 401 || error.response?.status === 500) {
      // Check if the error is JWT related
      const errorMessage = error.response?.data?.message || '';
      if (error.response?.status === 401 || 
          errorMessage.includes('JWT') || 
          errorMessage.includes('token') ||
          errorMessage.includes('MalformedJwt')) {
        console.log('JWT error detected - clearing auth');
        try {
          await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
          if (authCleanup) {
            authCleanup();
          }
        } catch (clearError) {
          console.error('Error clearing auth:', clearError);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('Login API call with:', { name: credentials.name });
    return api.post('/public/login', credentials);
  },
  register: (formData) => {
    console.log('Register API call');
    return api.post('/public/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getUserById: (id) => api.get(`/public/user/${id}`),
};

// User API
export const userAPI = {
  updateUser: (formData) => api.put('/user/update', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  changePassword: (data) => api.post('/user/change-password', null, {
    params: {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword
    },
  }),
};

// Friend API
export const friendAPI = {
  sendFriendRequest: (accepterName) => api.post(`/friend/add/${accepterName}`),
  getAllFriends: () => api.get('/friend/all'),
  getFriendRequests: () => api.get('/friend/requests'),
  acceptRequest: (senderId) => api.post(`/friend/accept/${senderId}`),
  rejectRequest: (senderId) => api.post(`/friend/reject/${senderId}`),
  removeFriend: (removerId) => api.post(`/friend/remove/${removerId}`),
  searchUsers: (keyword) => api.get('/friend/search', { params: { keyword } }),
};

// Expense API
export const expenseAPI = {
  createExpense: (expenseData) => api.post('/Expense/new', expenseData),
  getMyExpenses: () => api.get('/Expense/myexpense'),
  markExpensePaid: (receiverId, expenseId) => api.post(`/Expense/accept/${receiverId}/${expenseId}`),
};

// Expense Participant API
export const participantAPI = {
  getExpenseRequests: () => api.get('/participant/getreq'),
  getParticipantsByExpenseId: (expenseId) => api.get(`/participant/byEid/${expenseId}`),
};

// Chat API
export const chatAPI = {
  getConversationId: (friendId) => api.get(`/chat/conversation/${friendId}`),
  sendMessage: (messageData) => api.post('/chat/send', messageData),
  getChatHistory: (conversationId) => api.get(`/chat/history/${conversationId}`),
  getConversations: () => api.get('/chat/getConversations'),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notification/all'),
  getUnread: () => api.get('/notification/unread'),
  markRead: () => api.get('/notification/read'),
  getUnreadCount: () => api.get('/notification/count'),
};

// Connectivity Check API
export const connectivityAPI = {
  check: () => {
    console.log('[Connectivity] Pinging backend at:', API_BASE_URL);
    return api.get('/public/health', { timeout: 5000 }); // Fast timeout for check
  }
};

export default api;
