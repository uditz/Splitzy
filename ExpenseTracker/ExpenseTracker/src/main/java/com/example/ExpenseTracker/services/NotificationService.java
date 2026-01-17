package com.example.ExpenseTracker.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.NotificationRepo;
import java.util.List;
import com.example.ExpenseTracker.entity.Notification;
import java.util.ArrayList;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

@Service
public class NotificationService {
    @Autowired
    NotificationRepo notificationRepo;

    @Autowired
    UserService userService;

    @CacheEvict(value = "notifications", allEntries = true)
    public void saveNotification(Notification notification) {
        notificationRepo.save(notification);
    }

    @Cacheable(value = "notifications", key = "#username")
    public List<Notification> getAllNotificationsByid(String username) {
        User user = userService.findByUsername(username);
        return notificationRepo.findByUserId(user.getId());

    }

    @CacheEvict(value = "notifications", key = "#username")
    public void markNotificationAsRead(String username) {
        User user = userService.findByUsername(username);
        List<Notification> notifications = notificationRepo.findByUserId(user.getId());
        for (Notification notification : notifications) {
            notification.setRead(true);
            notificationRepo.save(notification);
        }
    }

    @Cacheable(value = "unreadNotifications", key = "#username")
    public List<Notification> getUnreadNotifications(String username) {
        User user = userService.findByUsername(username);
        List<Notification> notifications = notificationRepo.findByUserId(user.getId());
        List<Notification> unreadNotifications = new ArrayList<>();
        for (Notification notification : notifications) {
            if (!notification.isRead()) {
                unreadNotifications.add(notification);
            }
        }
        return unreadNotifications;
    }

    public int getUnreadNotificationCount(String username) {
        List<Notification> notifications = getUnreadNotifications(username);
        return notifications.size();
    }
}
