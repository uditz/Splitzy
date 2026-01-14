package com.example.ExpenseTracker.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.ExpenseTracker.entity.User;
import com.example.ExpenseTracker.repository.NotificationRepo;
import java.util.List;
import com.example.ExpenseTracker.entity.Notification;
import java.util.ArrayList;
@Service
public class NotificationService {
    @Autowired
    NotificationRepo notificationRepo;

    @Autowired
    UserService userService;
    public void saveNotification(Notification notification){
        notificationRepo.save(notification);
    }


    public List<Notification> getAllNotificationsByid(String username){
        User user=userService.findByUsername(username);
        return notificationRepo.findByUserId(user.getId());

    }
    public void markNotificationAsRead(String username){
        User user=userService.findByUsername(username);
        List<Notification> notifications=notificationRepo.findByUserId(user.getId());
        for(Notification notification:notifications){
            notification.setRead(true);
            notificationRepo.save(notification);
        }
    }
    
    public List<Notification> getUnreadNotifications(String username){
        User user=userService.findByUsername(username);
        List<Notification> notifications=notificationRepo.findByUserId(user.getId());
        List<Notification> unreadNotifications=new ArrayList<>();
        for(Notification notification:notifications){
            if(!notification.isRead()){
                unreadNotifications.add(notification);
            }
        }
        return unreadNotifications;
    }
    public int getUnreadNotificationCount(String username){
        List<Notification> notifications=getUnreadNotifications(username);
        return notifications.size();
    }
}
