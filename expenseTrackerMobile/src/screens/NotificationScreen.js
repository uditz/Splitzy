import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../config/constants';
import { notificationAPI } from '../services/api';

const NotificationScreen = ({ navigation }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getAll();
            // Assuming response.data is the list. Reverse to show newest first if backend doesn't sort.
            // Backend seemed to just do findAll/findByUserId, usually insertion order or ID order.
            setNotifications(response.data.reverse()); 
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const markAsRead = async () => {
        try {
            await notificationAPI.markRead();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        markAsRead();
    }, []);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
        markAsRead();
    }, []);

    const handleNotificationPress = (item) => {
        console.log('Notification pressed:', item.type);
        if (item.type === 'FRIEND_REQUEST') {
            navigation.navigate('Friends', { tab: 'requests' });
        } else if (item.type === 'EXPENSE' || item.type === 'INVITATION') {
            navigation.navigate('Expenses', { screen: 'ExpenseRequests' });
        }
    };

    const renderItem = ({ item }) => (
        <TouchableOpacity 
            style={[styles.itemContainer, !item.isRead && !item.read && styles.unreadItem]}
            onPress={() => handleNotificationPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.iconContainer}>
                 <Ionicons 
                    name={item.type === 'INVITATION' || item.type === 'FRIEND_REQUEST' ? 'person-add' : 'notifications'} 
                    size={24} 
                    color={COLORS.primary} 
                />
            </View>
            <View style={styles.textContainer}>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <View style={styles.center}>
                        <Text style={styles.emptyText}>No notifications</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    itemContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
        alignItems: 'center'
    },
    unreadItem: {
        backgroundColor: '#eef2ff' 
    },
    iconContainer: {
        marginRight: 16,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.light,
        justifyContent: 'center',
        alignItems: 'center'
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: 14,
        color: COLORS.text,
        marginBottom: 4,
    },
    date: {
        fontSize: 12,
        color: COLORS.textSecondary,
    },
    emptyText: {
        color: COLORS.textSecondary,
        fontSize: 16
    }
});

export default NotificationScreen;
