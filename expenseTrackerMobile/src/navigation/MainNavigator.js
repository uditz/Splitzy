import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { COLORS } from '../config/constants';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import FriendsListScreen from '../screens/friends/FriendsListScreen';
import ConversationsScreen from '../screens/chat/ConversationsScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import CreateExpenseScreen from '../screens/expenses/CreateExpenseScreen';
import MyExpensesScreen from '../screens/expenses/MyExpensesScreen';
import ExpenseRequestsScreen from '../screens/expenses/ExpenseRequestsScreen';
import ExpenseDetailsScreen from '../screens/expenses/ExpenseDetailsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Expense Stack Navigator
const ExpenseStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="ExpenseHome" 
        component={MyExpensesScreen}
        options={{ title: 'My Expenses' }}
      />
      <Stack.Screen 
        name="CreateExpense" 
        component={CreateExpenseScreen}
        options={{ title: 'Create Expense' }}
      />
      <Stack.Screen 
        name="ExpenseRequests" 
        component={ExpenseRequestsScreen}
        options={{ title: 'Expense Requests' }}
      />
      <Stack.Screen 
        name="ExpenseDetails" 
        component={ExpenseDetailsScreen}
        options={{ title: 'Expense Details' }}
      />
    </Stack.Navigator>
  );
};

// Chat Stack Navigator
const ChatStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.primary },
        headerTintColor: COLORS.white,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name="Conversations" 
        component={ConversationsScreen}
        options={{ title: 'Messages' }}
      />
      <Stack.Screen 
        name="Chat" 
        component={ChatScreen}
      />
    </Stack.Navigator>
  );
};

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Friends') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Messages') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={({ navigation }) => ({
          title: 'Dashboard',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Notification')}
              style={{ marginRight: 15 }}
            >
              <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpenseStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Friends" 
        component={FriendsListScreen}
        options={{ title: 'Friends' }}
      />
      <Tab.Screen 
        name="Messages" 
        component={ChatStack}
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="MainTab" 
        component={MainTabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Notification" 
        component={NotificationScreen}
        options={{ 
          title: 'Notifications',
          headerStyle: { backgroundColor: COLORS.primary },
          headerTintColor: COLORS.white,
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
