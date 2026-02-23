package com.example.ExpenseTracker.controllers;

import lombok.Data;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
import com.example.ExpenseTracker.entity.Notification;
import com.example.ExpenseTracker.services.NotificationService;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Autowired;
@RestController
@RequestMapping("/notification")
public class NotificationController {
    @Autowired
    private NotificationService notificationService;
    @GetMapping("/all")
    public List<Notification> getAllNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return notificationService.getAllNotificationsByid(username);
    }
    @GetMapping("/unread")
    public List<Notification> getUnreadNotifications() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return notificationService.getUnreadNotifications(username);
    }
    @GetMapping("/read")
    public void markNotificationAsRead() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        notificationService.markNotificationAsRead(username);
    }
    @GetMapping("/count")
    public int getUnreadNotificationCount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return notificationService.getUnreadNotificationCount(username);
    }
    
    

}
