package com.example.ExpenseTracker.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "notifications")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    @Column(name = "user_id")
    Long userId;
    @Column(name = "message")
    String message;
    @Column(name = "type")
    String type;
    @Column(name = "is_read")
    boolean isRead;
    @Column(name = "created_at")
    LocalDateTime createdAt;
}
