import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { expenseAPI, participantAPI, notificationAPI } from '../services/api';
import { COLORS } from '../config/constants';

const DashboardScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [stats, setStats] = useState({
    totalOwed: 0,
    totalToReceive: 0,
    myExpensesCount: 0,
    requestsCount: 0,
  });

  const loadDashboardData = useCallback(async () => {
    try {
      console.log('Loading dashboard data...');
      setError(null);
      setLoading(true);
      
      // Fetch my expenses
      console.log('Fetching my expenses...');
      const myExpensesResponse = await expenseAPI.getMyExpenses();
      const myExpenses = myExpensesResponse.data || [];
      console.log('My expenses count:', myExpenses.length);
      
      // Fetch expense requests (where I'm a participant)
      console.log('Fetching expense requests...');
      const requestsResponse = await participantAPI.getExpenseRequests();
      const requests = requestsResponse.data || [];
      console.log('Expense requests count:', requests.length);

      // Fetch unread notifications count
      console.log('Fetching unread notifications...');
      const unreadResponse = await notificationAPI.getUnreadCount();
      const count = unreadResponse.data || 0;
      setUnreadCount(count);
      console.log('Unread notifications count:', count);
      
      // Calculate totals
      const totalToReceive = myExpenses.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      const totalOwed = requests.reduce((sum, request) => sum + (request.amount || 0), 0);
      
      setStats({
        totalOwed,
        totalToReceive,
        myExpensesCount: myExpenses.length,
        requestsCount: requests.length,
      });
      
      console.log('Dashboard data loaded successfully');
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDashboardData();
    }, [loadDashboardData])
  );

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notification')}
          style={{ marginRight: 15 }}
        >
          <View>
            <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            {unreadCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  right: -6,
                  top: -3,
                  backgroundColor: COLORS.danger,
                  borderRadius: 10,
                  width: 20,
                  height: 20,
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderWidth: 1.5,
                  borderColor: COLORS.primary,
                }}
              >
                <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      ),
    });
  }, [navigation, unreadCount]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
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
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.userName}>{user?.name || 'User'}</Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={loadDashboardData}>
            <Text style={styles.retryText}>Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.owedCard]}>
          <Ionicons name="arrow-up-circle" size={32} color={COLORS.danger} />
          <Text style={styles.statAmount}>₹{(stats.totalOwed || 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>You Owe</Text>
        </View>

        <View style={[styles.statCard, styles.receiveCard]}>
          <Ionicons name="arrow-down-circle" size={32} color={COLORS.success} />
          <Text style={styles.statAmount}>₹{(stats.totalToReceive || 0).toFixed(2)}</Text>
          <Text style={styles.statLabel}>You'll Receive</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Expenses', { screen: 'CreateExpense' })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="add-circle" size={24} color={COLORS.primary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Create Expense</Text>
            <Text style={styles.actionDescription}>Split a new expense with friends</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Expenses', { screen: 'ExpenseHome' })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="wallet" size={24} color={COLORS.info} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>My Expenses</Text>
            <Text style={styles.actionDescription}>
              {stats.myExpensesCount} expense{stats.myExpensesCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Expenses', { screen: 'ExpenseRequests' })}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="receipt" size={24} color={COLORS.warning} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Expense Requests</Text>
            <Text style={styles.actionDescription}>
              {stats.requestsCount} pending request{stats.requestsCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionCard}
          onPress={() => navigation.navigate('Friends')}
        >
          <View style={styles.actionIconContainer}>
            <Ionicons name="people" size={24} color={COLORS.secondary} />
          </View>
          <View style={styles.actionContent}>
            <Text style={styles.actionTitle}>Manage Friends</Text>
            <Text style={styles.actionDescription}>Add or view your friends</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
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
  welcomeSection: {
    backgroundColor: COLORS.primary,
    padding: 20,
    paddingTop: 10,
    paddingBottom: 30,
  },
  welcomeText: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: COLORS.danger,
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.white,
    fontSize: 14,
  },
  retryText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    marginTop: -20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});

export default DashboardScreen;
