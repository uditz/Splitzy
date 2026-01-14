import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { participantAPI, expenseAPI } from '../../services/api';
import { COLORS } from '../../config/constants';

const ExpenseDetailsScreen = ({ route, navigation }) => {
  const { expense } = route.params;
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = async () => {
    try {
      const response = await participantAPI.getParticipantsByExpenseId(expense.id);
      setParticipants(response.data || []);
    } catch (error) {
      console.error('Error loading participants:', error);
      Alert.alert('Error', 'Failed to load expense details');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (receiverId, expenseId) => {
    try {
      await expenseAPI.markExpensePaid(receiverId, expenseId);
      Alert.alert('Success', 'Expense marked as paid');
      loadParticipants(); // Reload to show updated status
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      Alert.alert('Error', 'Failed to mark expense as paid');
    }
  };

  const renderParticipant = ({ item }) => (
    <View style={styles.participantCard}>
      <View style={styles.participantInfo}>
        <Text style={styles.participantName}>{item.receiverName}</Text>
        <Text style={styles.participantAmount}>₹{(item.amount || 0).toFixed(2)}</Text>
      </View>
      <View style={styles.participantActions}>
        <Text
          style={[
            styles.statusBadge,
            item.transactionType === 'DONE' && styles.statusBadgeDone,
          ]}
        >
          {item.transactionType}
        </Text>
        {item.transactionType === 'PENDING' && (
          <TouchableOpacity
            style={styles.markPaidButton}
            onPress={() => handleMarkPaid(item.receiverId, item.expenseId)}
          >
            <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
            <Text style={styles.markPaidText}>Mark Paid</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{expense.title}</Text>
        <Text style={styles.totalAmount}>₹{(expense.amount || 0).toFixed(2)}</Text>
        <Text style={styles.date}>
          {new Date(expense.date).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Participants</Text>
        <FlatList
          data={participants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
        />
      </View>
    </View>
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
  },
  header: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 8,
  },
  date: {
    fontSize: 14,
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
  listContainer: {
    gap: 12,
  },
  participantCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  participantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  participantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  participantAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  participantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.warning,
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  statusBadgeDone: {
    backgroundColor: COLORS.success,
  },
  markPaidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  markPaidText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ExpenseDetailsScreen;
