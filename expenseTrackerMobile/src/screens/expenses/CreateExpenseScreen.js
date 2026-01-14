import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { expenseAPI, friendAPI } from '../../services/api';
import { COLORS } from '../../config/constants';

const CreateExpenseScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [transactionType, setTransactionType] = useState('OWED');
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const response = await friendAPI.getAllFriends();
      setFriends(response.data || []);
    } catch (error) {
      console.error('Error loading friends:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleFriendSelection = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(selectedFriends.filter((id) => id !== friendId));
    } else {
      setSelectedFriends([...selectedFriends, friendId]);
    }
  };

  const handleCreateExpense = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill in title and amount');
      return;
    }

    if (selectedFriends.length === 0) {
      Alert.alert('Error', 'Please select at least one friend');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);

      // Assume equal split including the creator
      // Example: Bill is 100, 1 friend selected (2 people total). Split is 50.
      // Friend owes 50. Creator paid 100.
      const splitAmount = amountNum / (selectedFriends.length + 1);
      
      const participantObjects = selectedFriends.map(friendId => {
        const friend = friends.find(f => f.id === friendId);
        return {
          name: friend.name, // Matching ExpenseParticipantDto.name which backend uses for lookup
          amount: splitAmount, // Matching ExpenseParticipantDto.amount
        };
      });

      const expenseData = {
        title: title,
        totalAmount: amountNum, // Matching ExpenseCreationDto.totalAmount
        selectedFriend: participantObjects, // Matching ExpenseCreationDto.selectedFriend
      };

      console.log('Creating expense with payload:', JSON.stringify(expenseData));

      await expenseAPI.createExpense(expenseData);
      
      Alert.alert('Success', 'Expense created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Error creating expense:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create expense';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Dinner at restaurant"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Transaction Type</Text>
          <View style={styles.typeButtons}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'OWED' && styles.typeButtonActive,
              ]}
              onPress={() => setTransactionType('OWED')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'OWED' && styles.typeButtonTextActive,
                ]}
              >
                Owed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.typeButton,
                transactionType === 'PAID' && styles.typeButtonActive,
              ]}
              onPress={() => setTransactionType('PAID')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  transactionType === 'PAID' && styles.typeButtonTextActive,
                ]}
              >
                Paid
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Select Friends *</Text>
          {loadingFriends ? (
            <ActivityIndicator color={COLORS.primary} />
          ) : friends.length === 0 ? (
            <Text style={styles.emptyText}>
              No friends found. Add friends first.
            </Text>
          ) : (
            <View style={styles.friendsList}>
              {friends.map((friend) => (
                <TouchableOpacity
                  key={friend.id}
                  style={[
                    styles.friendItem,
                    selectedFriends.includes(friend.id) && styles.friendItemSelected,
                  ]}
                  onPress={() => toggleFriendSelection(friend.id)}
                >
                  <Ionicons
                    name={
                      selectedFriends.includes(friend.id)
                        ? 'checkbox'
                        : 'square-outline'
                    }
                    size={24}
                    color={
                      selectedFriends.includes(friend.id)
                        ? COLORS.primary
                        : COLORS.gray
                    }
                  />
                  <Text style={styles.friendName}>{friend.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleCreateExpense}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.buttonText}>Create Expense</Text>
          )}
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
  form: {
    padding: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeButtonText: {
    fontSize: 16,
    color: COLORS.text,
  },
  typeButtonTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  friendsList: {
    gap: 8,
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  friendItemSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.light,
  },
  friendName: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 12,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateExpenseScreen;
