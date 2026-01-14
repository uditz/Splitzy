import React, { useEffect, useState } from 'react';
import { notificationAPI } from '../api';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
        markAsRead();
    }, []);

    const fetchNotifications = async () => {
        try {
            const response = await notificationAPI.getAll();
            // Show newest first
            setNotifications(response.data.reverse()); 
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async () => {
        try {
            await notificationAPI.markRead();
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };

    if (loading) {
        return <div className="loading-state">Loading notifications...</div>;
    }

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h2>Notifications</h2>
            </div>

            <div className="notification-list">
                {notifications.length === 0 ? (
                    <div className="empty-state">
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((item) => (
                        <div 
                            key={item.id} 
                            className={`notification-item ${!item.read && !item.isRead ? 'unread' : ''}`}
                        >
                            <div className="notification-icon">
                                {item.type === 'INVITATION' ? '👋' : '🔔'}
                            </div>
                            <div className="notification-content">
                                <p className="notification-message">{item.message}</p>
                                <span className="notification-date">
                                    {new Date(item.createdAt).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
